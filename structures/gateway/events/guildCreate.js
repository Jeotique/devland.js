const Client = require('../../client/client')
const Models = require('../../models')
const Member = require('../../models/Member')
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
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                data.members.map(member => {
                    let user = new Models.User(client, member.user)
                    user.cachedAt = Date.now()
                    user.expireAt = Date.now() + client.options.usersLifeTime
                    client.users.set(user.id, user)
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