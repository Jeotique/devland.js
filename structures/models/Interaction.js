const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')
const User = require('./User')
const Member = require('./Member')
const Permissions = require('../util/BitFieldManagement/Permissions')
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
const Attachment = require('./Attachment')
const Collector = require("./Collector");
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
        this.isCommand = this.type === 2
        this.isModal = this.type === 5
        this.isMessageComponent = this.type === 3
        this.isAutoCompleteRequest = this.type === 4
        this.isButton = this.isMessageComponent && this.data.component_type === 2
        this.isActionRow = this.isMessageComponent && this.data.component_type === 1
        this.isStringSelect = this.isMessageComponent && this.data.component_type === 3
        this.isTextInput = this.isMessageComponent && this.data.component_type === 4
        this.isUserSelect = this.isMessageComponent && this.data.component_type === 5
        this.isRoleSelect = this.isMessageComponent && this.data.component_type === 6
        this.isMentionableSelect = this.isMessageComponent && this.data.component_type === 7
        this.isChannelSelect = this.isMessageComponent && this.data.component_type === 8
        this.isSlashCommand = this.isCommand && this.data.type === 1
        this.isSubCommand = this.isCommand && this.data?.options && this.data?.options?.length > 0 && this.data?.options[0]?.type === 1
        this.isSubCommandGroup = this.isCommand && this.data?.options && this.data?.options?.length > 0 && this.data?.options[0]?.type === 2
        this.isUserContext = this.isCommand && this.data.type === 2
        this.isMessageContext = this.isCommand && this.data.type === 3
        this.followUpMessageId = null
        this.deleted = false
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.isReplied = false
        this.isDeferUpdate = false
        this.isDeferReply = false
    }

    async deferUpdate(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (this.isDeferReply || this.isDeferUpdate || this.isReplied) return reject(new TypeError("Interaction already replied"))
            if (this.isCommand) return reject(new TypeError("You can't use deferUpdate on a command"))
            if (typeof options !== "object") options = {}
            if (typeof options.ephemeral !== "boolean") options.ephemeral = false
            if (options.ephemeral) options.flags = 1 << 6
            else delete options.ephemeral
            this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                type: 6,
                data: options
            }).then(() => {
                this.isDeferUpdate = true
                resolve(this)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async reply(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (this.isReplied || this.isDeferReply || this.isDeferUpdate) return reject(new TypeError("Interaction already replied"))
            if (typeof options !== "string" && typeof options !== "object") return reject(new TypeError("Invalid message payload"))
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
                this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                    type: 4,
                    data: data
                }).then(() => {
                    this.isReplied = true
                    return resolve(this)
                }).catch(e => {
                    return reject(e)
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                    type: 4,
                    data: data
                }).then(() => {
                    this.isReplied = true
                    return resolve(this)
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
                this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                    type: 4,
                    data: data
                }).then(() => {
                    this.isReplied = true
                    return resolve(this)
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
                data['flags'] = options['ephemeral'] ? 1 << 6 : undefined
                this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                    type: 4,
                    data: data
                }).then(() => {
                    this.isReplied = true
                    return resolve(this)
                }).catch(e => {
                    return reject(e)
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    async deferReply(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (this.isReplied || this.isDeferReply || this.isDeferUpdate) return reject(new TypeError("Interaction already replied"))
            if (typeof options !== "object") options = {}
            if (typeof options.ephemeral !== "boolean") options.ephemeral = false
            if (options.ephemeral) options.flags = 1 << 6
            else delete options.ephemeral
            this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                type: 5,
                data: options
            }).then(() => {
                this.isDeferReply = true
                resolve(this)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async sendAutoCompleteChoices(options = []) {
        return new Promise(async (resolve, reject) => {
            if (typeof options === "undefined") return reject(new TypeError("You must provid at least one option"))
            if (!Array.isArray(options)) return reject(new TypeError("You must provid a array of options"))
            if (options.length < 1) return reject(new TypeError("You must provid at least one option"))
            if (options.filter(op => {
                typeof op.name !== "string" || typeof op.value === "undefined"
            }).length > 0) return reject(new TypeError("Invalid option(s) provided"))
            this.client.rest.post(this.client._ENDPOINTS.INTERACTIONS(this.id, this.token), {
                type: 8,
                data: {
                    choices: options
                }
            }).then(() => {
                resolve(this)
            }).catch(e => {
                return reject(e)
            })
        })
    }

    async followUp(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (this.isReplied) return reject(new TypeError("Interaction already replied with \".reply()\""))
            if (!this.isDeferReply && !this.isDeferUpdate) return reject(new TypeError(`You must reply to the interaction first with ".deferUpdate()" for message components or ".deferReply()" for commands`))
            if (typeof options !== "string" && typeof options !== "object") return reject(new TypeError("Invalid message payload"))
            let data = {
                content: undefined,
                embeds: [],
                tts: false,
                nonce: undefined,
                allowed_mentions: undefined,
                components: [],
                flags: undefined,
            }
            if (typeof options === 'string') {
                data['content'] = options
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token), data).then((a) => {
                    this.followUpMessageId = a.id
                    this.followUpMessage = a
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(e)
                })
            } else if (options instanceof Embed) {
                data['embeds'].push(options.pack())
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token), data).then((a) => {
                    this.followUpMessageId = a.id
                    this.followUpMessage = a
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
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
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token), data).then((a) => {
                    this.followUpMessageId = a.id
                    this.followUpMessage = a
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
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
                data['flags'] = options['ephemeral'] ? 1 << 6 : undefined
                this.client.rest.post(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token), data).then((a) => {
                    this.followUpMessageId = a.id
                    this.followUpMessage = a
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(e)
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    async editFollowUp(options = {}, message_to_edit) {
        return new Promise(async (resolve, reject) => {
            var IdMessageToEdit = this.followUpMessageId
            var data = {
                content: undefined,
                embeds: this.followUpMessage?.embeds || [],
                tts: false,
                nonce: undefined,
                allowed_mentions: undefined,
                components: this.followUpMessage?.components || [],
                flags: undefined,
                attachments: this.followUpMessage?.attachments?.size < 1 ? [] : [...this.followUpMessage?.attachments?.values()]
            }
            if (typeof message_to_edit !== "undefined" && message_to_edit !== null) {
                if (typeof message_to_edit !== "object" || !(message_to_edit instanceof Message)) return reject(new TypeError("The message to edit must be a Message instance"))
                IdMessageToEdit = message_to_edit.id
                data['embeds'] = message_to_edit.embeds || []
                data['components'] = message_to_edit.components || []
                data['attachments'] = message_to_edit.attachments?.size < 1 ? [] : [...message_to_edit.attachments?.values()]
            }
            if (typeof options === 'string') {
                data['content'] = options
                this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + IdMessageToEdit, data).then((a) => {
                    if (IdMessageToEdit === this.followUpMessageId) this.followUpMessage = a
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(e)
                })
            } else if (options instanceof Embed) {
                data['embeds'] = []
                data['embeds'].push(options.pack())
                this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + IdMessageToEdit, data).then((a) => {
                    if (IdMessageToEdit === this.followUpMessageId) this.followUpMessage = a
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(e)
                })
            } else if (options instanceof ActionRow) {
                data['components'] = []
                data['components'].push(options.pack())
                let toTestCustomId = []
                let alrSeen = {}
                data['components']?.map(ar => ar?.components.map(comp => toTestCustomId.push(comp)))
                if (toTestCustomId.length > 0) toTestCustomId.filter(comp => comp.custom_id).map(test => {
                    if (alrSeen[test.custom_id]) return reject(new TypeError("Duplicated custom Id"))
                    else alrSeen[test.custom_id] = true
                })
                this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + IdMessageToEdit, data).then((a) => {
                    if (IdMessageToEdit === this.followUpMessageId) this.followUpMessage = a
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(e)
                })
            } else if (typeof options === 'object') {
                data['content'] = options['content']
                if (Array.isArray(options['embeds'])) data['embeds'] = []
                if (Array.isArray(options['embeds'])) options['embeds']?.map(embed_data => data['embeds'].push((embed_data instanceof Embed) ? embed_data.pack() : new Embed(embed_data).pack()))
                if (Array.isArray(options['embeds']) && options['embeds'].length < 1) data['embeds'] = []
                if (options['embeds'] === null) data['embeds'] = []
                if (Array.isArray(options['attachments'])) data['attachments'] = []
                if (Array.isArray(options['attachments'])) options['attachments']?.map(attach_data => data['attachments'].push((attach_data instanceof Attachment) ? attach_data.pack() : new Attachment(attach_data).pack()))
                if (Array.isArray(options['attachments']) && options['attachments'].length < 1) data['attachments'] = []
                if (options['attachments'] === null) data['attachments'] = []
                data['tts'] = options['tts']
                data['nonce'] = options['nonce']
                data['allowed_mentions'] = options['allowedMentions']
                if (typeof data['allowed_mentions'] !== 'undefined') {
                    if (!Array.isArray(data['allowed_mentions'])) data['allowed_mentions'] = undefined
                    else {
                        data['allowed_mentions'] = { parse: [...options['allowedMentions']] }
                    }
                }
                if (Array.isArray(options['components'])) data['components'] = []
                if (options['components'] === null) data['components'] = []
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
                data['flags'] = options['ephemeral'] ? 1 << 6 : undefined
                this.client.rest.patch(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + IdMessageToEdit, data).then((a) => {
                    if (IdMessageToEdit === this.followUpMessageId) this.followUpMessage = a
                    const Message = require('./Message')
                    return resolve(new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, a))
                }).catch(e => {
                    return reject(e)
                })
            } else return reject(new TypeError("Send without any options is not authorized"))
        })
    }

    /**
     * Delete the message
     * @returns {Promise<Interaction>}
     */
    async deleteFollowUp(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") options = {}
            if (typeof options.delay !== 'number') options.delay = 0
            var IdMessageToDelete = this.followUpMessageId
            if (typeof options.message_to_delete !== "undefined" && options.message_to_delete !== null) {
                if (typeof options.message_to_delete !== "object" || !(options.message_to_delete instanceof Message)) return reject(new TypeError("The message to delete must be a Message instance"))
                IdMessageToDelete = options.message_to_delete.id
            }
            setTimeout(() => {
                this.client.rest.delete(this.client._ENDPOINTS.WEBHOOKS_TOKEN(this.application_id, this.token) + '/messages/' + IdMessageToDelete).then(() => {
                    if (IdMessageToDelete === this.followUpMessageId) {
                        this.followUpMessage.deleted = true
                    } else {
                        options.message_to_delete.deleted = true
                    }
                    return resolve(this)
                }).catch(e => {
                    return reject(e)
                })
            }, options.delay)
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
                return reject(e)
            })
        })
    }

    getModalValue(input_id) {
        if (!this.isModal) throw new TypeError("This function can be used on a modal only")
        if (typeof input_id !== "string") throw new TypeError("You didn't provide any input Id")
        if (!this.data) return null
        if (!this.data?.components) return null
        if (this.data?.components?.length < 1) return null
        let goodComponent = this.data.components.find(comp => comp.components.find(c => c.custom_id === input_id))
        if (!goodComponent) return null
        if (!goodComponent.components) return null
        if (goodComponent.components.length < 1) return null
        let value = goodComponent.components.find(comp => comp.custom_id === input_id)
        if (!value) return null
        else return value.value
    }

    getSelectedUsers() {
        if (!this.isUserSelect) throw new TypeError("This function can be used on a user select only")
        return Object.keys(this.data.resolved.users).map(u => new User(this.client, this.data.resolved.users[u]))
    }

    getSelectedRoles() {
        if (!this.isRoleSelect) throw new TypeError("This function can be used on a role select only")
        return Object.keys(this.data.resolved.roles).map(r => new Role(this.client, this.client.guilds.get(this.guildId) || this.guild, this.data.resolved.roles[r]))
    }

    getSelectedMentionables() {
        if (!this.isMentionableSelect) throw new TypeError("This function can be used on a mentionable select only")
        return Object.keys(this.data.resolved.users).map(u => new User(this.client, this.data.resolved.users[u]))
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

    get subCommandName() {
        if (!this.isSubCommand && !this.isSubCommandGroup) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        const { name } = this.isSubCommand ? this.data?.options[0] : this.data?.options[0]?.options[0]
        if (!name) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        return name
    }

    get subCommandGroupName() {
        if (!this.isSubCommandGroup) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        const { name } = this.data?.options[0]
        if (!name) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        return name
    }

    getCommandValue(name) {
        if (!this.isSlashCommand) throw new TypeError("This function can be used on a slash command only")
        if (typeof name !== "string") throw new TypeError("You didn't provide any option name")
        if (!this.data) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        if (!this.data?.options || this.data?.options?.length < 1) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        let value;
        if (!this.isSubCommand && !this.isSubCommandGroup) value = this.data?.options?.find(op => op?.name === name)
        else if (this.isSubCommand) value = this.data?.options[0]?.options?.find(op => op?.name === name)
        else if (this.isSubCommandGroup) value = this.data?.options[0]?.options[0]?.options?.find(op => op?.name === name)
        if (!value) return this.client.options.invalidCommandValueReturnNull ? null : undefined
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

    getFocusedName(){
        if(!this.isAutoCompleteRequest) throw new TypeError("This function can be used on a auto complete request")
        if (!this.data) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        if (!this.data?.options || this.data?.options?.length < 1) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        let value = this.data.options.find(option => option.focused)?.name
        if (!value) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        return value
    }

    getFocusedType(){
        if(!this.isAutoCompleteRequest) throw new TypeError("This function can be used on a auto complete request")
        if (!this.data) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        if (!this.data?.options || this.data?.options?.length < 1) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        let value = this.data.options.find(option => option.focused)?.type
        if (!value) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        return value
    }

    getFocusedValue(){
        if(!this.isAutoCompleteRequest) throw new TypeError("This function can be used on a auto complete request")
        if (!this.data) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        if (!this.data?.options || this.data?.options?.length < 1) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        let value = this.data.options.find(option => option.focused)?.value
        if (!value) return this.client.options.invalidCommandValueReturnNull ? null : undefined
        return value
    }

    getTargetUser() {
        if (!this.isUserContext) throw new TypeError("This function can be used on a user context only")
        return new User(this.client, this.data.resolved.users[this.data.target_id])
    }

    getTargetMessage() {
        if (!this.isMessageContext) throw new TypeError("This function can be used on a message context only")
        return new Message(this.client, this.client.guilds.get(this.guildId) || this.guild, this.channel, this.data.resolved.messages[this.data.target_id])
    }

    createModalListener(options = {}) {
        if (typeof options !== "object") throw new TypeError("You must provide options for the collector")
        if (typeof options.count !== "undefined") {
            if (typeof options.count !== "number") throw new TypeError("The count must be a number")
        }
        options.type = 'component'
        if (typeof options.time !== "undefined") {
            if (typeof options.time !== "number") throw new TypeError("The time must be a number")
        }
        options.componentType = 5
        if (typeof options.filter !== "undefined") {
            if (typeof options.filter !== "function") throw new TypeError("The filter must be a filter function for the collector, example : 'filter: (collected) => collected.user.id === message.author.id'")
        }
        let identifier = Date.now()
        this.client.collectorCache[identifier] = new Collector(this.client, this.client.guilds.get(this.guildId) || this.guild, this.message, this.channel, options)
        this.client.collectorCache[identifier]?.on('end', () => {
            delete this.client.collectorCache[identifier]
        })
        return this.client.collectorCache[identifier]
    }

    awaitModalResponse(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") throw new TypeError("You must provide options for the collector")
            if (typeof options.count !== "undefined") {
                if (typeof options.count !== "number") throw new TypeError("The count must be a number")
            }
            options.type = "await_modal"
            if (typeof options.time !== "undefined") {
                if (typeof options.time !== "number") throw new TypeError("The time must be a number")
            }
            options.componentType = 5
            if (typeof options.filter !== "undefined") {
                if (typeof options.filter !== "function") throw new TypeError("The filter must be a filter function for the collector, example : 'filter: (collected) => collected.user.id === message.author.id'")
            }
            let identifier = Date.now()
            this.client.collectorCache[identifier] = new Collector(this.client, this.client.guilds.get(this.guildId) || this.guild, this.message, this.channel, options)
            var resolved = false
            this.client.collectorCache[identifier]?.on('end', () => {
                if (!resolved) resolve(null)
                delete this.client.collectorCache[identifier]
            })
            this.client.collectorCache[identifier]?.on('collected', collected => {
                resolved = true
                resolve(collected)
                delete this.client.collectorCache[identifier]
            })
        })
    }
}