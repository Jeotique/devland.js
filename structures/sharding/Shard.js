const childProcess = require('child_process')
const { EventEmitter } = require('events')
const path = require('path')
const Util = require('../util')

module.exports = class Shard extends EventEmitter {
    constructor(manager, id) {
        super()
        this.manager = manager
        this.id = id
        this.args = manager.shardArgs || []
        this.execArgv = manager.execArgv
        this.env = Object.assign({}, process.env, {
            SHARDING_MANAGER: true,
            SHARD_ID: this.id,
            SHARD_COUNT: this.manager.totalShards,
            CLIENT_TOKEN: this.manager.token,
        })
        this.ready = false
        this.process = null
        this._evals = new Map()
        this._fetches = new Map()
        this._exitListener = this._handleExit.bind(this, undefined);
    }

    async spawn(waitForReady = true) {
        if (this.process) throw new Error("Sharding process already exist")
        this.process = childProcess.fork(path.resolve(this.manager.file), this.args, {
            env: this.env, execArgv: this.execArgv
        }).on('message', this._handleMessage.bind(this)).on('exit', this._exitListener)

        this.emit('spawn', this.process)
        if (!waitForReady) return this.process
        await new Promise((resolve, reject) => {
            this.once('ready', resolve)
            this.once('disconnect', () => reject(new Error("Sharding ready disconnected", this.id)))
            this.once('death', () => reject(new Error("Sharding ready died", this.id)))
            setTimeout(() => reject(new Error("Sharding ready timeout", this.id)), 30000)
        })
        return this.process
    }

    kill() {
        this.process.removeListener('exit', this._exitListener)
        this.process.kill()
        this._handleExit()
    }

    async respawn(delay = 500, waitForReady = true) {
        this.kill()
        if (typeof delay !== "number") delay = 1
        setTimeout(() => {
            return this.spawn(waitForReady)
        }, delay)
    }

    send(message) {
        return new Promise((resolve, reject) => {
            this.process.send(message, err => {
                if (err) reject(err)
                else resolve(this)
            })
        })
    }

    fetchClientValue(prop) {
        if (this._fetches.has(prop)) return this._fetches.get(prop)
        const promise = new Promise((resolve, reject) => {
            const listener = message => {
                if (!message || message._fetchProp !== prop) return
                this.process.removeListener('message', listener)
                this._fetches.delete(prop)
                resolve(message._result)
            }
            this.process.on('message', listener)
            this.send({ _fetchProp: prop }).catch(err => {
                this.process.removeListener('message', listener)
                this._fetches.delete(prop)
                reject(err)
            })
        })
        this._fetches.set(prop, promise)
        return promise
    }

    eval(script) {
        if (this._evals.has(script)) return this._evals.get(script);

        const promise = new Promise((resolve, reject) => {
            const listener = message => {
                if (!message || message._eval !== script) return;
                this.process.removeListener('message', listener);
                this._evals.delete(script);
                if (!message._error) resolve(message._result); else reject(Util.makeError(message._error));
            };
            this.process.on('message', listener);

            const _eval = typeof script === 'function' ? `(${script})(this)` : script;
            this.send({ _eval }).catch(err => {
                this.process.removeListener('message', listener);
                this._evals.delete(script);
                reject(err);
            });
        });

        this._evals.set(script, promise);
        return promise;
    }

    _handleMessage(message) {
        if (message) {
            // Shard is ready
            if (message._ready) {
                this.ready = true;
                /**
                 * Emitted upon the shard's {@link Client#ready} event.
                 * @event Shard#ready
                 */
                this.emit('ready');
                return;
            }

            // Shard has disconnected
            if (message._disconnect) {
                this.ready = false;
                /**
                 * Emitted upon the shard's {@link Client#disconnect} event.
                 * @event Shard#disconnect
                 */
                this.emit('disconnect');
                return;
            }

            // Shard is attempting to reconnect
            if (message._reconnecting) {
                this.ready = false;
                /**
                 * Emitted upon the shard's {@link Client#reconnecting} event.
                 * @event Shard#reconnecting
                 */
                this.emit('reconnecting');
                return;
            }

            // Shard is requesting a property fetch
            if (message._sFetchProp) {
                this.manager.fetchClientValues(message._sFetchProp).then(
                    results => this.send({ _sFetchProp: message._sFetchProp, _result: results }),
                    err => this.send({ _sFetchProp: message._sFetchProp, _error: Util.makePlainError(err) })
                );
                return;
            }

            // Shard is requesting an eval broadcast
            if (message._sEval) {
                this.manager.broadcastEval(message._sEval).then(
                    results => this.send({ _sEval: message._sEval, _result: results }),
                    err => this.send({ _sEval: message._sEval, _error: Util.makePlainError(err) })
                );
                return;
            }

            // Shard is requesting a respawn of all shards
            if (message._sRespawnAll) {
                const { shardDelay, respawnDelay, waitForReady } = message._sRespawnAll;
                this.manager.respawnAll(shardDelay, respawnDelay, waitForReady).catch(() => {
                    // Do nothing
                });
                return;
            }
        }

        /**
         * Emitted upon recieving a message from the child process.
         * @event Shard#message
         * @param {*} message Message that was received
         */
        this.emit('message', message);
    }

    _handleExit(respawn = this.manager.respawn) {
        /**
         * Emitted upon the shard's child process exiting.
         * @event Shard#death
         * @param {childProcess} process Child process that exited
         */
        this.emit('death', this.process);

        this.ready = false;
        this.process = null;
        this._evals.clear();
        this._fetches.clear();

        if (respawn) this.spawn().catch(err => this.emit('error', err));
    }
}