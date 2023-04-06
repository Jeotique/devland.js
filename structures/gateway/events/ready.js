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
            }, 1500)
        }

        var o = setInterval(() => {
            if (typeof client.options.guildsLifeTime !== 'number') return clearInterval(o)
            if (client.options.guildsLifeTime < 1) return clearInverval(o)
            if (typeof client.options.rolesLifeTime !== 'number') return clearInterval(o)
            if (client.options.rolesLifeTime < 1) return clearInverval(o)
            client.guilds.map(guild => {
                guild.roles.map(role => {
                    if (Date.now() < role.expireAt) return
                    else guild.roles.delete(role.id)
                    client.emit('debug', `(${role.id}) Role removed from the cache`)
                    client.guilds.set(guild.id, guild)
                })
            })
        }, 3000)
        var t = setInterval(() => {
            if (typeof client.options.guildsLifeTime !== 'number') return clearInterval(t)
            if (client.options.guildsLifeTime < 1) return clearInverval(t)
            if (typeof client.options.membersLifeTime !== 'number') return clearInterval(t)
            if (client.options.membersLifeTime < 1) return clearInverval(t)
            client.guilds.map(guild => {
                guild.members.map(member => {
                    if (Date.now() < member.expireAt) return
                    else guild.members.delete(member.id)
                    client.emit('debug', `(${member.id}) Member removed from the cache`)
                    client.guilds.set(guild.id, guild)
                })
            })
        }, 3000)
        var w = setInterval(() => {
            if (typeof client.options.usersLifeTime !== 'number') return clearInterval(w)
            if (client.options.usersLifeTime < 1) return clearInverval(w)
            client.users.map(user => {
                if (Date.now() < user.expireAt) return
                else client.users.delete(user.id)
                client.emit('debug', `(${user.id}) User removed from the cache`)
            })
        }, 3000)
        var y = setInterval(() => {
            if (typeof client.options.guildsLifeTime !== 'number') return clearInterval(y)
            if (client.options.guildsLifeTime < 1) return clearInverval(y)
            client.guilds.map(guild => {
                if (Date.now() < guild.expireAt) return
                else client.guilds.delete(guild.id)
                client.emit('debug', `(${guild.id}) Guild removed from the cache`)
            })
        }, 3000)
        var x = setInterval(() => {
            if (typeof client.options.messagesLifeTime !== 'number') return clearInterval(x)
            if (client.options.messagesLifeTime < 1) return clearInverval(x)
            client.messages.map(message => {
                if (Date.now() < message.expireAt) return
                else client.messages.delete(message.id)
                client.emit('debug', `(${message.id}) Message removed from the cache`)
            })
        }, 3000)
        var z = setInterval(() => {
            if (typeof client.options.channelsLifeTime !== 'number') return clearInterval(z)
            if (client.options.channelsLifeTime < 1) return clearInverval(z)
            client.textChannels.map(text => {
                if (Date.now() < text.expireAt) return
                else client.textChannels.delete(text.id)
                client.emit('debug', `(${text.id}) Text channel removed from the cache`)
            })
            client.voiceChannels.map(voice => {
                if (Date.now() < voice.expireAt) return
                else client.voiceChannels.delete(voice.id)
                client.emit('debug', `(${voice.id}) Voice channel removed from the cache`)
            })
            client.categoryChannels.map(category => {
                if (Date.now() < category.expireAt) return
                else client.categoryChannels.delete(category.id)
                client.emit('debug', `(${category.id}) Category channel removed from the cache`)
            })
            client.announcementChannels.map(announcement => {
                if (Date.now() < announcement.expireAt) return
                else client.announcementChannels.delete(announcement.id)
                client.emit('debug', `(${announcement.id}) Announcement channel removed from the cache`)
            })
            client.threadChannels.map(thread => {
                if (Date.now() < thread.expireAt) return
                else client.threadChannels.delete(thread.id)
                client.emit('debug', `(${thread.id}) Thread channel removed from the cache`)
            })
            client.stageChannels.map(stage => {
                if (Date.now() < stage.expireAt) return
                else client.stageChannels.delete(stage.id)
                client.emit('debug', `(${stage.id}) Stage channel removed from the cache`)
            })
            client.forumChannels.map(forum => {
                if (Date.now() < forum.expireAt) return
                else client.forumChannels.delete(forum.id)
                client.emit('debug', `(${forum.id}) Forum channel removed from the cache`)
            })
        }, 3000)
    }
}