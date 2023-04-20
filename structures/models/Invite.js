const Client = require('../client/client')
const Guild = require('./Guild')
const User = require('./User')

module.exports = class Invite {
    constructor(client, guild, data, channel) {
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = guild.id
        this.channel = channel || client.textChannels.get(data.channel.id) || client.voiceChannels.get(data.channel.id) || client.announcementChannels.get(data.channel.id) || client.threadChannels.get(data.channel.id) || client.stageChannels.get(data.channel.id) || client.forumChannels.get(data.channel.id) || null
        this.channelId = data.channel_id
        this.code = data.code
        this.expire_At = data.expires_at
        this.inviter = data.inviter ? client.users.get(data.inviter.id) || new User(client, data.inviter) : null
        this.uses = data.uses
        this.maxUses = data.max_uses
        this.maxAge = data.max_age
        this.temporary = data.temporary
        this.createdAt = data.created_at
        this.guild_scheduled_event = data.guild_scheduled_event
        this.data_is_available = true
    }

    async delete(reason) {
        return new Promise(async (resolve, reject) => {
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.INVITES(this.code), {
                reason: reason
            }).then(res => {
                let invite = new Invite(this.client, this.client.guilds.get(this.guildId) || this.guild, res, this.channel)
                this.guild.invites.delete(this.code)
                resolve(invite)
                if (typeof this.client.options.invitesLifeTime === "number" && this.client.options.invitesLifeTime > 0) {
                    this.guild.invites.delete(invite.code)
                    this.client.guilds.set(this.guildId, this.guild)
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }
}