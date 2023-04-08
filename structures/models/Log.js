const Client = require('../client/client')
const Utils = require('../util/index')
const User = require('./User')
const Constants = require('../util/Constants')

module.exports = class Log {
    constructor(client, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.id = data.id
        this.guild = data.guild
        this.guildId = data.guildId
        this.executor = new User(client, data.user)
        this.type = Object.keys(Constants.logsType).find(v => Constants.logsType[v] === data.action_type)
        this.targetId = data.target_id
        this.changes = data.changes
        this.reason = data.reason
        this.extra = data.extra
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
    }
}