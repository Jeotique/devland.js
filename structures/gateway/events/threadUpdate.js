const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel, AnnouncementChannel } = require('../../models')
const Thread = require('../../models/Thread')
const CategoryChannel = require('../../models/CategoryChannel')
module.exports = {
    name: 'threadUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (!guild) {
            // gestion message par mp
        } else {
            if(!guild instanceof Guild) guild = new Guild(client, guild)
            let thread = new Thread(client, guild, data)
            let oldThread = client.threadChannels.get(thread.id)
            if(!oldThread) oldThread = { error: "Enable the threads cache to get the old thread data", id: data.id, data_is_available: false }
            /**
            * Emitted whenever a thread is deleted
            * @event client#threadUpdate
            * @param {Thread} oldThread
            * @param {Thread} thread
            */
            client.emit('threadUpdate', oldThread, thread)
            if (typeof client.options.threadsLifeTime === "number" && client.options.threadsLifeTime > 0) {
                thread.cachedAt = Date.now()
                thread.expireAt = Date.now() + client.options.threadsLifeTime
                client.threadChannels.set(thread.id, thread)
            }
        }
    }
}