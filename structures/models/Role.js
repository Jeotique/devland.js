const Guild = require('./Guild')
const Client = require('../client/client')
const Permissions = require('../util/Permissions/Permissions')
const Utils = require('../util/index')

module.exports = class Role {
    constructor(client, guild, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.id = data.id
        this.version = data.version
        this.unicode_emoji = data.unicode_emoji
        this.tags = data.tags
        this.position = data.position
        this.permissions_new = new Permissions(data.permissions_new)
        this.permissions = new Permissions(data.permissions.toString())
        this.name = data.name
        this.mentionable = data.mentionable
        this.managed = data.managed
        this.icon = data.icon
        this.hoist = data.hoist
        this.flags = data.flags
        this.color = data.color
        this.createdTimestamp = Utils.getTimestampFrom(data.id)
        this.createdAt = new Date(this.createdTimestamp)
    }
}