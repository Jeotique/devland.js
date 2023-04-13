const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Member, VoiceChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel } = require('../../models')
module.exports = {
    name: 'message',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))
        if (!guild) {
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
            if (!channel) return
            channel.user = client.users.get(data?.author?.id) || new User(client, data.author)
            let dm_channel = new DmChannel(client, channel)
            client.dmChannels.set(dm_channel.id, dm_channel)
            let message = new Message(client, guild, dm_channel, data)
            /**
             * Emitted whenever a message is sended
             * @event client#message
             * @param {Message} message
             */
            client.emit('message', message)
            if (typeof client.options.messagesLifeTime === "number" && client.options.messagesLifeTime > 0) {
                message.cachedAt = Date.now()
                message.expireAt = Date.now() + client.options.messagesLifeTime
                client.messages.set(message.id, message)
            }
        } else {
            if(!(guild instanceof Guild)) guild = new Guild(client, guild)
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => {  })
            if (!channel) return 
            if (channel.type === 0) channel = new TextChannel(client, guild, channel)
            else if (channel.type === 2) channel = new VoiceChannel(client, guild, channel)
            else if (channel.type === 5) channel = new AnnouncementChannel(client, guild, channel)
            else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(client, guild, channel)
            else if (channel.type === 13) channel = new StageChannel(client, guild, channel)
            else if (channel.type === 15) channel = new ForumChannel(client, guild, channel)
            let member;
            if(!data.webhook_id) member = guild.members.get(data.author?.id) || await client.rest.get(client._ENDPOINTS.MEMBERS(guild.id, data.author?.id))
            let user;
            if(member && !(member instanceof Member) && !member.user) user = client.users.get(data.author?.id) || await client.rest.get(client._ENDPOINTS.USER(data.author?.id))
            if(user && !(user instanceof User)) user = new User(client, user)
            if(user && !member.user) member.user = user
            if(member && !(member instanceof Member)) member = new Member(client, guild, member)
            data.member = member
            let message = new Message(client, guild, channel, data)
            /**
             * Emitted whenever a message is sended
             * @event client#message
             * @param {Message} message
             */
            client.emit('message', message)
            if (typeof client.options.messagesLifeTime === "number" && client.options.messagesLifeTime > 0) {
                message.cachedAt = Date.now()
                message.expireAt = Date.now() + client.options.messagesLifeTime
                client.messages.set(message.id, message)
            }
            if (client.textChannels.has(message.channelId)) {
                client.textChannels.set(message.channelId, message.channel)
            }
            if (client.voiceChannels.has(message.channelId)) {
                client.voiceChannels.set(message.channelId, message.channel)
            }
            if (client.announcementChannels.has(message.channelId)) {
                client.announcementChannels.set(message.channelId, message.channel)
            }
            if (client.threadChannels.has(message.channelId)) {
                client.threadChannels.set(message.channelId, message.channel)
            }
            if (client.forumChannels.has(message.channelId)) {
                client.forumChannels.set(message.channelId, message.channel)
            }
        }

    }
}