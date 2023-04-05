const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel, AnnouncementChannel } = require('../../models')
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
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (!guild) {
            // gestion message par mp
        } else {
            guild = new Guild(client, guild)
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
            }
        }

    }
}