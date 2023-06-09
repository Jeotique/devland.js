const Client = require('../../client/client')
const Models = require('../../models')
module.exports = {
    name: 'guildDelete',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d

            let guild = client.guilds.get(data.id)
            client.guilds.delete(data.id)
            client.guildsIds = client.guildsIds.filter(id => id !== data.id)
            if (guild) {
                /**
                 * Emitted whenever a guild is leaved
                 * @event client#guildRemoved
                 * @param {Models.Guild} guild
                 */
                client.emit("guildRemoved", guild)
            } else {
                /**
                 * Emitted whenever a guild is leaved
                 * @event client#guildRemoved
                 * @param {object} guild 
                 */
                client.emit("guildRemoved", { error: "Enable the guilds cache to get the old guild data", id: data.id, data_is_available: false })
            }
            client.textChannels.filter(channel => channel.guildId === guild.id).map(channel => {
                client.textChannels.delete(channel.id)
            })
            client.voiceChannels.filter(channel => channel.guildId === guild.id).map(channel => {
                client.voiceChannels.delete(channel.id)
            })
            client.announcementChannels.filter(channel => channel.guildId === guild.id).map(channel => {
                client.voiceChannels.delete(channel.id)
            })
            client.threadChannels.filter(channel => channel.guildId === guild.id).map(channel => {
                client.voiceChannels.delete(channel.id)
            })
            client.stageChannels.filter(channel => channel.guildId === guild.id).map(channel => {
                client.voiceChannels.delete(channel.id)
            })
            client.forumChannels.filter(channel => channel.guildId === guild.id).map(channel => {
                client.voiceChannels.delete(channel.id)
            })
            client.categoryChannels.filter(channel => channel.guildId === guild.id).map(channel => {
                client.voiceChannels.delete(channel.id)
            })
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}