const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, VoiceChannel, AnnouncementChannel, Thread, StageChannel, ForumChannel, Emoji, Member, VoiceState } = require('../../models')
module.exports = {
    name: 'voiceServerUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
            if (guild && !(guild instanceof Guild)) guild = new Guild(client, guild)
            client.emit('voiceServerUpdate', {
                guild: guild,
                token: data.token,
                endpoint: data.endpoint
            })
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}