const Client = require('../../client/client')
const { Guild, TextChannel, Message, DmChannel, User, Webhook, Member } = require('../../models')
const { default: Store } = require('../../util/Store/Store')
module.exports = {
    name: 'guildUpdate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        try {
            const data = d.d
            let guild = new Guild(client, data)
            let oldGuild = client.guilds.get(data.id)
            client.guilds.delete(data.id)
            if (oldGuild) {
                guild.members = oldGuild.members
                guild.invites = oldGuild.invites
                guild.roles = oldGuild.roles
            } else oldGuild = { error: "Enable the guilds cache to get the old guild data", id: data.id, data_is_available: false }
            client.emit('guildUpdate', oldGuild, guild)
            if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                guild.cachedAt = Date.now()
                guild.expireAt = Date.now() + client.options.guildsLifeTime
                client.guilds.set(guild.id, guild)
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}