const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member, User } = require('../../models')
module.exports = {
    name: 'guildBanAdd',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))
        if (!(guild instanceof Guild)) guild = new Guild(client, guild)
        let user = new User(client, data.user)
        guild.members.delete(data.user.id)
        if (user) {
            client.emit('memberBan', user, guild)
            if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                guild.cachedAt = Date.now()
                guild.expireAt = Date.now() + client.options.guildsLifeTime
                client.guilds.set(guild.id, guild)
            }
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                if (client.guilds.filter(g => g.members.has(user.id)).size < 1) client.users.delete(user.id)
            }
        } else {
            client.emit('memberBan', { error: "Enable the users cache to get the old user data", id: data.user.id, data_is_available: false }, guild)
        }
    }
}