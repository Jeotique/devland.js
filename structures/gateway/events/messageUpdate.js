const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member, User, VoiceChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel, Role } = require('../../models')
const MessageFlags = require('../../util/BitFieldManagement/MessageFlags')
const { Store } = require('../../util/Store/Store')
module.exports = {
    name: 'messageUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
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
                    data.roleMentions = await fetchMentionsRoles()
                    data.channelMentions = await fetchMentionsChannels()
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
                    async function fetchMentionsRoles() {
                        return new Promise(async (resolve) => {
                            if (!data?.mention_roles || data?.mention_roles?.length < 1) return resolve(undefined)
                            let roleMentions = new Store()
                            if (guild.roles.size > 0) {
                                data.mention_roles.map((r_id, index) => {
                                    roleMentions.set(r_id, guild.roles.get(r_id))
                                    if (index + 1 === data.mention_roles.length) return resolve(roleMentions)
        
                                })
                            } else {
                                let allroles = await client.rest.get(client._ENDPOINTS.ROLES(guild.id)).catch(e => { })
                                if (!allroles) return resolve(undefined)
                                allroles.filter(r => data.mention_roles.includes(r.id)).map(role => roleMentions.set(role.id, new Role(client, guild, role)))
                                return resolve(roleMentions)
                            }
                        })
                    }
                    async function fetchMentionsChannels() {
                        return new Promise(async (resolve) => {
                            let test = data.content?.split('<')
                            let channelMentions = new Store()
                            if (!test) return resolve(channelMentions)
                            if (test.length < 1) return resolve(channelMentions)
                            if (client.options.channelsLifeTime > 0) {
                                test.map((channel, index) => {
                                    if (!channel.includes('#')) {
                                        if (index + 1 === test.length) return resolve(channelMentions)
                                    } else {
                                        channel = channel.replace('<', '').replace('>', '').replace('#', '')
                                        if (isNaN(channel)) {
                                            if (index + 1 === test.length) return resolve(channelMentions)
                                        } else {
                                            channel = client.textChannels.get(channel) || client.voiceChannels.get(channel) || client.announcementChannels.get(channel) || client.threadChannels.get(channel) || client.stageChannels.get(channel) || client.forumChannels.get(channel)
                                            if (!channel) {
                                                if (index + 1 === test.length) return resolve(channelMentions)
                                            } else {
                                                channelMentions.set(channel.id, channel)
                                                if (index + 1 === test.length) return resolve(channelMentions)
                                            }
                                        }
                                    }
                                })
                            } else {
                                await Promise.all(test.map(async (channel_id, index) => {
                                    channel_id = channel_id.slice(0, 20)
                                    if (!channel_id || channel_id === '') return
                                    if (isNaN(channel_id.replace('#', '')) || channel_id.includes(' ')) channel_id = channel_id.slice(0, 19)
                                    if (isNaN(channel_id.replace('#', '')) || channel_id.includes(' ')) return
                                    if (!channel_id.includes('#')) {
                                        return
                                    } else {
                                        channel_id = channel_id.replace('<', '').replace('>', '').replace('#', '')
                                        if (isNaN(channel_id)) {
                                            return
                                        } else {
                                            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(channel_id))
                                            if (!channel) {
                                                return
                                            } else {
                                                if (channel.type === 0) channel = new TextChannel(client, guild, channel)
                                                else if (channel.type === 2) channel = new VoiceChannel(client, guild, channel)
                                                else if (channel.type === 5) channel = new AnnouncementChannel(client, guild, channel)
                                                else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(client, guild, channel)
                                                else if (channel.type === 13) channel = new StageChannel(client, guild, channel)
                                                else if (channel.type === 15) channel = new ForumChannel(client, guild, channel)
                                                channelMentions.set(channel.id, channel)
                                                return
                                            }
                                        }
                                    }
                                }))
                                return resolve(channelMentions)
                            }
                        })
                    }
                }
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}