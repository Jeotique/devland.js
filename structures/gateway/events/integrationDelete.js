const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, Integration } = require('../../models')
module.exports = {
    name: 'integrationDelete',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))
        if (!(guild instanceof Guild)) guild = new Guild(client, guild)
        client.emit('integrationDelete', guild, data.application_id)
    }
}