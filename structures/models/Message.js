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
const Collector = require('./Collector')
const Member = require('./Member')
const Role = require('./Role')
module.exports = class Message {
    /**
     * 
     * @param {Client} client 
     * @param {Guild} guild 
     * @param {TextChannel} channel 
     */
    constructor(client, guild, channel, data) {
        /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
        Object.defineProperty(this, 'client', { value: client })
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
        this.memberMentions = new Store()
        this.roleMentions = new Store()
        this.channelMentions = new Store()
        this.pinned = data.pinned
        this.mentionEveryone = data.mention_everyone
        this.tts = data.tts
        this.createdTimestamp = Utils.getTimestampFrom(data.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.guildId = this.guild?.id
        this.editTimestamp = new Date(data.edited_timestamp)
        this.flags = data.flags
        this.components = []
        this.messageReplyied = data.referenced_message ? new Message(this.client, this.guild, this.channel, data.referenced_message) : null
        this.deleted = false
        this.webhookId = data.webhook_id
        this.author = this.webhookId ? null : new User(this.client, data.author)
        this.authorId = this.webhookId ? this.webhookId : data.author.id
        this.member = this.webhookId ? null : this.guildId ? this.member ? this.member : this.guild.members.get(this.authorId) : null
        this.interaction = data.interaction
        this.data_is_available = true
        if(this.interaction && this.interaction.user){
            this.interaction.user = this.client.users.get(this.interaction.user.id) || new User(this.client, this.interaction.user)
        }
        if(data.mentions) data.mentions.map(m => {
            if(m.member){
            m.member.user = m
            this.memberMentions.set(m.id, new Member(this.client, this.client.guilds.get(this.guildId)||this.guild, m.member))
            } else {
                this.memberMentions.set(m.id, new User(this.client, m))
            }
        })
        if(data.mention_roles) data.mention_roles.map(async r_id => {
            if(this.guild.roles.get(r_id)) this.roleMentions.set(r_id, this.guild.roles.get(r_id))
            else {
                let res = await this.client.rest.get(this.client._ENDPOINTS.ROLES(this.guildId)).catch(e=>{})
                if(!res) return
                let role = res.find(r => r.id === r_id)
                if(!role) return
                this.roleMentions.set(r_id, new Role(this.client, this.client.guilds.get(this.guildId)||this.guild, role))
            }
        })
        if(data.mention_channels) data.mention_channels.map(async channelraw => {
            if(this.client.textChannels.get(channelraw.id)) this.channelMentions.set(channelraw.id, this.textChannels.get(channelraw.id))
            else {
                let res = await this.client.rest.get(this.client._ENDPOINTS.CHANNEL(channelraw.id)).catch(e=>{})
                if(!res) return
                this.channelMentions.set(channelraw.id, new TextChannel(this.client, this.client.guilds.get(this.guildId)||this.guild, res))
            }
        })
        data.attachments.map(attach => this.attachments.set(attach.id, new Attachment(this.client, this, attach)))
        data.embeds.map(embed => this.embeds.push(new Embed(embed)))
        data.components.map(component => {
            this.components.push(new ActionRow(...component.components.map(op => {
                switch (op.type) {
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
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, messageData))
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
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, messageData))
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
                if (options['components'] && options['components']?.length > 0) options['components']?.map(comp => {
                    if (comp instanceof ActionRow) data['components'].push(comp.pack())
                    else return reject(new TypeError("Invalid component, must be a ActionRow instance"))
                })
                else data['components'] = this.components
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if (toTestCustomId.length > 0) toTestCustomId.map(test => {
                    if (alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.patch(this.client._ENDPOINTS.MESSAGES(this.channelId, this.id), data).then(messageData => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, messageData))
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
                if(this.deleted) return resolve(this)
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
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, messageData))
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
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, messageData))
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
                this.client.rest.post(this.client._ENDPOINTS.MESSAGES(this.channelId), data).then(messageData => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, messageData))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    async crosspost() {
        return new Promise(async (resolve, reject) => {
            if (this.channel.type !== 5) return reject(new TypeError("The channel must be an announcement channel"))
            this.client.rest.post(`${this.client._ENDPOINTS.MESSAGES(this.channelId, this.id)}/crosspost`).then(message_data => {
                let message = new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, message_data)
                Object.keys(message).map(k => this[k] = message[k])
                return resolve(message)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async pinMessage(reason) {
        return new Promise(async (resolve, reject) => {
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.put(this.client._ENDPOINTS.CHANNEL(this.channelId) + '/pins/' + this.id, {
                "reason": reason
            }).then(() => {
                return resolve()
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async unpinMessage(reason) {
        return new Promise(async (resolve, reject) => {
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.CHANNEL(this.channelId) + '/pins/' + this.id, {
                "reason": reason
            }).then(() => {
                return resolve()
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async react(emoji) {
        return new Promise(async (resolve, reject) => {
            let testemoji = null
            if (emoji && typeof emoji === "string") testemoji = Utils.parseEmoji(emoji)
            if (emoji && typeof emoji === "string" && (!testemoji || typeof testemoji !== 'object')) return reject(new TypeError("Invalid emoji"))
            if (typeof emoji === "object" && emoji.name) testemoji = emoji
            if (!testemoji) return reject(new TypeError("Invalid emoji"))
            let encoded = encodeURIComponent(testemoji.id ? `${testemoji.name}:${testemoji.id}` : testemoji.name)
            if (!encoded) return reject(new TypeError("An error occured during the encode process"))
            this.client.rest.put(this.client._ENDPOINTS.REACTIONS(this.channelId, this.id, encoded, "@me")).then(() => {
                return resolve()
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async unreact(emoji, user) {
        return new Promise(async (resolve, reject) => {
            let testemoji = null
            if (emoji && typeof emoji === "string") testemoji = Utils.parseEmoji(emoji)
            if (emoji && typeof emoji === "string" && (!testemoji || typeof testemoji !== 'object')) return reject(new TypeError("Invalid emoji"))
            if (typeof emoji === "object" && emoji.name) testemoji = emoji
            if (!testemoji) return reject(new TypeError("Invalid emoji"))
            let encoded = encodeURIComponent(testemoji.id ? `${testemoji.name}:${testemoji.id}` : testemoji.name)
            if (!encoded) return reject(new TypeError("An error occured during the encode process"))
            if (typeof user !== "undefined") {
                if (user instanceof User) user = user.id
                if (typeof user !== "string") return reject(new TypeError("The provided user must be a string or a User instance"))
                this.client.rest.delete(this.client._ENDPOINTS.REACTIONS(this.channelId, this.id, encoded, user)).then(() => {
                    return resolve()
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else {
                this.client.rest.delete(this.client._ENDPOINTS.REACTIONS(this.channelId, this.id, encoded, "@me")).then(() => {
                    return resolve()
                }).catch(e => {
                    return reject(new Error(e))
                })
            }
        })
    }

    async getUsersFromReaction(emoji, options = {}) {
        return new Promise(async (resolve, reject) => {
            let testemoji = null
            if (emoji && typeof emoji === "string") testemoji = Utils.parseEmoji(emoji)
            if (emoji && typeof emoji === "string" && (!testemoji || typeof testemoji !== 'object')) return reject(new TypeError("Invalid emoji"))
            if (typeof emoji === "object" && emoji.name) testemoji = emoji
            if (!testemoji) return reject(new TypeError("Invalid emoji"))
            let encoded = encodeURIComponent(testemoji.id ? `${testemoji.name}:${testemoji.id}` : testemoji.name)
            if (!encoded) return reject(new TypeError("An error occured during the encode process"))
            if (typeof options !== "undefined") {
                if (typeof options !== "object") return reject(new TypeError("Get reactions options must be an object"))
                if (typeof options.limit !== "undefined") {
                    if (typeof options.limit !== "number") return reject(new TypeError("Get reactions options limit must be a number"))
                    if (options.limit < 1 || options.limit > 100) return reject(new TypeError("Get reactions options limit must be between 1 and 100 (included)"))
                }
                if (typeof options.after !== "undefined") {
                    if (options.after instanceof User) options.after = options.after.id
                    if (typeof options.after !== "string") return reject(new TypeError("Get reactions options after must be a string or a User instance"))
                }
            } else options = { limit: 100 }
            this.client.rest.get(this.client._ENDPOINTS.REACTIONS(this.channelId, this.id, encoded) + `?limit=${options.limit}${options.after ? `&after=${options.after}` : ``}`).then((res) => {
                let collect = new Store()
                res.map(a => {
                    collect.set(a.id, new User(this.client, a))
                })
                return resolve(collect)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async deleteAllReactions(emoji) {
        return new Promise(async (resolve, reject) => {
            if (typeof emoji !== "undefined") {
                let testemoji = null
                if (emoji && typeof emoji === "string") testemoji = Utils.parseEmoji(emoji)
                if (emoji && typeof emoji === "string" && (!testemoji || typeof testemoji !== 'object')) return reject(new TypeError("Invalid emoji"))
                if (typeof emoji === "object" && emoji.name) testemoji = emoji
                if (!testemoji) return reject(new TypeError("Invalid emoji"))
                let encoded = encodeURIComponent(testemoji.id ? `${testemoji.name}:${testemoji.id}` : testemoji.name)
                if (!encoded) return reject(new TypeError("An error occured during the encode process"))
                this.client.rest.delete(this.client._ENDPOINTS.REACTIONS(this.channelId, this.id, encoded)).then(() => {
                    return resolve()
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else {
                this.client.rest.delete(this.client._ENDPOINTS.REACTIONS(this.channelId, this.id)).then(() => {
                    return resolve()
                }).catch(e => {
                    return reject(new Error(e))
                })
            }
        })
    }

    createComponentsCollector(options = {}){
        if(typeof options !== "object") throw new TypeError("You must provide options for the collector")
        if(typeof options.count !== "undefined"){
            if(typeof options.count !== "number") throw new TypeError("The count must be a number")
        }
        options.type = 'component'
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
        this.client.collectorCache[identifier] = new Collector(this.client, this.client.guilds.get(this.guildId)||this.guild, this, this.channel, options)
        this.client.collectorCache[identifier]?.on('end', () => {
            delete this.client.collectorCache[identifier]
        })
        return this.client.collectorCache[identifier]  
    }
}