const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, VoiceChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel } = require('../../models')
module.exports = {
    name: 'channelPinsUpdate',
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
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
            if (!channel) return
            if (channel.type === 0) channel = new TextChannel(client, guild, channel)
            else if (channel.type = 1) channel = new DmChannel(client, channel)
            else if (channel.type === 2) channel = new VoiceChannel(client, guild, channel)
            else if (channel.type === 5) channel = new AnnouncementChannel(client, guild, channel)
            else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(client, guild, channel)
            else if (channel.type === 13) channel = new StageChannel(client, guild, channel)
            else if (channel.type === 15) channel = new ForumChannel(client, guild, channel)
            client.emit('channelPinsUpdate', channel)
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}