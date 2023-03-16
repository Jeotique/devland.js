const Client = require('../../client/client')
const Models = require('../../models')
module.exports = {
    name: 'guildCreate',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d
        if (client.guilds.has(data.id) && client.guilds.get(data.id).ready === false) {
            data.ready = true
            let guild = new Models.Guild(client, data)
            /**
             * Emitted whenever the guild data is available
             * @event client#guildAvailable
             * @param {Models.Guild} guild
             */
            client.emit('guildAvailable', guild)
            guild.cachedAt = Date.now()
            guild.expireAt = Date.now() + client.options.guildsLifeTime
            client.guilds.set(guild.id, guild)
        } else {
            data.ready = true
            data.ready = true
            let guild = new Models.Guild(client, data)
            /**
             * Emitted whenever the bot join a new guild
             * @event client#guildAdded
             * @param {Models.Guild} guild
             */
            client.emit('guildAdded', guild)
            if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                guild.cachedAt = Date.now()
                guild.expireAt = Date.now() + client.options.guildsLifeTime
                client.guilds.set(guild.id, guild)
            }
        }
    }
}