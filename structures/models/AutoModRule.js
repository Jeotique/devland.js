const Client = require('../client/client')
const { Guild, User } = require('./index')
const Utils = require('../util/index')

module.exports = class AutoModRule {
    constructor(client, guild, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.id = data.id
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.guildId = data.guild_id
        this.guild = guild
        this.name = data.name
        this.creatorId = data.creator_id
        this.creator = data.creator
        this.event_type = data.event_type
        this.trigger_type = data.trigger_type
        this.trigger_metadata = data.trigger_metadata
        this.actions = data.actions
        this.enabled = data.enabled
        this.exempt_roles = data.exempt_roles
        this.exempt_channels = data.exempt_channels
    }

    async edit(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Edit automod rules options must be a object"))
            if (typeof options.name !== "undefined" && typeof options.name !== "string") return reject(new TypeError("Edit automod rules options name must be a string"))
            if (typeof options.event_type !== "undefined" && typeof options.event_type !== "number") return reject(new TypeError("Edit automod rules options event type must be a number"))
            if (typeof options.event_type !== "undefined" && options.event_type !== 1) return reject(new TypeError("Edit automod rules options event type is valid, only type 1 is supported"))
            if (typeof options.trigger_metadata !== "undefined") {
                if (typeof options.trigger_metadata !== "object") return reject(new TypeError("Edit automod rules options trigger metadata must be a object"))
                if (typeof options.trigger_metadata.keyword_filter !== "undefined") {
                    if (!Array.isArray(options.trigger_metadata.keyword_filter)) return reject(new TypeError("Edit automod rules options trigger metadata keyword filter must be a array"))
                    if (options.trigger_metadata.keyword_filter.find(k => typeof k !== "string")) return reject(new TypeError("Edit automod rules options trigger metadata keyword filter can contains string only"))
                    if (options.trigger_metadata.keyword_filter.length > 1000) return reject(new TypeError("Edit automod rules options trigger metadata keyword filter maximum length of 1000"))
                }
                if (typeof options.trigger_metadata.regex_patterns !== "undefined") {
                    if (!Array.isArray(options.trigger_metadata.regex_patterns)) return reject(new TypeError("Edit automod rules options trigger metadata regex patterns must be a array"))
                    if (options.trigger_metadata.regex_patterns.find(k => typeof k !== "string")) return reject(new TypeError("Edit automod rules options trigger metadata regex patterns can contains string only"))
                    if (options.trigger_metadata.regex_patterns.length > 1000) return reject(new TypeError("Edit automod rules options trigger metadata regex patterns maximum length of 10"))
                }
                if (typeof options.trigger_metadata.presets !== "undefined") {
                    if (!Array.isArray(options.trigger_metadata.presets)) return reject(new TypeError("Edit automod rules options trigger metadata presets must be a array"))
                    if (options.trigger_metadata.presets.find(k => typeof k !== "number")) return reject(new TypeError("Edit automod rules options trigger metadata presets can contains number only"))
                    if (options.trigger_metadata.presets.find(k => k < 1 || k > 3)) return reject(new TypeError("Edit automod rules options trigger metadata presets invalid"))
                }
                if (typeof options.trigger_metadata.allow_list !== "undefined") {
                    if (!Array.isArray(options.trigger_metadata.allow_list)) return reject(new TypeError("Edit automod rules options trigger metadata allow list must be a array"))
                    if (options.trigger_metadata.allow_list.find(k => typeof k !== "string")) return reject(new TypeError("Edit automod rules options trigger metadata allow list can contains string only"))
                    if (options.trigger_metadata.allow_list.length > 100 && (!options.trigger_metadata.presets || options.trigger_metadata.presets?.length < 1)) return reject(new TypeError("Edit automod rules options trigger metadata allow list maximum length of 100"))
                    if (options.trigger_metadata.allow_list.length > 1000) return reject(new TypeError("Edit automod rules options trigger metadata allow list maximum length of 1000"))
                }
                if (typeof options.trigger_metadata.mention_total_limit !== "undefined") {
                    if (typeof options.trigger_metadata.mention_total_limit !== "number") return reject(new TypeError("Edit automod rules options trigger metadata mention total limit must be a number"))
                    if (options.trigger_metadata.mention_total_limit > 50) return reject(new TypeError("Edit automod rules options trigger metadata mention total limit maximum of 50"))
                }
            }
            if (typeof options.actions !== "undefined" && !Array.isArray(options.actions)) return reject(new TypeError("Edit automod rules options actions must be a array"))
            if (typeof options.actions !== "undefined" && options.actions.length < 1) return reject(new TypeError("Edit automod rules options actions you must provid at least one action"))
            if (typeof options.actions !== "undefined" && options.actions.find(a => typeof a.type !== "number")) return reject(new TypeError("Edit automod rules options action type must be a number"))
            if (typeof options.actions !== "undefined" && options.actions.find(a => a.type < 1 || a.type > 3)) return reject(new TypeError("Edit automod rules options action type invalid"))
            if (typeof options.actions !== "undefined") options.actions.map(action => {
                if (typeof action.metadata !== "undefined") {
                    if (typeof action.metadata !== "object") return reject(new TypeError("Edit automod rules options action metadata must be a object"))
                    if (typeof action.metadata.channel_id !== "undefined" && typeof action.metadata.channel_id !== "string") return reject(new TypeError("Edit automod rules options action metadata channel Id must be a string"))
                    if (typeof action.metadata.duration_seconds !== "undefined" && typeof action.metadata.duration_seconds !== "number") return reject(new TypeError("Edit automod rules options action metadata duration seconds must be a number"))
                    if (typeof action.metadata.duration_seconds !== "undefined" && action.metadata.duration_seconds > 2419200) return reject(new TypeError("Edit automod rules options action metadata duration seconds maximum of 2419200 (4 weeks)"))
                    if (typeof action.metadata.custom_message !== "undefined" && typeof action.metadata.custom_message !== "string") return reject(new TypeError("Edit automod rules options action metadata custom message must be a string"))
                    if (typeof action.metadata.custom_message !== "undefined" && action.metadata.custom_message.length > 150) return reject(new TypeError("Edit automod rules options action metadata custom message length maximum of 150"))
                }
            })
            if (typeof options.enabled !== "undefined") {
                if (typeof options.enabled !== "boolean") return reject(new TypeError("Edit automod rules options enabled must be a boolean"))
            }
            if (typeof options.exempt_roles !== "undefined") {
                if (!Array.isArray(options.exempt_roles)) return reject(new TypeError("Edit automod rules options exempt roles must be a array"))
                if (options.exempt_roles.find(a => typeof a !== "string")) return reject(new TypeError("Edit automod rules options exempt roles can contains only string"))
                if (options.exempt_roles.length > 20) return reject(new TypeError("Edit automod rules options exempt roles maximum length of 20"))
            }
            if (typeof options.exempt_channels !== "undefined") {
                if (!Array.isArray(options.exempt_channels)) return reject(new TypeError("Edit automod rules options exempt channels must be a array"))
                if (options.exempt_channels.find(a => typeof a !== "string")) return reject(new TypeError("Edit automod rules options exempt channels can contains only string"))
                if (options.exempt_channels.length > 50) return reject(new TypeError("Edit automod rules options exempt channels maximum length of 50"))
            }
            if (options.reason === null) options.reason = undefined
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("Edit automod rules options reason must be string or a undefined value"))
            this.client.rest.patch(this.client._ENDPOINTS.AUTOMOD(this.guildId, this.id), options).then(res => {
                res.creator = this.client.user
                let rules = new AutoModRule(this.client, this.client.guilds.get(this.guildId) || this.guild, res)
                resolve(rules)
                Object.keys(rules).map(k => this[k] = rules[k])
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async delete(reason) {
        return new Promise(async (resolve, reject) => {
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("Delete automod rules reason must be string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.AUTOMOD(this.guildId, this.id), {
                reason: reason
            }).then(() => {
                this.enabled = false
                return resolve(this)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }
}