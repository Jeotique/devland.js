const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel, AnnouncementChannel, Thread, Role } = require('../../models')
const CategoryChannel = require('../../models/CategoryChannel')
module.exports = {
    name: 'roleCreate',
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
            let role = new Role(client, guild, data.role)
            /**
            * Emitted whenever a role is created
            * @event client#roleCreate
            * @param {Role} role
            */
            client.emit('roleCreate', role)
            if (typeof client.options.rolesLifeTime === "number" && client.options.rolesLifeTime > 0) {
                role.cachedAt = Date.now()
                role.expireAt = Date.now() + client.options.rolesLifeTime
                guild.roles.set(role.id, role)
                client.guilds.set(guild.id, guild)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}