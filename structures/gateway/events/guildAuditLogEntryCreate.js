const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, Member, Log } = require('../../models')
const { default: Store } = require('../../util/Store/Store')
module.exports = {
    name: 'guildAuditLogEntryCreate',
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
            let obj = {}
            obj.guild = guild
            obj.guildId = data.guild_id
            obj.id = data.id
            obj.user = client.users.get(data.user_id) || await client.rest.get(client._ENDPOINTS.USER(data.user_id)).catch(e => { })
            if (obj.user && !(obj.user instanceof User)) obj.user = new User(client, obj.user)
            obj.user.tag = obj.user.username + '#' + obj.user.discriminator
            obj.action_type = data.action_type
            obj.target_id = data.target_id
            obj.changes = data.changes
            obj.reason = data.reason || null
            obj.options = data.options || null
            let log = new Log(client, obj)
            client.emit('guildAuditLogEntryCreate', log)
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}