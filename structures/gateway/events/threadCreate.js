const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel, AnnouncementChannel } = require('../../models')
const Thread = require('../../models/Thread')
const CategoryChannel = require('../../models/CategoryChannel')
module.exports = {
    name: 'threadCreate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
        if (!guild) {
            // gestion message par mp
        } else {
            if(!(guild instanceof Guild)) guild = new Guild(client, guild)
            let thread = new Thread(client, guild, data)
            /**
            * Emitted whenever a thread is created
            * @event client#threadCreate
            * @param {Thread} thread
            */
            client.emit('threadCreate', thread)
            if (typeof client.options.threadsLifeTime === "number" && client.options.threadsLifeTime > 0) {
                thread.cachedAt = Date.now()
                thread.expireAt = Date.now() + client.options.threadsLifeTime
                client.threadChannels.set(thread.id, thread)
            }
        }
    }
}