const Guild = require('./Guild')
const Client = require('../client/client')
const Permissions = require('../util/Permissions/Permissions')
const Utils = require('../util/index')

module.exports = class Role {
    constructor(client, guild, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = guild.id
        this.id = data.id
        this.version = data.version
        this.unicode_emoji = data.unicode_emoji
        this.tags = data.tags
        this.position = data.position
        this.permissions_new = new Permissions(data.permissions_new)
        this.permissions = new Permissions(data.permissions.toString())
        this.name = data.name
        this.mentionable = data.mentionable
        this.managed = data.managed
        this.icon = data.icon
        this.hoist = data.hoist
        this.flags = data.flags
        this.color = data.color
        this.createdTimestamp = Utils.getTimestampFrom(data.id)
        this.createdAt = new Date(this.createdTimestamp)
        this.data_is_available = true
    }

    edit(options = {}) {
        return new Promise(async (resolve, reject) => {
            if (typeof options !== "object") return reject(new TypeError("Edit role options must be a object"))
            if (typeof options.name !== "undefined") {
                if (typeof options.name !== "string") return reject(new TypeError("Edit role options name must be a string"))
                if (options.name.length > 100) return reject(new TypeError("Edit role options must be less than 100 caracters"))
            }
            if (typeof options.permissions !== "undefined") {
                if (options.permissions instanceof Permissions) options.permissions = options.permissions.bitfield.toString()
                else options.permissions = new Permissions(options.permissions).bitfield.toString()
            }
            if (typeof options.color !== "undefined") {
                if (typeof options.color === "string") options.color = Utils.resolveColor(options.color)
                if (typeof options.color !== "number") return reject(new TypeError("Edit role options color must be a number"))
            }
            if (typeof options.hoist !== "undefined") {
                if (typeof options.hoist !== "boolean") return reject(new TypeError("Edit role options hoist must be a boolean"))
            }
            if (typeof options.unicode_emoji !== "undefined") {
                if (options.unicode_emoji instanceof Emoji) {
                    options.unicode_emoji = options.unicode_emoji.pack()
                    options.unicode_emoji = options.unicode_emoji.id ? `${options.unicode_emoji.name}` : `<${options.unicode_emoji.animated ? "a" : ""}:${options.unicode_emoji.name}:${options.unicode_emoji.id}>`
                }
                if (typeof options.unicode_emoji !== "string") return reject(new TypeError("Edit role options unicode_emoji must be a string"))
            }
            if (typeof options.mentionable !== "undefined") {
                if (typeof options.mentionable !== "boolean") return reject(new TypeError("Edit role options mentionable must be a boolean"))
            }
            if (typeof options.position !== "undefined") {
                if (typeof options.position !== "number") return reject(new TypeError("Edit role options position must be a number"))
            }
            if (typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.patch(this.client._ENDPOINTS.ROLES(this.guildId, this.id), options).then(res => {
                let role = new Role(this.client, this.client.guilds.get(this.id) || this, res)
                resolve(role)
                Object.keys(role).map(k => this[k] = role[k])
                if (typeof this.client.options.rolesLifeTime === "number" && this.client.options.rolesLifeTime > 0) {
                    role.cachedAt = Date.now()
                    role.expireAt = Date.now() + this.client.options.rolesLifeTime
                    this.guild.roles.set(role.id, role)
                }
                if (typeof options.position === "number") {
                    this.client.rest.patch(this.client._ENDPOINTS.ROLE(this.guildId), {
                        id: this.id,
                        position: options.position,
                        reason: options.reason
                    }).then(res => {
                        let role = new Role(this.client, this.client.guilds.get(this.id) || this, res)
                        Object.keys(role).map(k => this[k] = role[k])
                        if (typeof this.client.options.rolesLifeTime === "number" && this.client.options.rolesLifeTime > 0) {
                            role.cachedAt = Date.now()
                            role.expireAt = Date.now() + this.client.options.rolesLifeTime
                            this.guild.roles.set(role.id, role)
                        }
                    }).catch(e => { console.error(`Can't update the role position of ${role.name} in ${role.guild.name} for the next reason : ${e}`) })
                }
            }).catch(e => {
                return reject(new Error(e))
            })
        })
    }

    async delete(reason){
        return new Promise(async(resolve, reject) => {
            if (typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("The reason must be a string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.ROLES(this.guildId, this.id), {
                reason: reason
            }).then(()=>{
                resolve(this)
                this.guild.roles.delete(this.id)
            }).catch(e=>{
                return reject(new Error(e))
            })
        })
    }

    get hexColor() {
        return `#${this.color.toString(16).padStart(6, '0')}`;
    }

    comparePositions(role){
        const resolvedRole1 = this
        const resolvedRole2 = role instanceof Role ? role : this.guild.roles.get(role)
        if(!resolvedRole1 || !resolvedRole2) throw new TypeError("One of the two roles is undefined.")
        if(resolvedRole1.position === resolvedRole2.position){
            return Number(BigInt(resolvedRole2.id) - BigInt(resolvedRole1.id))
        }
        return resolvedRole1.position - resolvedRole2.position
    }
}