const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, Member } = require('../../models')
module.exports = {
    name: 'guildMemberUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id)).catch(e => { })
        if (!guild instanceof Guild) guild = new Guild(client, guild)
        let member = new Member(client, guild, data)
        let oldMember = guild.members.get(member.id)
        if (oldMember) {
            client.emit('memberUpdate', oldMember, member)
            member.cachedAt = Date.now()
            member.expireAt = Date.now() + client.options.membersLifeTime
            guild.members.set(member.id, member)
        } else {
            /**
                 * Emitted whenever a member is updated
                 * @event client#memberUpdate
                 * @param {object} oldMember
                 * @param {Message} member
                 */
            client.emit('memberUpdate', { error: "Enable the members cache to get the old member data", id: data.id, data_is_available: false }, member)
        }

    }
}