const ws = require('ws');
const { getGatewayBot } = require('../util/Gateway');
const fs = require('fs')
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
    socket.on('message', (incoming) => {
        const d = JSON.parse(incoming) || incoming;
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
                            status: client.options.presence.status,
                            afk: client.options.presence.afk,
                        },
                        intents: client.options.intents
                    }
                }));
                break;
            case 11:
                client.ws.gateway.heartbeat.last = Date.now();
                client.ws.gateway.heartbeat.recieved = true;
                break;
            case 0:
                const Events = require('../util/GatewayEvents');
                if (!Events.hasOwnProperty(d.t)) return;
                if (d.t == 'READY') client.readyAt = Date.now();
                if (!eventFiles.has(Events[d.t])) return
                let event = eventFiles.get(Events[d.t])
                event.run(client, d)
                break;
        }
    });
}

