const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const Embed = require('./Embed')
const Utils = require('../util')
const ActionRow = require('./ActionRow')
const { default: Store } = require('../util/Store/Store')
const Permissions = require('../util/BitFieldManagement/Permissions')
const ForumTag = require('./ForumTag')
const User = require('./User')
module.exports = class DmChannel {
    /**
     * 
     * @param {Client} client
     * @param {*} data 
     */
    constructor(client, data) {
        /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
        Object.defineProperty(this, 'client', { value: client })

        this.id = data.id
        this.last_message_id = data.last_message_id
        this.type = data.type
        this.name = data.name
        this.flags = data.flags
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
        const User = require('./User')
        this.user = (data.user || data.recipients) ? data.recipients.length < 1 ? null : new User(client, data.recipients[0]) : null
        this.data_is_available = true
    }

    toString(){
        return `<#${this.id}>`
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
            if(typeof options !== "string" && typeof options !== "object") return reject(new TypeError("Invalid message payload"))
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
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else if (options instanceof ActionRow) {
                data['components'].push(options.pack())
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if (toTestCustomId.length > 0) toTestCustomId.filter(comp => comp.custom_id).map(test => {
                    if (alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof options === 'object') {
                data['content'] = options['content']
                if (Array.isArray(options['embeds'])) options['embeds']?.map(embed_data => data['embeds'].push((embed_data instanceof Embed) ? embed_data.pack() : new Embed(embed_data).pack()))
                data['tts'] = options['tts']
                data['nonce'] = options['nonce']
                data['allowed_mentions'] = options['allowedMentions']
                if (typeof data['allowed_mentions'] !== 'undefined') {
                    if (!Array.isArray(data['allowed_mentions'])) data['allowed_mentions'] = undefined
                    else {
                        data['allowed_mentions'] = { parse: [...options['allowedMentions']] }
                    }
                }
                data['components'] = []
                options['components']?.map(comp => {
                    if (comp instanceof ActionRow) data['components'].push(comp.pack())
                    else return reject(new TypeError("Invalid component, must be a ActionRow instance"))
                })
                data['files'] = await Utils.lookForFiles(options.files)
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if (toTestCustomId.length > 0) toTestCustomId.filter(comp => comp.custom_id).map(test => {
                    if (alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id), data).then(messageData => {
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.guild, this, messageData))
                }).catch(e => {
                    return reject(e)
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    async fetchMessages(options) {
        return new Promise(async (resolve, reject) => {
            if (options && typeof options === "string") {
                this.client.rest.get(this.client._ENDPOINTS.MESSAGES(this.id, options)).then(data => {
                    const Message = require('./Message')
                    let message = new Message(this.client, this.guild, this, data)
                    resolve(new Store().set(message.id, message))
                    if (typeof this.client.options.messagesLifeTime === "number" && this.client.options.messagesLifeTime > 0) {
                        message.cachedAt = Date.now()
                        message.expireAt = Date.now() + this.client.options.messagesLifeTime
                        this.client.messages.set(message.id, message)
                    }
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof options === "object") {
                if (options.limit && typeof options.limit !== "number") return reject(new TypeError("Limit must be a number"))
                if (options.limit && options.limit > 100) return reject(new TypeError("The limit can't be more than 100"))
                if (options.limit && options.limit < 1) return reject(new TypeError("The limit can't be less than 1"))
                if (typeof options.around !== "undefined" && typeof options.around !== "string") return reject(new TypeError("The around value must be a string (message Id)"))
                if (typeof options.before !== "undefined" && typeof options.before !== "string") return reject(new TypeError("The before value must be a string (message Id)"))
                if (typeof options.after !== "undefined" && typeof options.after !== "string") return reject(new TypeError("The after value must be a string (message Id)"))
                let used = 0
                if (options.around) used++
                if (options.before) used++
                if (options.after) used++
                if (used > 1) return reject(new TypeError("You can only use one filter (around | before | after)"))
                this.client.rest.get(`${this.client._ENDPOINTS.MESSAGES(this.id)}${options.limit ? `?limit=${options.limit}${options.around ? `&around=${options.around}` : `${options.before ? `&before=${options.before}` : `${options.after ? `&after=${options.after}` : ``}`}`}` : `${options.around ? `?around=${options.around}` : `${options.before ? `?before=${options.before}` : `${options.after ? `?after=${options.after}` : ``}`}`}`}`).then(data => {
                    let cache = new Store()
                    data.map(message_data => {
                        const Message = require('./Message')
                        let message = new Message(this.client, this.guild, this, message_data)
                        cache.set(message.id, message)
                        if (typeof this.client.options.messagesLifeTime === "number" && this.client.options.messagesLifeTime > 0) {
                            message.cachedAt = Date.now()
                            message.expireAt = Date.now() + this.client.options.messagesLifeTime
                            this.client.messages.set(message.id, message)
                        }
                    })
                    return resolve(cache)
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof options === "undefined") {
                this.client.rest.get(this.client._ENDPOINTS.MESSAGES(this.id)).then(data => {
                    let cache = new Store()
                    data.map(message_data => {
                        const Message = require('./Message')
                        let message = new Message(this.client, this.guild, this, message_data)
                        cache.set(message.id, message)
                        if (typeof this.client.options.messagesLifeTime === "number" && this.client.options.messagesLifeTime > 0) {
                            message.cachedAt = Date.now()
                            message.expireAt = Date.now() + this.client.options.messagesLifeTime
                            this.client.messages.set(message.id, message)
                        }
                    })
                    return resolve(cache)
                }).catch(e => {
                    return reject(e)
                })
            } else return reject(new TypeError("Invalid fetch messages options provided"))
        })
    }
    async bulkDelete(data) {
        return new Promise(async (resolve, reject) => {
            if (typeof data === "undefined") return reject(new TypeError("You must provide how many message you want to delete"))
            if (typeof data === "object") {
                let res = []
                data.map(d => {
                    if (d instanceof Message) {
                        res.push(d.id)
                    } else if (typeof d === "string") res.push(d)
                    else return reject(new TypeError("Unknow message"))
                })
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id) + "/bulk-delete", {
                    messages: res
                }).then(() => {
                    return resolve()
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof data === "number") {
                let res = []
                if (data < 2) return reject(new TypeError("The message count must be more than 1"))
                if (data > 100) return reject(new TypeError("The message count must be less than 100"))
                let all = await this.fetchMessages({ limit: data }).catch(e => {
                    return reject(e)
                })
                all.map(message => res.push(message.id))
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.id) + "/bulk-delete", {
                    messages: res
                }).then(() => {
                    return resolve()
                }).catch(e => {
                    return reject(e)
                })
            }
        })
    }

    async getPinnedMessages(){
        return new Promise(async(resolve, reject) => {
            this.client.rest.get(this.client._ENDPOINTS.CHANNEL(this.id)+'/pins').then(messages => {
                let collect = new Store()
                messages.map(msg => {
                    collect.set(msg.id, new Message(this.client, this.client.guilds.get(this.guildId)||this.guild, this.client.textChannels.get(this.id)||this,msg))
                })
                return resolve(collect)
            }).catch(e => {
                return reject(e)
              })
        })
    }

    createCollector(options = {}){
        if(typeof options !== "object") throw new TypeError("You must provide options for the collector")
        if(typeof options.count !== "undefined"){
            if(typeof options.count !== "number") throw new TypeError("The count must be a number")
        }
        if(typeof options.type !== "undefined"){
            if(typeof options.type !== "string") throw new TypeError("The type must be a string")
            options.type = options.type.toLowerCase()
            if(!["message", "component"].includes(options.type)) throw new TypeError("Invalid collector type (message or component)")
        }
        if(typeof options.time !== "undefined"){
            if(typeof options.time !== "number") throw new TypeError("The time must be a number")
        }
        if(typeof options.componentType !== "undefined"){
            if(typeof options.componentType !== "number") throw new TypeError("The componentType must be a number")
            if(options.componentType < 1 || options.componentType > 8) throw new TypeError("Invalid componentType for the collector")
        }
        if(typeof options.filter !== "undefined"){
            if(typeof options.filter !== "function") throw new TypeError("The filter must be a filter function for the collector, example : 'filter: (collected) => collected.author.id === message.author.id'")
        }
        let identifier = Date.now()
        this.client.collectorCache[identifier] = new Collector(this.client, this.client.guilds.get(this.guildId)||this.guild, null, this.channel, options)
        this.client.collectorCache[identifier]?.on('end', () => {
            delete this.client.collectorCache[identifier]
        })
        return this.client.collectorCache[identifier]    
    }

    awaitMessages(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") throw new TypeError("You must provide options for the collector")
            if (typeof options.count !== "undefined") {
                if (typeof options.count !== "number") throw new TypeError("The count must be a number")
            }
            options.type = "await_message"
            if (typeof options.time !== "undefined") {
                if (typeof options.time !== "number") throw new TypeError("The time must be a number")
            }
            if (typeof options.componentType !== "undefined") {
                if (typeof options.componentType !== "number") throw new TypeError("The componentType must be a number")
                if (options.componentType < 1 || options.componentType > 8) throw new TypeError("Invalid componentType for the collector")
            }
            if (typeof options.filter !== "undefined") {
                if (typeof options.filter !== "function") throw new TypeError("The filter must be a filter function for the collector, example : 'filter: (collected) => collected.author.id === message.author.id'")
            }
            let identifier = Date.now()
            this.client.collectorCache[identifier] = new Collector(this.client, this.client.guilds.get(this.guildId) || this.guild, null, this, options)
            this.client.collectorCache[identifier]?.on('end', () => {
                delete this.client.collectorCache[identifier]
            })
            this.client.collectorCache[identifier]?.on('collected', collected => {
                resolve(collected)
                delete this.client.collectorCache[identifier]
            })
        })
    }

    async startTyping() {
        return new Promise(async (resolve, reject) => {
            this.client.rest.post(this.client._ENDPOINTS.TYPING(this.id)).then(() => {
                resolve()
            }).catch(e => {
                return reject(e)
            })
        })
    }
}