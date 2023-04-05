const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User } = require('../../models')
module.exports = {
    name: 'message',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
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
            guild = new Guild(client, guild)
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
            if (!channel) return
            let message = new Message(client, guild, new TextChannel(client, guild, channel), data)
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