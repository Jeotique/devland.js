const Client = require('../client/client')
const Guild = require('./Guild')
const TextChannel = require('./TextChannel')
const Utils = require('../util/index')
const { Store } = require('../util/Store/Store')
const Attachment = require('./Attachment')
const MessageEmbed = require('./MessageEmbed')
const User = require('./User')
module.exports = class Message {
    /**
     * 
     * @param {Client} client 
     * @param {Guild} guild 
     * @param {TextChannel} channel 
     */
    constructor(client, guild, channel, data) {
        this.client = client
        this.guild = guild
        this.channel = channel

        this.id = data.id
        this.type = data.type
        this.content = data.content
        this.channelId = data.channel_id
        /**
         * @type {Store<String, Attachment>}
         */
        this.attachments = new Store()
        /**
         * @type {MessageEmbed[]}
         */
        this.embeds = []
        this.mentions = [...data.mentions, ...data.mention_roles]
        this.pinned = data.pinned
        this.mentionEveryone = data.mention_everyone
        this.tts = data.tts
        this.createdTimestamp = Utils.getTimestampFrom(data.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.guildId = this.guild.id
        this.editTimestamp = data.edited_timestamp
        this.flags = data.flags
        this.components = data.components
        this.messageReplyied = data.referenced_message ? new Message(this.client, this.guild, this.channel, data.referenced_message) : null
        this.deleted = false
        this.webhookId = data.webhook_id
        this.author = this.webhookId ? null : new User(this.client, data.author)

        data.attachments.map(attach => this.attachments.set(attach.id, new Attachment(this.client, this, attach)))
        data.embeds.map(embed => this.embeds.push(new MessageEmbed(embed)))
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
     * Edit the current message
     * @param {MessageOptions|string} options 
     * @returns {Promise<Message>}
     */
    async edit(options) {
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
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else if (options instanceof MessageEmbed) {
                data['embeds'].push(options.pack())
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof options === 'object') {
                data['content'] = options['content']
                if (typeof options['embeds'] === 'object') options['embeds']?.map(embed_data => data['embeds'].push(embed_data.pack()))
                data['embeds'] = options['embeds']
                data['tts'] = options['tts']
                data['nonce'] = options['nonce']
                data['allowed_mentions'] = options['allowedMentions']
                data['components'] = options['components']
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else return reject("Send without any options is not authorized")
        })
    }
    /**
     * Delete the message
     * @param {number} delay Delay in ms before deleting the message  
     * @returns {Promise<Message>}
     */
    async delete(delay) {
        return new Promise(async (resolve, reject) => {
            if (typeof delay !== 'number') delay = 0
            setTimeout(() => {
                this.client.rest.delete(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id)).then(() => {
                    this.deleted = true
                    return resolve(this)
                }).catch(e => {
                    return reject(e)
                })
            }, delay)
        })
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
     * Reply to the current message
     * @param {MessageOptions|string} options 
     * @returns {Promise<Message>}
     */
    async reply(options) {
        return new Promise(async (resolve, reject) => {
            let data = {
                content: undefined,
                embeds: [],
                tts: false,
                nonce: undefined,
                allowed_mentions: undefined,
                components: [],
                message_reference: {
                    channel_id: this.channelId,
                    guild_id: this.guildId,
                    message_id: this.id,
                    fail_if_not_exists: false
                }
            }
            if (typeof options === 'string') {
                data['content'] = options
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else if (options instanceof MessageEmbed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof options === 'object') {
                data['content'] = options['content']
                if (typeof options['embeds'] === 'object') options['embeds']?.map(embed_data => data['embeds'].push(embed_data.pack()))
                data['embeds'] = options['embeds']
                data['tts'] = options['tts']
                data['nonce'] = options['nonce']
                data['allowed_mentions'] = options['allowedMentions']
                data['components'] = options['components']
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else return reject("Send without any options is not authorized")
        })
    }
    
}