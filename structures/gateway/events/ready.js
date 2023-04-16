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
        try {
            const data = d.d
            
            data.user.tag = data.user.username + '#' + data.user.discriminator
            client.user = new Models.ClientUser(client, data.user)
            client.sessionID = data.session_id
            client.ws.gateway.resume_gateway_url = data.resume_gateway_url
            for (const [obj] in data.guilds) {
                client.guildsIds.push(data.guilds[obj].id)
                if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                    client.guilds.set(data.guilds[obj].id, { ready: false, id: data.guilds[obj].id })
                }
            }
            if (typeof client.options.guildsLifeTime === "number" && client.options.guildsLifeTime > 0) {
                var checkGuilds = setInterval(() => {
                    if (client.guilds.size < 1) {
                        clearInterval(checkGuilds)
                        client.ready = true
                        /**
                        * @event client#ready
                        * @param {Client} client
                        */
                        client.emit('ready', client)
                    } else {
                        if (client.guilds.filter(g => g.ready === true).size < client.guilds.size) return
                        if (client.options.waitCacheBeforeReady && client.options.membersLifeTime && client.guilds.filter(g => g.members.size < g.member_count).size > 0) return
                        if (client.options.waitCacheBeforeReady && client.options.presencesLifeTime && client.guilds.filter(g => g.presences.size < g.member_count).size > 0) return
                        if (client.options.waitCacheBeforeReady && client.options.voicesLifeTime && client.guilds.filter(g => g.voicesStates.size < g.member_count).size > 0) return
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

            client.cacheInverval = setInterval(() => {
                checkGuildsCache()
                checkRoleCache()
                checkMembersCache()
                checkUsersCache()
                checkMessagesCache()
                checkChannelsCache()
                checkPresencesCache()
                checkVoicesCache()
            }, 4000)
            async function checkRoleCache() {
                if (typeof client.options.guildsLifeTime !== 'number') return
                if (client.options.guildsLifeTime < 1) return
                if (typeof client.options.rolesLifeTime !== 'number') return
                if (client.options.rolesLifeTime < 1) return
                client.guilds.map(guild => {
                    guild.roles.map(role => {
                        if (Date.now() < role.expireAt) return
                        else guild.roles.delete(role.id)
                        client.emit('debug', `(${role.id}) Role removed from the cache`)
                        client.guilds.set(guild.id, guild)
                    })
                })
            }
            async function checkMembersCache() {
                if (typeof client.options.guildsLifeTime !== 'number') return
                if (client.options.guildsLifeTime < 1) return
                if (typeof client.options.membersLifeTime !== 'number') return
                if (client.options.membersLifeTime < 1) return
                client.guilds.map(guild => {
                    guild.members.map(member => {
                        if (Date.now() < member.expireAt) return
                        else guild.members.delete(member.id)
                        client.emit('debug', `(${member.id}) Member removed from the cache`)
                        client.guilds.set(guild.id, guild)
                    })
                })
            }
            async function checkPresencesCache() {
                if (typeof client.options.guildsLifeTime !== 'number') return
                if (client.options.guildsLifeTime < 1) return
                if (typeof client.options.presencesLifeTime !== 'number') return
                if (client.options.presencesLifeTime < 1) return
                client.guilds.map(guild => {
                    guild.presences.map(presence => {
                        if (Date.now() < presence.expireAt) return
                        else {
                            guild.presences.delete(presence.user?.id)
                            let member = guild.members.get(presence.user?.id)
                            if (member) {
                                member.presence = null
                                guild.members.set(presence.user?.id, member)
                            }
                        }
                        client.emit('debug', `(${presence.user?.id}) Presence removed from the cache`)
                        client.guilds.set(guild.id, guild)
                    })
                })
            }
            async function checkVoicesCache() {
                if (typeof client.options.guildsLifeTime !== 'number') return
                if (client.options.guildsLifeTime < 1) return
                if (typeof client.options.voicesLifeTime !== 'number') return
                if (client.options.voicesLifeTime < 1) return
                client.guilds.map(guild => {
                    guild.voicesStates.map(voice => {
                        if (Date.now() < voice.expireAt) return
                        else {
                            guild.voicesStates.delete(voice.user?.id)
                            let member = guild.members.get(voice.user?.id)
                            if (member) {
                                member.voice = null
                                guild.members.set(voice.user?.id, member)
                            }
                        }
                        client.emit('debug', `(${voice.user?.id}) Voice state removed from the cache`)
                        client.guilds.set(guild.id, guild)
                    })
                })
            }
            async function checkUsersCache() {
                if (typeof client.options.usersLifeTime !== 'number') return
                if (client.options.usersLifeTime < 1) return
                client.users.map(user => {
                    if (Date.now() < user.expireAt) return
                    else client.users.delete(user.id)
                    client.emit('debug', `(${user.id}) User removed from the cache`)
                })
            }
            async function checkGuildsCache() {
                if (typeof client.options.guildsLifeTime !== 'number') return
                if (client.options.guildsLifeTime < 1) return
                client.guilds.map(guild => {
                    if (Date.now() < guild.expireAt) return
                    else client.guilds.delete(guild.id)
                    client.emit('debug', `(${guild.id}) Guild removed from the cache`)
                })
            }
            async function checkMessagesCache() {
                if (typeof client.options.messagesLifeTime !== 'number') return
                if (client.options.messagesLifeTime < 1) return
                client.messages.map(message => {
                    if (Date.now() < message.expireAt) return
                    else client.messages.delete(message.id)
                    client.emit('debug', `(${message.id}) Message removed from the cache`)
                })
            }
            async function checkChannelsCache() {
                if (typeof client.options.channelsLifeTime !== 'number') return
                if (client.options.channelsLifeTime < 1) return
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
            }
        } catch (err) { client.emit('errordev', d.t, err) }
    }
}