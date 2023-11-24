const Client = require('../../client/client')
const { Guild, TextChannel, Message, User, StageChannel, Presence } = require('../../models')
module.exports = {
    name: 'presenceUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
            if (!guild) return;
            if (!(guild instanceof Guild)) guild = new Guild(client, guild)
            let user = client.users.get(data.user?.id) || await client.rest.get(client._ENDPOINTS.USER(data.user?.id)).catch(e => { })
            if (!user) return;
            if (!(user instanceof User)) user = new User(client, user)
            data.user = user
            let oldPresence = guild.presences.get(data.user?.id) || { error: "Enable the presences cache to get the old presence data", id: data.user?.id, guild: guild, data_is_available: false }
            let newPresence = new Presence(client, guild, data)
            client.emit('presenceUpdate', oldPresence, newPresence)
            if (typeof client.options.presencesLifeTime === "number" && client.options.presencesLifeTime > 0) {
                newPresence.cachedAt = Date.now()
                newPresence.expireAt = Date.now() + client.options.presencesLifeTime
                guild.presences.set(data.user?.id, newPresence)
                let member = guild.members.get(data.user?.id)
                if (member) {
                    member.presence = newPresence
                    guild.members.set(data.user?.id, member)
                }
                client.guilds.set(guild.id, guild)
            }
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                client.users.set(user.id, user)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}