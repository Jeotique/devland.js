const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const User = require('./User')
const Member = require('./Member')
const Permissions = require('../util/Permissions/Permissions')
const Embed = require('./Embed')
const Utils = require('../util')
const ActionRow = require('./ActionRow')
const Modal = require('./Modal')
const Role = require('./Role')
const TextChannel = require('./TextChannel')
const VoiceChannel = require('./VoiceChannel')
const CategoryChannel = require('./CategoryChannel')
const AnnouncementChannel = require('./AnnouncementChannel')
const Thread = require('./Thread')
const StageChannel = require('./StageChannel')
const ForumChannel = require('./ForumChannel')
module.exports = class Interaction {
    constructor(client, guild, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = data.guild_id
        this.id = data.id
        this.application_id = data.application_id
        this.type = data.type
        this.data = data.data
        this.channel = data.channel
        this.channelId = data.channel_id
        this.member = data.member
        this.user = data.user ? data.user : this.member ? this.member.user : undefined
        this.userId = this.user ? this.user.id : undefined
        this.token = data.token
        this.version = data.version
        this.message = data.message ? new Message(client, guild, this.channel, data.message) : undefined
        this.app_permissions = data.app_permissions ? new Permissions(data.app_permissions) : undefined
        this.locale = data.locale
        this.guild_locale = data.guild_locale
        this.commandName = data?.data?.name
        this.customId = data?.data?.custom_id
        this.values = data?.data?.values
        this.isSlashCommand = this.type === 2
        this.isModal = this.type === 5
        this.isMessageComponent = this.type === 3
        this.isButton = this.isMessageComponent && this.data.component_type === 2
        this.isActionRow = this.isMessageComponent && this.data.component_type === 1
        this.isStringSelect = this.isMessageComponent && this.data.component_type === 3
        this.isTextInput = this.isMessageComponent && this.data.component_type === 4
        this.isUserSelect = this.isMessageComponent && this.data.component_type === 5
        this.isRoleSelect = this.isMessageComponent && this.data.component_type === 6
        this.isMentionableSelect = this.isMessageComponent && this.data.component_type === 7
        this.isChannelSelect = this.isMessageComponent && this.data.component_type === 8
        this.followUpMessageId = null
        this.deleted = false
    }

    async deferUpdate(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (this.isSlashCommand) return reject(new TypeError("You can't use deferUpdate on a slash command"))
            if (typeof options !== "object") options = {}
            if (typeof options.ephemeral !== "boolean") options.ephemeral = false
            if (options.ephemeral) options.flags = 1 << 6
            else delete options.ephemeral
            this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                type: 6,
                data: options
            }).then(() => {
                resolve(this)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async reply(options = {}) {
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
                this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                    type: 4,
                    data: data
                }).then(() => {
                    return resolve(this)
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                    type: 4,
                    data: data
                }).then(() => {
                    return resolve(this)
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
                this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                    type: 4,
                    data: data
                }).then(() => {
                    return resolve(this)
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
                data['flags'] = options['ephemeral'] ? 1 << 6 : undefined
                this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                    type: 4,
                    data: data
                }).then(() => {
                    return resolve(this)
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    async deferReply(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") options = {}
            if (typeof options.ephemeral !== "boolean") options.ephemeral = false
            if (options.ephemeral) options.flags = 1 << 6
            else delete options.ephemeral
            this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                type: 5,
                data: options
            }).then(() => {
                resolve(this)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async followUp(options = {}) {
        return new Promise(async (resolve, reject) => {
            let data = {
                content: undefined,
                embeds: [],
                tts: false,
                nonce: undefined,
                allowed_mentions: undefined,
                components: this.components,
                flags: undefined,
            }
            if (typeof options === 'string') {
                data['content'] = options
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token), data).then((a) => {
                    this.followUpMessageId = a.id
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token), data).then((a) => {
                    this.followUpMessageId = a.id
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
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
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token), data).then((a) => {
                    this.followUpMessageId = a.id
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
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
                data['flags'] = options['ephemeral'] ? 1 << 6 : undefined
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token), data).then((a) => {
                    this.followUpMessageId = a.id
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    async editFollowUp(options = {}) {
        return new Promise(async (resolve, reject) => {
            let data = {
                content: undefined,
                embeds: [],
                tts: false,
                nonce: undefined,
                allowed_mentions: undefined,
                components: this.components,
                flags: undefined,
            }
            if (typeof options === 'string') {
                data['content'] = options
                this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + this.followUpMessageId, data).then((a) => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + this.followUpMessageId, data).then((a) => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
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
                this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + this.followUpMessageId, data).then((a) => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
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
                data['flags'] = options['ephemeral'] ? 1 << 6 : undefined
                this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + this.followUpMessageId, data).then((a) => {
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(new Error(e))
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    /**
     * Delete the message
     * @param {number} delay Delay in ms before deleting the message  
     * @returns {Promise<Interaction>}
     */
    async deleteFollowUp(delay) {
        return new Promise(async (resolve, reject) => {
            if (typeof delay !== 'number') delay = 0
            setTimeout(() => {
                if (this.deleted) return resolve(this)
                this.client.rest.delete(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + this.followUpMessageId).then(() => {
                    this.deleted = true
                    return resolve(this)
                }).catch(e => {
                    return reject(new Error(e))
                })
            }, delay)
        })
    }

    async submitModal(modal) {
        return new Promise(async (resolve, reject) => {
            if (typeof modal === "undefined") return reject(new TypeError("No modal provided"))
            if (typeof modal === "object") modal = new Modal(modal)
            if (modal instanceof Modal) modal = modal.pack()
            this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                type: 9,
                data: modal
            }).then(() => {
                resolve(this)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    getModalValue(input_id) {
        if (!this.isModal) throw new TypeError("This function can be used on a modal only")
        if (typeof input_id !== "string") throw new TypeError("You didn't provide any input Id")
        let goodComponent = this.data.components.find(comp => comp.components.find(c => c.custom_id === input_id))
        if (!goodComponent) return null
        let value = goodComponent.components.find(comp => comp.custom_id === input_id)
        if (!value) return null
        else return value.value
    }

    getSelectedUsers() {
        if (!this.isUserSelect) throw new TypeError("This function can be used on a user select only")
        return [Object.keys(this.data.resolved.users).map(u => new User(this.client, this.data.resolved.users[u]))]
    }

    getSelectedRoles() {
        if (!this.isRoleSelect) throw new TypeError("This function can be used on a role select only")
        return [Object.keys(this.data.resolved.roles).map(r => new Role(this.client, this.client.guilds.get(this.guildId) || this.guild, this.data.resolved.roles[r]))]
    }

    getSelectedMentionables() {
        if (!this.isMentionableSelect) throw new TypeError("This function can be used on a mentionable select only")
        return [Object.keys(this.data.resolved.users).map(u => new User(this.client, this.data.resolved.users[u]))]
    }

    getSelectedChannels() {
        if (!this.isChannelSelect) throw new TypeError("This function can be used on a channel select only")
        return Object.keys(this.data.resolved.channels).map(c => {
            let channel = this.data.resolved.channels[c]
            if (channel.type === 0) channel = new TextChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, channel)
            else if (channel.type === 2) channel = new VoiceChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, channel)
            else if (channel.type === 4) channel = new CategoryChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, channel)
            else if (channel.type === 5) channel = new AnnouncementChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, channel)
            else if (channel.type === 10 || channel.type === 11 || channel.type === 12) channel = new Thread(this.client, this.client.guilds.get(this.guildId) || this.guild, channel)
            else if (channel.type === 13) channel = new StageChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, channel)
            else if (channel.type === 15) channel = new ForumChannel(this.client, this.client.guilds.get(this.guildId) || this.guild, channel)
            return channel
        })
    }

    getCommandValue(name) {
        if (!this.isSlashCommand) throw new TypeError("This function can be used on a slash command only")
        if (typeof name !== "string") throw new TypeError("You didn't provide any option name")
        let value = this.data.options.find(op => op.name === name)
        if (!value) return null
        switch (value.type) {
            case 3:
                return value.value
                break;
            case 4:
                return value.value
                break;
            case 5:
                return value.value
                break;
            case 6:
                return this.client.users.get(value.value)
                break;
            case 7:
                return this.client.textChannels.get(value.value) || this.client.voiceChannels.get(value.value) || this.client.announcementChannels.get(value.value) || this.client.categoryChannels.get(value.value) || this.client.threadChannels.get(value.value) || this.client.stageChannels.get(value.value) || this.client.forumChannels.get(value.value)
                break;
            case 8:
                return this.guild.roles.get(value.value)
                break;
            case 9:
                return this.client.users.get(value.value)
                break;
            case 10:
                return value.value
                break;
            case 11:
                return value.value
                break;
            default:
                return value.value
                break;
        }
    }
}