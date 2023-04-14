const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member, User } = require('../../models')
module.exports = {
    name: 'guildBanRemove',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
        if (!(guild instanceof Guild)) guild = new Guild(client, guild)
        let user = new User(client, data.user)
        if (user) {
            client.emit('memberUnban', user, guild)
        } else {
            client.emit('memberUnban', { error: "Enable the users cache to get the old user data", id: data.user.id, data_is_available: false }, guild)
        }
    }
}