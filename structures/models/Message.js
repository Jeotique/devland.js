const Client = require('../client/client')
const Guild = require('./Guild')
const TextChannel = require('./TextChannel')
const Utils = require('../util/index')
const { Store } = require('../util/Store/Store')
const Attachment = require('./Attachment')
const Embed = require('./Embed')
const User = require('./User')
const ActionRow = require('./ActionRow')
const StringSelect = require('./StringSelect')
const Button = require('./Button')
const RoleSelect = require('./RoleSelect')
const UserSelect = require('./UserSelect')
const MentionableSelect = require('./MentionableSelect')
const ChannelSelect = require('./ChannelSelect')
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
         * @type {Embed[]}
         */
        this.embeds = []
        this.mentions = [...data.mentions, ...data.mention_roles]
        this.pinned = data.pinned
        this.mentionEveryone = data.mention_everyone
        this.tts = data.tts
        this.createdTimestamp = Utils.getTimestampFrom(data.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.guildId = this.guild.id
        this.editTimestamp = new Date(data.edited_timestamp)
        this.flags = data.flags
        this.components = []
        this.messageReplyied = data.referenced_message ? new Message(this.client, this.guild, this.channel, data.referenced_message) : null
        this.deleted = false
        this.webhookId = data.webhook_id
        this.author = this.webhookId ? null : new User(this.client, data.author)
        this.data_is_available = true

        data.attachments.map(attach => this.attachments.set(attach.id, new Attachment(this.client, this, attach)))
        data.embeds.map(embed => this.embeds.push(new Embed(embed)))
        data.components.map(component => {
            this.components.push(new ActionRow(...component.components.map(op => {
                switch(op.type){
                    case 2: op = new Button(op); break;
                    case 3: op = new StringSelect(op); break;
                    case 6: op = new RoleSelect(op); break;
                    case 5: op = new UserSelect(op); break;
                    case 7: op = new MentionableSelect(op); break;
                    case 8: op = new ChannelSelect(op); break;
                }
                return op
            })))
        })
    }
    /**
         * @typedef {object} MessageOptions
         * @property {string} content
         * @property {Embed[]} embeds
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
                components: this.components
            }
            if (typeof options === 'string') {
                data['content'] = options
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
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
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
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
                if(options['components'] && options['components']?.length > 0) options['components']?.map(comp => {
                    if(comp instanceof ActionRow) data['components'].push(comp.pack())
                    else return reject(new TypeError("Invalid component, must be a ActionRow instance"))
                })
                else data['components'] = this.components
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if(toTestCustomId.length > 0) toTestCustomId.map(test => {
                    if(alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
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
                    return reject(new Error(e))
                })
            }, delay)
        })
    }
    /**
         * @typedef {object} MessageOptions
         * @property {string} content
         * @property {Embed[]} embeds
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
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
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
                if (typeof options['embeds'] === 'object') options['embeds']?.map(embed_data => data['embeds'].push(embed_data.pack()))
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
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }
    
}