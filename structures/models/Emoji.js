const Client = require('../client/client')
const Guild = require('./Guild')
const Member = require('./Member')
const User = require('./User')

module.exports = class Emoji {
    /**
     * 
     * @param {Client} client 
     * @param {Guild} guild 
     * @param {*} data 
     */
    constructor(client, guild, data) {
        /*
        * The client that instantiated this
         * @name Base#client
         * @type {Client}
         * @readonly
         */
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = guild?.id
        this.name = data.name
        this.id = data.id || null
        this.roles = data.roles
        this.animated = data.animated
        this.require_colons = data.require_colons
        this.managed = data.managed
        this.available = data.available
        const User = require('./User')
        this.user = data.user ? new User(client, data.user) : null
    }

    toString(){
        return this.id ? `<${this.animated?'a':''}:${this.name}:${this.id}>` : `${this.name}`
    }

    pack(){
        return {
            name: this.name,
            id: this.id,
            animated: this.animated
        }
    }

    async edit(options){
        return new Promise(async(resolve, reject) => {
            if(typeof options === "undefined") return reject(new TypeError("No data provided"))
            if(typeof options !== "object") return reject(new TypeError("Create emoji options must be a object"))
            if(typeof options.name !== "string") return reject(new TypeError("Create emoji options name must be a string"))
            if(typeof options.roles === "undefined") options.roles = []
            if(typeof options.roles !== "object") return reject(new TypeError("Create emoji options roles must be a array"))
            if(options.roles.find(value => typeof value !== "string")) return reject(new TypeError("Create emoji options roles must contains only roles Id"))
            if(typeof options.reason !== "undefined" && typeof options.reason !== "string") return reject(new TypeError("Create emoji options reason must be string or a undefined value"))
            this.client.rest.patch(this.client._ENDPOINTS.EMOJI(this.guildId, this.id), {
                name: options.name,
                roles: options.roles.length < 1 ? undefined : options.roles,
                "reason": options.reason,
            }).then(res => {
                let newEmoji = new Emoji(this.client, this.client.guilds.get(this.guildId)|this.guild, res)
                Object.keys(newEmoji).map(k => this[k] = newEmoji[k])
                return resolve(newEmoji)
            }).catch(e => {
                return reject(e)
              })
        })
    }

    async delete(reason){
        return new Promise(async(resolve, reject) => {
            if(typeof reason !== "undefined" && typeof reason !== "string") return reject(new TypeError("Delete emoji reason must be a string or a undefined value"))
            this.client.rest.delete(this.client._ENDPOINTS.EMOJI(this.guildId, this.id), {
                "reason": reason,
            }).then(() => {
                return resolve()
            }).catch(e => {
                return reject(e)
              })
        })
    }
}