const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel, AnnouncementChannel, StageChannel, ForumChannel } = require('../../models')
const CategoryChannel = require('../../models/CategoryChannel')
module.exports = {
    name: 'channelCreate',
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
            if(!(guild instanceof Guild)) guild = new Guild(client, guild)
            if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                if(data.parent_id){
                    let category = client.categoryChannels.get(data.parent_id)
                    if(category){
                        category.childrens.push(data.id)
                        client.categoryChannels.set(category.id, category)
                    }
                }
            }
            if (data.type === 0) { // text channel
                let text = new TextChannel(client, guild, data)
                /**
                * Emitted whenever a channel is created
                * @event client#channelCreate
                * @param {TextChannel} text
                */
                client.emit('channelCreate', text)
                /**
                * Emitted whenever a text channel is created
                * @event client#channelCreateText
                * @param {TextChannel} text
                */
                client.emit('channelCreateText', text)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    text.cachedAt = Date.now()
                    text.expireAt = Date.now() + client.options.channelsLifeTime
                    client.textChannels.set(text.id, text)
                }
            } else if(data.type === 2) { // voice channel
                let voice = new VoiceChannel(client, guild, data)
                /**
                * Emitted whenever a channel is created
                * @event client#channelCreate
                * @param {VoiceChannel} voice
                */
                client.emit('channelCreate', voice)
                /**
                * Emitted whenever a text channel is created
                * @event client#channelCreateVoice
                * @param {VoiceChannel} voice
                */
                client.emit('channelCreateVoice', voice)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    voice.cachedAt = Date.now()
                    voice.expireAt = Date.now() + client.options.channelsLifeTime
                    client.voiceChannels.set(voice.id, voice)
                }
            } else if(data.type === 4) { // category channel
                let category = new CategoryChannel(client, guild, data)
                /**
                * Emitted whenever a channel is created
                * @event client#channelCreate
                * @param {CategoryChannel} category
                */
                client.emit('channelCreate', category)
                /**
                * Emitted whenever a category channel is created
                * @event client#channelCreateCategory
                * @param {CategoryChannel} category
                */
                client.emit('channelCreateCategory', category)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    category.cachedAt = Date.now()
                    category.expireAt = Date.now() + client.options.channelsLifeTime
                    client.categoryChannels.set(category.id, category)
                }
            } else if(data.type === 5) { // announcement channel
                let announcement = new AnnouncementChannel(client, guild, data)
                /**
                * Emitted whenever a channel is created
                * @event client#channelCreate
                * @param {AnnouncementChannel} announcement
                */
                client.emit('channelCreate', announcement)
                /**
                * Emitted whenever a announcement channel is created
                * @event client#channelCreateAnnouncement
                * @param {AnnouncementChannel} announcement
                */
                client.emit('channelCreateAnnouncement', announcement)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    announcement.cachedAt = Date.now()
                    announcement.expireAt = Date.now() + client.options.channelsLifeTime
                    client.announcementChannels.set(announcement.id, announcement)
                }
            } else if(data.type === 13) { // stage channel
                let stage = new StageChannel(client, guild, data)
                /**
                * Emitted whenever a channel is created
                * @event client#channelCreate
                * @param {StageChannel} stage
                */
                client.emit('channelCreate', stage)
                /**
                * Emitted whenever a stage channel is created
                * @event client#channelCreateStage
                * @param {StageChannel} stage
                */
                client.emit('channelCreateStage', stage)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    stage.cachedAt = Date.now()
                    stage.expireAt = Date.now() + client.options.channelsLifeTime
                    client.stageChannels.set(stage.id, stage)
                }
            } else if(data.type === 15) { // forum channel
                let forum = new ForumChannel(client, guild, data)
                /**
                * Emitted whenever a channel is created
                * @event client#channelCreate
                * @param {ForumChannel} forum
                */
                client.emit('channelCreate', forum)
                /**
                * Emitted whenever a forum channel is created
                * @event client#channelCreateForum
                * @param {ForumChannel} forum
                */
                client.emit('channelCreateForum', forum)
                if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                    forum.cachedAt = Date.now()
                    forum.expireAt = Date.now() + client.options.channelsLifeTime
                    client.forumChannels.set(forum.id, forum)
                }
            }
        }

    }
}