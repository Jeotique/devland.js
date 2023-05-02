const { EventEmitter } = require('events')
const RESTHandler = require('../rest/RESTHandler')
const ws = require('ws')
const util = require('../util')
const Models = require('../models')
const { Store } = require('../util/Store/Store')
const { Message, Guild, TextChannel, User, VoiceChannel, CategoryChannel, AnnouncementChannel, StageChannel, DmChannel, GuildCommand } = require('../models')
const Thread = require('../models/Thread')
const ForumChannel = require('../models/ForumChannel')
const IntentFlags = require('../util/BitFieldManagement/IntentFlags')
const ShardClientUtil = require('../sharding/ShardClientUtil')
const webSocket = require('../gateway/webSocket')
/**
 * @extends {EventEmitter}
 */
module.exports = class Client extends EventEmitter {
    /**
     * @typedef {object} propertiesOptions
     * @property {string|NODEJS.platform} $os
     * @property {string} $browser
     * @property {string} $device
     */
    /**
     * @typedef {object} wsOptions
     * @property {number} large_threshold
     * @property {boolean} compress
     * @property {propertiesOptions} properties
     * @property {number} version
     */
    /**
     * @typedef {object} clientOptions
     * @property {boolean} connect
     * @property {number} intents
     * @property {wsOptions} ws
     * @property {presenceOptions} presence
     * @property {string} token
     * @property {number} messagesLifeTime
     * @property {number} guildsLifeTime
     * @property {number} channelsLifeTime
     * @property {number} usersLifeTime
     * @property {number} channelsLifeTime
     * @property {number} threadsLifeTime
     * @property {number} membersLifeTime
     * @property {number} rolesLifeTime
     * @property {number} invitesLifeTime
     * @property {number} presencesLifeTime
     * @property {number} voicesLifeTime
     * @property {boolean} waitCacheBeforeReady
     * @property {number} shardId
     * @property {number} shardCount
     * @property {number} connectionTimeout
     * @property {number} maxReconnectAttempts
     * @property {number} maxResumeAttempts
     * @property {boolean} invalidCommandValueReturnNull
     * @property {boolean} fetchAllMembers
     * @property {boolean} checkForUpdate
     */
    /**
     * The client options
     * @param {clientOptions} options 
     * @returns 
     */
    constructor(options = {}) {
        super();
        this.ready = false;
        /**
         * @private
         */
        let DiscordAPI = 'https://discord.com/api/v10';
        /**
         * @private
         */
        let DiscordCDN = 'https://cdn.discordapp.com';
        /**
         * @private
         */
        let ME = DiscordAPI + '/users/@me';
        /**
         * @private
         */
        this._ENDPOINTS = {
            API: DiscordAPI,
            CDN: DiscordCDN,
            ME: ME,
            LOGIN: DiscordAPI + '/auth/login',
            OAUTH: DiscordAPI + '/oauth2/applications/@me',
            GATEWAY: DiscordAPI + '/gateway',
            SETTINGS: ME + '/settings',
            NOTE: (userID) => { return ME + '/notes/' + userID; },
            SERVERS: (serverID) => { return `${DiscordAPI}/guilds${serverID ? '/' + serverID : ''}`; },
            SERVERS_USER: (serverID) => { return `${this._ENDPOINTS.ME()}/guilds${serverID ? '/' + serverID : ''}`; },
            SERVER_EMOJIS: (serverID, emojiID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/emojis${emojiID ? '/' + emojiID : ''}`; },
            CHANNEL: (channelID) => { return DiscordAPI + '/channels/' + channelID; },
            DM_CHANNEL: () => { return ME + '/channels'; },
            MEMBERS: (serverID, userID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/members${userID ? '/' + userID : ''}`; },
            MEMBER_ROLES: (serverID, userID, roleID) => { return `${this._ENDPOINTS.MEMBERS(serverID, userID)}/roles${roleID ? '/' + roleID : ''}`; },
            USER_DM: (userId) => { return ME + '/' + userId },
            USER: (userID) => { return DiscordAPI + '/users/' + userID; },
            ROLES: (serverID, roleID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/roles${roleID ? '/' + roleID : ''}`; },
            BANS: (serverID, userID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/bans${userID ? '/' + userID : ''}`; },
            MESSAGES: (channelID, messageID) => { return `${this._ENDPOINTS.CHANNEL(channelID)}/messages${messageID ? '/' + messageID : ''}`; },
            DM_MESSAGES: (userID, messageID) => { return `${this._ENDPOINTS.DM_CHANNEL(userID)}/messages${messageID ? '/' + messageID : ''}` },
            PINNED_MESSAGES: (channelID, messageID) => { return `${this._ENDPOINTS.CHANNEL(channelID)}/pins${messageID ? '/' + messageID : ''}`; },
            MESSAGE_REACTIONS: (channelID, messageID, reaction) => { return `${this._ENDPOINTS.MESSAGES(channelID, messageID)}/reactions${reaction ? '/' + reaction : ''}`; },
            USER_REACTIONS: (channelID, messageID, reaction, userID) => { return `${this._ENDPOINTS.MESSAGE_REACTIONS(channelID, messageID, reaction)}/${!userID || userID === this.id ? '@me' : userID}`; },
            INVITES: (inviteCode) => { return DiscordAPI + '/invite' + inviteCode; },
            SERVER_WEBHOOKS: (serverID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/webhooks`; },
            CHANNEL_WEBHOOKS: (channelID) => { return `${this._ENDPOINTS.CHANNEL(channelID)}/webhooks`; },
            WEBHOOKS: (webhookID) => { return DiscordAPI + '/webhooks/' + webhookID; },
            WEBHOOKS_TOKEN: (webhookID, webhookToken) => { return DiscordAPI + '/webhooks/' + webhookID + '/' + webhookToken; },
            WEBHOOKS_MESSAGE: (webhookID, webhookToken, messageID) => { return DiscordAPI + '/webhooks/' + webhookID + '/' + webhookToken + '/messages/' + messageID; },
            BULD_DELETE: (channelID) => { return `${this._ENDPOINTS.CHANNEL(channelID)}/messages/bulk-delete`; },
            TYPING: (channelID) => { return `${this._ENDPOINTS.CHANNEL(channelID)}/typing`; },
            COMMANDS: (guildId, commandId) => { return `${this._ENDPOINTS.API}/applications/${this.user.id}/guilds/${guildId}/commands${commandId ? `/${commandId}` : ``}` },
            GLOBAL_COMMANDS: (commandId) => { return `${this._ENDPOINTS.API}/applications/${this.user.id}/commands${commandId ? `/${commandId}` : ``}` },
            SERVER_CHANNEL: (serverID, channelID) => { return `${DiscordAPI}/guilds/${serverID}/channels${channelID ? `/${channelID}` : ``}`; },
            REACTIONS: (channelID, messageID, emoji, user) => { return `${this._ENDPOINTS.CHANNEL(channelID)}/messages/${messageID}/reactions${emoji ? `/${emoji}${user ? `/${user}` : ``}` : ``}`; },
            EMOJI: (guildID, emoji) => { return `${this._ENDPOINTS.SERVERS(guildID)}/emojis${emoji ? `/${emoji}` : ``}` },
            THREAD_MEMBER: (channelID, user) => { return DiscordAPI + '/channels/' + channelID + 'thread-members' + user ? '/' + user : ''; },
            STAGE: () => { return `${DiscordAPI}/stage-instances`; },
            PRUNE: (serverID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/prune`; },
            SERVER_INVITES: (serverID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/invites`; },
            INTEGRATIONS: (serverID, integrationID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/integrations${integrationID ? `/${integrationID}` : ``}`; },
            INTERACTIONS: (interactionID, interactionToken) => { return DiscordAPI + '/interactions/' + interactionID + '/' + interactionToken + '/callback'; },
            INTERACTIONS_MESSAGE: (interactionID, interactionToken) => { return DiscordAPI + '/interactions/' + interactionID + '/' + interactionToken; },
            AUTOMOD: (serverID, ruleID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/auto-moderations/rules${ruleID ? `/${ruleID}` : ``}`; },
            EVENT: (serverID, eventID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/scheduled-events${eventID ? `/${eventID}` : ``}`; },
        }

        this.token = options?.token
        this.readyAt = 0;
        this.guildsIds = [];
        this.ws = new webSocket(this)

        // don't use !
        this.seq = -1
        // don't use !
        this.heartbeat = null
        // don't use !
        this.sessionID = null;
        /**
         * @type {clientOptions}
         */
        this.options = util.mergeDefault(util.createDefaultOptions(), options)
        if (this.options.membersLifeTime > 0 && !this.options.guildsLifeTime) {
            this.options.membersLifeTime = null
            process.emitWarning("The guilds cache must be enabled if you want to use the members cache")
        }
        if (this.options.rolesLifeTime > 0 && !this.options.guildsLifeTime) {
            this.options.rolesLifeTime = null
            process.emitWarning("The guilds cache must be enabled if you want to use the roles cache")
        }
        if (this.options.invitesLifeTime > 0 && !this.options.guildsLifeTime) {
            this.options.invitesLifeTime = null
            process.emitWarning("The guilds cache must be enabled if you want to use the invites cache")
        }
        if (this.options.presencesLifeTime > 0 && !this.options.presencesLifeTime) {
            this.options.presencesLifeTime = null
            process.emitWarning("The guilds cache must be enabled if you want to use the presences cache")
        }
        if (this.options.voicesLifeTime > 0 && !this.options.voicesLifeTime) {
            this.options.voicesLifeTime = null
            process.emitWarning("The guilds cache must be enabled if you want to use the voices cache")
        }

        if (!this.options.shardId && 'SHARD_ID' in process.env) {
            this.options.shardId = Number(process.env.SHARD_ID)
        }
        if (!this.options.shardCount && 'SHARD_COUNT' in process.env) {
            this.options.shardCount = Number(process.env.SHARD_COUNT)
        }
        if (typeof this.options.shardId !== "number" || isNaN(this.options.shardId)) throw new TypeError("shardId must be a number")
        if (typeof this.options.shardCount !== "number" || isNaN(this.options.shardCount)) throw new TypeError("shardCount must be a number")
        if (this.options.shardId < 0) throw new RangeError("shardId can't be less than 0")
        if (this.options.shardCount < 0) throw new RangeError("shardCount can't be less than 0")
        if (this.options.shardId !== 0 && this.options.shardId >= this.options.shardCount) throw new RangeError("shardId must be less than shardCount")
        this.shard = process.env.SHARDING_MANAGER ? ShardClientUtil.singleton(this) : null

        this.rest = new RESTHandler(this)
        this.user = new Models.ClientUser(this)
        /**
         * @type {Store<String, Message>}
         */
        this.messages = new Store()
        /**
         * @type {Store<String, Guild>}
         */
        this.guilds = new Store()
        /**
         * @type {Store<String, TextChannel>}
         */
        this.textChannels = new Store()
        /**
         * @type {Store<String, VoiceChannel>}
         */
        this.voiceChannels = new Store()
        /**
         * @type {Store<String, CategoryChannel>}
         */
        this.categoryChannels = new Store()
        /**
         * @type {Store<String, AnnouncementChannel>}
         */
        this.announcementChannels = new Store()
        /**
         * @type {Store<String, Thread>}
         */
        this.threadChannels = new Store()
        /**
         * @type {Store<String, User>}
         */
        this.users = new Store()
        /**
         * @type {Store<String, StageChannel>}
         */
        this.stageChannels = new Store()
        /**
         * @type {Store<String, ForumChannel>}
         */
        this.forumChannels = new Store()
        /**
         * @private
         * @type {Store<String, DmChannel>}
         */
        this.dmChannels = new Store()
        /**
         * @private
         */
        this.collectorCache = {}
        /**
         * @private
         */
        this.deletedmessages = new Store()

        this.lastHeartbeatAcked = true
        if (this.options.checkForUpdate) {
            util.checkUpdate()
        }
        if (this.options && this.options.connect == false) {
            return this;
        } else {
            return this.connect();
        }
    }

    get uptime() {
        return this.readyAt ? Date.now() - this.readyAt : 0
    }

    static get version() { return require('../../package.json').version }

    get allChannels() {
        let collect = new Store()
        this.textChannels.map(c => collect.set(c.id, c))
        this.categoryChannels.map(c => collect.set(c.id, c))
        this.voiceChannels.map(c => collect.set(c.id, c))
        this.announcementChannels.map(c => collect.set(c.id, c))
        this.threadChannels.map(c => collect.set(c.id, c))
        this.stageChannels.map(c => collect.set(c.id, c))
        this.forumChannels.map(c => collect.set(c.id, c))
        this.dmChannels.map(c => collect.set(c.id, c))
        return collect
    }

    /**
     * Connect your bot to the discord gateway
     * @param {string} token The discord bot token 
     */
    connect(token) {
        this.emit('debug', `Connect attempt started`)
        if (token && typeof token === 'string') this.token = token;
        if (Array.isArray(this.options.intents)) this.options.intents = parseInt(new IntentFlags(this.options.intents).bitfield)
        if (this.options.fetchAllMembers && !(new IntentFlags(BigInt(this.options.intents)).has(IntentFlags.FLAGS.GUILD_MEMBERS))) throw new TypeError("You cannot use 'fetchAllMembers' if your bot is not using 'GUILD_MEMBERS' intent")
        this.emit('debug', `Trying to attempt login`)
        this.ws._token = this.token
        this.ws.connect()
        return this
    }

    destroy(reopen = false) {
        this.emit('debug', reopen ? `Reopening a new session after a request` : `Destroying the current session`)
        if (!reopen) this.readyAt = 0
        if (!reopen) this.ready = false
        this.ws.disconnect({
            reconnect: reopen ? "auto" : false
        })
        return this
    }

    toJSON() {
        return JSON.stringify(this)
    }

    /**
     * Fetch and returns guilds data 
     * @param {number} max The max guilds count to fetch
     * @returns {Promise<Store<String, Guild>>}
     */
    async fetchGuilds(max) {
        return new Promise(async (resolve, reject) => {
            /**
             * @type {Store<String, Guild>}
             */
            let res = new Store()
            if (!max) for (let i of this.guildsIds) {
                let result = await this.rest.get(this._ENDPOINTS.SERVERS(i)).catch(e => { return reject(e) })
                if (!result) return reject(new TypeError("One guild has not result"))
                let oldGuild = this.guilds.get(i)
                let guild = new Guild(this, result)
                if (oldGuild) guild.members = oldGuild.members
                res.set(result.id, guild)
                if (typeof this.options.guildsLifeTime && this.options.guildsLifeTime > 0) {
                    guild.cachedAt = Date.now()
                    guild.expireAt = Date.now() + this.options.guildsLifeTime
                    this.guilds.set(guild.id, guild)
                }
                if (res.size === this.guildsIds.length) return resolve(res)
            }
            else for (let i of this.guildsIds.slice(0, max)) {
                let result = await this.rest.get(this._ENDPOINTS.SERVERS(i)).catch(e => { return reject(e) })
                if (!result) return reject(new TypeError("One guild has not result"))
                let oldGuild = this.guilds.get(i)
                let guild = new Guild(this, result)
                if (oldGuild) guild.members = oldGuild.members
                res.set(result.id, guild)
                if (typeof this.options.guildsLifeTime && this.options.guildsLifeTime > 0) {
                    guild.cachedAt = Date.now()
                    guild.expireAt = Date.now() + this.options.guildsLifeTime
                    this.guilds.set(guild.id, guild)
                }
                if (res.size === this.guildsIds.length) return resolve(res)
            }
        })
    }
    /**
     * Fetch and return guild data
     * @param {string|Guild} guildId The guild id to fetch 
     * @returns {Promise<Guild>}
     */
    async fetchGuild(guildId) {
        return new Promise(async (resolve, reject) => {
            if (guildId instanceof Guild) guildId = guildId?.id
            if (typeof guildId !== "string") return reject(new TypeError("guildId must be a string or a valid guild reference"))
            let result = await this.rest.get(this._ENDPOINTS.SERVERS(guildId)).catch(e => { reject(e) })
            if (!result) return reject(new TypeError("Unknow guild"))
            let oldGuild = this.guilds.get(guildId)
            let guild = new Guild(this, result)
            if (oldGuild) guild.members = oldGuild.members
            if (typeof this.options.guildsLifeTime && this.options.guildsLifeTime > 0) {
                guild.cachedAt = Date.now()
                guild.expireAt = Date.now() + this.options.guildsLifeTime
                this.guilds.set(guild.id, guild)
            }
            return resolve(guild)
        })
    }

    async fetchUser(userId) {
        return new Promise(async (resolve, reject) => {
            if (userId instanceof User) userId = userId?.id
            if (typeof userId !== "string") return reject(new TypeError("userId must be a User instance or User Id"))
            let result = await this.rest.get(this._ENDPOINTS.USER(userId)).catch(e => { reject(e) })
            if (!result) return reject(new TypeError("Unknow user"))
            let user = new User(this, result)
            if (typeof this.options.usersLifeTime && this.options.usersLifeTime > 0) {
                user.cachedAt = Date.now()
                user.expireAt = Date.now() + this.options.usersLifeTime
                this.users.set(user.id, user)
            }
            return resolve(user)
        })
    }

    async getCommands() {
        return new Promise(async (resolve, reject) => {
            this.rest.get(this._ENDPOINTS.GLOBAL_COMMANDS()).then(res => {
                if (res.length < 1) return resolve([])
                else {
                    let data = []
                    res.map(com => data.push(new GuildCommand(com)))
                    return resolve(data)
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
                this.rest.delete(this._ENDPOINTS.COMMANDS(this.id, command.id)).then(() => {
                    return resolve(true)
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof command === "object") {
                if (!command?.id) return reject(new TypeError("Invalid command provided, if you are using a custom object you need to provide the \"<command>.id\""))
                this.rest.delete(this._ENDPOINTS.GLOBAL_COMMANDS(command.id)).then(() => {
                    return resolve(true)
                }).catch(e => {
                    return reject(e)
                })
            } else return reject(new TypeError("Invalid command provided"))
        })
    }

    async setCommands(...commands) {
        return new Promise(async (resolve, reject) => {
            if (!commands || (!(commands instanceof Store) && commands?.length < 1) || (commands instanceof Store && commands?.size < 1)) return reject(new TypeError("No command provided"))
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
                this.rest.put(this._ENDPOINTS.GLOBAL_COMMANDS(), body).then(() => {
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
                this.rest.put(this._ENDPOINTS.GLOBAL_COMMANDS(), all).then(() => {
                    return resolve(true)
                }).catch(e => {
                    return reject(e)
                })
            }
        })
    }

    async fetchChannel(channel) {
        return new Promise(async (resolve, reject) => {
            if (channel instanceof VoiceChannel || channel instanceof TextChannel || channel instanceof CategoryChannel || channel instanceof AnnouncementChannel || channel instanceof StageChannel || channel instanceof ForumChannel || channel instanceof Thread) channel = channel.id
            if (typeof channel !== "string") return reject(new TypeError("The channel must be a valid channel instance or a valid Id"))
            this.rest.get(this._ENDPOINTS.CHANNEL(channel)).then(async channel => {
                if (channel.type !== 1) {
                    let guild = this.guilds.get(channel.guild_id) || await this.rest.get(this._ENDPOINTS.SERVERS(channel.guild_id)).catch(e => { })
                    if (guild && !(guild instanceof Guild)) guild = new Guild(this, guild)
                    if (channel.type === 0) channel = new TextChannel(this, guild, channel)
                    else if (channel.type === 2) channel = new VoiceChannel(this, guild, channel)
                    else if (channel.type === 5) channel = new AnnouncementChannel(this, guild, channel)
                    else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(this, guild, channel)
                    else if (channel.type === 13) channel = new StageChannel(this, guild, channel)
                    else if (channel.type === 15) channel = new ForumChannel(this, guild, channel)
                    return resolve(channel)
                } else {
                    channel = new DmChannel(this, channel)
                    return resolve(channel)
                }
            }).catch(e => {
                return reject(e)
            })
        })
    }

}