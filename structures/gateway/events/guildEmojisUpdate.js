const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, Member, Log, Emoji } = require('../../models')
const { default: Store } = require('../../util/Store/Store')
module.exports = {
    name: 'guildEmojisUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
            if (!(guild instanceof Guild)) guild = new Guild(client, guild)
            let collect = new Store()
            data.emojis?.map(emo => collect.set(emo.id, new Emoji(client, guild, emo)))
            client.emit('guildEmojisUpdate', guild, collect)
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}