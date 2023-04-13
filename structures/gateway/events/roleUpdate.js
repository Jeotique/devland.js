const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel, AnnouncementChannel, Role } = require('../../models')
module.exports = {
    name: 'roleUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))
        if (!(guild instanceof Guild)) guild = new Guild(client, guild)
        let role = new Role(client, guild, data.role)
        let oldRole = guild.roles.get(role.id)
        if (!oldRole) oldRole = { error: "Enable the roles cache to get the old role data", id: data.role.id, data_is_available: false }
        if (oldRole && Object.keys(oldRole).filter(k => k !== "position").filter(k => oldRole[k] !== role[k]).length < 1) {
            if (oldRole.position !== role.position) {
                if (typeof client.options.rolesLifeTime === "number" && client.options.rolesLifeTime > 0) {
                    role.cachedAt = Date.now()
                    role.expireAt = Date.now() + client.options.rolesLifeTime
                    guild.roles.set(role.id, role)
                    client.guilds.set(guild.id, guild)
                }
            }
            return client.emit('roleFakeUpdate', oldRole, role)
        } else {
            /**
            * Emitted whenever a role is updated
            * @event client#roleUpdate
            * @param {Role} oldRole
            * @param {Role} role
            */
            client.emit('roleUpdate', oldRole, role)
            if (typeof client.options.rolesLifeTime === "number" && client.options.rolesLifeTime > 0) {
                role.cachedAt = Date.now()
                role.expireAt = Date.now() + client.options.rolesLifeTime
                guild.roles.set(role.id, role)
                client.guilds.set(guild.id, guild)
            }
        }
    }
}