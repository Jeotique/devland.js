const Client = require('../../client/client')
const { Guild, ScheduledEvent, User } = require('../../models')
module.exports = {
    name: 'guildScheduledEventUserAdd',
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
            let event_data = await client.rest.get(client._ENDPOINTS.EVENT(data.guild_id, data.guild_scheduled_event_id)).catch(e => { })
            if (!event_data) return
            let event = new ScheduledEvent(client, guild, event_data)
            let user = client.users.get(data.user_id) || await client.rest.get(client._ENDPOINTS.USER(data.user_id)).catch(e => { })
            if (!user) return
            if (!(user instanceof User)) user = new User(client, user)
            client.emit('guildScheduledEventUserAdd', event, user)
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                client.users.set(user.id, user)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}