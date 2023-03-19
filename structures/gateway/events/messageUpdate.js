const Client = require('../../client/client')
const { Guild, TextChannel, Message } = require('../../models')
module.exports = {
    name: 'messageUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let oldMessage = client.messages.get(data.id)
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (!guild) {
            // gestion message par mp
        } else {
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e=>{})
            if(!channel) return
            let message = new Message(client, guild, new TextChannel(client, guild, channel), data)

            if(oldMessage) {
                /**
                 * Emitted whenever a message is updated
                 * @event client#messageUpdate
                 * @param {Message} oldMessage
                 * @param {Message} message
                 */
                client.emit('messageUpdate', oldMessage, message)
                if(typeof client.options.messagesLifeTime === "number" && client.options.messagesLifeTime > 0 && client.options.messagesLifeTimeResetAfterEvents) {
                    message.cachedAt = Date.now()
                    message.expireAt = Date.now()+client.options.messagesLifeTime
                    client.messages.set(message.id, message)
                }
                
            } else {
                /**
                 * Emitted whenever a message is updated
                 * @event client#messageUpdate
                 * @param {object} oldMessage
                 * @param {Message} message
                 */
                client.emit('messageUpdate', {error: "Enable the messages cache to get the old message data", guild: guild, channel: channel, id: data.id, data_is_available: false}, message)
            }
        }
    }
}