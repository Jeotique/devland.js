const Client = require('../client/client')
const ws = require('ws')
let EventEmitter;
try {
    EventEmitter = require("eventemitter3");
} catch (err) {
    EventEmitter = require("events").EventEmitter;
}
const fs = require('fs');
const { delayFor } = require('../util');
module.exports = class WebSocket extends EventEmitter {
    constructor(client) {
        super()
        this.client = client
        this.onPacket = this.onPacket.bind(this)
        this._onWSOpen = this._onWSOpen.bind(this)
        this._onWSMessage = this._onWSMessage.bind(this)
        this._onWSError = this._onWSError.bind(this)
        this._onWSClose = this._onWSClose.bind(this)
        this.eventFiles = new Map()
        let allFiles = fs.readdirSync(__dirname + `/events`)
        for (const file of allFiles) {
            let event = require('./events/' + file)
            if (!event) return
            this.eventFiles.set(event.name, event)
        }

        this.hardReset()

        /**
         this.ws.on("open", this._onWSOpen)
        this.ws.on("message", this._onWSMessage)
        this.ws.on("error", this._onWSError)
        this.ws.on("close", this._onWSClose)
         */
    }

    emit(event, ...args) {
        this.client.emit.call(this.client, event, ...args);
        if (event !== "error" || this.listeners("error").length > 0) {
            super.emit.call(this, event, ...args);
        }
    }

    connect() {
        if (this.ws && this.ws.readyState !== ws.CLOSED) {
            this.emit("error", new Error("Existing connection detected"), this.client.options.shardId)
            return
        }
        ++this.connectAttempts
        this.connecting = true
        return this.initializeWS()
    }

    async initializeWS() {
        if (!this._token) {
            return this.disconnect(null, new Error("Token not specified"))
        }
        this.status = "connecting"
        let {getGatewayBot} = require('../util/Gateway')
        let gatewayURL = await getGatewayBot(this._token)
        this.gatewayURL = gatewayURL
        if (this.sessionID) {
            if (!this.resumeURL) {
                this.emit("warn", "Resume url is not currently present, Discord may disconnect you quicker", this.client.options.shardId)
            }
            this.ws = new ws(`${this.resumeURL || this.gatewayURL}/?v=9&encoding=json`, this.client.options.ws)
        } else {
            this.ws = new ws(`${this.gatewayURL}/?v=9&encoding=json`, this.client.options.ws)
        }
        this.ws.on("open", this._onWSOpen)
        this.ws.on("message", this._onWSMessage)
        this.ws.on("error", this._onWSError)
        this.ws.on("close", this._onWSClose)
        this.connectTimeout = setTimeout(() => {
            if (this.connecting) {
                this.disconnect({
                    reconnect: "auto"
                }, new Error("Connection timeout"))
            }
        }, this.client.options.connectionTimeout)
    }

    hardReset() {
        this.reset();
        this.seq = 0;
        this.sessionID = null;
        this.resumeURL = null;
        this.reconnectInterval = 1000;
        this.connectAttempts = 0;
        this.ws = null;
        this.heartbeatInterval = null;
        this.guildCreateTimeout = null;
        Object.defineProperty(this, "_token", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: this.client.token
        });
    }
    reset() {
        this.connecting = false;
        this.ready = false;
        this.preReady = false;
        this.latency = Infinity;
        this.ping = Infinity;
        this.lastHeartbeatAck = true;
        this.lastHeartbeatReceived = null;
        this.lastHeartbeatSent = null;
        this.status = "disconnected";
        if (this.connectTimeout) {
            clearTimeout(this.connectTimeout);
        }
        this.connectTimeout = null;
    }



    disconnect(options = {}, error) {
        if (!this.ws) return
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.ws.readyState !== ws.CLOSED) {
            this.ws.removeListener("message", this._onWSMessage);
            this.ws.removeListener("close", this._onWSClose);
            try {
                if (options.reconnect && this.sessionID) {
                    if (this.ws.readyState === ws.OPEN) {
                        this.ws.close(4901, "Devland: reconnect")
                    } else {
                        this.emit("debug", `Terminating websocket (state: ${this.ws.readyState})`, this.client.options.shardId)
                        this.ws.terminate()
                    }
                } else {
                    this.ws.close(1000, "Devland: normal")
                }
            } catch (err) {
                this.emit('error', err, this.client.options.shardId)
            }
        }
        this.ws = null
        this.reset()

        if (error) {
            this.emit("error", error, this.client.options.shardId)
        }
        super.emit("disconnect", error)

        if (this.sessionID && this.connectAttempts >= this.client.options.maxResumeAttempts) {
            this.emit("debug", `Automatically invalidating session due to excessive resume attempts | Attempt ${this.connectAttempts}`, this.client.options.shardId)
            this.sessionID = null
            this.resumeURL = null
        }
        if (options.reconnect === "auto") {
            if (this.sessionID) {
                this.emit("debug", `Immediately reconnecting for potential resume | Attempt ${this.connectAttempts}`, this.client.options.shardId)
                this.connect()
            } else {
                this.emit("debug", `Queueing reconnect in ${this.reconnectInterval}ms | Attempt ${this.connectAttempts}`, this.client.options.shardId)
                setTimeout(() => {
                    this.connect()
                }, this.reconnectInterval)
                this.reconnectInterval = Math.min(Math.round(this.reconnectInterval * (Math.random() * 2 + 1)), 30000)
            }
        } else if (!options.reconnect) {
            this.hardReset()
        }
    }

    heartbeat(normal) {
        if (this.status === "resuming" || this.status === "identifying") return;
        if (normal) {
            if (!this.lastHeartbeatAck) {
                this.emit("debug", "Heartbeat timeout; " + JSON.stringify({
                    lastReceived: this.lastHeartbeatReceived,
                    lastSent: this.lastHeartbeatSent,
                    interval: this.heartbeatInterval,
                    status: this.status,
                    timestamp: Date.now()
                }))
                return this.disconnect({
                    reconnect: "auto"
                }, new Error("Server didn't acknowledge previous heartbeat, possible lost connection"))
            }
            this.lastHeartbeatAck = false
        }
        this.lastHeartbeatSent = Date.now()
        this.sendWS(1, this.seq, true)
    }

    sendWS(op, _data, priority = false) {
        if (this.ws && this.ws.readyState === ws.OPEN) {
            this.ws.send(JSON.stringify({ op: op, d: _data }))
            if (_data.token) delete _data.token
            this.emit("debug", JSON.stringify({ op: op, d: _data }), this.client.options.shardId);
        }
    }

    identify() {
        this.status = "identifying"
        const identify = {
            token: this.client.token,
            v: 9,
            properties: {
                $os: this.client.options.ws.properties.$os,
                $browser: this.client.options.ws.properties.$browser,
                $device: this.client.options.ws.properties.$device,
            },
            compress: this.client.options.ws.compress,
            large_threshold: this.client.options.ws.large_threshold,
            presence: {
                activities: this.client.options.presence.activities,
                status: this.client.options.presence.status,
                afk: this.client.options.presence.afk,
                since: this.client.options.presence.since,
            },
            intents: this.client.options.intents,
            shard: this.client.options.shardCount > 0 ? [Number(this.client.options.shardId), Number(this.client.options.shardCount)] : undefined
        }
        this.sendWS(2, identify)
        this.lastHeartbeatSent = Date.now()
        this.sendWS(1, this.seq, true)
    }

    resume() {
        this.status = "resuming"
        this.sendWS(6, {
            token: this._token,
            session_id: this.sessionID,
            seq: this.seq
        })
    }

    onPacket(packet) {
        if (packet.s) {
            if (packet.s > this.seq + 1 && this.ws && this.status !== "resuming") {
                this.emit("warn", `Non-consecutive sequence (${this.seq} -> ${packet.s})`)
            }
            this.seq = packet.s
        }
        switch (packet.op) {
            case 0: {
                const Events = require('../util/GatewayEvents');
                if (!Events.hasOwnProperty(packet.t)) return;
                if (packet.t == 'READY') {
                    this.connectAttempts = 0
                    this.reconnectInterval = 1000
                    this.connecting = false
                    if (this.connectTimeout) {
                        clearTimeout(this.connectTimeout)
                    }
                    this.connectTimeout = null
                    this.status = "ready"
                    this.client.readyAt = Date.now()
                    this.resumeURL = `${packet.d.resume_gateway_url}?v=9&encoding=json}`
                    if (packet.d._trace) {
                        this.discordServerTrace = packet.d._trace
                    }
                    this.sessionID = packet.d.session_id
                    this.client.application = packet.d.application;
                    this.client.emit('debug', `Session ready with succes, shard : ${this.client.options.shardId}`)
                }
                if (packet.t == 'RESUMED') {
                    this.heartbeat()
                    this.preReady = true
                    this.ready = true
                    this.client.emit('debug', `Session resumed with succes, shard : ${this.client.options.shardId}`)
                }
                this.client.emit('raw', {
                    eventName: packet.t,
                    data: packet.d
                })
                if (!this.eventFiles.has(Events[packet.t])) return
                let event = this.eventFiles.get(Events[packet.t])
                try {
                    event.run(this.client, packet)
                } catch (err) { }
            }
                break;
            case 1: {
                this.heartbeat()
            }
                break;
            case 9: {
                this.seq = 0
                this.sessionId = null
                this.resumeURL = null
                this.emit("warn", "Invalid session, reidentifying", this.client.options.shardId)
                this.emit("debug", "Invalid session, reidentifying", this.client.options.shardId)
            }
                break;
            case 7: {
                this.emit("debug", "Reconnecting due to server request", this.client.options.shardId)
                this.disconnect({
                    reconnect: "auto"
                })
            }
                break;
            case 10: {
                if (packet.d.heartbeat_interval > 0) {
                    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
                    this.heartbeatInterval = setInterval(() => this.heartbeat(true), packet.d.heartbeat_interval)
                }
                this.discordServerTrace = packet.d._trace
                this.connecting = false
                if (this.connectTimeout) {
                    clearTimeout(this.connectTimeout)
                }
                this.connectTimeout = null
                if (this.sessionID) {
                    this.resume()
                } else {
                    this.identify(true)
                }
                this.emit("hello", packet.d._trace, this.client.options.shardId)
            }
                break;
            case 11: {
                this.lastHeartbeatAck = true
                this.lastHeartbeatReceived = Date.now()
                this.latency = this.lastHeartbeatReceived - this.lastHeartbeatSent
                this.ping = this.lastHeartbeatReceived - this.lastHeartbeatSent
                this.emit("debug", `Heartbeat received from discord gateway`, this.client.options.shardId)
            }
                break;
            default: {
                this.emit("unknown", packet, this.client.options.shardId)
            }
                break;
        }
    }

    _onWSOpen() {
        this.status = "handshaking"
        this.emit("connect", this.client.options.shardId)
        this.lastHeartbeatAck = true
    }

    _onWSMessage(data) {
        try {
            return this.onPacket(JSON.parse(data.toString()))
        } catch (err) {
            try {
                return this.onPacket(JSON.parse(data))
            } catch (err) {
                this.emit("error", err, this.client.options.shardId)
            }
        }
    }

    _onWSError(err) {
        this.emit("error", err, this.client.options.shardId);
    }

    _onWSClose(code, reason) {
        reason = reason.toString();
        this.emit("debug", "WS disconnected: " + JSON.stringify({
            code: code,
            reason: reason,
            status: this.status
        }));
        let err = !code || code === 1000 ? null : new Error(code + ": " + reason);
        let reconnect = "auto";
        if (code) {
            this.emit("debug", `${code === 1000 ? "Clean" : "Unclean"} WS close: ${code}: ${reason}`, this.client.options.shardId)
            if (code === 4001) {
                err = new Error("Gateway received invalid OP code");
            } else if (code === 4002) {
                err = new Error("Gateway received invalid message");
            } else if (code === 4003) {
                err = new Error("Not authenticated");
                this.sessionID = null;
                this.resumeURL = null;
            } else if (code === 4004) {
                err = new Error("Authentication failed");
                this.sessionID = null;
                this.resumeURL = null;
                reconnect = false;
                this.emit("error", new Error(`Invalid token: ${this._token}`));
            } else if (code === 4005) {
                err = new Error("Already authenticated");
            } else if (code === 4006 || code === 4009) {
                err = new Error("Invalid session");
                this.sessionID = null;
                this.resumeURL = null;
            } else if (code === 4007) {
                err = new Error("Invalid sequence number: " + this.seq);
                this.seq = 0;
            } else if (code === 4008) {
                err = new Error("Gateway connection was ratelimited");
            } else if (code === 4010) {
                err = new Error("Invalid shard key");
                this.sessionID = null;
                this.resumeURL = null;
                reconnect = false;
            } else if (code === 4011) {
                err = new Error("Shard has too many guilds (>2500)");
                this.sessionID = null;
                this.resumeURL = null;
                reconnect = false;
            } else if (code === 4013) {
                err = new Error("Invalid intents specified");
                this.sessionID = null;
                this.resumeURL = null;
                reconnect = false;
            } else if (code === 4014) {
                err = new Error("Disallowed intents specified");
                this.sessionID = null;
                this.resumeURL = null;
                reconnect = false;
            } else if (code === 1006) {
                err = new Error("Connection reset by peer");
            } else if (code !== 1000 && reason) {
                err = new Error(code + ": " + reason);
            }
            if (err) {
                err.code = code;
            }
        } else {
            this.emit("debug", "WS close: unknown code: " + reason, this.client.options.shardId);
        }
        this.disconnect({
            reconnect
        }, err)
    }

    toJSON() {
        return this.toJSON()
    }
}