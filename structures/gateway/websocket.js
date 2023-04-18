const ws = require('ws');
const { getGatewayBot } = require('../util/Gateway');
const fs = require('fs')
const Client = require('../client/client');
const { delayFor } = require('../util');
module.exports = async (client) => {
    const gatewayUrl = await getGatewayBot(client.token);
    client.ws.gateway = {
        url: gatewayUrl,
        obtainedAt: Date.now()
    };
    const eventFiles = new Map()
    let allFiles = fs.readdirSync(__dirname + `/events`)
    for (const file of allFiles) {
        let event = require('./events/' + file)
        if (!event) return
        eventFiles.set(event.name, event)
    }
    var socket;
    socket = new ws(`${client.ws.gateway.resume_gateway_url ? client.ws.gateway.resume_gateway_url : gatewayUrl}/?v=7&encoding=json`);
    client.ws.socket = socket;
    var heartbeat_interval = null
    socket.on('open', () => {
        client.ws.connected = true
    })
    socket.on('close', async (code) => {
        try {
            if (client.heartbeat) clearInterval(client.heartbeat)
            client.ws.connected = false
            switch (code) {
                case 4000:
                    console.error("Something went wrong, reconnecting...")
                    break;
                case 4001:
                    throw new Error("Invalid Gateway OPCODE or invalid payload for an OPCODE sended, report this error to devland.js developer(s).")
                    break;
                case 4004:
                    throw new Error("Invalid token provided.")
                    break;
                case 4008:
                    throw new Error("You're sending payloads too quickly, if the error persist report it to devland.js developer(s).")
                    break;
                case 4013:
                    throw new Error("You sent an invalid intent. You may have incorrectly calculated the bitwise value.")
                    break;
                case 4014:
                    throw new Error("You are trying to use disallowed intent(s) for your bot. Enable them on the bot page or if your bot is certified be sure they are approved for.")
                    break;
                case 8888:
                    return;
                    break;
                case 1006:
                    throw new Error("Connection lost... Check your connection and retry. All clients has been destroyed and all sessions has been closed.")
                break;
            }
            if (code === 8888) return client.emit('debug', `Client destroyed by the bot owner`)
            //client.emit("error", "Something went wrong with the gateway, trying to reconnect... (code : " + code + ")")
            client.emit("debug", "Something went wrong with the gateway, trying to reconnect... (code : " + code + ")")
            client.destroy(true)
        } catch (err) { }
    })
    socket.on('error', error => {
        client.emit('error', error)
        client.emit('debug', error)
    })
    socket.on('message', (incoming) => {
        const d = JSON.parse(incoming) || incoming;
        if (d.s) client.seq = d.s > client.seq ? d.s : client.seq
        switch (d.op) {
            case 10:
                if (client.heartbeat) clearInterval(client.heartbeat)
                client.ws.gateway.heartbeat = {
                    interval: d.d.heartbeat_interval,
                    last: null,
                    recieved: true
                };
                if (!client.sessionID) socket.send(JSON.stringify({
                    op: 2,
                    d: {
                        token: client.token,
                        properties: {
                            $os: client.options.ws.properties.$os,
                            $browser: client.options.ws.properties.$browser,
                            $device: client.options.ws.properties.$device,
                        },
                        compress: client.options.ws.compress,
                        large_threshold: client.options.ws.large_threshold,
                        presence: {
                            activities: client.options.presence.activities,
                            status: client.options.presence.status,
                            afk: client.options.presence.afk,
                            since: client.options.presence.since,
                        },
                        intents: client.options.intents,
                        shard: client.options.shardCount > 0 ? [Number(client.options.shardId), Number(client.options.shardCount)] : undefined
                    }
                }));
                else socket.send(JSON.stringify({
                    op: 6,
                    d: {
                        session_id: client.sessionID,
                        token: client.token,
                        seq: client.seq
                    }
                }))

                require('./heartbeat')(client);
                break;
            case 11:
                client.emit('debug', `Heartbeat Ack received from the discord gateway, shard : ${client.options.shardId}`)
                client.lastHeartbeatAcked = true
                client.ws.ping = (Date.now() - client.ws.gateway.heartbeat.last)
                client.ws.gateway.heartbeat.last = Date.now();
                client.ws.gateway.heartbeat.recieved = true;
                break;
            case 0:
                const Events = require('../util/GatewayEvents');
                if (!Events.hasOwnProperty(d.t)) return;
                if (d.t == 'READY') {
                    client.lastHeartbeatAcked = true
                    require('./heartbeat')(client, true)
                    client.readyAt = Date.now();
                    client.emit('debug', `Session ready with succes, shard : ${client.options.shardId}`)
                }
                if (d.t == 'RESUMED') {
                    client.lastHeartbeatAcked = true
                    require('./heartbeat')(client, true)
                    if(d.d && d.d.session_id) client.sessionID = d.d.session_id
                    client.emit('debug', `Session resumed with succes, shard : ${client.options.shardId}`)
                }
                client.emit('raw', {
                    eventName: d.t,
                    data: d.d
                })
                if (!eventFiles.has(Events[d.t])) return
                let event = eventFiles.get(Events[d.t])
                try {
                    event.run(client, d)
                } catch (err) { }
                break;
            case 7:
                client.emit('debug', `Trying to resume session after discord request. Shard : ${client.options.shardId}`)
                return socket = new ws(`${client.ws.gateway.resume_gateway_url ? client.ws.gateway.resume_gateway_url : gatewayUrl}/?v=7&encoding=json`)
                return socket.send(JSON.stringify({
                    op: 6,
                    d: {
                        session_id: client.sessionID,
                        token: client.token,
                        seq: client.seq
                    }
                }))
                break;
            case 9:
                if (!d.d) client.sessionID = null
                //client.emit("error", "Session invalidated. Shard : "+client.options.shardId)
                client.emit("debug", "Session invalidated. Shard : " + client.options.shardId)
                return socket = new ws(`${client.ws.gateway.resume_gateway_url ? client.ws.gateway.resume_gateway_url : gatewayUrl}/?v=7&encoding=json`)
                if (client.sessionID) {
                    client.emit('debug', `Invalid session, trying to resume the connection`)
                    client.emit('debug', `Trying to resume session`)
                    socket.send(JSON.stringify({
                        op: 6,
                        d: {
                            session_id: client.sessionID,
                            token: client.token,
                            seq: client.seq
                        }
                    }))
                } else {
                    client.emit('debug', `Invalid session, trying to reconnect with a new identify`)
                    client.seq = -1
                    socket.send(JSON.stringify({
                        op: 2,
                        d: {
                            token: client.token,
                            properties: {
                                $os: client.options.ws.properties.$os,
                                $browser: client.options.ws.properties.$browser,
                                $device: client.options.ws.properties.$device,
                            },
                            compress: client.options.ws.compress,
                            large_threshold: client.options.ws.large_threshold,
                            presence: {
                                activities: client.options.presence.activities,
                                status: client.options.presence.status,
                                afk: client.options.presence.afk,
                                since: client.options.presence.since,
                            },
                            intents: client.options.intents,
                            shard: client.options.shardCount > 0 ? [Number(client.options.shardId), Number(client.options.shardCount)] : undefined
                        }
                    }));
                }
                break;
            case 1:
                require('./heartbeat')(client, true)
                break;
        }
    });
}

