const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member, User, Invite, VoiceChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel } = require('../../models')
module.exports = {
    name: 'inviteDelete',
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
            let allChannels = await client.rest.get(client._ENDPOINTS.SERVER_CHANNEL(guild.id))
            let channel_data = allChannels.find(c => c.id === data.channel_id)
            let channel = undefined;
            if (channel_data.type === 0) channel = new TextChannel(client, guild, channel_data)
            else if (channel_data.type === 2) channel = new VoiceChannel(client, guild, channel_data)
            else if (channel_data.type === 5) channel = new AnnouncementChannel(client, guild, channel_data)
            else if (channel_data.type === 10 || channel_data.type === 11 || channel_data.type === 12) channel = new Thread(client, guild, channel_data)
            else if (channel_data.type === 13) channel = new StageChannel(client, guild, channel_data)
            else if (channel_data.type === 15) channel = new ForumChannel(client, guild, channel_data)
            let invite = guild.invites.get(data.code)
            if (!invite) invite = { error: "Enable the invites cache to get the old invite data", code: data.code, guild: guild, channel: channel, data_is_available: false }
            guild.invites.delete(data.code)
            client.emit('inviteDelete', invite)
            if (typeof client.options.invitesLifeTime === "number" && client.options.invitesLifeTime > 0) {
                invite.cachedAt = Date.now()
                invite.expireAt = Date.now() + client.options.invitesLifeTime
                guild.invites.delete(invite.code)
                client.guilds.set(guild.id, guild)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}