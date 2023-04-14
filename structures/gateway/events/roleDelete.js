const Client = require('../../client/client')
const { Guild, TextChannel, Message, VoiceChannel, AnnouncementChannel, Role } = require('../../models')
module.exports = {
    name: 'roleDelete',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        let guild = data.guild_id ? (client.guilds.get(data.guild_id) || await client.rest.get(client._ENDPOINTS.SERVERS(data.guild_id))) : undefined
        if (!(guild instanceof Guild)) guild = new Guild(client, guild)
        let oldRole = guild.roles.get(data.role_id)
        if (!oldRole) oldRole = { error: "Enable the roles cache to get the old role data", id: data.role.id, data_is_available: false }
        guild.roles.delete(data.role_id)
        /**
        * Emitted whenever a role is deleted
        * @event client#roleDelete
        * @param {Role} oldRole
        */
        client.emit('roleDelete', oldRole)
        if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
            client.guilds.set(guild.id, guild)
        }
    }
}