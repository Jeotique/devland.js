const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, Member } = require('../../models')
const { default: Store } = require('../../util/Store/Store')
module.exports = {
    name: 'threadMembersUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
        if (!(guild instanceof Guild)) guild = new Guild(client, guild)
        let allMembers = new Store()
        data.added_members?.map(m => {
            if(!m.member) return
            allMembers.set(m.user_id, new Member(client, guild, m.member))
        })
        let final = {
            id: data.id,
            guild: guild,
            guildId: data.guild_id,
            member_count: data.member_count,
            added_members: allMembers,
            removed_members: data.removed_member_ids
        }
        client.emit('threadMembersUpdate', final)
    }
}