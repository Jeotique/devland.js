const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, VoiceChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel, Emoji, Member } = require('../../models')
module.exports = {
    name: 'messageReactionAdd',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (guild && !guild instanceof Guild) guild = new Guild(client, guild)
        let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
        if (!channel) return
        if (channel.type === 0) channel = new TextChannel(client, guild, channel)
        else if (channel.type === 1) channel = new DmChannel(client, channel)
        else if (channel.type === 2) channel = new VoiceChannel(client, guild, channel)
        else if (channel.type === 5) channel = new AnnouncementChannel(client, guild, channel)
        else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(client, guild, channel)
        else if (channel.type === 13) channel = new StageChannel(client, guild, channel)
        else if (channel.type === 15) channel = new ForumChannel(client, guild, channel)
        let message = client.messages.get(data.message_id) || await client.rest.get(client._ENDPOINTS.MESSAGES(channel.id, data.message_id))
        if(message && !message instanceof Message) message = new Message(client, guild, channel, message)
        let emoji = new Emoji(client, guild, data.emoji)
        let user = client.users.get(data.user_id) || await client.rest.get(client._ENDPOINTS.USER(data.user_id))
        if(user && !user instanceof User) user = new User(client, user)
        let member;
        if(data.member) member = guild.members.get(data.member.id) || await client.rest.get(client._ENDPOINTS.MEMBERS(guild.id, data.member.id))
        if(member && !member instanceof Member) member = new Member(client, guild, member)
        client.emit('messageReactionAdd', guild, channel, message, user, member, emoji)
    }
}