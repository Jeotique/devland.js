const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member, User, VoiceChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel } = require('../../models')
const MessageFlags = require('../../util/BitFieldManagement/MessageFlags')
module.exports = {
    name: 'messageUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
<<<<<<< Updated upstream
        const data = d.d
        let oldMessage = client.messages.get(data.id)
        let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
        if (guild && !(guild instanceof Guild)) guild = new Guild(client, guild)
        let test = new MessageFlags(BigInt(data.flags ?? 0))
        if (test.has("LOADING")) return;
        if (!guild) {
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
            if (!channel) return
            channel.user = client.users.get(data?.author?.id) || new User(client, data.author)
            let dm_channel = new DmChannel(client, channel)
            client.dmChannels.set(dm_channel.id, dm_channel)
            let message = new Message(client, guild, dm_channel, data)

            if (oldMessage) {
                /**
                 * Emitted whenever a message is updated
                 * @event client#messageUpdate
                 * @param {Message} oldMessage
                 * @param {Message} message
                 */
                client.emit('messageUpdate', oldMessage, message)
                if (typeof client.options.messagesLifeTime === "number" && client.options.messagesLifeTime > 0 && client.options.messagesLifeTimeResetAfterEvents) {
                    message.cachedAt = Date.now()
                    message.expireAt = Date.now() + client.options.messagesLifeTime
                    client.messages.set(message.id, message)
                }

            } else {
                /**
                 * Emitted whenever a message is updated
                 * @event client#messageUpdate
                 * @param {object} oldMessage
                 * @param {Message} message
                 */
                client.emit('messageUpdate', { error: "Enable the messages cache to get the old message data", guild: guild, channel: channel, id: data.id, data_is_available: false }, message)
            }
        } else {
            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
            if (!channel) return
            if (channel.type === 0) channel = new TextChannel(client, guild, channel)
            else if (channel.type === 2) channel = new VoiceChannel(client, guild, channel)
            else if (channel.type === 5) channel = new AnnouncementChannel(client, guild, channel)
            else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(client, guild, channel)
            else if (channel.type === 13) channel = new StageChannel(client, guild, channel)
            else if (channel.type === 15) channel = new ForumChannel(client, guild, channel)
            let member;
            if (!data.webhook_id) member = guild.members.get(data.author?.id) || await client.rest.get(client._ENDPOINTS.MEMBERS(guild.id, data.author?.id))
            let user;
            if (member && !(member instanceof Member) && !member.user) user = client.users.get(data.author?.id) || await client.rest.get(client._ENDPOINTS.USER(data.author?.id))
            if (user && !(user instanceof User)) user = new User(client, user)
            if (user && !member.user) member.user = user
            if (member && !(member instanceof Member)) member = new Member(client, guild, member)
            data.member = member
            let message = new Message(client, guild, channel, data)

            if (oldMessage) {
                /**
                 * Emitted whenever a message is updated
                 * @event client#messageUpdate
                 * @param {Message} oldMessage
                 * @param {Message} message
                 */
                client.emit('messageUpdate', oldMessage, message)
                if (typeof client.options.messagesLifeTime === "number" && client.options.messagesLifeTime > 0 && client.options.messagesLifeTimeResetAfterEvents) {
                    message.cachedAt = Date.now()
                    message.expireAt = Date.now() + client.options.messagesLifeTime
                    client.messages.set(message.id, message)
=======
        try {
            const data = d.d
            let oldMessage = client.messages.get(data.id)
            let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
            if (guild && !(guild instanceof Guild)) guild = new Guild(client, guild)
            let test = new MessageFlags(BigInt(data.flags ?? 0))
            if (test.has("LOADING")) return;
            if (typeof data.type === "undefined" || typeof data.timestamp === "undefined") {
                if (!oldMessage) return
                Object.keys(data).map(k => {
                    if (typeof oldMessage[k] !== "undefined") oldMessage[k] = data[k]
                })
                client.messages.set(data.id, oldMessage)
            } else {
                if (!guild) {
                    let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
                    if (!channel) return
                    channel.user = client.users.get(data?.author?.id) || new User(client, data.author)
                    let dm_channel = new DmChannel(client, channel)
                    client.dmChannels.set(dm_channel.id, dm_channel)
                    let message = new Message(client, guild, dm_channel, data)

                    if (oldMessage) {
                        /**
                         * Emitted whenever a message is updated
                         * @event client#messageUpdate
                         * @param {Message} oldMessage
                         * @param {Message} message
                         */
                        client.emit('messageUpdate', oldMessage, message)
                        if (typeof client.options.messagesLifeTime === "number" && client.options.messagesLifeTime > 0 && client.options.messagesLifeTimeResetAfterEvents) {
                            message.cachedAt = Date.now()
                            message.expireAt = Date.now() + client.options.messagesLifeTime
                            client.messages.set(message.id, message)
                        }

                    } else {
                        /**
                         * Emitted whenever a message is updated
                         * @event client#messageUpdate
                         * @param {object} oldMessage
                         * @param {Message} message
                         */
                        client.emit('messageUpdate', { error: "Enable the messages cache to get the old message data", guild: guild, channel: channel, id: data.id, data_is_available: false }, message)
                    }
                } else {
                    let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(data.channel_id)).catch(e => { })
                    if (!channel) return
                    if (channel.type === 0) channel = new TextChannel(client, guild, channel)
                    else if (channel.type === 2) channel = new VoiceChannel(client, guild, channel)
                    else if (channel.type === 5) channel = new AnnouncementChannel(client, guild, channel)
                    else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(client, guild, channel)
                    else if (channel.type === 13) channel = new StageChannel(client, guild, channel)
                    else if (channel.type === 15) channel = new ForumChannel(client, guild, channel)
                    let member;
                    if (!data.webhook_id) member = guild.members.get(data.author?.id) || await client.rest.get(client._ENDPOINTS.MEMBERS(guild.id, data.author?.id))
                    let user;
                    if (member && !(member instanceof Member) && !member.user) user = client.users.get(data.author?.id) || await client.rest.get(client._ENDPOINTS.USER(data.author?.id)).catch(e => { })
                    if (user && !(user instanceof User)) user = new User(client, user)
                    if (user && !member.user) member.user = user
                    if (member && !(member instanceof Member)) member = new Member(client, guild, member)
                    data.member = member
                    let message = new Message(client, guild, channel, data)

                    if (oldMessage) {
                        /**
                         * Emitted whenever a message is updated
                         * @event client#messageUpdate
                         * @param {Message} oldMessage
                         * @param {Message} message
                         */
                        client.emit('messageUpdate', oldMessage, message)
                        if (typeof client.options.messagesLifeTime === "number" && client.options.messagesLifeTime > 0 && client.options.messagesLifeTimeResetAfterEvents) {
                            message.cachedAt = Date.now()
                            message.expireAt = Date.now() + client.options.messagesLifeTime
                            client.messages.set(message.id, message)
                        }

                    } else {
                        /**
                         * Emitted whenever a message is updated
                         * @event client#messageUpdate
                         * @param {object} oldMessage
                         * @param {Message} message
                         */
                        client.emit('messageUpdate', { error: "Enable the messages cache to get the old message data", guild: guild, channel: channel, id: data.id, data_is_available: false }, message)
                    }
>>>>>>> Stashed changes
                }

            } else {
                /**
                 * Emitted whenever a message is updated
                 * @event client#messageUpdate
                 * @param {object} oldMessage
                 * @param {Message} message
                 */
                client.emit('messageUpdate', { error: "Enable the messages cache to get the old message data", guild: guild, channel: channel, id: data.id, data_is_available: false }, message)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}