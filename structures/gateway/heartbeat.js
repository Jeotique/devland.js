const { delayFor } = require('../util');

const p = require('phin').promisified;

module.exports = async (client, no_interval = false) => {
    if (client.ws.gateway.heartbeat.recieved == false) throw new Error(`Last heartbeat hasn't been acknowledged, terminating connection`);
    if (no_interval) {
        client.ws.socket.send(JSON.stringify({
            op: 1,
            d: client.seq  <= 0 ? null : client.seq
        }));
        client.emit('debug', `Heartbeat sended to the gateway after a request from discord, Shard : ${client.options.shardId}`)
        client.ws.gateway.heartbeat.last = Date.now()
    } else {
        client.heartbeat = setInterval(async () => {
            if (!client.lastHeartbeatAcked) {
                client.emit('debug', `Didn't process heartbeat ack last time, assuming zombie connection. Detroying and reconnecting.
            Sequence : ${client.seq}, Shard : ${client.options.shardId}`)
                client.destroy()
                await delayFor(100)
                client.connect()
            } else {
                client.lastHeartbeatAcked = false
                client.ws.gateway.heartbeat.last = Date.now()
                client.ws.gateway.heartbeat.recieved = false;
                client.ws.socket.send(JSON.stringify({
                    op: 1,
                    d: client.seq  <= 0 ? null : client.seq
                }));
                client.emit('debug', `Heartbeat sended to the gateway (from the normal timer), Shard : ${client.options.shardId}`)
            }
        }, client.ws.gateway.heartbeat.interval-1000);
    }
}
