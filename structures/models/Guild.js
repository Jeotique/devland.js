const Utils = require('../util')
const Client = require('../client/client')
const TextChannel = require('./TextChannel')
const GuildCommand = require('./GuildCommand')
const {Store} = require('../util/Store/Store')
const Emoji = require('./Emoji')
const User = require('./User')
const VoiceChannel = require('./VoiceChannel')
const CategoryChannel = require('./CategoryChannel')
const AnnouncementChannel = require('./AnnouncementChannel')
const StageChannel = require('./StageChannel')
const ForumChannel = require('./ForumChannel')
const Member = require('./Member')
const Role = require('./Role')
const Permissions = require('../util/BitFieldManagement/Permissions')
const Constants = require('../util/Constants')
const Ban = require('./Ban')
const Invite = require('./Invite')
const Integration = require('./Integration')
const DataResolver = require('../util/DateResolver')
const AutoModRule = require('./AutoModRule')
const ScheduledEvent = require('./ScheduledEvent')
const {parseEmoji} = require("../util");

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
        Object.defineProperty(this, 'client', {value: client})
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
        this.member_count = (data.member_count && !isNaN(data.member_count)) ? data.member_count : data.approximate_member_count || data?.members?.length
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
        this.members = new Store()
        this.roles = new Store()
        this.invites = new Store()
        this.presences = new Store()
        this.voicesStates = new Store()
        this.data_is_available = true

        if (this.icon) {
            this.icon = `https://cdn.discordapp.com/icons/${this.id}/${this.icon}${this.icon.startsWith('a_') ? '.gif' : '.png'}?size=512`
        }
    }

    toString() {
        return `${this.name}`
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
            let result = await this.client.rest.get(this.client._ENDPOINTS.SERVERS(this.id) + '/vanity-url').catch(e => {
                return reject(e)
            })
            if (!result) return reject(new TypeError("Can't fetch the vanity data from : " + this.name))
            let res = {
                code: result.code,
                uses: result.uses,
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
            let guildResult = await this.client.rest.get(this.client._ENDPOINTS.SERVERS(this.id)).catch(e => {
                return reject(e)
            })
            if (!guildResult) return reject(new TypeError("Can't fetch the guild : " + this.name))
            let afkChannel = null
            let afkTimeout = guildResult.afk_timeout
            let systemChannel = null
            let widgetChannel = null
            let widgetEnabled = guildResult.widget_enabled
            let rulesChannel = null
            let safetyChannel = null
            let publicUpdatesChannel = null
            if (guildResult.system_channel_id) systemChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.system_channel_id)).catch(e => reject(e))
            if (guildResult.afk_channel_id) afkChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.afk_channel_id)).catch(e => reject(e))
            if (guildResult.widget_channel_id) widgetChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.widget_channel_id)).catch(e => reject(e))
            if (guildResult.rules_channel_id) rulesChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.rules_channel_id)).catch(e => reject(e))
            if (guildResult.safety_alerts_channel_id) safetyChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.safety_alerts_channel_id)).catch(e => reject(e))
            if (guildResult.public_updates_channel_id) publicUpdatesChannel = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(guildResult.public_updates_channel_id)).catch(e => reject(e))
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
            if (!commands || (Array.isArray(commands) && commands?.length < 1) || (commands instanceof Store && commands?.size < 1)) return reject(new TypeError("No command provided"))
            if (commands[0] instanceof Store || commands[0] instanceof Map) {
                var body = [...commands[0].values()]
                body.map(data => {
                    data.map(command => {
                        if (command instanceof GuildCommand) {
                            command = command.pack()
                        } else if (typeof command == "object") {
                            command = new GuildCommand(command).pack()
                        } else return reject(new TypeError("Invalid command format"))

                    })
                })
                this.client.rest.put(this.client._ENDPOINTS.COMMANDS(this.id), body).then(() => {
                    return resolve(true)
                }).catch(e => {
                    return reject(e)
                })
            } else {
                var all = []
                commands.map(command => {
                    if (Array.isArray(command)) {
                        command.map(cmd => {
                            if (cmd instanceof GuildCommand) {
                                all.push(cmd.pack())
                            } else if (typeof cmd == "object") {
                                all.push(new GuildCommand(cmd).pack())
                            } else return reject(new TypeError("Invalid command format"))
                        })
                    } else {
                        if (command instanceof GuildCommand) {
                            all.push(command.pack())
                        } else if (typeof command == "object") {
                            all.push(new GuildCommand(command).pack())
                        } else return reject(new TypeError("Invalid command format"))
                    }
                })
                this.client.rest.put(this.client._ENDPOINTS.COMMANDS(this.id), all).then(() => {
                    return resolve(true)
                }).catch(e => {
                    return reject(e)
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
                return reject(e)
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
                    return reject(e)
                })
            } else if (typeof command === "object") {
                if (!command?.id) return reject(new TypeError("Invalid command provided, if you are using a custom object you need to provide the \"<command>.id\""))
                this.client.rest.delete(this.client._ENDPOINTS.COMMANDS(this.id, command.id)).then(() => {
                    return resolve(true)
                }).catch(e => {
                    return reject(e)
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
                return reject(e)
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
            options.image = await DataResolver.resolveImage(options.image)
            if (options.reason === null) options.reason = undefined
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("Create emoji options reason must be string or a undefined value"))
            this.client.rest.post(this.client._ENDPOINTS.EMOJI(this.id), {
                name: options.name,
                image: options.image,
                roles: options.roles,
                "reason": options.reason,
            }).then(res => {
                return resolve(new Emoji(this.client, this.client.guilds.get(this.id) || this, res))
            }).catch(e => {
                return reject(e)
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
                if (typeof options.afk_channel_id === "object" && options.afk_channel_id instanceof VoiceChannel) options.afk_channel_id = options.afk_channel_id.id
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
            if (typeof options.icon !== "undefined") options.icon = await DataResolver.resolveImage(options.icon)
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be string or a undefined value"))
            options['reason'] = reason
            this.client.rest.patch(this.client._ENDPOINTS.SERVERS(this.id), options).then(res => {
                let newGuild = new Guild(this.client, res)
                Object.keys(newGuild).map(k => this[k] = newGuild[k])
                return resolve(newGuild)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async delete() {
        return new Promise(async (resolve, reject) => {
            if (this.ownerId !== this.client.user.id) return reject(new TypeError("The bot need to be the owner to do this action"))
            this.client.rest.delete(this.client._ENDPOINTS.SERVERS(this.id)).then(() => {
                return resolve()
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchTextChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                res = res.filter(channel => channel.type === 0)
                let collect = new Store()
                res.map(channel => collect.set(channel.id, new TextChannel(this.client, this.client.guilds.get(this.id) || this, channel)))
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.textChannels.set(channel.id, channel)
                    })
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchVoiceChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                res = res.filter(channel => channel.type === 2)
                let collect = new Store()
                res.map(channel => collect.set(channel.id, new VoiceChannel(this.client, this.client.guilds.get(this.id) || this, channel)))
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.voiceChannels.set(channel.id, channel)
                    })
                }
            }).catch(e => {
                return reject(e)
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
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.categoryChannels.set(channel.id, channel)
                    })
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchAnnouncementChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                res = res.filter(channel => channel.type === 5)
                let collect = new Store()
                res.map(channel => collect.set(channel.id, new AnnouncementChannel(this.client, this.client.guilds.get(this.id) || this, channel)))
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.announcementChannels.set(channel.id, channel)
                    })
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchStageChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                res = res.filter(channel => channel.type === 13)
                let collect = new Store()
                res.map(channel => collect.set(channel.id, new StageChannel(this.client, this.client.guilds.get(this.id) || this, channel)))
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.stageChannels.set(channel.id, channel)
                    })
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchForumChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                res = res.filter(channel => channel.type === 15)
                let collect = new Store()
                res.map(channel => collect.set(channel.id, new ForumChannel(this.client, this.client.guilds.get(this.id) || this, channel)))
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.forumChannels.set(channel.id, channel)
                    })
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchChannels() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_CHANNEL(this.id)).then(res => {
                let toSend = {
                    text: new Store(),
                    voice: new Store(),
                    category: new Store(),
                    announcement: new Store(),
                    stage: new Store(),
                    forum: new Store(),
                }
                res.map(channel => {
                    switch (channel.type) {
                        case 0:
                            let text = new TextChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                            toSend['text'].set(text.id, text)
                            if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                                text.cachedAt = Date.now()
                                text.expireAt = Date.now() + this.client.options.channelsLifeTime
                                this.client.textChannels.set(text.id, text)
                            }
                            break;
                        case 2:
                            let voice = new VoiceChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                            toSend['voice'].set(voice.id, voice)
                            if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                                voice.cachedAt = Date.now()
                                voice.expireAt = Date.now() + this.client.options.channelsLifeTime
                                this.client.voiceChannels.set(voice.id, voice)
                            }
                            break;
                        case 4:
                            let category = new CategoryChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                            category.childrens = []
                            res.filter(child => child.parent_id === category.id || child.parentId === category.id).map(child => category.childrens.push(child.id))
                            toSend['category'].set(category.id, category)
                            if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                                category.cachedAt = Date.now()
                                category.expireAt = Date.now() + this.client.options.channelsLifeTime
                                this.client.categoryChannels.set(category.id, category)
                            }
                            break;
                        case 5:
                            let announcement = new AnnouncementChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                            toSend['announcement'].set(announcement.id, announcement)
                            if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                                announcement.cachedAt = Date.now()
                                announcement.expireAt = Date.now() + this.client.options.channelsLifeTime
                                this.client.announcementChannels.set(announcement.id, announcement)
                            }
                            break;
                        case 13:
                            let stage = new StageChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                            toSend['stage'].set(stage.id, stage)
                            if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                                stage.cachedAt = Date.now()
                                stage.expireAt = Date.now() + this.client.options.channelsLifeTime
                                this.client.stageChannels.set(stage.id, stage)
                            }
                            break;
                        case 15:
                            let forum = new ForumChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                            toSend['forum'].set(forum.id, forum)
                            if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                                forum.cachedAt = Date.now()
                                forum.expireAt = Date.now() + this.client.options.channelsLifeTime
                                this.client.forumChannels.set(forum.id, forum)
                            }
                            break;
                    }
                })
                return resolve(toSend)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchChannel(channel_id) {
        return new Promise(async (resolve, reject) => {
            if (typeof channel_id !== "string") return reject(new TypeError("The channel Id must be a string"))
            this.client.rest.get(this.client._ENDPOINTS.CHANNEL(channel_id)).then(channel => {
                switch (channel.type) {
                    case 0:
                        let text = new TextChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                        resolve(text)
                        if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                            text.cachedAt = Date.now()
                            text.expireAt = Date.now() + this.client.options.channelsLifeTime
                            this.client.textChannels.set(text.id, text)
                        }
                        break;
                    case 2:
                        let voice = new VoiceChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                        resolve(voice)
                        if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                            voice.cachedAt = Date.now()
                            voice.expireAt = Date.now() + this.client.options.channelsLifeTime
                            this.client.voiceChannels.set(voice.id, voice)
                        }
                        break;
                    case 4:
                        let category = new CategoryChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                        category.childrens = []
                        res.filter(child => child.parent_id === category.id || child.parentId === category.id).map(child => category.childrens.push(child.id))
                        resolve(category)
                        if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                            category.cachedAt = Date.now()
                            category.expireAt = Date.now() + this.client.options.channelsLifeTime
                            this.client.categoryChannels.set(category.id, category)
                        }
                        break;
                    case 5:
                        let announcement = new AnnouncementChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                        resolve(announcement)
                        if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                            announcement.cachedAt = Date.now()
                            announcement.expireAt = Date.now() + this.client.options.channelsLifeTime
                            this.client.announcementChannels.set(announcement.id, announcement)
                        }
                        break;
                    case 13:
                        let stage = new StageChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                        resolve(stage)
                        if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                            stage.cachedAt = Date.now()
                            stage.expireAt = Date.now() + this.client.options.channelsLifeTime
                            this.client.stageChannels.set(stage.id, stage)
                        }
                        break;
                    case 15:
                        let forum = new ForumChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                        resolve(forum)
                        if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                            forum.cachedAt = Date.now()
                            forum.expireAt = Date.now() + this.client.options.channelsLifeTime
                            this.client.forumChannels.set(forum.id, forum)
                        }
                        break;
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchMember(user) {
        return new Promise(async (resolve, reject) => {
            if (user instanceof User) user = user.id
            if (user instanceof Member) user = user.id
            if (typeof user !== "string") return reject(new TypeError("The user must be a string or a valid User instance"))
            this.client.rest.get(this.client._ENDPOINTS.MEMBERS(this.id, user)).then(res => {
                let member = new Member(this.client, this, res)
                resolve(member)
                if (typeof this.client.options.membersLifeTime === "number" && this.client.options.membersLifeTime > 0) {
                    member.cachedAt = Date.now()
                    member.expireAt = Date.now() + this.client.options.membersLifeTime
                    this.members.set(member.id, member)
                }
            }).catch(e => {
                return new Error(e)
            })
        })
    }

    async fetchMembers(options = {
        limit: 1000,
        after: 0
    }) {
        return new Promise(async (resolve, reject) => {
            if (typeof options.limit !== "number") return reject(new TypeError("The limit must be a number"))
            if (options.limit < 1 || options.limit > 1000) return reject(new TypeError("The limit must be between 1 and 1000"))
            if (typeof options.after !== "number") return reject(new TypeError("After must be a number"))
            this.client.rest.get(`${this.client._ENDPOINTS.MEMBERS(this.id)}?limit=${options.limit}&after=${options.after}`).then(res => {
                let collect = new Store()
                res.map(member_data => {
                    let member = new Member(this.client, this, member_data)
                    collect.set(member.id, member)
                })
                resolve(collect)
                if (typeof this.client.options.membersLifeTime === "number" && this.client.options.membersLifeTime > 0) {
                    collect.map(member => {
                        member.cachedAt = Date.now()
                        member.expireAt = Date.now() + this.client.options.membersLifeTime
                        this.members.set(member.id, member)
                    })
                }
            }).catch(e => {
                return new Error(e)
            })
        })
    }

    async fetchRoles() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.ROLES(this.id)).then(res => {
                let collect = new Store()
                res.map(role => collect.set(role.id, new Role(this.client, this.client.guilds.get(this.id) || this, role)))
                resolve(collect)
                if (typeof this.client.options.rolesLifeTime === "number" && this.client.options.rolesLifeTime > 0) {
                    collect.map(role => {
                        role.cachedAt = Date.now()
                        role.expireAt = Date.now() + this.client.options.rolesLifeTime
                        this.roles.set(role.id, role)
                    })
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async createRole(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Create role options must be a object"))
            if (typeof options.name !== "undefined") {
                if (typeof options.name !== "string") return reject(new TypeError("Create role options name must be a string"))
                if (options.name.length > 100) return reject(new TypeError("Create role options must be less than 100 caracters"))
            }
            if (typeof options.permissions !== "undefined") {
                if (typeof options.permissions === "object" && options.permissions instanceof Permissions) options.permissions = options.permissions.bitfield.toString()
                else options.permissions = new Permissions(options.permissions).bitfield.toString()
            }
            if (typeof options.color !== "undefined") {
                if (typeof options.color === "string") options.color = Utils.resolveColor(options.color)
                if (typeof options.color !== "number") return reject(new TypeError("Create role options color must be a number"))
            }
            if (typeof options.hoist !== "undefined") {
                if (typeof options.hoist !== "boolean") return reject(new TypeError("Create role options hoist must be a boolean"))
            }
            if (typeof options.unicode_emoji !== "undefined") {
                if (options.unicode_emoji !== null) {
                    if (typeof options.unicode_emoji === "object" && options.unicode_emoji instanceof Emoji) {
                        options.unicode_emoji = options.unicode_emoji.pack()
                        options.unicode_emoji = options.unicode_emoji.id ? `${options.unicode_emoji.name}` : `<${options.unicode_emoji.animated ? "a" : ""}:${options.unicode_emoji.name}:${options.unicode_emoji.id}>`
                        if (typeof options.unicode_emoji !== "string") return reject(new TypeError("Create role options unicode_emoji must be a string"))
                        if (!this.features.includes("ROLE_ICONS")) options.unicode_emoji = undefined
                    }
                }
            }
            if (typeof options.mentionable !== "undefined") {
                if (typeof options.mentionable !== "boolean") return reject(new TypeError("Create role options mentionable must be a boolean"))
            }
            if (typeof options.icon !== "undefined" && options.icon !== null) options.icon = await DataResolver.resolveImage(options.icon)
            if (!this.features.includes("ROLE_ICONS")) options.icon = undefined
            if (options.reason === null) options.reason = undefined
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.post(this.client._ENDPOINTS.ROLES(this.id), options).then(res => {
                if (typeof options.position === "number") {
                    this.client.rest.patch(this.client._ENDPOINTS.ROLES(this.id), {
                        reason: options.reason,
                        id: res.id,
                        position: options.position
                    }).then(allRoles => {
                        let goodRole = allRoles.find(r => r.id === res.id)
                        if (!goodRole) return reject(new Error("Can't find the role after his creation"))
                        let role = new Role(this.client, this.client.guilds.get(this.id) || this, goodRoles)
                        resolve(role)
                        if (typeof this.client.options.rolesLifeTime === "number" && this.client.options.rolesLifeTime > 0) {
                            role.cachedAt = Date.now()
                            role.expireAt = Date.now() + this.client.options.rolesLifeTime
                            this.roles.set(role.id, role)
                        }
                    }).catch(e => {
                        let role = new Role(this.client, this.client.guilds.get(this.id) || this, res)
                        resolve(role)
                        if (typeof this.client.options.rolesLifeTime === "number" && this.client.options.rolesLifeTime > 0) {
                            role.cachedAt = Date.now()
                            role.expireAt = Date.now() + this.client.options.rolesLifeTime
                            this.roles.set(role.id, role)
                        }
                    })
                } else {
                    let role = new Role(this.client, this.client.guilds.get(this.id) || this, res)
                    resolve(role)
                    if (typeof this.client.options.rolesLifeTime === "number" && this.client.options.rolesLifeTime > 0) {
                        role.cachedAt = Date.now()
                        role.expireAt = Date.now() + this.client.options.rolesLifeTime
                        this.roles.set(role.id, role)
                    }
                }

            }).catch(e => {
                return reject(e)
            })
        })
    }

    get premiumSubscriberRole() {
        return this.roles.find(role => role.tags?.premiumSubscriberRole) ?? null
    }

    get everyoneRole() {
        return this.roles.get(this.id) || null
    }

    get highestRole() {
        let all = this.roles.toJSON()
        return all.reduce((prev, role) => (role.comparePositions(prev) > 0 ? role : prev), this.roles.first())
    }

    async fetchLogs(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (options.type && typeof options.type === "number") options.type = Constants.logsTypeFromIndex[options.type]
            var query = {
                type: options.type ? Constants.logsType[options.type.toUpperCase()] : null,
                limit: options.limit || null,
                user_id: options.user_id || null
            }
            let typeQuery = query.type ? `action_type=${query.type}` : null
            let limitQuery = query.limit ? `&limit=${query.limit}` : null
            let userIdQuery = query.user_id ? `&user_id=${query.user_id}` : null
            this.client.rest.get(`${this.client._ENDPOINTS.SERVERS(this.id)}/audit-logs?${typeQuery ? typeQuery : ''}${limitQuery ? limitQuery : ''}${userIdQuery ? userIdQuery : ''}`).then(auditResult => {
                let collect = new Store()
                auditResult?.audit_log_entries?.map(d => {
                    let obj = {}
                    obj.id = d.id
                    obj.user = auditResult?.users?.find(u => u?.id === d?.user_id)
                    obj.user.tag = obj?.user?.username + '#' + obj?.user?.discriminator
                    obj.action_type = d.action_type
                    obj.target_id = d.target_id
                    obj.changes = d.changes
                    obj.reason = d.reason || null
                    obj.options = d.options || null
                    collect.set(obj.id, new (require('./Log'))(this.client, obj))
                })
                return resolve(collect)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async leave() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.delete(this.client._ENDPOINTS.SERVERS(this.id)).then(() => {
                resolve()
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async kickMember(user, reason) {
        return new Promise(async (resolve, reject) => {
            if (user instanceof User) user = user.id
            if (user instanceof Member) user = user.id
            if (typeof user !== "string") return reject(new TypeError("The user must be a valid User or Member instance or a valid Id"))
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            let member = this.members.get(user) || null
            this.client.rest.delete(this.client._ENDPOINTS.MEMBERS(this.id, user), {
                reason: reason
            }).then(() => {
                resolve(member)
                this.members.delete(user)
                if (typeof this.client.options.guildsLifeTime === "number" && this.client.options.guildsLifeTime > 0) {
                    this.cachedAt = Date.now()
                    this.expireAt = Date.now() + this.client.options.guildsLifeTime
                    this.client.guilds.set(this.id, this)
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async banMember(user, delete_message_seconds, reason) {
        return new Promise(async (resolve, reject) => {
            if (user instanceof User) user = user.id
            if (user instanceof Member) user = user.id
            if (typeof user !== "string") return reject(new TypeError("The user must be a valid User or Member instance or a valid Id"))
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            let member = this.members.get(user) || null
            if (delete_message_seconds === null) delete_message_seconds = undefined
            if (typeof delete_message_seconds !== "undefined" && typeof delete_message_seconds !== "number") return reject(new TypeError("delete_message_seconds must be a number"))
            this.client.rest.put(this.client._ENDPOINTS.BANS(this.id, user), {
                delete_message_seconds: delete_message_seconds,
                reason: reason
            }).then(() => {
                resolve(member)
                this.members.delete(user)
                if (typeof this.client.options.guildsLifeTime === "number" && this.client.options.guildsLifeTime > 0) {
                    this.cachedAt = Date.now()
                    this.expireAt = Date.now() + this.client.options.guildsLifeTime
                    this.client.guilds.set(this.id, this)
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async unbanMember(user, reason) {
        return new Promise(async (resolve, reject) => {
            if (user instanceof User) user = user.id
            if (user instanceof Member) user = user.id
            if (typeof user !== "string") return reject(new TypeError("The user must be a valid User or Member instance or a valid Id"))
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.BANS(this.id, user), {
                reason: reason
            }).then(() => {
                resolve(true)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchBans() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.BANS(this.id)).then(res => {
                let collect = new Store()
                res.map(b => collect.set(b.user.id, new Ban(this.client, b)))
                return resolve(collect)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchBan(user) {
        return new Promise(async (resolve, reject) => {
            if (user instanceof User) user = user.id
            if (user instanceof Member) user = user.id
            if (typeof user !== "string") return reject(new TypeError("The user must be a valid User or Member instance or a valid Id"))
            this.client.rest.get(this.client._ENDPOINTS.BANS(this.id, user)).then(res => {
                return resolve(new Ban(this.client, res))
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async prune(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Prune options must be a object"))
            if (typeof options.days !== "undefined") {
                if (typeof options.days !== "number") return reject(new TypeError("Prune options days must be a number"))
                if (options.days < 1 || options.days > 30) return reject(new TypeError("Prune options days must be between 1 and 30"))
            }
            if (typeof options.compute_prune_count !== "undefined") {
                if (typeof options.compute_prune_count !== "boolean") return reject(new TypeError("Prune options compute_prune_count must be a boolean"))
            }
            if (typeof options.include_roles !== "undefined") {
                if (typeof options.include_roles !== "object") return reject(new TypeError("Prune options include_roles must be a array"))
                let a = []
                options.include_roles.map(role => {
                    if (role instanceof Role) a.push(role.id)
                    else if (typeof role === "string") a.push(role)
                    else return reject(new TypeError("Prune options include_roles must contains valid role Id or Role instance"))
                })
                options.include_roles = a
            }
            if (options.reason === null) options.reason = undefined
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.post(this.client._ENDPOINTS.PRUNE(this.id), options).then(() => {
                return resolve(this)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchInvites() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_INVITES(this.id)).then(res => {
                let collect = new Store()
                res.map(invite => collect.set(invite.code, new Invite(this.client, this.client.guilds.get(this.id) || this, invite)))
                resolve(collect)
                if (typeof this.client.options.invitesLifeTime === "number" && this.client.options.invitesLifeTime > 0) {
                    collect.map(invite => {
                        invite.cachedAt = Date.now()
                        invite.expireAt = Date.now() + this.client.options.invitesLifeTime
                        this.invites.set(invite.code, invite)
                        this.client.guilds.set(this.id, this)
                    })
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchWebhooks() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.SERVER_WEBHOOKS(this.id)).then(res => {
                let collect = new Store()
                res.map(web => collect.set(web.id, new Webhook(this.client, this.client.guilds.get(this.id) || this, web)))
                resolve(collect)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchIntegrations() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.INTEGRATIONS(this.id)).then(res => {
                let collect = new Store()
                res.map(i => collect.set(i.id, new Integration(this.client, this.client.guilds.get(this.id) || this, i)))
                resolve(collect)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchAutoModRules() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.AUTOMOD(this.id)).then(res => {
                let collect = new Store()
                if (res.length < 1) return resolve(collect)
                res.map(async (value) => {
                    value.creator = this.client.users.get(value.creator_id) || await this.client.rest.get(this.client._ENDPOINTS.USER(value.creator_id)).catch(e => {
                    })
                    if (value.creator && !(value.creator instanceof User)) value.creator = new User(this.client, value.creator)
                    let rules = new AutoModRule(this.client, this.client.guilds.get(this.id) || this, value)
                    collect.set(rules.id, rules)
                    if (collect.size === res.length) return resolve(collect)
                })
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async fetchAutoModRule(rule_id) {
        return new Promise(async (resolve, reject) => {
            if (rule_id instanceof AutoModRules) rule_id = rule_id.id
            if (typeof rule_id !== "string") return reject(new TypeError("The rule Id must be a string"))
            this.client.rest.get(this.client._ENDPOINTS.AUTOMOD(this.id, rule_id)).then(async res => {
                res.creator = this.client.users.get(res.creator_id) || await this.client.rest.get(this.client._ENDPOINTS.USER(res.creator_id)).catch(e => {
                })
                if (res.creator && !(res.creator instanceof User)) res.creator = new User(this.client, res.creator)
                return resolve(new AutoModRule(this.client, this.client.guilds.get(this.id) || this, res))
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async createAutoModRule(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Create automod rules options must be a object"))
            if (typeof options.name !== "string") return reject(new TypeError("Create automod rules options name must be a string"))
            if (typeof options.event_type !== "number") return reject(new TypeError("Create automod rules options event type must be a number"))
            if (options.event_type !== 1) return reject(new TypeError("Create automod rules options event type is valid, only type 1 is supported"))
            if (typeof options.trigger_type !== "number") return reject(new TypeError("Create automod rules options trigger type must be a number"))
            if (options.trigger_type < 1 || options.trigger_type === 2 || options.trigger_type > 5) return reject(new TypeError("Create automod rules options trigger type invalid"))
            if (typeof options.trigger_metadata !== "undefined") {
                if (typeof options.trigger_metadata !== "object") return reject(new TypeError("Create automod rules options trigger metadata must be a object"))
                if (typeof options.trigger_metadata.keyword_filter !== "undefined") {
                    if (!Array.isArray(options.trigger_metadata.keyword_filter)) return reject(new TypeError("Create automod rules options trigger metadata keyword filter must be a array"))
                    if (options.trigger_metadata.keyword_filter.find(k => typeof k !== "string")) return reject(new TypeError("Create automod rules options trigger metadata keyword filter can contains string only"))
                    if (options.trigger_metadata.keyword_filter.length > 1000) return reject(new TypeError("Create automod rules options trigger metadata keyword filter maximum length of 1000"))
                }
                if (typeof options.trigger_metadata.regex_patterns !== "undefined") {
                    if (!Array.isArray(options.trigger_metadata.regex_patterns)) return reject(new TypeError("Create automod rules options trigger metadata regex patterns must be a array"))
                    if (options.trigger_metadata.regex_patterns.find(k => typeof k !== "string")) return reject(new TypeError("Create automod rules options trigger metadata regex patterns can contains string only"))
                    if (options.trigger_metadata.regex_patterns.length > 1000) return reject(new TypeError("Create automod rules options trigger metadata regex patterns maximum length of 10"))
                }
                if (typeof options.trigger_metadata.presets !== "undefined") {
                    if (!Array.isArray(options.trigger_metadata.presets)) return reject(new TypeError("Create automod rules options trigger metadata presets must be a array"))
                    if (options.trigger_metadata.presets.find(k => typeof k !== "number")) return reject(new TypeError("Create automod rules options trigger metadata presets can contains number only"))
                    if (options.trigger_metadata.presets.find(k => k < 1 || k > 3)) return reject(new TypeError("Create automod rules options trigger metadata presets invalid"))
                }
                if (typeof options.trigger_metadata.allow_list !== "undefined") {
                    if (!Array.isArray(options.trigger_metadata.allow_list)) return reject(new TypeError("Create automod rules options trigger metadata allow list must be a array"))
                    if (options.trigger_metadata.allow_list.find(k => typeof k !== "string")) return reject(new TypeError("Create automod rules options trigger metadata allow list can contains string only"))
                    if (options.trigger_metadata.allow_list.length > 100 && (!options.trigger_metadata.presets || options.trigger_metadata.presets?.length < 1)) return reject(new TypeError("Create automod rules options trigger metadata allow list maximum length of 100"))
                    if (options.trigger_metadata.allow_list.length > 1000) return reject(new TypeError("Create automod rules options trigger metadata allow list maximum length of 1000"))
                }
                if (typeof options.trigger_metadata.mention_total_limit !== "undefined") {
                    if (typeof options.trigger_metadata.mention_total_limit !== "number") return reject(new TypeError("Create automod rules options trigger metadata mention total limit must be a number"))
                    if (options.trigger_metadata.mention_total_limit > 50) return reject(new TypeError("Create automod rules options trigger metadata mention total limit maximum of 50"))
                }
            }
            if (typeof options.actions === "undefined") return reject(new TypeError("Create automod rules options actions must be a array"))
            if (!Array.isArray(options.actions)) return reject(new TypeError("Create automod rules options actions must be a array"))
            if (options.actions.length < 1) return reject(new TypeError("Create automod rules options actions you must provid at least one action"))
            if (options.actions.find(a => typeof a.type !== "number")) return reject(new TypeError("Create automod rules options action type must be a number"))
            if (options.actions.find(a => a.type < 1 || a.type > 3)) return reject(new TypeError("Create automod rules options action type invalid"))
            options.actions.map(action => {
                if (typeof action.metadata !== "undefined") {
                    if (typeof action.metadata !== "object") return reject(new TypeError("Create automod rules options action metadata must be a object"))
                    if (typeof action.metadata.channel_id !== "undefined" && typeof action.metadata.channel_id !== "string") return reject(new TypeError("Create automod rules options action metadata channel Id must be a string"))
                    if (typeof action.metadata.duration_seconds !== "undefined" && typeof action.metadata.duration_seconds !== "number") return reject(new TypeError("Create automod rules options action metadata duration seconds must be a number"))
                    if (typeof action.metadata.duration_seconds !== "undefined" && action.metadata.duration_seconds > 2419200) return reject(new TypeError("Create automod rules options action metadata duration seconds maximum of 2419200 (4 weeks)"))
                    if (typeof action.metadata.custom_message !== "undefined" && typeof action.metadata.custom_message !== "string") return reject(new TypeError("Create automod rules options action metadata custom message must be a string"))
                    if (typeof action.metadata.custom_message !== "undefined" && action.metadata.custom_message.length > 150) return reject(new TypeError("Create automod rules options action metadata custom message length maximum of 150"))
                }
            })
            if (typeof options.enabled !== "undefined") {
                if (typeof options.enabled !== "boolean") return reject(new TypeError("Create automod rules options enabled must be a boolean"))
            }
            if (typeof options.exempt_roles !== "undefined") {
                if (!Array.isArray(options.exempt_roles)) return reject(new TypeError("Create automod rules options exempt roles must be a array"))
                if (options.exempt_roles.find(a => typeof a !== "string")) return reject(new TypeError("Create automod rules options exempt roles can contains only string"))
                if (options.exempt_roles.length > 20) return reject(new TypeError("Create automod rules options exempt roles maximum length of 20"))
            }
            if (typeof options.exempt_channels !== "undefined") {
                if (!Array.isArray(options.exempt_channels)) return reject(new TypeError("Create automod rules options exempt channels must be a array"))
                if (options.exempt_channels.find(a => typeof a !== "string")) return reject(new TypeError("Create automod rules options exempt channels can contains only string"))
                if (options.exempt_channels.length > 50) return reject(new TypeError("Create automod rules options exempt channels maximum length of 50"))
            }
            if (options.reason === null) options.reason = undefined
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("Create automod rules options reason must be string or a undefined value"))
            this.client.rest.post(this.client._ENDPOINTS.AUTOMOD(this.id), options).then(res => {
                res.creator = this.client.user
                return resolve(new AutoModRule(this.client, this.client.guilds.get(this.id) || this, res))
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async createChannel(options = {}, reason) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Invalid options object provided"))
            if (Object.keys(options).length < 1) return reject(new TypeError("You need to provide a minimum of one change"))
            if (typeof options.name !== "string") return reject(new TypeError("The channel name must be a string"))
            if (options.name.length < 1) return reject(new TypeError("The channel name must have more than 1 character"))
            if (options.name.length > 100) return reject(new TypeError("The channel name must have less then 100 characters"))
            if (typeof options.type !== "undefined") {
                if (typeof options.type !== "number") return reject(new TypeError("The channel type must be a number"))
                if (options.type === 1 || options.type === 3 || options.type === 14 || options.type < 0 || options.type > 15) return reject(new TypeError("Invalid channel type"))
            }
            if (typeof options.position !== "undefined") {
                if (typeof options.position !== "number") return reject(new TypeError("The channel position must be a number"))
                if (options.position < 0) return reject(new TypeError("The channel position must be more than 0 (or =0)"))
            }
            if (typeof options.topic !== "undefined") {
                if (options.topic !== null) {
                    if (typeof options.topic !== "string") return reject(new TypeError("The channel topic must be a string"))
                    if (options.topic.length > 1024 && options.type !== 15) return reject(new TypeError("The channel topic must have less than 1024 characters (4096 for forum channel)"))
                    else if (options.topic.length > 4096 && options.type === 15) return reject(new TypeError("The channel topic must have less than 4096 characters"))
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
                if (options.bitrate > 128000 && this.boostLevel < 1) return reject(new TypeError("The channel bitrate is too much elevated for a guild with boost level <1"))
                if (options.bitrate > 256000 && this.boostLevel < 2) return reject(new TypeError("The channel bitrate is too much elevated for a guild with boost level <2"))
                if (options.bitrate > 384000 && this.boostLevel < 3 && !this.features.includes("VIP_REGIONS")) return reject(new TypeError("The channel bitrate is too much elevated for a guild with boost level <3"))
            }
            if (typeof options.user_limit !== "undefined") {
                if (options.user_limit === null) options.user_limit = 0
                if (typeof options.user_limit !== "number") return reject(new TypeError("The channel user limit must be a number"))
                if (options.user_limit < 0) return reject(new TypeError("The channel user limit must be more than 0 (or =0)"))
                if (options.user_limit > 99 && options.type !== 13) return reject(new TypeError("The channel user limit must be less than 99 (10000 for stage channel)"))
                else if (options.user_limit > 10000 && options.type === 13) return reject(new TypeError("The channel user limit must be less than 10000"))
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
                if (options.rtc_region !== null && typeof options.rtc_region !== "string") return reject(new TypeError("The channel rtc region must be a string"))
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
            this.client.rest.post(this.client._ENDPOINTS.SERVER_CHANNEL(this.id), options).then(channel => {
                if (channel.type === 0) channel = new TextChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                else if (channel.type === 2) channel = new VoiceChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                else if (channel.type === 5) channel = new AnnouncementChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(this.client, this.client.guilds.get(this.id) || this, channel)
                else if (channel.type === 13) channel = new StageChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                else if (channel.type === 15) channel = new ForumChannel(this.client, this.client.guilds.get(this.id) || this, channel)
                return resolve(channel)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async createScheduledEvent(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Options must be defined by a object"))
            if (typeof options.name !== "string") return reject(new TypeError("Options name must be a string"))
            options.privacy_level = 2
            if (typeof options.scheduled_start_time === "undefined") return reject(new TypeError("Options scheduled_start_time must be a number timestamp or a valid Date instance"))
            options.scheduled_start_time = !(options.scheduled_start_time instanceof Date) ? new Date(options.scheduled_start_time) : new Date(options.scheduled_start_time.getTime())
            if (typeof options.entity_type !== "number") return reject(new TypeError("Options entity type must be a number"))
            if (options.entity_type < 1 || options.entity_type > 3) return reject(new TypeError("Options invalid entity type"))
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
                if (options.entity_type !== 3) return reject(new TypeError("Options entity metadata must be null or undefined for non external event"))
                if (typeof options.entity_metadata !== "object") return reject(new TypeError("Options entity metadata must be a object"))
                if (typeof options.entity_metadata.location !== "string") return reject(new TypeError("Options entity metadata location must be a string"))
                if (options.entity_metadata.location.length < 1 || options.entity_metadata.location.length > 100) return reject(new TypeError("Options entity metadata location length must be between 1 and 100"))
            }
            if (typeof options.image !== "undefined") options.image = await DataResolver.resolveImage(options.image)
            if (options.reason === null) reason = undefined
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            if (options.entity_type === 3) options.channel_id = null
            else options.entity_metadata = null
            this.client.rest.post(this.client._ENDPOINTS.EVENT(this.id), options).then(res => {
                return resolve(new ScheduledEvent(this.client, this.client.guilds.get(this.id) || this, res))
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async getScheduledEvent(event) {
        return new Promise(async (resolve, reject) => {
            if (typeof event === "undefined") return reject(new TypeError("The event must be a valid Id or ScheduledEvent instance"))
            if (event instanceof ScheduledEvent) event = event.id
            if (typeof event !== "string") return reject(new TypeError("Event must be a valid Id or ScheduledEvent instance"))
            this.client.rest.get(this.client._ENDPOINTS.EVENT(this.id, event) + '?with_user_count=true').then(res => {
                return resolve(new ScheduledEvent(this.client, this.client.guilds.get(this.id) || this, res))
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async listScheduledEvent() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.EVENT(this.id) + '?with_user_count=true').then(res => {
                let collect = new Store()
                res.map(r => collect.set(r.id, new ScheduledEvent(this.client, this.client.guilds.get(this.id) || this, r)))
                return resolve(collect)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async getWelcomeScreen() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.WELCOME_SCREEN(this.id)).then(res => {
                let sendData = {
                    channels: res?.welcome_channels?.map(data => {
                        return {
                            emoji: (data.emoji_id || data.emoji_name) ? parseEmoji(data.emoji_id ? `<:${data.emoji_name}:${data.emoji_id}>` : `${data.emoji_name}`) : null,
                            channelId: data.channel_id || null,
                            channel: this.client.allChannels.get(data.channel_id) || null,
                            description: data.description || null
                        }
                    }) || null,
                    description: res.description || null
                }
                return resolve(sendData)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async setWelcomeScreen(options) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Options must be defined by a object"))
            if (options.enabled === null) options.enabled = undefined
            if (options.description === null) options.enabled = undefined
            if (options.channels === null) options.channels = undefined
            if (typeof options.enabled !== "undefined") {
                if (typeof options.enabled !== "boolean") return reject(new TypeError("The enabled propertie must be a boolean"))
            }
            if (typeof options.description !== "undefined") {
                if (typeof options.description !== "string") return reject(new TypeError("The description propertie must be a string"))
            }
            if (typeof options.channels !== "undefined") {
                if (typeof options.channels !== "object") return reject(new TypeError("The channels propertie must be a object"))
                options.channels.map(channel => {
                    if (typeof channel.channel !== "object" && channel.channel !== null && typeof channel.channel !== "undefined") return reject(new TypeError("The channel must be a channel object"))
                    else if(typeof channel.channelId === "undefined" || channel.channelId === null) channel.channelId = channel.channel?.id
                    if (typeof channel.channelId !== "string" && channel.channelId !== null) return reject(new TypeError("The channelId must be a string"))
                    if (typeof channel.description !== "string" && channel.description !== null) return reject(new TypeError("The description must be a string"))
                    if (typeof channel.emoji !== "undefined" && channel.emoji !== null) {
                        if (typeof channel.emoji === "string") channel.emoji = parseEmoji(channel.emoji)
                        if (typeof channel.emoji !== "object") return reject(new TypeError("The emoji is invalid"))
                    }
                })
            }
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.patch(this.client._ENDPOINTS.WELCOME_SCREEN(this.id), {
                enabled: options.enabled,
                description: options.description,
                welcome_channels: options.channels ? options.channels.map(channel => {
                    return {
                        channel_id: channel.channelId,
                        description: channel.description,
                        emoji: channel.emoji
                    }
                }) : undefined,
                reason: options.reason
            }).then(res => {
                let sendData = {
                    channels: res?.welcome_channels?.map(data => {
                        return {
                            emoji: (data.emoji_id || data.emoji_name) ? parseEmoji(data.emoji_id ? `<:${data.emoji_name}:${data.emoji_id}>` : `${data.emoji_name}`) : null,
                            channelId: data.channel_id || null,
                            channel: this.client.allChannels.get(data.channel_id) || null,
                            description: data.description || null
                        }
                    }) || null,
                    description: res.description || null
                }
                return resolve(sendData)
            }).catch(e => {
                return reject(e)
            })
        })
    }
}