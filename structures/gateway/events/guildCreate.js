const Client = require('../../client/client')
const Models = require('../../models')
const Member = require('../../models/Member')
const Presence = require('../../models/Presence')
const Role = require('../../models/Role')
module.exports = {
    name: 'guildCreate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            if (client.guilds.has(data.id) && client.guilds.get(data.id).ready === false) {
                data.ready = true
                let guild = new Models.Guild(client, data)
                if (typeof client.options.rolesLifeTime === "number" && client.options.rolesLifeTime > 0) {
                    data.roles.map(role_data => {
                        let role = new Role(client, guild, role_data)
                        role.cachedAt = Date.now()
                        role.expireAt = Date.now() + client.options.rolesLifeTime
                        guild.roles.set(role.id, role)
                    })
                }
                if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                    data.members.map(member => {
                        let user = new Models.User(client, member.user)
                        user.cachedAt = Date.now()
                        user.expireAt = Date.now() + client.options.usersLifeTime
                        client.users.set(user.id, user)
                    })
                }
                if (typeof client.options.presencesLifeTime === "number" && client.options.presencesLifeTime > 0) {
                    data.members.map(member => {
                        let user = client.users.get(member.user.id) || new Models.User(client, member.user)
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
                            guild.presences.set(user.id, presence)
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
                            guild.presences.set(user.id, presence)
                        }
                    })
                }
                if (typeof client.options.voicesLifeTime === "number" && client.options.voicesLifeTime > 0) {
                    data.members.map(async member => {
                        let user = client.users.get(member.user.id) || new Models.User(client, member.user)
                        let member_class = guild.members.get(member.user.id) || new Models.Member(client, guild, member)
                        let voice_data = data.voice_states.find(p => p.user_id === user.id)
                        if (!voice_data) {
                            let raw_data = {
                                user: user,
                                guild: guild,
                                member: member_class,
                                user_id: user.id,
                                guild_id: guild.id,
                            }
                            let voice = new Models.VoiceState(client, raw_data)
                            voice.cachedAt = Date.now()
                            voice.expireAt = Date.now() + client.options.voicesLifeTime
                            if (guild.members.has(user.id)) {
                                let g_member = guild.members.get(user.id)
                                g_member.voice = voice
                                guild.members.set(user.id, g_member)
                            }
                            guild.voicesStates.set(user.id, voice)
                        } else {
                            let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(voice_data.channel_id)).catch(e => { })
                            if (channel) {
                                if (channel.type === 0) channel = new Models.TextChannel(client, guild, channel)
                                else if (channel.type === 1) channel = new Models.DmChannel(client, channel)
                                else if (channel.type === 2) channel = new Models.VoiceChannel(client, guild, channel)
                                else if (channel.type === 5) channel = new Models.AnnouncementChannel(client, guild, channel)
                                else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Models.Thread(client, guild, channel)
                                else if (channel.type === 13) channel = new Models.StageChannel(client, guild, channel)
                                else if (channel.type === 15) channel = new Models.ForumChannel(client, guild, channel)
                                voice_data.user = user
                                voice_data.guild = guild
                                voice_data.guild_id = guild.id
                                voice_data.member = guild.members.get(member.user.id) || member_class
                                voice_data.channel = channel
                                let voice = new Models.VoiceState(client, voice_data)
                                voice.cachedAt = Date.now()
                                voice.expireAt = Date.now() + client.options.voicesLifeTime
                                if (guild.members.has(user.id)) {
                                    let g_member = guild.members.get(user.id)
                                    g_member.voice = voice
                                    guild.members.set(user.id, g_member)
                                }
                                guild.voicesStates.set(user.id, voice)
                            } else {
                                let raw_data = {
                                    user: user,
                                    guild: guild,
                                    member: guild.members.get(member.user.id) || member_class,
                                    user_id: user.id,
                                    guild_id: guild.id,
                                }
                                let voice = new Models.VoiceState(client, raw_data)
                                voice.cachedAt = Date.now()
                                voice.expireAt = Date.now() + client.options.voicesLifeTime
                                if (guild.members.has(user.id)) {
                                    let g_member = guild.members.get(user.id)
                                    g_member.voice = voice
                                    guild.members.set(user.id, g_member)
                                }
                                guild.voicesStates.set(user.id, voice)
                            }
                        }
                    })
                }
                if (typeof client.options.membersLifeTime === "number" && client.options.membersLifeTime > 0) {
                    data.members.map(member_data => {
                        let member = new Member(client, guild, member_data)
                        member.cachedAt = Date.now()
                        member.expireAt = Date.now() + client.options.membersLifeTime
                        guild.members.set(member.id, member)
                    })
                }
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    data.channels.filter(channel => channel.type === 0).map(channel => {
                        let text = new Models.TextChannel(client, guild, channel)
                        text.cachedAt = Date.now()
                        text.expireAt = Date.now() + client.options.channelsLifeTime
                        client.textChannels.set(text.id, text)
                    })
                    data.channels.filter(channel => channel.type === 2).map(channel => {
                        let voice = new Models.VoiceChannel(client, guild, channel)
                        voice.cachedAt = Date.now()
                        voice.expireAt = Date.now() + client.options.channelsLifeTime
                        client.voiceChannels.set(voice.id, voice)
                    })
                    data.channels.filter(channel => channel.type === 4).map(channel => {
                        let category = new Models.CategoryChannel(client, guild, channel)
                        data.channels.filter(child => child.parent_id === category.id || child.parentId === category.id).map(child => category.childrens.push(child.id))
                        category.cachedAt = Date.now()
                        category.expireAt = Date.now() + client.options.channelsLifeTime
                        client.categoryChannels.set(category.id, category)
                    })
                    data.channels.filter(channel => channel.type === 5).map(channel => {
                        let announcement = new Models.AnnouncementChannel(client, guild, channel)
                        announcement.cachedAt = Date.now()
                        announcement.expireAt = Date.now() + client.options.channelsLifeTime
                        client.announcementChannels.set(announcement.id, announcement)
                    })
                    data.channels.filter(channel => channel.type === 10 || channel.type === 11 || channel.type === 12).map(channel => {
                        let thread = new Models.Thread(client, guild, channel)
                        thread.cachedAt = Date.now()
                        thread.expireAt = Date.now() + client.options.channelsLifeTime
                        client.threadChannels.set(thread.id, thread)
                    })
                    data.channels.filter(channel => channel.type === 13).map(channel => {
                        let stage = new Models.StageChannel(client, guild, channel)
                        stage.cachedAt = Date.now()
                        stage.expireAt = Date.now() + client.options.channelsLifeTime
                        client.stageChannels.set(stage.id, stage)
                    })
                    data.channels.filter(channel => channel.type === 15).map(channel => {
                        let forum = new Models.ForumChannel(client, guild, channel)
                        forum.cachedAt = Date.now()
                        forum.expireAt = Date.now() + client.options.channelsLifeTime
                        client.forumChannels.set(forum.id, forum)
                    })
                }

                /**
                 * Emitted whenever the guild data is available
                 * @event client#guildAvailable
                 * @param {Models.Guild} guild
                 */
                client.emit('guildAvailable', guild)
                guild.cachedAt = Date.now()
                guild.expireAt = Date.now() + client.options.guildsLifeTime
                client.guilds.set(guild.id, guild)
            } else {
                data.ready = true
                client.guildsIds.push(data.id)
                let guild = new Models.Guild(client, data)
                if (typeof client.options.rolesLifeTime === "number" && client.options.rolesLifeTime > 0) await Promise.all(data.roles.map(role_data => {
                    let role = new Role(client, guild, role_data)
                    role.cachedAt = Date.now()
                    role.expireAt = Date.now() + client.options.rolesLifeTime
                    return guild.roles.set(role.id, role)
                }))
                if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) await Promise.all(data.members.map(member => {
                    let user = new Models.User(client, member.user)
                    user.cachedAt = Date.now()
                    user.expireAt = Date.now() + client.options.usersLifeTime
                    return client.users.set(user.id, user)
                }))
                if (typeof client.options.membersLifeTime === "number" && client.options.membersLifeTime > 0) await Promise.all(data.members.map(member_data => {
                    let member = new Member(client, guild, member_data)
                    member.cachedAt = Date.now()
                    member.expireAt = Date.now() + client.options.membersLifeTime
                    return guild.members.set(member.id, member)
                }))
                if (typeof client.options.presencesLifeTime === "number" && client.options.presencesLifeTime > 0) await Promise.all(data.members.map(member => {
                    let user = client.users.get(member.user.id) || new Models.User(client, member.user)
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
                if (typeof client.options.voicesLifeTime === "number" && client.options.voicesLifeTime > 0) await Promise.all(data.members.map(async member => {
                    let user = client.users.get(member.user.id) || new Models.User(client, member.user)
                    let member_class = guild.members.get(member.user.id) || new Models.Member(client, guild, member)
                    let voice_data = data.voice_states.find(p => p.user_id === user.id)
                    if (!voice_data) {
                        let raw_data = {
                            user: user,
                            guild: guild,
                            member: member_class,
                            user_id: user.id,
                            guild_id: guild.id,
                        }
                        let voice = new Models.VoiceState(client, raw_data)
                        voice.cachedAt = Date.now()
                        voice.expireAt = Date.now() + client.options.voicesLifeTime
                        if (guild.members.has(user.id)) {
                            let g_member = guild.members.get(user.id)
                            g_member.voice = voice
                            guild.members.set(user.id, g_member)
                        }
                        return guild.voicesStates.set(user.id, voice)
                    } else {
                        let channel = await client.rest.get(client._ENDPOINTS.CHANNEL(voice_data.channel_id))//.catch(e => {  })
                        if (channel) {
                            if (channel.type === 0) channel = new Models.TextChannel(client, guild, channel)
                            else if (channel.type === 1) channel = new Models.DmChannel(client, channel)
                            else if (channel.type === 2) channel = new Models.VoiceChannel(client, guild, channel)
                            else if (channel.type === 5) channel = new Models.AnnouncementChannel(client, guild, channel)
                            else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Models.Thread(client, guild, channel)
                            else if (channel.type === 13) channel = new Models.StageChannel(client, guild, channel)
                            else if (channel.type === 15) channel = new Models.ForumChannel(client, guild, channel)
                            voice_data.user = user
                            voice_data.guild = guild
                            voice_data.guild_id = guild.id
                            voice_data.member = guild.members.get(member.user.id) || member_class
                            voice_data.channel = channel
                            let voice = new Models.VoiceState(client, voice_data)
                            voice.cachedAt = Date.now()
                            voice.expireAt = Date.now() + client.options.voicesLifeTime
                            if (guild.members.has(user.id)) {
                                let g_member = guild.members.get(user.id)
                                g_member.voice = voice
                                guild.members.set(user.id, g_member)
                            }
                            return guild.voicesStates.set(user.id, voice)
                        } else {
                            let raw_data = {
                                user: user,
                                guild: guild,
                                member: guild.members.get(member.user.id) || member_class,
                                user_id: user.id,
                                guild_id: guild.id,
                            }
                            let voice = new Models.VoiceState(client, raw_data)
                            voice.cachedAt = Date.now()
                            voice.expireAt = Date.now() + client.options.voicesLifeTime
                            if (guild.members.has(user.id)) {
                                let g_member = guild.members.get(user.id)
                                g_member.voice = voice
                                guild.members.set(user.id, g_member)
                            }
                            return guild.voicesStates.set(user.id, voice)
                        }
                    }
                }))

                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) await Promise.all(data.channels.filter(channel => channel.type === 0).map(channel => {
                    let text = new Models.TextChannel(client, guild, channel)
                    text.cachedAt = Date.now()
                    text.expireAt = Date.now() + client.options.channelsLifeTime
                    return client.textChannels.set(text.id, text)
                }),
                    data.channels.filter(channel => channel.type === 2).map(channel => {
                        let voice = new Models.VoiceChannel(client, guild, channel)
                        voice.cachedAt = Date.now()
                        voice.expireAt = Date.now() + client.options.channelsLifeTime
                        return client.voiceChannels.set(voice.id, voice)
                    }),
                    data.channels.filter(channel => channel.type === 4).map(channel => {
                        let category = new Models.CategoryChannel(client, guild, channel)
                        data.channels.filter(child => child.parent_id === category.id || child.parentId === category.id).map(child => category.childrens.push(child.id))
                        category.cachedAt = Date.now()
                        category.expireAt = Date.now() + client.options.channelsLifeTime
                        return client.categoryChannels.set(category.id, category)
                    }),
                    data.channels.filter(channel => channel.type === 5).map(channel => {
                        let announcement = new Models.AnnouncementChannel(client, guild, channel)
                        announcement.cachedAt = Date.now()
                        announcement.expireAt = Date.now() + client.options.channelsLifeTime
                        return client.announcementChannels.set(announcement.id, announcement)
                    }),
                    data.channels.filter(channel => channel.type === 10 || channel.type === 11 || channel.type === 12).map(channel => {
                        let thread = new Models.Thread(client, guild, channel)
                        thread.cachedAt = Date.now()
                        thread.expireAt = Date.now() + client.options.channelsLifeTime
                        return client.threadChannels.set(thread.id, thread)
                    }),
                    data.channels.filter(channel => channel.type === 13).map(channel => {
                        let stage = new Models.StageChannel(client, guild, channel)
                        stage.cachedAt = Date.now()
                        stage.expireAt = Date.now() + client.options.channelsLifeTime
                        return client.stageChannels.set(stage.id, stage)
                    }),
                    data.channels.filter(channel => channel.type === 15).map(channel => {
                        let forum = new Models.ForumChannel(client, guild, channel)
                        forum.cachedAt = Date.now()
                        forum.expireAt = Date.now() + client.options.channelsLifeTime
                        return client.forumChannels.set(forum.id, forum)
                    }))
                /**
                 * Emitted whenever the bot join a new guild
                 * @event client#guildAdded
                 * @param {Models.Guild} guild
                 */
                client.emit('guildAdded', guild)
                if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                    guild.cachedAt = Date.now()
                    guild.expireAt = Date.now() + client.options.guildsLifeTime
                    client.guilds.set(guild.id, guild)
                }
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}