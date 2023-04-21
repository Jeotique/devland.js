const Client = require('../client/client')
const Guild = require('./Guild')
const User = require('./User')
const Util = require('../util')
const VoiceChannel = require('./VoiceChannel')
const StageChannel = require('./StageChannel')

module.exports = class ScheduledEvent {
    constructor(client, guild, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.id = data.id
        this.guildId = data.guild_id
        this.guild = guild
        this.channel_id = data.channel_id
        this.channel = !data.channel_id ? null : client.voiceChannels.get(data.channel_id) || client.stageChannels.get(data.channel_id) || null
        this.creatorId = data.creator_id
        this.creator = data.creator ? new User(client, data.creator) : null
        this.name = data.name
        this.description = data.description
        this.scheduled_start_time = new Date(data.scheduled_start_time)
        this.scheduled_end_time = data.scheduled_end_time ? new Date(data.scheduled_end_time) : null
        this.privacy_level = data.privacy_level
        this.status = data.status
        this.entity_type = data.entity_type
        this.entity_id = data.entity_id
        this.entity_metadata = data.entity_metadata ? data.entity_metadata : null
        this.user_count = this.user_count || 0
        this.image = data.image
        this.createdTimestamp = Util.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
    }

    async edit(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Options must be defined by a object"))
            if (typeof options.name !== "undefined" && typeof options.name !== "string") return reject(new TypeError("Options name must be a string"))
            options.privacy_level = 2
            if (typeof options.scheduled_start_time !== "undefined") options.scheduled_start_time = !(options.scheduled_start_time instanceof Date) ? new Date(options.scheduled_start_time) : new Date(options.scheduled_start_time.getTime())
            if (typeof options.entity_type !== "undefined" && typeof options.entity_type !== "number") return reject(new TypeError("Options entity type must be a number"))
            if (options.entity_type && options.entity_type < 1 || options.entity_type > 3) return reject(new TypeError("Options invalid entity type"))
            if (typeof options.channel_id === "undefined" && options.entity_type !== 3) return reject(new TypeError("Options channel Id must be defined for non external event"))
            else if (typeof options.channel_id !== "undefined" && options.channel_id !== null && options.entity_type === 3) return reject(new TypeError("Options channel Id must be null or undefined for external event"))
            else if (options.channel_id instanceof VoiceChannel || options.channel_id instanceof StageChannel) options.channel_id = options.channel_id.id
            if (typeof options.channel_id !== "undefined" && options.channel_id !== null && typeof options.channel_id !== "string") return reject(new TypeError("Options channel Id must be a string or a valid VoiceChannel/StageChannel instance"))
            if (typeof options.description !== "undefined") {
                if (options.description === null) options.description = undefined
                if (typeof options.description !== "string" && typeof options.description !== "undefined") return reject(new TypeError("Options description must be a string"))
            }
            if (typeof options.scheduled_end_time === "undefined" && options.entity_type === 3) return reject(new TypeError("Options scheduled_end_time must be defined for external event"))
            else options.scheduled_end_time = !(options.scheduled_end_time instanceof Date) ? new Date(options.scheduled_end_time) : new Date(options.scheduled_end_time.getTime())
            if (options.entity_metadata === null) options.entity_metadata = undefined
            if (typeof options.entity_metadata !== "undefined") {
                if (options.entity_type && options.entity_type !== 3) return reject(new TypeError("Options entity metadata must be null or undefined for non external event"))
                if (typeof options.entity_metadata !== "object") return reject(new TypeError("Options entity metadata must be a object"))
                if (typeof options.entity_metadata.location !== "string") return reject(new TypeError("Options entity metadata location must be a string"))
                if (options.entity_metadata.location.length < 1 || options.entity_metadata.location.length > 100) return reject(new TypeError("Options entity metadata location length must be between 1 and 100"))
            }
            if (typeof options.image !== "undefined") options.image = await DataResolver.resolveImage(options.image)
            if (options.reason === null) reason = undefined
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            if (options.entity_type === 3) options.channel_id = null
            else options.entity_metadata = null
            if (typeof options.status !== "undefined") {
                if (typeof options.status !== "number") return reject(new TypeError("Options status must be a number"))
                if (options.status < 1 || options.status > 4) return reject(new TypeError("Options status must be between 1 and 4"))
            }
            this.client.rest.patch(this.client._ENDPOINTS.EVENT(this.guildId, this.id), options).then(res => {
                let newS = new ScheduledEvent(this.client, this.client.guilds.get(this.guildId) || this.guild, res)
                resolve(newS)
                Object.keys(newS).map(k => this[k] = newS[k])
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async delete() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.delete(this.client._ENDPOINTS.EVENT(this.guildId, this.id)).then(() => {
                return resolve()
            }).catch(e => {
                return reject(e)
            })
        })
    }
}