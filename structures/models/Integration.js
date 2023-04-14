const Guild = require('./Guild')
const Client = require('../client/client')
const User = require('./User')

module.exports = class Integration {
    constructor(client, guild, data){
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = data.guild_id || data.guild?.id
        this.id = data.id
        this.name = data.name
        this.type = data.type
        this.enabled = data.enabled
        this.syncing = data.syncing
        this.role_id = data.role_id
        this.enable_emoticons = data.enable_emoticons
        this.expire_behavior = data.expire_behavior
        this.expire_grace_period = data.expire_grace_period
        this.user = data.user ? client.users.get(data.user.id) || new User(client, data.user) : null
        this.account = data.account
        this.synced_at = data.synced_at
        this.subscriber_count = data.subscriber_count
        this.revoked = data.revoked
        this.application = data.application
        this.scopes = data.scopes
        if(this.application && this.application.bot){
            this.application.bot = this.client.users.get(this.application.bot.id) || new User(this.client, this.application.bot)
        }
    }

    delete(reason){
        return new Promise(async(resolve, reject) => {
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.INTEGRATIONS(this.guildId, this.id), {
                reason: reason
            }).then(() => {
                resolve()
            }).catch(e=>{
                return reject(new Error(e))
            })
        })
    }
}