const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member } = require('../../models')
module.exports = {
    name: 'guildMemberRemove',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (!guild instanceof Guild) guild = new Guild(client, guild)
        let oldMember = guild.members.get(data.user.id)
        guild.members.delete(data.user.id)
        if (oldMember) {
            client.emit('memberLeave', oldMember)
            if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                guild.cachedAt = Date.now()
                guild.expireAt = Date.now() + client.options.guildsLifeTime
                client.guilds.set(guild.id, guild)
            }
            if (typeof client.options.usersLifeTime === "number" && client.options.usersLifeTime > 0) {
                if (client.guilds.filter(g => g.members.has(oldMember.id)).size < 1) client.users.delete(oldMember.id)
            }
        } else {
            client.emit('memberLeave', { error: "Enable the members cache to get the old member data", id: data.user.id, data_is_available: false })
        }
    }
}