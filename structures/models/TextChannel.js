const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const Embed = require('./Embed')
const Utils = require('../util')
const ActionRow = require('./ActionRow')
const { default: Store } = require('../util/Store/Store')
const Permissions = require('../util/Permissions/Permissions')
const ForumTag = require('./ForumTag')
module.exports = class TextChannel {
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
        this.lastMessageId = data.last_message_id
        this.type = data.type
        this.name = data.name
        this.position = data.position
        this.flags = data.flags
        this.parentId = data.parentId
        this.topic = data.topic
        this.guildId = data.guild_id
        this.rateLimitPerUser = data.rate_limit_per_user
        this.nsfw = data.nsfw
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
    }
    /**
     * @typedef {object} MessageOptions
     * @property {string} content
     * @property {Embed[]} embeds
     * @property {boolean} tts
     * @property {string} nonce
     * @property {'roles'|'users'|'everyone'} allowedMentions
     * @property {ActionRow[]} components
     */
    /**
     * Send a message is the channel
     * @param {MessageOptions|string} options 
     * @returns {Promise<Message>}
     */
    async send(options) {
        return new Promise(async (resolve, reject) => {
            let data = {
                content: undefined,
                embeds: [],
                tts: false,
                nonce: undefined,
                allowed_mentions: undefined,
                components: []
            }
            if (typeof options === 'string') {
                data['content'] = options
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof ActionRow) {
                data['components'].push(options.pack())
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if (toTestCustomId.length > 0) toTestCustomId.map(test => {
                    if (alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (typeof options === 'object') {
                data['content'] = options['content']
                if (typeof options['embeds'] === 'object') options['embeds']?.map(embed_data => data['embeds'].push(embed_data.pack()))
                data['embeds'] = options['embeds']
                data['tts'] = options['tts']
                data['nonce'] = options['nonce']
                data['allowed_mentions'] = options['allowedMentions']
                data['components'] = []
                options['components']?.map(comp => {
                    if (comp instanceof ActionRow) data['components'].push(comp.pack())
                    else return reject(new TypeError("Invalid component, must be a ActionRow instance"))
                })
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if (toTestCustomId.length > 0) toTestCustomId.map(test => {
                    if (alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    async fetchMessages(options) {
        return new Promise(async (resolve, reject) => {
            if (options && typeof options === "string") {
                this.client.rest.get(this.client._ENDPOINTS.MESSAGES(this.id, options)).then(data => {
                    let message = new Message(this.client, this.guild, this, data)
                    resolve(new Store().set(message.id, message))
                    if (typeof this.client.options.messagesLifeTime === "number" && this.client.options.messagesLifeTime > 0) {
                        message.cachedAt = Date.now()
                        message.expireAt = Date.now() + this.client.options.messagesLifeTime
                        this.client.messages.set(message.id, message)
                    }
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (typeof options === "object") {
                if (options.limit && typeof options.limit !== "number") return reject(new TypeError("Limit must be a number"))
                if (options.limit && options.limit > 100) return reject(new TypeError("The limit can't be more than 100"))
                if (options.limit && options.limit < 1) return reject(new TypeError("The limit can't be less than 1"))
                if (typeof options.around !== "undefined" && typeof options.around !== "string") return reject(new TypeError("The around value must be a string (message Id)"))
                if (typeof options.before !== "undefined" && typeof options.before !== "string") return reject(new TypeError("The before value must be a string (message Id)"))
                if (typeof options.after !== "undefined" && typeof options.after !== "string") return reject(new TypeError("The after value must be a string (message Id)"))
                let used = 0
                if (options.around) used++
                if (options.before) used++
                if (options.after) used++
                if (used > 1) return reject(new TypeError("You can only use one filter (around | before | after)"))
                this.client.rest.get(`${this.client._ENDPOINTS.MESSAGES(this.id)}${options.limit ? `?limit=${options.limit}${options.around ? `&around=${options.around}` : `${options.before ? `&before=${options.before}` : `${options.after ? `&after=${options.after}` : ``}`}`}` : `${options.around ? `?around=${options.around}` : `${options.before ? `?before=${options.before}` : `${options.after ? `?after=${options.after}` : ``}`}`}`}`).then(data => {
                    let cache = new Store()
                    data.map(message_data => {
                        let message = new Message(this.client, this.guild, this, message_data)
                        cache.set(message.id, message)
                        if (typeof this.client.options.messagesLifeTime === "number" && this.client.options.messagesLifeTime > 0) {
                            message.cachedAt = Date.now()
                            message.expireAt = Date.now() + this.client.options.messagesLifeTime
                            this.client.messages.set(message.id, message)
                        }
                    })
                    return resolve(cache)
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (typeof options === "undefined") {
                this.client.rest.get(this.client._ENDPOINTS.MESSAGES(this.id)).then(data => {
                    let cache = new Store()
                    data.map(message_data => {
                        let message = new Message(this.client, this.guild, this, message_data)
                        cache.set(message.id, message)
                        if (typeof this.client.options.messagesLifeTime === "number" && this.client.options.messagesLifeTime > 0) {
                            message.cachedAt = Date.now()
                            message.expireAt = Date.now() + this.client.options.messagesLifeTime
                            this.client.messages.set(message.id, message)
                        }
                    })
                    return resolve(cache)
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Invalid fetch messages options provided"))
        })
    }

    async edit(options = {}) {
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
                /*if(options.parent_id instanceof CategoryChannel){
                    options.parent_id = options.parent_id.id
                }*/
                if (options.parent_id !== null && typeof options.parent_id !== "string") return reject(new TypeError("The channel parent id must be a string"))
            }
            if (typeof options.permission_overwrites !== "undefined") {
                if (options.permission_overwrites !== null) {
                    if (typeof options.permission_overwrites !== "object") return reject(new TypeError("The channel permissions overwrites must an object"))
                    options.permission_overwrites.map(async perm => {
                        if (!perm.id) return reject(new TypeError("Id of the role/user is missing in the permissions array"))
                        let isMember;
                        isMember = await this.client.rest.get(this.client._ENDPOINTS.MEMBERS(this.guildId, perm.id)).catch(e => { })
                        if (isMember) perm.type = 1
                        let isRole;
                        if (!isMember) isRole = await this.client.rest.get(this.client._ENDPOINTS.ROLES(this.guildId, perm.id)).catch(e => { })
                        if (isRole) perm.type = 0
                        if (!perm.allow && !perm.deny) return reject(new TypeError("You need to provide 'allow' or 'deny' permissions"))
                        if (perm.allow) perm.allow = new Permissions(perm.allow).bitfield
                        if (perm.deny) perm.deny = new Permissions(perm.deny).bitfield
                    })
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
            this.client.rest.patch(this.client._ENDPOINTS.CHANNEL(this.id), options).then(res => {
                let newChannel = new TextChannel(this.client, this.client.guilds.get(newChannel.guild_id) || this.guild, newChannel)
                Object.keys(newChannel).map(k => this[k] = newChannel[k])
                return resolve(newChannel)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }
}