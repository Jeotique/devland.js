const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const MessageEmbed = require('./MessageEmbed')
const Utils = require('../util')
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
     * @property {MessageEmbed[]} embeds
     * @property {boolean} tts
     * @property {string} nonce
     * @property {'roles'|'users'|'everyone'} allowedMentions
     * @property {object} components
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
                    return reject(e)
                })
            } else if (options instanceof MessageEmbed) {
                data['embeds'].push(options.pack())
                console.log(data)
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof options === 'object') {
                data['content'] = options['content']
                if(typeof options['embeds'] === 'object') options['embeds']?.map(embed_data => data['embeds'].push(embed_data.pack()))
                data['embeds'] = options['embeds']
                data['tts'] = options['tts']
                data['nonce'] = options['nonce']
                data['allowed_mentions'] = options['allowedMentions']
                data['components'] = options['components']
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else return reject("Send without any options is not authorized")
        })
    }
}