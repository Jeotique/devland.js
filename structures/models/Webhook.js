const Client = require('../client/client')
const Guild = require('./Guild')
const User = require('./User')
const Utils = require('../util/index')
const TextChannel = require('./TextChannel')
const AnnouncementChannel = require('./AnnouncementChannel')
const ForumChannel = require('./ForumChannel')
module.exports = class Webhook {
    constructor(client, guild, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = guild?.id
        this.id = data.id
        this.type = data.type
        this.channel = client.textChannels.get(data.channel_id) || client.announcementChannels.get(data.channel_id) || null
        this.channelId = data.channel_id
        this.user = data.user ? client.users.get(data.user.id) || new User(client, data.user) : null
        this.name = data.name
        this.avatar = data.avatar
        this.token = data.token
        this.application_id = data.application_id
        this.source_guild = data.source_guild
        this.source_channel = data.source_channel
        this.url = data.url
        this.createdTimestamp = Utils.getTimestampFrom(data.id)
        this.createdAt = new Date(this.createdTimestamp)
    }

    async edit(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Edit webhook options must be a object"))
            if (typeof options.name !== "undefined" && typeof options.name !== "string") return reject(new TypeError("Edit webhook options name must be provided (string)"))
            if (typeof options.name === "string" && (options.name.length < 1 || options.name.length > 80)) return reject(new TypeError("Edit webhook options name must have a length between 1 and 80"))
            if (options.channel_id instanceof TextChannel) options.channel_id = options.channel_id.id
            if (options.channel_id instanceof AnnouncementChannel) options.channel_id = options.channel_id.id
            if (options.channel_id instanceof ForumChannel) options.channel_id = options.channel_id.id
            if (typeof options.channel_id !== "undefined" && typeof options.channel_id !== "string") return reject(new TypeError("Edit webhook options the channel must be a valid Channel instance or a valid Id"))
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS(this.id), options).then(res => {
                let newweb = new Webhook(this.client, this.client.guilds.get(this.guildId) || this.guild, res)
                resolve(newweb)
                Object.keys(newweb).map(k => this[k] = newweb[k])
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async delete(reason) {
        return new Promise(async (resolve, reject) => {
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.WEBHOOKS(this.id), {
                reason: reason
            }).then(() => {
                resolve()
            }).catch(e => {
                return reject(new Error(e))
            })
        })
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
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS(this.id) + '/' + this.token, data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this.channel, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS(this.id) + '/' + this.token, data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this.channel, messageData))
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
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS(this.id) + '/' + this.token, data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this.channel, messageData))
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
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS(this.id) + '/' + this.token, data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this.channel, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }
}