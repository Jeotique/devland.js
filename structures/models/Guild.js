const Utils = require('../util')
const Client = require('../client/client')
const TextChannel = require('./TextChannel')
const GuildCommand = require('./GuildCommand')
const { Store } = require('../util/Store/Store')
const Emoji = require('./Emoji')
const User = require('./User')
const VoiceChannel = require('./VoiceChannel')
const CategoryChannel = require('./CategoryChannel')

module.exports = class Guild {
    /**
     * 
     * @param {Client} client 
     */
    constructor(client, data) {
        /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
        Object.defineProperty(this, 'client', { value: client })
        this.ready = true
        this.id = data.id
        this.name = data.name
        this.icon = data.icon
        this.description = data.description
        this.homeHeader = data.homeHeader
        this.splash = data.splash
        this.discovery_splash = data.discovery_splash
        this.features = data.features
        this.banner = data.banner
        this.ownerId = data.owner_id
        this.region = data.region
        this.verification_level = data.verification_level
        this.mfa_level = data.mfa_level
        this.default_message_notifications = data.default_message_notifications
        this.explicit_content_filter = data.explicit_content_filter
        this.max_members = data.max_members
        this.max_stage_video_channel_users = data.max_stage_video_channel_users
        this.max_video_channel_users = data.max_video_channel_users
        this.boostLevel = data.premium_tier
        this.boostCount = data.premium_subscription_count
        this.system_channel_flags = data.system_channel_flags
        this.preferred_locale = data.preferred_locale
        this.premium_progress_bar_enabled = data.premium_progress_bar_enabled
        this.nsfw = data.nsfw
        this.nsfw_level = data.nsfw_level
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.data_is_available = true
    }
    /**
     * @typedef {Object} guildVanityData
     * @property {string|null} code
     * @property {number|null} uses
     */
    /**
     * Fetch and return vanity url data
     * @returns {Promise<guildVanityData>}
     */
    async fetchVanity() {
        return new Promise(async (resolve, reject) => {
            let result = await this.client.rest.get(this.client._ENDPOINTS.SERVERS(this.id) + '/vanity-url').catch(e => { return reject(new Error(e)) })
            if (!result) return reject(new TypeError("Can't fetch the vanity data from : " + this.name))
            let res = {
                code: result.vanityUrlCode,
                uses: result.vanityUrlUses,
            }
            return resolve(res)
        })
    }
    /**
     * @typedef {Object} utilsChannels
     * @property {TextChannel|null} systemChannel
     * @property {number} afkTimeout
     * @property {TextChannel|null} afkChannel
     * @property {TextChannel|null} widgetChannel
     * @property {boolean} widgetEnabled
     * @property {TextChannel|null} rulesChannel
     * @property {TextChannel|null} safetyChannel
     * @property {TextChannel|null} publicUpdatesChannel
    */
    /**
     * Fetch and returns afk, system, widget, rules, safety, public updates channels
     * @returns {Promise<utilsChannels>}
     */
    async fetchUtilsChannels() {
        return new Promise(async (resolve, reject) => {
            let guildResult = await this.client.rest.get(this.client._ENDPOINTS.SERVERS(this.id)).catch(e => { return reject(new Error(e)) })
            if (!guildResult) return reject(new TypeError("Can't fetch the guild : " + this.name))
            let afkChannel = null
            let afkTimeout = guildResult.afk_timeout
            let systemChannel = null
            let widgetChannel = null
            let widgetEnabled = guildResult.widget_enabled
            let rulesChannel = null
            let safetyChannel = null
            let publicUpdatesChannel = null
            if (guildResult.system_channel_id) systemChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.system_channel_id)).catch(e => reject(new Error(e)))
            if (guildResult.afk_channel_id) afkChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.afk_channel_id)).catch(e => reject(new Error(e)))
            if (guildResult.widget_channel_id) widgetChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.widget_channel_id)).catch(e => reject(new Error(e)))
            if (guildResult.rules_channel_id) rulesChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.rules_channel_id)).catch(e => reject(new Error(e)))
            if (guildResult.safety_alerts_channel_id) safetyChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.safety_alerts_channel_id)).catch(e => reject(new Error(e)))
            if (guildResult.public_updates_channel_id) publicUpdatesChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.public_updates_channel_id)).catch(e => { reject(new Error(e)) })
            if (systemChannel) systemChannel = new TextChannel(this.client, this, systemChannel)
            if (afkChannel) afkChannel = new VoiceChannel(this.client, this, afkChannel)
            if (widgetChannel) widgetChannel = new TextChannel(this.client, this, widgetChannel)
            if (rulesChannel) rulesChannel = new TextChannel(this.client, this, rulesChannel)
            if (safetyChannel) safetyChannel = new TextChannel(this.client, this, safetyChannel)
            if (publicUpdatesChannel) publicUpdatesChannel = new TextChannel(this.client, this, publicUpdatesChannel)
            return resolve({
                systemChannel,
                afkTimeout,
                afkChannel,
                widgetChannel,
                widgetEnabled,
                rulesChannel,
                safetyChannel,
                publicUpdatesChannel
            })
        })
    }

    async setCommands(...commands) {
        return new Promise(async (resolve, reject) => {
            if (!commands || commands.length < 1) return reject(new TypeError("No command provided"))
            if (commands[0] instanceof Store || commands[0] instanceof Map) {
                let body = [...commands[0].values()]
                body.map(data => {
                    data.map(command => {
                        if (command instanceof GuildCommand) {
                            command = command.pack()
                        } else if (typeof command == "object") {
                            command = new GuildCommand(command).pack()
                        } else return reject(new TypeError("Invalid command format"))
                        console.log(command)
                        this.client.rest.post(this.client._ENDPOINTS.COMMANDS(this.id), command).then(() => {
                            return resolve(true)
                        }).catch(e => {
                            return reject(new Error(e))
                        })
                    })
                })
            } else {
                let all = []
                commands.map(command => {
                    if (command instanceof GuildCommand) {
                        all.push(command.pack())
                    } else if (typeof command == "object") {
                        all.push(new GuildCommand(command).pack())
                    } else return reject(new TypeError("Invalid command format"))
                })
                all.map(data => {
                    this.client.rest.post(this.client._ENDPOINTS.COMMANDS(this.id), data).then(() => {
                        return resolve(true)
                    }).catch(e => {
                        return reject(new Error(e))
                    })
                })
            }
        })
    }
    async getCommands() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.COMMANDS(this.id)).then(data => {
                if (data.length < 1) return resolve([])
                else {
                    let res = []
                    data.map(com => res.push(new GuildCommand(com)))
                    return resolve(res)
                }
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }
    async deleteCommand(command) {
        return new Promise(async (resolve, reject) => {
            if (command instanceof GuildCommand) {
                if (!command.id) return reject(new TypeError("Invalid command provided, you must provide a GuildCommand class get after using \"getCommands()\""))
                this.client.rest.delete(this.client._ENDPOINTS.COMMANDS(this.id, command.id)).then(() => {
                    return resolve(true)
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (typeof command === "object") {
                if (!command?.id) return reject(new TypeError("Invalid command provided, if you are using a custom object you need to provide the \"<command>.id\""))
                this.client.rest.delete(this.client._ENDPOINTS.COMMANDS(this.id, command.id)).then(() => {
                    return resolve(true)
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Invalid command provided"))
        })
    }

    async fetchEmojis(emoji_id) {
        return new Promise(async (resolve, reject) => {
            if (emoji_id instanceof Emoji) emoji_id = emoji_id.id
            if (typeof emoji_id !== "undefined" && typeof emoji_id !== "string") return reject(new TypeError("Invalid emoji Id"))
            this.client.rest.get(this.client._ENDPOINTS.EMOJI(this.id, emoji_id)).then(res => {
                if (emoji_id) {
                    return resolve(new Emoji(this.client, this.client.guilds.get(this.id) || this, res))
                } else {
                    let collect = new Store()
                    res.map(a => collect.set(a.id, new Emoji(this.client, this.client.guilds.get(this.id) || this, a)))
                    return resolve(collect)
                }
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async createEmoji(options) {
        return new Promise(async (resolve, reject) => {
            if (typeof options === "undefined") return reject(new TypeError("No data provided"))
            if (typeof options !== "object") return reject(new TypeError("Create emoji options must be a object"))
            if (typeof options.name !== "string") return reject(new TypeError("Create emoji options name must be a string"))
            if (typeof options.roles === "undefined") options.roles = []
            if (typeof options.roles !== "object") return reject(new TypeError("Create emoji options roles must be a array"))
            if (options.roles.find(value => typeof value !== "string")) return reject(new TypeError("Create emoji options roles must contains only roles Id"))
            if (typeof options.image === "undefined") return reject(new TypeError("Create emoji options image cannot be undefined"))
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("Create emoji options reason must be string or a undefined value"))
            this.client.rest.post(this.client._ENDPOINTS.EMOJI(this.id), {
                name: options.name,
                image: options.image,
                roles: options.roles,
                "reason": options.reason,
            }).then(res => {
                return resolve(new Emoji(this.client, this.client.guilds.get(this.id) || this, res))
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async edit(options, reason) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Invalid options object provided"))
            if (Object.keys(options).length < 1) return reject(new TypeError("You need to provide a minimum of one change"))
            if (typeof options.name !== "undefined") {
                if (typeof options.name !== "string") return reject(new TypeError("The guild name must be a string"))
            }
            if (typeof options.verification_level !== "undefined") {
                if (options.verification_level === null) options.verification_level = 0
                if (typeof options.verification_level !== "number") return reject(new TypeError("The guild verification level must be a number"))
                if (options.verification_level < 0 || options.verification_level > 4) return reject(new TypeError("The guild verification level is invalid"))
            }
            if (typeof options.default_message_notifications !== "undefined") {
                if (options.default_message_notifications === null) options.default_message_notifications = 0
                if (typeof options.default_message_notifications !== "number") return reject(new TypeError("The guild default message notifications must be a number"))
                if (options.default_message_notifications < 0 || options.default_message_notifications > 1) return reject(new TypeError("The guild default message notifications is invalid"))
            }
            if (typeof options.explicit_content_filter !== "undefined") {
                if (options.explicit_content_filter === null) options.explicit_content_filter = 0
                if (typeof options.explicit_content_filter !== "number") return reject(new TypeError("The guild explicit content filter must be a number"))
                if (options.explicit_content_filter < 0 || options.explicit_content_filter > 2) return reject(new TypeError("The guild explicit content filter is invalid"))
            }
            if (typeof options.afk_channel_id !== "undefined") {
                /*
                    if(options.afk_channel_id instanceof VoiceChannel) options.afk_channel_id = options.afk_channel_id.id
                */
                if (options.afk_channel_id !== null && typeof options.afk_channel_id !== "string") return reject(new TypeError("The guild afk channel id must be a string or a VoiceChannel instance"))
            }
            if (typeof options.afk_timeout !== "undefined") {
                if (typeof options.afk_timeout !== "number") return reject(new TypeError("The guild afk timeout must be a number"))
            }
            if (typeof options.owner_id !== "undefined") {
                if (this.ownerId !== this.client.user.id) return reject(new TypeError("The bot need to be the owner to do this action"))
                if (options.owner_id instanceof User) options.owner_id = options.owner_id.id
                if (typeof options.owner_id !== "string") return reject(new TypeError("The guild owner id must be a string or a User instance"))
            }
            if (typeof options.system_channel_id !== "undefined") {
                if (options.system_channel_id instanceof TextChannel) options.system_channel_id = options.system_channel_id.id
                if (options.system_channel_id !== null && typeof options.system_channel_id !== "string") return reject(new TypeError("The guild system channel id must be a string or a TextChannel instance"))
            }
            if (typeof options.system_channel_flags !== "undefined") {
                if (options.system_channel_flags !== null && typeof options.system_channel_flags !== "string" && typeof options.system_channel_flags !== "number") return reject(new TypeError("The guild system channel flags must be string or number"))
            }
            if (typeof options.rules_channel_id !== "undefined") {
                if (options.rules_channel_id instanceof TextChannel) options.rules_channel_id = options.rules_channel_id.id
                if (options.rules_channel_id !== null && typeof options.rules_channel_id !== "string") return reject(new TypeError("The guild rules channel id must be a string or a TextChannel instance"))
            }
            if (typeof options.public_updates_channel_id !== "undefined") {
                if (options.public_updates_channel_id instanceof TextChannel) options.public_updates_channel_id = options.public_updates_channel_id.id
                if (options.public_updates_channel_id !== null && typeof options.public_updates_channel_id !== "string") return reject(new TypeError("The guild public updates channel id must be a string or a TextChannel instance"))
            }
            if (typeof options.preferred_locale !== "undefined") {
                if (typeof options.preferred_locale !== "string") return reject(new TypeError("The guild preferred locale must be a string"))
            }
            if (typeof options.features !== "undefined") {
                if (typeof options.features !== "object") return reject(new TypeError("The guild features to enable must be a array"))
            }
            if (typeof options.description !== "undefined") {
                if (options.description !== null && typeof options.description !== "string") return reject(new TypeError("The guild description must be a string"))
            }
            if (typeof options.premium_progress_bar_enabled !== "undefined") {
                if (typeof options.premium_progress_bar_enabled !== "boolean") return reject(new TypeError("The guild premium progress bar enabled must be a boolean"))
            }
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be string or a undefined value"))
            options['reason'] = reason
            this.client.rest.patch(this.client._ENDPOINTS.SERVERS(this.id), options).then(res => {
                let newGuild = new Guild(this.client, res)
                Object.keys(newGuild).map(k => this[k] = newGuild[k])
                return resolve(newGuild)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async delete() {
        return new Promise(async (resolve, reject) => {
            if (this.ownerId !== this.client.user.id) return reject(new TypeError("The bot need to be the owner to do this action"))
            this.client.rest.delete(this.client._ENDPOINTS.SERVERS(this.id)).then(() => {
                return resolve()
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async fetchTextChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                res = res.filter(channel => channel.type === 0)
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
                res = res.filter(channel => channel.type === 2)
                let collect = new Store()
                res.map(channel => collect.set(channel.id, new VoiceChannel(this.client, this.client.guilds.get(this.id) || this, channel)))
                return resolve(collect)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async fetchCategoryChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                let collect = new Store()
                res.filter(channel => channel.type === 4).map(channel => {
                    channel.childrens = []
                    res.filter(child => child.parent_id === channel.id || child.parentId === channel.id).map(child => channel.childrens.push(child.id))
                    collect.set(channel.id, new CategoryChannel(this.client, this.client.guilds.get(this.id) || this, channel))
                })
                return resolve(collect)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }
}