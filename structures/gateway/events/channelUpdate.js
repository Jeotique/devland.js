const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel, AnnouncementChannel, CategoryChannel, StageChannel, ForumChannel } = require('../../models')
module.exports = {
    name: 'channelUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
        if (!guild) {
            // gestion message par mp
        } else {
            setTimeout(async() => {
            if (!(guild instanceof Guild)) guild = new Guild(client, guild)
            let oldChannel = { error: "Enable the channels cache to get the old channel data", id: data.id, data_is_available: false }
            if (data.type !== 4) {
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    if (data.parent_id) {
                        let category = client.categoryChannels.get(data.parent_id)
                        category.childrens.push(data.id)
                        client.categoryChannels.set(category.id, category)
                    } else {
                        client.categoryChannels.filter(c => c.childrens.includes(data.id)).map(category => {
                            category.childrens = category.childrens.filter(id => id !== data.id)
                            client.categoryChannels.set(category.id, category)
                        })
                    }
                }
            }
            if (data.type === 0) { // text channel
                let text = new TextChannel(client, guild, data)
                if (client.textChannels.has(text.id)) oldChannel = client.textChannels.get(text.id)
                /**
                * Emitted whenever a channel is stage
                * @event client#channelUpdate
                * @param {TextChannel} oldChannel
                * @param {TextChannel} text
                */
                client.emit('channelUpdate', oldChannel, text)
                /**
                * Emitted whenever a text channel is stage
                * @event client#channelUpdateText
                * @param {TextChannel} oldChannel
                * @param {TextChannel} text
                */
                client.emit('channelUpdateText', oldChannel, text)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    text.cachedAt = Date.now()
                    text.expireAt = Date.now() + client.options.channelsLifeTime
                    client.textChannels.set(text.id, text)
                }
            } else if (data.type === 2) { // voice channel
                let voice = new VoiceChannel(client, guild, data)
                if (client.voiceChannels.has(voice.id)) oldChannel = client.voiceChannels.get(voice.id)
                /**
                * Emitted whenever a channel is stage
                * @event client#channelUpdate
                * @param {VoiceChannel} oldChannel
                * @param {VoiceChannel} voice
                */
                client.emit('channelUpdate', oldChannel, voice)
                /**
                * Emitted whenever a text channel is stage
                * @event client#channelUpdateVoice
                * @param {VoiceChannel} oldChannel
                * @param {VoiceChannel} voice
                */
                client.emit('channelUpdateVoice', oldChannel, voice)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    voice.cachedAt = Date.now()
                    voice.expireAt = Date.now() + client.options.channelsLifeTime
                    client.voiceChannels.set(voice.id, voice)
                }
            } else if (data.type === 4) { // category channel
                let category = new CategoryChannel(client, guild, data)
                category.childrens = []
                if (client.categoryChannels.has(category.id)) oldChannel = client.categoryChannels.get(category.id)
                let allChannels = await client.rest.get(client._ENDPOINTS.SERVER_CHANNEL(data.guild_id))
                if (allChannels) {
                    allChannels.filter(child => child.parent_id === data.id).map(child => category.childrens.push(child.id))
                }
                /**
                * Emitted whenever a channel is stage
                * @event client#channelUpdate
                * @param {CategoryChannel} oldChannel
                * @param {CategoryChannel} category
                */
                client.emit('channelUpdate', oldChannel, category)
                /**
                * Emitted whenever a category channel is stage
                * @event client#channelUpdateCategory
                * @param {CategoryChannel} oldChannel
                * @param {CategoryChannel} category
                */
                client.emit('channelUpdateCategory', oldChannel, category)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    category.cachedAt = Date.now()
                    category.expireAt = Date.now() + client.options.channelsLifeTime
                    client.categoryChannels.set(category.id, category)
                }
            } else if (data.type === 5) { // announcement channel
                let announcement = new AnnouncementChannel(client, guild, data)
                if (client.announcementChannels.has(announcement.id)) oldChannel = client.announcementChannels.get(announcement.id)
                /**
                * Emitted whenever a channel is stage
                * @event client#channelUpdate
                * @param {CategoryChannel} oldChannel
                * @param {AnnouncementChannel} announcement
                */
                client.emit('channelUpdate', oldChannel, announcement)
                /**
                * Emitted whenever a announcement channel is stage
                * @event client#channelUpdateAnnouncement
                * @param {AnnouncementChannel} oldChannel
                * @param {AnnouncementChannel} announcement
                */
                client.emit('channelUpdateAnnouncement', oldChannel, announcement)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    announcement.cachedAt = Date.now()
                    announcement.expireAt = Date.now() + client.options.channelsLifeTime
                    client.announcementChannels.set(announcement.id, announcement)
                }
            } else if (data.type === 13) { // stage channel
                let stage = new StageChannel(client, guild, data)
                if (client.stageChannels.has(stage.id)) oldChannel = client.stageChannels.get(stage.id)
                /**
                * Emitted whenever a channel is updated
                * @event client#channelUpdate
                * @param {CategoryChannel} oldChannel
                * @param {StageChannel} stage
                */
                client.emit('channelUpdate', oldChannel, stage)
                /**
                * Emitted whenever a stage channel is stage
                * @event client#channelUpdateStage
                * @param {StageChannel} oldChannel
                * @param {StageChannel} stage
                */
                client.emit('channelUpdateStage', oldChannel, stage)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    stage.cachedAt = Date.now()
                    stage.expireAt = Date.now() + client.options.channelsLifeTime
                    client.stageChannels.set(stage.id, stage)
                }
            } else if (data.type === 15) { // forum channel
                let forum = new ForumChannel(client, guild, data)
                if (client.forumChannels.has(forum.id)) oldChannel = client.forumChannels.get(forum.id)
                /**
                * Emitted whenever a channel is updated
                * @event client#channelUpdate
                * @param {CategoryChannel} oldChannel
                * @param {ForumChannel} forum
                */
                client.emit('channelUpdate', oldChannel, forum)
                /**
                * Emitted whenever a forum channel is stage
                * @event client#channelUpdateForum
                * @param {ForumChannel} oldChannel
                * @param {ForumChannel} forum
                */
                client.emit('channelUpdateForum', oldChannel, forum)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    forum.cachedAt = Date.now()
                    forum.expireAt = Date.now() + client.options.channelsLifeTime
                    client.forumChannels.set(forum.id, forum)
                }
            }
        }, 350)
    }
    }
}