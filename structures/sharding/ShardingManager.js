const path = require('path')
const fs = require('fs')
const { EventEmitter } = require('events')
const { Store } = require('../util/Store/Store')
const Util = require('../util')
const Shard = require('./Shard')
module.exports = class ShardingManager extends EventEmitter {
    constructor(file, options = {}) {
        super();
        options = Util.mergeDefault(Util.createDefaultShardOptions(), options)
        this.file = file
        if (!file) throw new Error("You must specify a file")
        if (!path.isAbsolute(file)) this.file = path.resolve(process.cwd(), file)
        const stats = fs.statSync(this.file)
        if (!stats.isFile()) throw new Error("Invalid file specified")
        this.totalShards = options.totalShards
        if (this.totalShards !== "auto") {
            if (typeof this.totalShards !== "number") throw new Error("Total shards must be a number")
            if (this.totalShards < 1) throw new Error("At least 1 shard is required")
            if (this.totalShards !== Math.floor(this.totalShards)) throw new Error("Total shards must be a integer")
        }
        this.respawn = options.respawn
        this.shardArgs = options.shardArgs
        this.execArgv = options.execArgv
        this.token = options.token ? options.token.replace(/^Bot\s*/i, '') : null
        this.autospawn = options.autospawn
        /**
         * @type {Store<number, Shard>}
         */
        this.shards = new Store()

        if(this.autospawn === true) this.spawn()
    }

    createShard(id = this.shards.size) {
        const shard = new Shard(this, id)
        this.shards.set(id, shard)
        this.emit('shardCreate', shard)
        return shard
    }

    async spawn(amount = this.totalShards, delay = 5500, waitForReady = true) {
        if (amount === 'auto') {
            amount = await Util.fetchRecommendedShards(this.token)
        } else {
            if (typeof amount !== 'number' || isNaN(amount)) {
                throw new TypeError("Total shards must be a number");
            }
            if (amount < 1) throw new RangeError("At least 1 shard is required");
            if (amount !== Math.floor(amount)) {
                throw new TypeError("Total shards must be a integer");
            }
        }
        if (this.shards.size >= amount) throw new Error("Sharding already spawned", this.shards.size)
        this.totalShards = amount
        for (let s = 1; s <= amount; s++) {
            const promises = []
            const shard = this.createShard()
            promises.push(shard.spawn(waitForReady))
            if (delay > 0 && s !== amount) promises.push(Util.delayFor(delay))
            await Promise.all(promises)
        }
        return this.shards
    }

    broadcast(message) {
        const promises = [];
        for (const shard of this.shards.values()) promises.push(shard.send(message));
        return Promise.all(promises);
    }
    broadcastEval(script) {
        const promises = [];
        for (const shard of this.shards.values()) promises.push(shard.eval(script));
        return Promise.all(promises);
    }
    fetchClientValues(prop) {
        if (this.shards.size === 0) return Promise.reject(new Error('Sharding no shard'));
        if (this.shards.size !== this.totalShards) return Promise.reject(new Error('Sharding in process'));
        const promises = [];
        for (const shard of this.shards.values()) promises.push(shard.fetchClientValue(prop));
        return Promise.all(promises);
    }
    async respawnAll(shardDelay = 5000, respawnDelay = 500, waitForReady = true) {
        let s = 0;
        for (const shard of this.shards.values()) {
            const promises = [shard.respawn(respawnDelay, waitForReady)];
            if (++s < this.shards.size && shardDelay > 0) promises.push(Util.delayFor(shardDelay));
            await Promise.all(promises);
        }
        return this.shards;
    }
}