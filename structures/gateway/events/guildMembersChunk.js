const Client = require('../../client/client')
const { Guild, Member, User, Presence } = require('../../models')
module.exports = {
    name: 'guildMembersChunk',
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
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0 && data.members) await Promise.all(data.members.map(member => {
                if (client.users.has(member.user.id)) return
                let user = new User(client, member.user)
                user.cachedAt = Date.now()
                user.expireAt = Date.now() + client.options.usersLifeTime
                return client.users.set(user.id, user)
            }))
            if (typeof client.options.membersLifeTime === "number" && client.options.membersLifeTime > 0 && data.members) await Promise.all(data.members.map((member_data, index) => {
                if (guild.members.has(member_data.user.id)) return
                let member = new Member(client, guild, member_data)
                member.cachedAt = Date.now()
                member.expireAt = Date.now() + client.options.membersLifeTime
                return guild.members.set(member.id, member)
            }))
            if (typeof client.options.presencesLifeTime === "number" && client.options.presencesLifeTime > 0 && data.presences) await Promise.all(data.members.map(member => {
                let user = client.users.get(member.user.id) || new User(client, member.user)
                if (guild.presences.has(user.id)) return
                let presence_data = data.presences.find(p => p.user?.id === user.id)
                if (!presence_data) {
                    let raw_data = {
                        user: user
                    }
                    let presence = new Presence(client, guild, raw_data)
                    presence.cachedAt = Date.now()
                    presence.expireAt = Date.now() + client.options.presencesLifeTime
                    if (guild.members.has(user.id)) {
                        let g_member = guild.members.get(user.id)
                        g_member.presence = presence
                        guild.members.set(user.id, g_member)
                    }
                    return guild.presences.set(user.id, presence)
                } else {
                    presence_data.user = user
                    let presence = new Presence(client, guild, presence_data)
                    presence.cachedAt = Date.now()
                    presence.expireAt = Date.now() + client.options.presencesLifeTime
                    if (guild.members.has(user.id)) {
                        let g_member = guild.members.get(user.id)
                        g_member.presence = presence
                        guild.members.set(user.id, g_member)
                    }
                    return guild.presences.set(user.id, presence)
                }
            }))
            client.emit('guildMembersChunck', guild)
            if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                guild.cachedAt = Date.now()
                guild.expireAt = Date.now() + client.options.guildsLifeTime
                client.guilds.set(guild.id, guild)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}