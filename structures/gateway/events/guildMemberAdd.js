const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member, User } = require('../../models')
module.exports = {
    name: 'guildMemberAdd',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (!guild instanceof Guild) guild = new Guild(client, guild)
        let user = new User(client, data.user)
        if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
            user.cachedAt = Date.now()
            user.expireAt = Date.now() + client.options.usersLifeTime
            client.users.set(user.id, user)
        }
        let member = new Member(client, guild, data)
        client.emit('memberJoin', member)
        if (typeof client.options.membersLifeTime === "number" && client.options.membersLifeTime > 0) {
            member.cachedAt = Date.now()
            member.expireAt = Date.now() + client.options.membersLifeTime
            guild.members.set(member.id, member)
            client.guilds.set(guild.id, guild)
        }
    }
}