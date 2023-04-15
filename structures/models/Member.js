const MemberFlags = require('../util/BitFieldManagement/MemberFlags')
const Permissions = require('../util/BitFieldManagement/Permissions')
const Guild = require('./Guild')
const Role = require('./Role')
const StageChannel = require('./StageChannel')
const User = require('./User')
const VoiceChannel = require('./VoiceChannel')
const {Store} = require('../util/Store/Store')

module.exports = class Member {
    constructor(client, guild, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = guild.id
        this.id = data.user.id
        this.premium_since = data.premium_since
        this.pending = data.pending
        this.nick = data.nick
        this.voice = guild.voicesStates.get(this.id) || null
        this.joined_at = new Date(data.joined_at)
        this.joinedTimestamp = new Date(data.joined_at).getTime()
        this.flags = new MemberFlags(BigInt(data.flags))
        this.communication_disabled_until = data.communication_disabled_until
        this.avatar = data.avatar
        this.roles = data.roles
        this.data_is_available = true
        const User = require('./User')
        this.user = data.user ? this.client.users.get(data.user.id) || new User(client, data.user) : null
        this.permissions = (this.id === this.guild.ownerId) ? new Permissions("ADMINISTRATOR") : this.roles.length > 0 && this.guild.roles.size > 0 ? new Permissions(this.roles.map(role_id => {
            return this.guild.roles.get(role_id)?.permissions.toArray()
        })) : new Permissions()
        this.presence = guild.presences.get(this.id) || null
    }

    async send(options) {
        return new Promise(async (resolve, reject) => {
            this.user.send(options).then(res => resolve(res)).catch(e => reject(new Error(e)))
        })
    }

    hasPermissions(permission) {
        if (this.id === this.guild.ownerId) return true
        else return this.permissions.has(permission, true)
    }

    async edit(data = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof data.nick !== "undefined") {
                if (typeof data.nick !== "string") return reject(new TypeError("The nickname must be a string"))
            }
            if (typeof data.roles !== "undefined") {
                if (data.roles instanceof Role) {
                    data.roles = [data.roles.id]
                } else if (data.roles === null) data.roles = []
                else if (typeof data.roles === "object") {
                    let r = []
                    data.roles.map(role => {
                        if (role instanceof Role) r.push(role.id)
                        else if (typeof role === "string") r.push(role)
                        else return reject(new TypeError("The role data must be a array with all roles Id or Role instance of the member"))
                    })
                    data.roles = r
                } else if (typeof data.roles === "string") data.roles = [data.roles]
                else return reject(new TypeError("The role data must be a valid Role instance or a valid role Id or a array with all roles Id / Role instance"))
            }
            if (typeof data.mute !== "undefined") {
                if (typeof data.mute !== "boolean") return reject(new TypeError("The mute state must be a boolean"))
            }
            if (typeof data.deaf !== "undefined") {
                if (typeof data.deaf !== "boolean") return reject(new TypeError("The deaf state must be a boolean"))
            }
            if (typeof data.channel_id !== "undefined") {
                if (data.channel_id instanceof VoiceChannel) data.channel_id = data.channel_id.id
                if (data.channel_id instanceof StageChannel) data.channel_id = data.channel_id.id
                if (data.channel_id !== null && typeof data.channel_id !== "string") return reject(new TypeError("The channel id must be set to null or a valid Id / VoiceChannel instance / StageChannel instance must be provided"))
            }
            if (typeof data.communication_disabled_until !== "undefined") {
                if (!(data.communication_disabled_until instanceof Date) && data.communication_disabled_until !== null && typeof data.communication_disabled_until !== "number") return reject(new TypeError("The communication disabled until state must be a number"))
                data.communication_disabled_until = !(data.communication_disabled_until instanceof Date) ? new Date(Date.now() + data.communication_disabled_until) : new Date(data.communication_disabled_until.getTime())
            }
            if (typeof data.flags !== "undefined") {
                if (typeof data.flags !== "number") return reject(new TypeError("The flags state must be a number"))
            }
            if (data.reason === null) data.reason = undefined
            if (typeof data.reason !== "undefined" && typeof data.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.patch(this.client._ENDPOINTS.MEMBERS(this.guildId, this.id), data).then(res => {
                let newMember = new Member(this.client, this.client.guilds.get(this.guildId) || this.guild, res)
                resolve(newMember)
                Object.keys(newMember).map(k => this[k] = newMember[k])
                if (typeof this.client.options.membersLifeTime === "number" && this.client.options.membersLifeTime > 0) {
                    newMember.cachedAt = Date.now()
                    newMember.expireAt = Date.now() + this.client.options.membersLifeTime
                    this.guild.members.set(newMember.id, newMember)
                    newMember.guild.members.set(newMember.id, newMember)
                }
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async addRoles(role, reason) {
        return new Promise(async (resolve, reject) => {
            let data = []
            if (typeof role === "undefined") return reject(new TypeError("Invalid roles provided"))
            if (typeof role === "string") data.push(role)
            else if (role instanceof Role) data.push(role.id)
            else if (typeof role === "object") role.map(r => {
                if (typeof r === "string") data.push(r)
                else if (r instanceof Role) data.push(r.id)
                else return reject(new TypeError("Invalid role provided"))
            })
            else return reject(new TypeError("Invalid role provided"))
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            data.filter(r => !this.roles.includes(r)).map(r => this.roles.push(r))
            this.client.rest.patch(this.client._ENDPOINTS.MEMBERS(this.guildId, this.id), {
                roles: this.roles,
                reason: reason,
            }).then(res => {
                let newMember = new Member(this.client, this.client.guilds.get(this.guildId) || this.guild, res)
                resolve(newMember)
                Object.keys(newMember).map(k => this[k] = newMember[k])
                if (typeof this.client.options.membersLifeTime === "number" && this.client.options.membersLifeTime > 0) {
                    newMember.cachedAt = Date.now()
                    newMember.expireAt = Date.now() + this.client.options.membersLifeTime
                    this.guild.members.set(newMember.id, newMember)
                    newMember.guild.members.set(newMember.id, newMember)
                }
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async removeRoles(role, reason) {
        return new Promise(async (resolve, reject) => {
            let data = []
            if (typeof role === "undefined") return reject(new TypeError("Invalid roles provided"))
            if (typeof role === "string") data.push(role)
            else if (role instanceof Role) data.push(role.id)
            else if (typeof role === "object") role.map(r => {
                if (typeof r === "string") data.push(r)
                else if (r instanceof Role) data.push(r.id)
                else return reject(new TypeError("Invalid role provided"))
            })
            else return reject(new TypeError("Invalid role provided"))
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.roles = this.roles.filter(r => !data.includes(r))
            this.client.rest.patch(this.client._ENDPOINTS.MEMBERS(this.guildId, this.id), {
                roles: this.roles,
                reason: reason,
            }).then(res => {
                let newMember = new Member(this.client, this.client.guilds.get(this.guildId) || this.guild, res)
                resolve(newMember)
                Object.keys(newMember).map(k => this[k] = newMember[k])
                if (typeof this.client.options.membersLifeTime === "number" && this.client.options.membersLifeTime > 0) {
                    newMember.cachedAt = Date.now()
                    newMember.expireAt = Date.now() + this.client.options.membersLifeTime
                    this.guild.members.set(newMember.id, newMember)
                    newMember.guild.members.set(newMember.id, newMember)
                }
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async fetchRoles() {
        return new Promise(async (resolve, reject) => {
            let collect = new Store()
            if (this.guild.roles.size > 0) {
                this.roles.map(async (r_id, n) => {
                    if (this.guild.roles.get(r_id)) collect.set(r_id, this.guild.roles.get(r_id))
                    else {
                        let res = await this.client.rest.get(this.client._ENDPOINTS.MEMBER_ROLES(this.guildId, this.id, r_id)).catch(e => { })
                        if (res) {
                            collect.set(r_id, new Role(this.client, this.client.guilds.get(this.guildId) || this.guild, res))
                        }
                    }

                    if (n + 1 === this.roles.length) return resolve(collect)
                })
            } else {
                let res = await this.client.rest.get(this.client._ENDPOINTS.ROLES(this.guildId)).catch(e => { return reject(new Error(e)) })
                res.filter(r => this.roles.includes(r.id)).map(role => {
                    collect.set(role.id, new Role(this.client, this.client.guilds.get(this.guildId) || this.guild, role))
                })
                return resolve(collect)
            }
        })
    }

    async kick(reason) {
        return new Promise(async (resolve, reject) => {
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.guild.kickMember(this.id, reason).then(member => {
                return resolve(member)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async ban(delete_message_seconds, reason) {
        return new Promise(async (resolve, reject) => {
            if (typeof delete_message_seconds !== "undefined" && typeof delete_message_seconds !== "number") return reject(new TypeError("delete_message_seconds must be a number"))
            if (reason === null) reason = undefined
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.guild.banMember(this.id, delete_message_seconds, reason).then(member => {
                return resolve(member)
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }
}