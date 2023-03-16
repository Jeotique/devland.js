const Client = require('../../client/client')
const Models = require('../../models')
module.exports = {
    name: 'ready',
    /**
     * 
     * @param {Client} client 
     * @param {*} d 
     */
    run: async (client, d) => {
        const data = d.d

        data.user.tag = data.user.username + '#' + data.user.discriminator
        client.user = new Models.ClientUser(client, data.user)
        client.sessionID = data.session_id
        for (const [obj] in data.guilds) {
            client.guildsIds.push(data.guilds[obj].id)
            if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                client.guilds.set(data.guilds[obj].id, { ready: false, id: data.guilds[obj].id })
            }
        }
        if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
            var checkGuilds = setInterval(() => {
                if (client.guilds.size < 1) {
                    clearInverval(checkGuilds)
                    client.ready = true
                    /**
                    * @event client#ready
                    * @param {Client} client
                    */
                    client.emit('ready', client)
                } else {
                    if (client.guilds.filter(g => g.ready === true).size < client.guilds.size) return
                    clearInterval(checkGuilds)
                    client.ready = true
                    /**
                    * @event client#ready
                    * @param {Client} client
                    */
                    client.emit('ready', client)
                    var x = setInterval(() => {
                        if (typeof client.options.messagesLifeTime !== 'number') return clearInterval(x)
                        if (client.options.messagesLifeTime < 1) return clearInverval(x)
                        client.messages.map(message => {
                            if (Date.now() > message.expireAt) return
                            else client.messages.delete(message.id)
                            client.emit('debug', `(${message.id}) Message removed from the cache`)
                        })
                    }, 3000)
                    var y = setInterval(() => {
                        if (typeof client.options.guildsLifeTime !== 'number') return clearInterval(y)
                        if (client.options.guildsLifeTime < 1) return clearInverval(y)
                        client.guilds.map(guild => {
                            if (Date.now() > guild.expireAt) return
                            else client.guilds.delete(guild.id)
                            client.emit('debug', `(${guild.id}) Guild removed from the cache`)
                        })
                    }, 3000)
                }
            })
        } else {
            setTimeout(() => {
                client.ready = true
                /**
                 * @event client#ready
                 * @param {Client} client
                 */
                client.emit('ready', client)
                var x = setInterval(() => {
                    if (typeof client.options.messagesLifeTime !== 'number') return clearInterval(x)
                    if (client.options.messagesLifeTime < 1) return clearInverval(x)
                    client.messages.map(message => {
                        if (Date.now() > message.expireAt) return
                        else client.messages.delete(message.id)
                        client.emit('debug', `(${message.id}) Message removed from the cache`)
                    })
                }, 3000)
            }, 1500)
        }
    }
}