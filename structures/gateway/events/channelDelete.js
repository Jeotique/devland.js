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
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (!guild) {
            // gestion message par mp
        } else {
            if (typeof client.options.channelsLifeTime === "number" && client.options.channelsLifeTime > 0) {
                guild = new Guild(client, guild)
                if (data.type === 0) { // text channel
                    let channel = client.textChannels.get(data.id)
                    channel.guild = guild
                    client.emit('channelDelete', channel)
                    client.emit('channelDeleteText', channel)
                    client.textChannels.delete(data.id)
                } else if (data.type === 2) { // voice channel
                    let channel = client.voiceChannels.get(data.id)
                    channel.guild = guild
                    client.emit('channelDelete', channel)
                    client.emit('channelDeleteVoice', channel)
                    client.voiceChannels.delete(data.id)
                } else if (data.type === 4) { // category channel
                    let channel = client.categoryChannels.get(data.id)
                    channel.guild = guild
                    client.emit('channelDelete', channel)
                    client.emit('channelDeleteCategory', channel)
                    client.categoryChannels.delete(data.id)
                } else if (data.type === 5){ // announcement channel
                    let channel = client.announcementChannels.get(data.id)
                    channel.guild = guild
                    client.emit('channelDelete', channel)
                    client.emit('channelDeleteAnnouncement', channel)
                    client.announcementChannels.delete(data.id)
                }
            } else {
                let channel = { error: "Enable the guilds cache to get the old guild data", id: data.id, data_is_available: false }
                client.emit('channelDelete', channel)
                if (data.type === 0) client.emit('channelDeleteText', channel)
                else if (data.type === 2) client.emit('channelDeleteVoice', channel)
                else if (data.type === 4) client.emit('channelDeleteCategory', channel)
                else if (data.type === 5) client.emit('channelDeleteAnnouncement', channel)
            }
        }
    }
}