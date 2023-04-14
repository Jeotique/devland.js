const ws = require('ws');
const { getGatewayBot } = require('../util/Gateway');
const fs = require('fs')
const Client = require('../client/client')
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
    const socket = new ws(`${gatewayUrl}/?v=7&encoding=json`);
    client.ws.socket = socket;
    var heartbeat_interval = null
    socket.on('close', (code) => {
        if (client.heartbeat) clearInterval(client.heartbeat)
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
        }
        if (code === 8888) return client.emit('debug', `Client destroyed by the bot owner`)
        client.emit("error", "Something went wrong with the gateway, trying to reconnect... (code : " + code + ")")
        client.emit("debug", "Something went wrong with the gateway, trying to reconnect... (code : " + code + ")")
        client.connect()
    })
    socket.on('error', error => {
        client.emit('error', error)
        client.emit('debug', error)
    })
    socket.on('message', (incoming) => {
        const d = JSON.parse(incoming) || incoming;
        if (d.s) client.seq = d.s
        switch (d.op) {
            case 10:
                client.ws.gateway.heartbeat = {
                    interval: d.d.heartbeat_interval,
                    last: null,
                    recieved: true
                };
                require('./heartbeat')(client);
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
                        intents: client.options.intents
                    }
                }));
                break;
            case 11:
                client.ws.ping = (Date.now() - client.ws.gateway.heartbeat.last)
                client.ws.gateway.heartbeat.last = Date.now();
                client.ws.gateway.heartbeat.recieved = true;
                break;
            case 0:
                s = d.s
                const Events = require('../util/GatewayEvents');
                if (!Events.hasOwnProperty(d.t)) return;
                if (d.t == 'READY') client.readyAt = Date.now();
                if (!eventFiles.has(Events[d.t])) return
                let event = eventFiles.get(Events[d.t])
                try {
                    event.run(client, d)
                } catch (err) { }
                break;
            case 7:
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
                client.seq = 0
                client.emit("error", "Session invalidated, will identify a new session")
                client.emit("debug", "Session invalidated, will identify a new session")
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
                        intents: client.options.intents
                    }
                }));
                break;
        }
    });
}

