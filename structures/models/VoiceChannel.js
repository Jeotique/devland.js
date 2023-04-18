const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const Embed = require('./Embed')
const Utils = require('../util')
const ActionRow = require('./ActionRow')
const { default: Store } = require('../util/Store/Store')
const Permissions = require('../util/BitFieldManagement/Permissions')
const ForumTag = require('./ForumTag')
const Invite = require('./Invite')
const CategoryChannel = require('./CategoryChannel')
module.exports = class VoiceChannel {
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
        this.last_message_id = data.last_message_id
        this.type = data.type
        this.name = data.name
        this.position = data.position
        this.flags = data.flags
        this.parent_id = data.parentId || data.parent_id
        this.guildId = data.guild_id || guild.id
        this.rate_limit_per_user = data.rate_limit_per_user
        this.nsfw = data.nsfw
        this.bitrate = data.bitrate
        this.user_limit = data.user_limit
        this.rtc_region = data.rtc_region
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.permission_overwrites = []
        this.video_quality_mode = data.video_quality_mode
        this.data_is_available = true
        data.permission_overwrites?.map(perm => {
            this.permission_overwrites.push({
                id: perm.id,
                type: perm.type,
                allow: perm.allow && perm.allow.length > 0 ? new Permissions(perm.allow).toArray() : [],
                deny: perm.deny && perm.deny.length > 0 ? new Permissions(perm.deny).toArray() : []
            })
        })
    }

    toString(){
        return `<#${this.id}>`
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
                if (toTestCustomId.length > 0) toTestCustomId.filter(comp => comp.custom_id).map(test => {
                    if (alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (typeof options === 'object') {
                data['content'] = options['content']
                if (Array.isArray(options['embeds'])) options['embeds']?.map(embed_data => data['embeds'].push(embed_data.pack()))
                data['tts'] = options['tts']
                data['nonce'] = options['nonce']
                data['allowed_mentions'] = options['allowedMentions']
                if (typeof data['allowed_mentions'] !== 'undefined') {
                    if (!Array.isArray(data['allowed_mentions'])) data['allowed_mentions'] = undefined
                    else {
                        data['allowed_mentions'] = { parse: [...options['allowedMentions']] }
                    }
                }
                data['components'] = []
                options['components']?.map(comp => {
                    if (comp instanceof ActionRow) data['components'].push(comp.pack())
                    else return reject(new TypeError("Invalid component, must be a ActionRow instance"))
                })
                data['files'] = await Utils.lookForFiles(options.files)
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if (toTestCustomId.length > 0) toTestCustomId.filter(comp => comp.custom_id).map(test => {
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
                if (typeof options.parent_id === "object" && options.parent_id instanceof CategoryChannel) {
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
                if (typeof options.available_tags === "object" && options.available_tags instanceof ForumTag) {
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
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            options["reason"] = reason
            this.client.rest.patch(this.client._ENDPOINTS.CHANNEL(this.id), options).then(res => {
                let newChannel = new VoiceChannel(this.client, this.client.guilds.get(res.guild_id) || this.guild, res)
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
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            if (time === null) time = 0
            if (!time) time = 0
            if (typeof time !== "undefined" && typeof time !== "number") return reject(new TypeError("The time before deleting the channel must be a number (ms) or a undefined value"))
            setTimeout(() => {
                this.client.rest.delete(this.client._ENDPOINTS.CHANNEL(this.id), {
                    "reason": reason
                }).then(newChannel => {
                    let channel = new VoiceChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, newChannel)
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
                    rate_limit_per_user: this.rate_limit_per_user,
                    position: this.position,
                    permission_overwrites: this.permission_overwrites.map(perm => {
                        return {
                            id: perm.id,
                            type: perm.type,
                            allow: perm.allow.length < 1 ? undefined : new Permissions(perm.allow).bitfield.toString(),
                            deny: perm.deny.length < 1 ? undefined : new Permissions(perm.deny).bitfield.toString()
                        }
                    }),
                    parent_id: this.parent_id ? this.client.options.channelsLifeTime ? this.client.categoryChannels.has(this.parent_id) ? this.parent_id : undefined : this.parent_id : undefined,
                    nsfw: this.nsfw,
                    rtc_region: this.rtc_region,
                    video_quality_mode: this.video_quality_mode,
                    
                }
                if (reason) data['reason'] = reason
                this.client.rest.post(this.client._ENDPOINTS.SERVER_CHANNEL(this.guildId), data).then(newChannel => {
                    let channel = new VoiceChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, newChannel)
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
                let newChannel = new VoiceChannel(this.client, this.client.guilds.get(res.guild_id) || this.guild, res)
                Object.keys(newChannel).map(k => this[k] = newChannel[k])
                return resolve(newChannel)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async bulkDelete(data) {
        return new Promise(async (resolve, reject) => {
            if (typeof data === "undefined") return reject(new TypeError("You must provide how many message you want to delete"))
            if (typeof data === "object") {
                let res = []
                data.map(d => {
                    if (d instanceof Message) {
                        res.push(d.id)
                    } else if (typeof d === "string") res.push(d)
                    else return reject(new TypeError("Unknow message"))
                })
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id) + "/bulk-delete", {
                    messages: res
                }).then(() => {
                    return resolve()
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (typeof data === "number") {
                let res = []
                if (data < 2) return reject(new TypeError("The message count must be more than 1"))
                if (data > 100) return reject(new TypeError("The message count must be less than 100"))
                let all = await this.fetchMessages({ limit: data }).catch(e => {
                    return reject(new Error(e))
                })
                all.map(message => res.push(message.id))
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id) + "/bulk-delete", {
                    messages: res
                }).then(() => {
                    return resolve()
                }).catch(e => {
                    return reject(new Error(e))
                })
            }
        })
    }

    join(mute, deaf) {
        if (typeof mute === "undefined") mute = false
        if (typeof deaf === "undefined") deaf = false
        if (typeof mute !== "boolean") throw new TypeError("Mute state must be a boolean")
        if (typeof deaf !== "boolean") throw new TypeError("Deaf state must be a boolean")
        this.client.ws.socket.send(JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: this.id,
                self_mute: mute,
                self_deaf: deaf
            }
        }))
    }
    leave() {
        this.client.ws.socket.send(JSON.stringify({
            op: 4,
            d: {
                guild_id: this.guildId,
                channel_id: null,
            }
        }))
    }

    createCollector(options = {}){
        if(typeof options !== "object") throw new TypeError("You must provide options for the collector")
        if(typeof options.count !== "undefined"){
            if(typeof options.count !== "number") throw new TypeError("The count must be a number")
        }
        if(typeof options.type !== "undefined"){
            if(typeof options.type !== "string") throw new TypeError("The type must be a string")
            options.type = options.type.toLowerCase()
            if(!["message", "component"].includes(options.type)) throw new TypeError("Invalid collector type (message or component)")
        }
        if(typeof options.time !== "undefined"){
            if(typeof options.time !== "number") throw new TypeError("The time must be a number")
        }
        if(typeof options.componentType !== "undefined"){
            if(typeof options.componentType !== "number") throw new TypeError("The componentType must be a number")
            if(options.componentType < 1 || options.componentType > 8) throw new TypeError("Invalid componentType for the collector")
        }
        if(typeof options.filter !== "undefined"){
            if(typeof options.filter !== "function") throw new TypeError("The filter must be a filter function for the collector, example : 'filter: (collected) => collected.author.id === message.author.id'")
        }
        let identifier = Date.now()
        this.client.collectorCache[identifier] = new Collector(this.client, this.client.guilds.get(this.guildId)||this.guild, null, this.channel, options)
        this.client.collectorCache[identifier]?.on('end', () => {
            delete this.client.collectorCache[identifier]
        })
        return this.client.collectorCache[identifier]    
    }

    awaitMessages(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") throw new TypeError("You must provide options for the collector")
            if (typeof options.count !== "undefined") {
                if (typeof options.count !== "number") throw new TypeError("The count must be a number")
            }
            options.type = "await_message"
            if (typeof options.time !== "undefined") {
                if (typeof options.time !== "number") throw new TypeError("The time must be a number")
            }
            if (typeof options.componentType !== "undefined") {
                if (typeof options.componentType !== "number") throw new TypeError("The componentType must be a number")
                if (options.componentType < 1 || options.componentType > 8) throw new TypeError("Invalid componentType for the collector")
            }
            if (typeof options.filter !== "undefined") {
                if (typeof options.filter !== "function") throw new TypeError("The filter must be a filter function for the collector, example : 'filter: (collected) => collected.author.id === message.author.id'")
            }
            let identifier = Date.now()
            this.client.collectorCache[identifier] = new Collector(this.client, this.client.guilds.get(this.guildId) || this.guild, null, this, options)
            this.client.collectorCache[identifier]?.on('end', () => {
                delete this.client.collectorCache[identifier]
            })
            this.client.collectorCache[identifier]?.on('collected', collected => {
                resolve(collected)
                delete this.client.collectorCache[identifier]
            })
        })
    }

    async createInvite(options = {}) {
        return new Promise(async(resolve, reject) => {
            if(typeof options !== 'object') return reject(new TypeError("Create invite options must be object"))
            if(typeof options.max_age !== "undefined"){
                if(typeof options.max_age !== "number") return reject(new TypeError("Create invite options max_age must be a number"))
                if(options.max_age < 0 || options.max_age > 604800) return reject(new TypeError("Create invite options max_age must be between 0 and 604800"))
            }
            if(typeof options.max_uses !== "undefined"){
                if(typeof options.max_uses !== "number") return reject(new TypeError("Create invite options max_uses must be a number"))
                if(options.max_uses < 0 || options.max_uses > 100) return reject(new TypeError("Create invite options max_uses must be between 0 and 100"))
            }
            if(typeof options.temporary !== "undefined"){
                if(typeof options.temporary !== "boolean") return reject(new TypeError("Create invite options temporary must be a boolean"))
            }
            if(typeof options.unique !== "undefined"){
                if(typeof options.unique !== "boolean") return reject(new TypeError("Create invite options unique must be a boolean"))
            }
            if (options.reason === null) options.reason = undefined
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.post(`${this.client._ENDPOINTS.CHANNEL(this.id)}/invites`, options).then(res => {
                return resolve(new Invite(this.client, this.client.guilds.get(this.guildId)||this.guild, res, this))
            }).catch(e=>{
                return reject(new Error(e))
            })
        })
    }
}