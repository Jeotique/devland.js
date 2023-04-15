const Client = require('../../client/client')
const { Guild, User, AutoModRule } = require('../../models')
module.exports = {
    name: 'autoModRuleUpdate',
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
            let creator = client.users.get(data.creator_id) || await client.rest.get(client._ENDPOINTS.USER(data.creator_id)).catch(e => { })
            if (creator && !(creator instanceof User)) creator = new User(this.client, creator)
            data.creator = creator
            let rule = new AutoModRule(client, guild, data)
            client.emit('autoModRuleUpdate', rule)
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}