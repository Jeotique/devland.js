const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const Embed = require('./Embed')
const Utils = require('../util')
const ActionRow = require('./ActionRow')
module.exports = class TextChannel {
    /**
     * 
     * @param {Client} client 
     * @param {Guild} guild 
     * @param {*} data 
     */
    constructor(client, guild, data) {
        this.client = client
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
            } else if(options instanceof ActionRow) {
                data['components'].push(options.pack())
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if(toTestCustomId.length > 0) toTestCustomId.map(test => {
                    if(alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (typeof options === 'object') {
                data['content'] = options['content']
                if(typeof options['embeds'] === 'object') options['embeds']?.map(embed_data => data['embeds'].push(embed_data.pack()))
                data['embeds'] = options['embeds']
                data['tts'] = options['tts']
                data['nonce'] = options['nonce']
                data['allowed_mentions'] = options['allowedMentions']
                data['components'] = []
                options['components']?.map(comp => {
                    if(comp instanceof ActionRow) data['components'].push(comp.pack())
                    else return reject(new TypeError("Invalid component, must be a ActionRow instance"))
                })
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if(toTestCustomId.length > 0) toTestCustomId.map(test => {
                    if(alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
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
}