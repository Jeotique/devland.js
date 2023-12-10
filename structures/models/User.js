const Utils = require('../util')
const Client = require('../client/client')
const DmChannel = require('./DmChannel')
const Message = require('./Message')
const UserFlags = require('../util/BitFieldManagement/UserFlags')
const Embed = require('./Embed')
const ActionRow = require('./ActionRow')

module.exports = class User {
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
        this.username = data.username
        this.flags = new UserFlags(BigInt(data.public_flags??0))
        this.id = data.id
        this.tag = data.username
        this.discriminator = data.discriminator
        this.displayName = data.display_name || data.global_name
        this.bot = data.bot ? true : false
        this.avatarDecoration = data.avatar_decoration
        this.avatar = data.avatar
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.banner = data.banner
        this.premiumType = data.premium_type || null

        if (this.avatar) {
            this.avatar = `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}${this.avatar.startsWith('a_') ? '.gif' : '.png'}?size=512`
        }
        if (this.banner){
            this.banner = `https://cdn.discordapp.com/banners/${this.id}/${this.banner}${this.banner.startsWith('a_') ? '.gif' : '.png'}?size=1024`
        }
    }

    toString(){
        return `<@${this.id}>`
    }

    getBannerUrl(size = 1024, type = "auto"){
        if (typeof size !== "number") size = 1024
        if (typeof type !== "string" || type === "auto") type = this.banner.startsWith('a_') ? 'gif' : 'png'
        return `https://cdn.discordapp.com/banners/${this.id}/${this.banner}.${type}?size=${size}`
    }

    getAvatarUrl(size = 512, type = "auto"){
        if (typeof size !== "number") size = 512
        if (typeof type !== "string" || type === "auto") type = this.avatar.startsWith('a_') ? 'gif' : 'png'
        return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${type}?size=${size}`
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
                components: [],
                files: null,
            }
            if (typeof options === 'string') {
                data['content'] = options
                let dm_channel = this.client.dmChannels.find(c => c.user.id === this.id)
                if (dm_channel) {
                    this.client.rest.post(this.client._ENDPOINTS.MESSAGES(dm_channel.id), data).then(messageData => {
                        let Message = require('./Message')
                        return resolve(new Message(this.client, this.guild, dm_channel, messageData))
                    }).catch(e => {
                        return reject(e)
                    })
                } else {
                    this.client.rest.post(this.client._ENDPOINTS.DM_CHANNEL(), {
                        recipient_id: this.id
                    }).then(res => {
                        res.user = this
                        dm_channel = new DmChannel(this.client, res)
                        this.client.dmChannels.set(dm_channel.id, dm_channel)
                        this.client.rest.post(this.client._ENDPOINTS.MESSAGES(dm_channel.id), data).then(messageData => {
                            let Message = require('./Message')
                            return resolve(new Message(this.client, this.guild, dm_channel, messageData))
                        }).catch(e => {
                            return reject(e)
                          })
                    }).catch(e => {
                        return reject(e)
                    })
                }
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                let dm_channel = this.client.dmChannels.find(c => c.user.id === this.id)
                if (dm_channel) {
                    this.client.rest.post(this.client._ENDPOINTS.MESSAGES(dm_channel.id), data).then(messageData => {
                        let Message = require('./Message')
                        return resolve(new Message(this.client, this.guild, dm_channel, messageData))
                    }).catch(e => {
                        return reject(e)
                    })
                } else {
                    this.client.rest.post(this.client._ENDPOINTS.DM_CHANNEL(), {
                        recipient_id: this.id
                    }).then(res => {
                        res.user = this
                        dm_channel = new DmChannel(this.client, res)
                        this.client.dmChannels.set(dm_channel.id, dm_channel)
                        this.client.rest.post(this.client._ENDPOINTS.MESSAGES(dm_channel.id), data).then(messageData => {
                            let Message = require('./Message')
                            return resolve(new Message(this.client, this.guild, dm_channel, messageData))
                        }).catch(e => {
                            return reject(e)
                          })
                    }).catch(e => {
                        return reject(e)
                    })
                }
            } else if (options instanceof ActionRow) {
                data['components'].push(options.pack())
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if (toTestCustomId.length > 0) toTestCustomId.filter(comp => comp.custom_id).map(test => {
                    if (alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                let dm_channel = this.client.dmChannels.find(c => c.user.id === this.id)
                if (dm_channel) {
                    this.client.rest.post(this.client._ENDPOINTS.MESSAGES(dm_channel.id), data).then(messageData => {
                        let Message = require('./Message')
                        return resolve(new Message(this.client, this.guild, dm_channel, messageData))
                    }).catch(e => {
                        return reject(e)
                    })
                } else {
                    this.client.rest.post(this.client._ENDPOINTS.DM_CHANNEL(), {
                        recipient_id: this.id
                    }).then(res => {
                        res.user = this
                        dm_channel = new DmChannel(this.client, res)
                        this.client.dmChannels.set(dm_channel.id, dm_channel)
                        this.client.rest.post(this.client._ENDPOINTS.MESSAGES(dm_channel.id), data).then(messageData => {
                            let Message = require('./Message')
                            return resolve(new Message(this.client, this.guild, dm_channel, messageData))
                        }).catch(e => {
                            return reject(e)
                          })
                    }).catch(e => {
                        return reject(e)
                    })
                }
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
                let dm_channel = this.client.dmChannels.find(c => c.user.id === this.id)
                if (dm_channel) {
                    this.client.rest.post(this.client._ENDPOINTS.MESSAGES(dm_channel.id), data).then(messageData => {
                        let Message = require('./Message')
                        return resolve(new Message(this.client, this.guild, dm_channel, messageData))
                    }).catch(e => {
                        return reject(e)
                    })
                } else {
                    this.client.rest.post(this.client._ENDPOINTS.DM_CHANNEL(), {
                        recipient_id: this.id
                    }).then(res => {
                        res.user = this
                        dm_channel = new DmChannel(this.client, res)
                        this.client.dmChannels.set(dm_channel.id, dm_channel)
                        this.client.rest.post(this.client._ENDPOINTS.MESSAGES(dm_channel.id), data).then(messageData => {
                            let Message = require('./Message')
                            return resolve(new Message(this.client, this.guild, dm_channel, messageData))
                        }).catch(e => {
                            return reject(e)
                          })
                    }).catch(e => {
                        return reject(e)
                    })
                }
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    async fetchBanner(size = 1024, type = "auto") {
        return new Promise(async (resolve, reject) => {
            if (typeof size !== "number") size = 1024
            let user = await this.client.rest.get(this.client._ENDPOINTS.USER(this.id)).catch(e => { return reject(e) })
            if (!user.banner) return resolve(null)
            if (typeof type !== "string" || type === "auto") type = user.banner.startsWith('a_') ? 'gif' : 'png'
            return resolve(`https://cdn.discordapp.com/banners/${this.id}/${user.banner}.${type}?size=${size}`)
        })
    }
    async fetchAvatar(size = 512, type = "auto") {
        return new Promise(async (resolve, reject) => {
            if (typeof size !== "number") size = 512
            let user = await this.client.rest.get(this.client._ENDPOINTS.USER(this.id)).catch(e => { return reject(e) })
            if (!user.avatar) return resolve(null)
            if (typeof type !== "string" || type === "auto") type = user.avatar.startsWith('a_') ? 'gif' : 'png'
            return resolve(`https://cdn.discordapp.com/avatars/${this.id}/${user.avatar}.${type}?size=${size}`)
        })
    }
}