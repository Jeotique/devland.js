const Client = require('../client/client')
const { default: Store } = require('../util/Store/Store')
const Log = require('./Log')

module.exports = class AuditLogs {
    constructor(client, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.entries = new Store()
        data.audit_log_entries.map(d => {
            let obj = {}
            obj.id = d.id
            obj.guild = data.guild
            obj.guildId = data.guild.id
            obj.user = data.users.find(u => u.id === d.user_id)
            obj.user.tag = obj.user.username + '#' + obj.user.discriminator
            obj.action_type = d.action_type
            obj.target_id = d.target_id
            obj.changes = d.changes
            obj.reason = d.reason || null
            obj.options = d.options || null
            let log = new Log(this.client, obj)
            return this.entries.set(log.id, log)
        })
    }
}