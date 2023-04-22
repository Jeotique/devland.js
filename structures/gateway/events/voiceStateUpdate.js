const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, VoiceChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel, Emoji, Member, VoiceState } = require('../../models')
module.exports = {
    name: 'voiceStateUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
            if (guild && !(guild instanceof Guild)) guild = new Guild(client, guild)
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
            if (channel) {
                if (channel.type === 0) channel = new TextChannel(client, guild, channel)
                else if (channel.type === 1) channel = new DmChannel(client, channel)
                else if (channel.type === 2) channel = new VoiceChannel(client, guild, channel)
                else if (channel.type === 5) channel = new AnnouncementChannel(client, guild, channel)
                else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(client, guild, channel)
                else if (channel.type === 13) channel = new StageChannel(client, guild, channel)
                else if (channel.type === 15) channel = new ForumChannel(client, guild, channel)
            }
            let user = client.users.get(data.user_id) || await client.rest.get(client._ENDPOINTS.USER(data.user_id)).catch(e => { })
            if (user && !(user instanceof User)) user = new User(client, user)
            let member;
            if (data.member) member = guild.members.get(data.user_id) || await client.rest.get(client._ENDPOINTS.MEMBERS(guild.id, data.user_id))
            if (member && !(member instanceof Member) && (user instanceof User)) member.user = user
            if (member && !(member instanceof Member)) member = new Member(client, guild, member)
            data.member = member
            data.user = user
            data.guild = guild
            data.channel = channel
            let voicestate = new VoiceState(client, data)
            let oldData = guild.voicesStates.get(data.user_id) || { error: "Enable the voices cache to get the old voice state data", id: data.user_id, guild: guild, data_is_available: false }
            client.emit('voiceStateUpdate', oldData, voicestate)
            if (typeof client.options.voicesLifeTime === "number" && client.options.voicesLifeTime > 0) {
                voicestate.cachedAt = Date.now()
                voicestate.expireAt = Date.now() + client.options.voicesLifeTime
                let member = guild.members.get(data.user?.id)
                if (member) {
                    member.voice = voicestate
                    guild.members.set(data.user_id, member)
                }
                guild.voicesStates.set(data.user_id, voicestate)
            }
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                client.users.set(user.id, user)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}