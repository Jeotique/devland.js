const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const Embed = require('./Embed')
const Utils = require('../util')
const ActionRow = require('./ActionRow')
const { default: Store } = require('../util/Store/Store')
const Permissions = require('../util/Permissions/Permissions')
const ForumTag = require('./ForumTag')
module.exports = class CategoryChannel {
    /**
     * 
     * @param {Client} client 
     * @param {Guild} guild 
     * @param {*} data 
     */
    constructor(client, guild, data) {
        /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild

        this.id = data.id
        this.type = data.type
        this.name = data.name
        this.position = data.position
        this.flags = data.flags
        this.guildId = data.guild_id || guild.id
        this.childrens = data.childrens || []
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.permission_overwrites = []
        this.data_is_available = true
        data.permission_overwrites.map(perm => {
            this.permission_overwrites.push({
                id: perm.id,
                type: perm.type,
                allow: perm.allow && perm.allow.length > 0 ? new Permissions(perm.allow).toArray() : [],
                deny: perm.deny && perm.deny.length > 0 ? new Permissions(perm.deny).toArray() : []
            })
        })
    }

    async edit(options = {}, reason) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Invalid options object provided"))
            if (Object.keys(options).length < 1) return reject(new TypeError("You need to provide a minimum of one change"))
            if (typeof options.name !== "undefined") {
                if (typeof options.name !== "string") return reject(new TypeError("The channel name must be a string"))
                if (options.name.length < 1) return reject(new TypeError("The channel name must have more than 1 character"))
                if (options.name.length > 100) return reject(new TypeError("The channel name must have less then 100 characters"))
            }
            if (typeof options.position !== "undefined") {
                if (typeof options.position !== "number") return reject(new TypeError("The channel position must be a number"))
                if (options.position < 0) return reject(new TypeError("The channel position must be more than 0 (or =0)"))
            }
            if (typeof options.topic !== "undefined") {
                if (options.topic !== null) {
                    if (typeof options.topic !== "string") return reject(new TypeError("The channel topic must be a string"))
                    if (options.topic.length > 1024 && this.type !== 15) return reject(new TypeError("The channel topic must have less than 1024 characters (4096 for forum channel)"))
                    else if (options.topic.length > 4096 && this.type === 15) return reject(new TypeError("The channel topic must have less than 4096 characters"))
                }
            }
            if (typeof options.nsfw !== "undefined") {
                if (typeof options.nsfw !== "boolean") return reject(new TypeError("Nsfw value must be a boolean"))
            }
            if (typeof options.rate_limit_per_user !== "undefined") {
                if (options.rate_limit_per_user === null) options.rate_limit_per_user = 0
                if (typeof options.rate_limit_per_user !== "number") return reject(new TypeError("The channel rate limit per user must be a number"))
                if (options.rate_limit_per_user < 0) return reject(new TypeError("The channel rate limit per user must be more than 0"))
                if (options.rate_limit_per_user > 21600) return reject(new TypeError("The channel rate limit per user must be less than 21600"))
            }
            if (typeof options.bitrate !== "undefined") {
                if (typeof options.bitrate !== "number") return reject(new TypeError("The channel bitrate must be a number"))
                if (options.bitrate < 8000) return reject(new TypeError("The channel bitrate must be more than 8000"))
                if (options.bitrate > 128000 && this.guild.boostLevel < 1) return reject(new TypeError("The channel bitrate is too much elevated for a guild with boost level <1"))
                if (options.bitrate > 256000 && this.guild.boostLevel < 2) return reject(new TypeError("The channel bitrate is too much elevated for a guild with boost level <2"))
                if (options.bitrate > 384000 && this.guild.boostLevel < 3 && !this.guild.features.includes("VIP_REGIONS")) return reject(new TypeError("The channel bitrate is too much elevated for a guild with boost level <3"))
            }
            if (typeof options.user_limit !== "undefined") {
                if (options.user_limit === null) options.user_limit = 0
                if (typeof options.user_limit !== "number") return reject(new TypeError("The channel user limit must be a number"))
                if (options.user_limit < 0) return reject(new TypeError("The channel user limit must be more than 0 (or =0)"))
                if (options.user_limit > 99 && this.type !== 13) return reject(new TypeError("The channel user limit must be less than 99 (10000 for stage channel)"))
                else if (options.user_limit > 10000 && this.type === 13) return reject(new TypeError("The channel user limit must be less than 10000"))
            }
            if (typeof options.parent_id !== "undefined") {
                if (options.parent_id instanceof CategoryChannel) {
                    options.parent_id = options.parent_id.id
                }
                if (options.parent_id !== null && typeof options.parent_id !== "string") return reject(new TypeError("The channel parent id must be a string"))
            }
            if (typeof options.permission_overwrites !== "undefined") {
                if (options.permission_overwrites !== null) {
                    if (typeof options.permission_overwrites !== "object") return reject(new TypeError("The channel permissions overwrites must an object"))
                    let res = []
                    options.permission_overwrites.map(async perm => {
                        if (!perm.id) return reject(new TypeError("Id of the role/user is missing in the permissions array"))
                        if (typeof perm.type !== "number") return reject(new TypeError("Type of the permission (0 = role, 1 = user) must be provided"))
                        if (perm.type < 0 || perm.type > 1) return reject(new TypeError("The type is invalid (0 = role, 1 = user)"))
                        if (!perm.allow && !perm.deny) return reject(new TypeError("You need to provide 'allow' or 'deny' permissions"))
                        if (perm.allow) perm.allow = new Permissions(perm.allow).bitfield.toString()
                        if (perm.deny) perm.deny = new Permissions(perm.deny).bitfield.toString()
                        res.push(perm)
                    })
                    options.permission_overwrites = res
                }
            }
            if (typeof options.rtc_region !== "undefined") {
                if (typeof options.rtc_region !== "string") return reject(new TypeError("The channel rtc region must be a string"))
            }
            if (typeof options.video_quality_mode !== "undefined") {
                if (typeof options.video_quality_mode !== "number") return reject(new TypeError("The channel video quality mode must be a number (1 = auto, 2 = 720p)"))
                if (options.video_quality_mode < 1 || options.video_quality_mode > 2) return reject(new TypeError("The channel video quality mode must be set to 1 or 2"))
            }
            if (typeof options.available_tags !== "undefined") {
                if (options.available_tags instanceof ForumTag) {
                    options.available_tags = [options.available_tags.pack()]
                } else if (typeof options.available_tags === "object") {
                    let res = []
                    options.available_tags.map(tag => {
                        if (tag instanceof ForumTag) tag = tag.pack()
                        else if (typeof tag === "object") tag = new ForumTag(tag).pack()
                        else return reject(new TypeError("The tag provided is invalid, must be an object or a ForumTag instance"))
                        res.push(tag)
                    })
                    if (res.length > 20) return reject(new TypeError("You can set only 20 tags"))
                    options.available_tags = res
                } else return reject(new TypeError("Available tags must be an array or a ForumTag instance"))
            }
            if (typeof options.default_reaction_emoji !== "undefined") {
                if (options.default_reaction_emoji !== null) {
                    if (typeof options.default_reaction_emoji === "string") options.default_reaction_emoji = Utils.parseEmoji(options.default_reaction_emoji)
                    if (typeof options.default_reaction_emoji !== "object") return reject(new TypeError("Invalid default reaction emoji"))
                    if (!options.default_reaction_emoji.name) return reject(new TypeError("Invalid default reaction emoji"))
                    options.default_reaction_emoji = {
                        emoji_id: options.default_reaction_emoji.id,
                        emoji_name: options.default_reaction_emoji.name
                    }
                }
            }
            if (typeof options.default_thread_rate_limit_per_user !== "undefined") {
                if (options.default_thread_rate_limit_per_user === null) options.default_thread_rate_limit_per_user = 0
                if (typeof options.default_thread_rate_limit_per_user !== "number") return reject(new TypeError("Default thread rate limit per user must be set to null or a number"))
            }
            if (typeof options.default_sort_order !== "undefined") {
                if (options.default_sort_order === null) options.default_sort_order = 0
                if (typeof options.default_sort_order !== "number") return reject(new TypeError("Default sort order must be set to null or a number"))
            }
            if (typeof options.default_forum_layout !== "undefined") {
                if (options.default_forum_layout === null) options.default_forum_layout = 0
                if (typeof options.default_forum_layout !== "number") return reject(new TypeError("Default forum layout must be set to null or a number"))
            }
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            options["reason"] = reason
            this.client.rest.patch(this.client._ENDPOINTS.CHANNEL(this.id), options).then(res => {
                let newChannel = new TextChannel(this.client, this.client.guilds.get(res.guild_id) || this.guild, res)
                Object.keys(newChannel).map(k => this[k] = newChannel[k])
                return resolve(newChannel)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async delete(reason, time) {
        return new Promise(async (resolve, reject) => {
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            if (time === null) time = 0
            if (!time) time = 0
            if (typeof time !== "undefined" && typeof time !== "number") return reject(new TypeError("The time before deleting the channel must be a number (ms) or a undefined value"))
            setTimeout(() => {
                this.client.rest.delete(this.client._ENDPOINTS.CHANNEL(this.id), {
                    "reason": reason
                }).then(newChannel => {
                    let channel = new TextChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, newChannel)
                    Object.keys(channel).map(k => this[k] = channel[k])
                    return resolve(channel)
                }).catch(e => {
                    return reject(new Error(e))
                })
            }, time)
        })
    }

    async clone(reason, time) {
        return new Promise(async (resolve, reject) => {
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            if (time === null) time = 0
            if (!time) time = 0
            if (typeof time !== "undefined" && typeof time !== "number") return reject(new TypeError("The time before deleting the channel must be a number (ms) or a undefined value"))
            setTimeout(() => {
                let data = {
                    name: this.name,
                    type: this.type,
                    topic: this.topic,
                    bitrate: this.bitrate,
                    user_limit: this.user_limit,
                    rate_limit_per_user: this.rateLimitPerUser,
                    position: this.position,
                    permission_overwrites: this.permission_overwrites.map(perm => {
                        return {
                            id: perm.id,
                            type: perm.type,
                            allow: perm.allow.length < 1 ? undefined : new Permissions(perm.allow).bitfield.toString(),
                            deny: perm.deny.length < 1 ? undefined : new Permissions(perm.deny).bitfield.toString()
                        }
                    }),
                    parent_id: this.parentId || this.parent_id,
                    nsfw: this.nsfw,
                    rtc_region: this.rtcRegion,
                    video_quality_mode: this.videoQualityMode,
                    default_auto_archive_duration: this.defaultAutoArchiveDuration,
                    default_reaction_emoji: this.defaultReactionEmoji,
                    available_tags: this.availableTags,
                    default_sort_order: this.defaultSortOrder,
                }
                if (reason) data['reason'] = reason
                this.client.rest.post(this.client._ENDPOINTS.SERVER_CHANNEL(this.guildId), data).then(newChannel => {
                    let channel = new TextChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, newChannel)
                    return resolve(channel)
                }).catch(e => {
                    return reject(new Error(e))
                })
            }, time)
        })
    }

    async setPosition(position) {
        return new Promise(async (resolve, reject) => {
            if (typeof position === "undefined") return reject(new TypeError("The channel position must be a number"))
            if (typeof position !== "number") return reject(new TypeError("The channel position must be a number"))
            if (position < 0) return reject(new TypeError("The channel position must be more than 0"))
            this.client.rest.patch(this.client._ENDPOINTS.CHANNEL(this.id), { position: position }).then(res => {
                let newChannel = new TextChannel(this.client, this.client.guilds.get(res.guild_id) || this.guild, res)
                Object.keys(newChannel).map(k => this[k] = newChannel[k])
                return resolve(newChannel)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async fetchTextChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                res = res.filter(channel => channel.type === 0 || channel.parent_id === this.id || channel.parentId === this.id)
                let collect = new Store()
                res.map(channel => collect.set(channel.id, new TextChannel(this.client, this.client.guilds.get(this.id) || this, channel)))
                return resolve(collect)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async fetchVoiceChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                res = res.filter(channel => channel.type === 2 || channel.parent_id === this.id || channel.parentId === this.id)
                let collect = new Store()
                res.map(channel => collect.set(channel.id, new VoiceChannel(this.client, this.client.guilds.get(this.id) || this, channel)))
                return resolve(collect)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }
}