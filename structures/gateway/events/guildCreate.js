const Client = require('../../client/client')
const Models = require('../../models')
const Member = require('../../models/Member')
const Role = require('../../models/Role')
module.exports = {
    name: 'guildCreate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        if (client.guilds.has(data.id) && client.guilds.get(data.id).ready === false) {
            data.ready = true
            let guild = new Models.Guild(client, data)
            if(typeof client.options.rolesLifeTime === "number" && client.options.rolesLifeTime > 0) {
                data.roles.map(role_data => {
                    let role = new Role(client, guild, role_data)
                    role.cachedAt = Date.now()
                    role.expireAt = Date.now() + client.options.rolesLifeTime
                    guild.roles.set(role.id, role)
                })
            }
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                data.members.map(member => {
                    console.log(member)
                    let user = new Models.User(client, member.user)
                    user.cachedAt = Date.now()
                    user.expireAt = Date.now() + client.options.usersLifeTime
                    client.users.set(user.id, user)
                })
            }
            if(typeof client.options.membersLifeTime === "number" && client.options.membersLifeTime > 0) {
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
                    data.channels.filter(child => child.parent_id === category.id || child.parentId === category.id).map(child => category.childrens.push(child))
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
            let guild = new Models.Guild(client, data)
            if(typeof client.options.rolesLifeTime === "number" && client.options.rolesLifeTime > 0) {
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
            if(typeof client.options.membersLifeTime === "number" && client.options.membersLifeTime > 0) {
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
                    data.channels.filter(child => child.parent_id === category.id || child.parentId === category.id).map(child => category.childrens.push(child))
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
    }
}