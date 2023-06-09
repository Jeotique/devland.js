const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, Member } = require('../../models')
module.exports = {
    name: 'threadMemberUpdate',
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
            if (!data.member) return;
            let member = new Member(client, guild, data.member)
            client.emit('threadMemberUpdate', member)
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}