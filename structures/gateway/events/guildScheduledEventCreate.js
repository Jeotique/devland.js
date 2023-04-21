const Client = require('../../client/client')
const { Guild, ScheduledEvent } = require('../../models')
module.exports = {
    name: 'guildScheduledEventCreate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
            if (!(guild instanceof Guild)) guild = new Guild(client, guild)
            let event = new ScheduledEvent(client, guild, data)
            client.emit('guildScheduledEventCreate', event)
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}