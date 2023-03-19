const Client = require('../../client/client')
const { Guild, TextChannel, Message } = require('../../models')
module.exports = {
    name: 'messageDelete',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let message = client.messages.get(data.id)
        client.messages.delete(data.id)
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (!guild) {
            // gestion message par mp
        } else {
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e=>{})
            if(!channel) return
            if(message) {
                /**
                 * Emitted whenever a message is deleted
                 * @event client#messageDelete
                 * @param {Message} message
                 */
                client.emit('messageDelete', message)
            } else {
                /**
                 * Emitted whenever a message is deleted
                 * @event client#messageDelete
                 * @param {object} message
                 */
                client.emit('messageDelete', {error: "Enable the messages cache to get the old message data", guild: guild, channel: channel, id: data.id, data_is_available: false}, message)
            }
        }
    }
}