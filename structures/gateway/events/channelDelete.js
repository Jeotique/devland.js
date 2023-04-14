const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel } = require('../../models')
const CategoryChannel = require('../../models/CategoryChannel')
module.exports = {
    name: 'channelDelete',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
            if (!guild) {
                // gestion message par mp
            } else {
                client.messages.map(msg => {
                    if (msg.channelId === data.id) client.messages.delete(msg.id)
                })
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    if (!(guild instanceof Guild)) guild = new Guild(client, guild)
                    if (data.type === 0) { // text channel
                        let channel = client.textChannels.get(data.id)
                        channel.guild = guild
                        if (channel.parent_id) {
                            let category = client.categoryChannels.get(channel.parent_id)
                            if (category) {
                                category.childrens = category.childrens.filter(id => id !== channel.id)
                                client.categoryChannels.set(category.id, category)
                            }
                        }
                        client.emit('channelDelete', channel)
                        client.emit('channelDeleteText', channel)
                        client.textChannels.delete(data.id)
                    } else if (data.type === 2) { // voice channel
                        let channel = client.voiceChannels.get(data.id)
                        channel.guild = guild
                        if (channel.parent_id) {
                            let category = client.categoryChannels.get(channel.parent_id)
                            if (category) {
                                category.childrens = category.childrens.filter(id => id !== channel.id)
                                client.categoryChannels.set(category.id, category)
                            }
                        }
                        client.emit('channelDelete', channel)
                        client.emit('channelDeleteVoice', channel)
                        client.voiceChannels.delete(data.id)
                    } else if (data.type === 4) { // category channel
                        let channel = client.categoryChannels.get(data.id)
                        let newChannel = new CategoryChannel(client, guild, channel)
                        client.emit('channelDelete', newChannel)
                        client.emit('channelDeleteCategory', newChannel)
                        client.categoryChannels.delete(data.id)
                    } else if (data.type === 5) { // announcement channel
                        let channel = client.announcementChannels.get(data.id)
                        channel.guild = guild
                        if (channel.parent_id) {
                            let category = client.categoryChannels.get(channel.parent_id)
                            if (category) {
                                category.childrens = category.childrens.filter(id => id !== channel.id)
                                client.categoryChannels.set(category.id, category)
                            }
                        }
                        client.emit('channelDelete', channel)
                        client.emit('channelDeleteAnnouncement', channel)
                        client.announcementChannels.delete(data.id)
                    } else if (data.type === 13) { // stage channel
                        let channel = client.stageChannels.get(data.id)
                        channel.guild = guild
                        if (channel.parent_id) {
                            let category = client.categoryChannels.get(channel.parent_id)
                            if (category) {
                                category.childrens = category.childrens.filter(id => id !== channel.id)
                                client.categoryChannels.set(category.id, category)
                            }
                        }
                        client.emit('channelDelete', channel)
                        client.emit('channelDeleteStage', channel)
                        client.stageChannels.delete(data.id)
                    } else if (data.type === 15) { // forum channel
                        let channel = client.forumChannels.get(data.id)
                        channel.guild = guild
                        if (channel.parent_id) {
                            let category = client.categoryChannels.get(channel.parent_id)
                            if (category) {
                                category.childrens = category.childrens.filter(id => id !== channel.id)
                                client.categoryChannels.set(category.id, category)
                            }
                        }
                        client.emit('channelDelete', channel)
                        client.emit('channelDeleteForum', channel)
                        client.forumChannels.delete(data.id)
                    }
                } else {
                    let channel = { error: "Enable the guilds cache to get the old guild data", id: data.id, data_is_available: false }
                    client.emit('channelDelete', channel)
                    if (data.type === 0) client.emit('channelDeleteText', channel)
                    else if (data.type === 2) client.emit('channelDeleteVoice', channel)
                    else if (data.type === 4) client.emit('channelDeleteCategory', channel)
                    else if (data.type === 5) client.emit('channelDeleteAnnouncement', channel)
                    else if (data.type === 13) client.emit('channelDeleteStage', channel)
                    else if (data.type === 15) client.emit('channelDeleteForum', channel)
                }
            }
        } catch (err) { }
    }
}