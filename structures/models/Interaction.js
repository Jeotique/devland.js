const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const User = require('./User')
const Member = require('./Member')
const Permissions = require('../util/Permissions/Permissions')

module.exports = class Interaction {
    constructor(client, guild, data){
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = data.guild_id
        this.id = data.id
        this.application_id = data.application_id
        this.type = data.type
        this.data = data.data
        this.channel = data.channel
        this.channelId = data.channel_id
        this.member = data.member ? guild.members.get(data.member.id) : new Member(client, guild, member)
        this.user = data.user ? client.users.get(data.user.id) || new User(client, data.user) : this.member ? this.member.user : undefined
        this.userId = this.user ? this.user.id : undefined
        this.token = data.token
        this.version = data.version
        this.message = data.message ? new Message(client, guild, this.channel, data.message) : undefined
        this.app_permissions = data.app_permissions ? new Permissions(data.app_permissions) : undefined
        this.locale = data.locale
        this.guild_locale = data.guild_locale
    }
}