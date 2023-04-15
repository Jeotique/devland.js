const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member, User, Presence, VoiceState } = require('../../models')
module.exports = {
    name: 'guildMemberAdd',
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
            let user = new User(client, data.user)
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                user.cachedAt = Date.now()
                user.expireAt = Date.now() + client.options.usersLifeTime
                client.users.set(user.id, user)
            }
            guild.member_count++
            let member = new Member(client, guild, data)
            client.emit('memberJoin', member)
            if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                client.guilds.set(guild.id, guild)
            }
            if (typeof client.options.presencesLifeTime === "number" && client.options.presencesLifeTime > 0) {
                let presence = new Presence(client, guild, {
                    user: user
                })
                presence.cachedAt = Date.now()
                presence.expireAt = Date.now() + client.options.presencesLifeTime
                guild.presences.set(user.id, presence)
            }
            if (typeof client.options.voicesLifeTime === "number" && client.options.voicesLifeTime > 0) {
                let voice = new VoiceState(client, {
                    user: user,
                    user_id: user.id,
                    guild: guild,
                    guild_id: guild.id,
                    member: member
                })
                voice.cachedAt = Date.now()
                voice.expireAt = Date.now() + client.options.voicesLifeTime
                guild.voicesStates.set(user.id, voice)
            }
            if (typeof client.options.membersLifeTime === "number" && client.options.membersLifeTime > 0) {
                member.cachedAt = Date.now()
                member.expireAt = Date.now() + client.options.membersLifeTime
                guild.members.set(member.id, member)
                client.guilds.set(guild.id, guild)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}