const { EventEmitter } = require('events')
const RESTHandler = require('../rest/RESTHandler')
const ws = require('ws')
const util = require('../util')
const Models = require('../models')
const { Store } = require('../util/Store/Store')
const { Message, Guild, TextChannel, User } = require('../models')
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
     * @property {boolean} messagesLifeTimeResetAfterEvents
     * @property {number} guildsLifeTime
     * @property {boolean} guildsLifeTimeResetAfterEvents
     * @property {number} channelsLifeTime
     * @property {boolean} channelsLifeTimeResetAfterEvents
     * @property {number} usersLifeTime
     * @property {boolean} usersLifeTimeResetAfterEvents
     * @property {number} channelsLifeTime
     * @property {boolean} channelsLifeTimeResetAfterEvents
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
            DM_CHANNEL: (channelID) => { return ME + '/channels'; },
            MEMBERS: (serverID, userID) => { return `${this._ENDPOINTS.SERVERS(serverID)}/members${userID ? '/' + userID : ''}`; },
            MEMBER_ROLES: (serverID, userID, roleID) => { return `${this._ENDPOINTS.MEMBERS(serverID, userID)}/roles${roleID ? '/' + roleID : ''}`; },
            USER_DM: (userId) => { return ME + '/' + userId },
            USER: (userID) => { return DiscordAPI + /users/ + userID; },
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
            BULD_DELETE: (channelID) => { return `${this._ENDPOINTS.CHANNEL(channelID)}/messages/bulk-delete`; },
            TYPING: (channelID) => { return `${this._ENDPOINTS.CHANNEL(channelID)}/typing`; },
            COMMANDS: (guildId, commandId) => { return `${this._ENDPOINTS.API}/applications/${this.user.id}/guilds/${guildId}/commands${commandId ? `/${commandId}` : ``}` },
        }

        this.token = options?.token
        this.readyAt = 0;
        this.guildsIds = [];
        this.ws = {
            /**
             * @type {ws}
             */
            socket: null,
            /**
             * @type {boolean}
             */
            connected: false,
            /**
             * @type {object}
             */
            gateway: {
                /**
             * @type {string}
             */
                url: null,
                /**
             * @type {number}
             */
                obtainedAt: null,
                /**
             * @type {object}
             */
                heartbeat: {
                    /**
             * @type {number}
             */
                    interval: null,
                    /**
             * @type {number}
             */
                    last: null,
                    /**
             * @type {boolean}
             */
                    recieved: false,
                    seq: null,
                }
            }
        }

        this.sessionID = null;
        /**
         * @type {clientOptions}
         */
        this.options = util.mergeDefault(util.createDefaultOptions(), options)
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
        if (this.options && this.options.connect == false) {
            return this;
        } else {
            return this.connect();
        }
    }

    static get version() { return '1.0.0' }
    /**
     * Connect your bot to the discord gateway
     * @param {string} token The discord bot token 
     */
    connect(token) {
        if (token && typeof token === 'string') this.token = token;
        const attemptLogin = require('../gateway/websocket');
        if (this.ws.connected) throw new Error(`The client is already connected to the gateway`);

        attemptLogin(this);
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
                let result = await this.rest.get(this._ENDPOINTS.SERVERS(i)).catch(e => { return reject(new Error(e)) })
                if (!result) return reject(new TypeError("One guild has not result"))
                let guild = new Guild(this, result)
                res.set(result.id, guild)
                if (typeof this.options.guildsLifeTime && this.options.guildsLifeTime > 0) {
                    guild.cachedAt = Date.now()
                    guild.expireAt = Date.now() + this.options.guildsLifeTime
                    this.guilds.set(guild.id, guild)
                }
                if (res.size === this.guildsIds.length) return resolve(res)
            }
            else for (let i of this.guildsIds.slice(0, max)) {
                let result = await this.rest.get(this._ENDPOINTS.SERVERS(i)).catch(e => { return reject(new Error(e)) })
                if (!result) return reject(new TypeError("One guild has not result"))
                let guild = new Guild(this, result)
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
            let result = await this.rest.get(this._ENDPOINTS.SERVERS(guildId)).catch(e => { reject(new Error(e)) })
            if (!result) return reject(new TypeError("Unknow guild"))
            let guild = new Guild(this, result)
            if (typeof this.options.guildsLifeTime && this.options.guildsLifeTime > 0) {
                guild.cachedAt = Date.now()
                guild.expireAt = Date.now() + this.options.guildsLifeTime
                this.guilds.set(guild.id, guild)
            }
            return resolve(guild)
        })
    }

}