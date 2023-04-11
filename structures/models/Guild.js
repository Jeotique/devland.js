const Utils = require('../util')
const Client = require('../client/client')
const TextChannel = require('./TextChannel')
const GuildCommand = require('./GuildCommand')
const { Store } = require('../util/Store/Store')
const Emoji = require('./Emoji')
const User = require('./User')
const VoiceChannel = require('./VoiceChannel')
const CategoryChannel = require('./CategoryChannel')
const AnnouncementChannel = require('./AnnouncementChannel')
const StageChannel = require('./StageChannel')
const ForumChannel = require('./ForumChannel')
const Member = require('./Member')
const Role = require('./Role')
const Permissions = require('../util/Permissions/Permissions')
const Constants = require('../util/Constants')
const AuditLogs = require('./AuditLogs')
const Ban = require('./Ban')
const Invite = require('./Invite')
const Integration = require('./Integration')

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
        this.members = new Store()
        this.roles = new Store()
        this.invites = new Store()
        this.data_is_available = true

        if(this.icon) {
            this.icon = `https://cdn.discordapp.com/icons/${this.id}/${this.icon}${this.icon.startsWith('a_') ? '.gif' : '.png'}?size=512`
        }
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
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.textChannels.set(channel.id, channel)
                    })
                }
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
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.voiceChannels.set(channel.id, channel)
                    })
                }
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
                resolve(collect)
                if (typeof this.client.options.channelsLifeTime === "number" && this.client.options.channelsLifeTime > 0) {
                    collect.map(channel => {
                        channel.cachedAt = Date.now()
                        channel.expireAt = Date.now() + this.client.options.channelsLifeTime
                        this.client.categoryChannels.set(channel.id, channel)
                    })
                }
            }).catch(e => {
                return reject(new Error(e))
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
                return reject(new Error(e))
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
                return reject(new Error(e))
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
                return reject(new Error(e))
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
                return reject(new Error(e))
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
                return reject(new Error(e))
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
                if (options.permissions instanceof Permissions) options.permissions = options.permissions.bitfield.toString()
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
                if (options.unicode_emoji instanceof Emoji) {
                    options.unicode_emoji = options.unicode_emoji.pack()
                    options.unicode_emoji = options.unicode_emoji.id ? `${options.unicode_emoji.name}` : `<${options.unicode_emoji.animated ? "a" : ""}:${options.unicode_emoji.name}:${options.unicode_emoji.id}>`
                }
                if (typeof options.unicode_emoji !== "string") return reject(new TypeError("Create role options unicode_emoji must be a string"))
            }
            if (typeof options.mentionable !== "undefined") {
                if (typeof options.mentionable !== "boolean") return reject(new TypeError("Create role options mentionable must be a boolean"))
            }
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.post(this.client._ENDPOINTS.ROLES(this.id), options).then(res => {
                let role = new Role(this.client, this.client.guilds.get(this.id) || this, res)
                resolve(role)
                if (typeof this.client.options.rolesLifeTime === "number" && this.client.options.rolesLifeTime > 0) {
                    role.cachedAt = Date.now()
                    role.expireAt = Date.now() + this.client.options.rolesLifeTime
                    this.roles.set(role.id, role)
                }
            }).catch(e => {
                return reject(new Error(e))
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
                auditResult.guild = this
                let audit = new AuditLogs(this.client, auditResult)
                return resolve(audit)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async leave() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.delete(this.client._ENDPOINTS.SERVERS(this.id)).then(() => {
                resolve()
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async kickMember(user, reason) {
        return new Promise(async (resolve, reject) => {
            if (user instanceof User) user = user.id
            if (user instanceof Member) user = user.id
            if (typeof user !== "string") return reject(new TypeError("The user must be a valid User or Member instance or a valid Id"))
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
                return reject(new Error(e))
            })
        })
    }

    async banMember(user, delete_message_seconds, reason) {
        return new Promise(async (resolve, reject) => {
            if (user instanceof User) user = user.id
            if (user instanceof Member) user = user.id
            if (typeof user !== "string") return reject(new TypeError("The user must be a valid User or Member instance or a valid Id"))
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            let member = this.members.get(user) || null
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
                return reject(new Error(e))
            })
        })
    }

    async unbanMember(user, reason) {
        return new Promise(async (resolve, reject) => {
            if (user instanceof User) user = user.id
            if (user instanceof Member) user = user.id
            if (typeof user !== "string") return reject(new TypeError("The user must be a valid User or Member instance or a valid Id"))
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.BANS(this.id, user), {
                reason: reason
            }).then(() => {
                resolve(true)
            }).catch(e => {
                return reject(new Error(e))
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
                return reject(new Error(e))
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
                return reject(new Error(e))
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
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.post(this.client._ENDPOINTS.PRUNE(this.id), options).then(() => {
                return resolve(this)
            }).catch(e => {
                return reject(new Error(e))
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
                return reject(new Error(e))
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
                return reject(new Error(e))
            })
        })
    }

    async fetchIntegrations(){
        return new Promise(async(resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.INTEGRATIONS(this.id)).then(res => {
                let collect = new Store()
                res.map(i => collect.set(i.id, new Integration(this.client, this.client.guilds.get(this.id)||this, i)))
                resolve(collect)
            }).catch(e=>{
                return reject(new Error(e))
            })
        })
    }
}