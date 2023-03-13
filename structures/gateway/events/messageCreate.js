const Client = require('../../client/client')
const { Guild, TextChannel, Message } = require('../../models')
module.exports = {
    name: 'message',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async(client, d) => {
        const data = d.d
        let guild = await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e=>{})
        if(!guild) {
            // gestion message par mp
        } else {
            guild = new Guild(client, guild)
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e=>{})
            if(!channel) return
            /**
             * @event client#messageCreate
             * @param {Message} message
             */
            client.emit('messageCreate', new Message(client, guild, new TextChannel(client, guild, channel), data))
        }
    }
}