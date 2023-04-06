const Guild = require('./Guild')
const StageChannel = require('./StageChannel')
const User = require('./User')
const VoiceChannel = require('./VoiceChannel')

module.exports = class Member {
    constructor(client, guild, data) {
        Object.defineProperty(this, 'client', { value: client })
        this.guild = guild
        this.guildId = guild.id
        this.id = data.user.id
        this.premium_since = data.premium_since
        this.pending = data.pending
        this.nick = data.nick
        this.voice = {
            mute: data.mute,
            deaf: data.deaf
        }
        this.joined_at = data.joined_at
        this.joinedTimestamp = new Date(data.joinedTimestamp).getTime()
        this.flags = data.flags
        this.communication_disabled_until = data.communication_disabled_until
        this.avatar = data.avatar
        this.user = this.client.users.get(data.user.id) || new User(client, data.user)
    }

    async edit(data = {}){
        return new Promise(async(resolve, reject) => {
            if(typeof data.nick !== "undefined") {
                if(typeof data.nick !== "string") return reject(new TypeError("The nickname must be a string"))
            }
            if(typeof data.roles !== "undefined"){
                // faire les rôles ici
            }
            if(typeof data.mute !== "undefined") {
                if(typeof data.mute !== "boolean") return reject(new TypeError("The mute state must be a boolean"))
            }
            if(typeof data.deaf !== "undefined") {
                if(typeof data.deaf !== "boolean") return reject(new TypeError("The deaf state must be a boolean"))
            }
            if(typeof data.channel_id !== "undefined"){
                if(data.channel_id instanceof VoiceChannel) data.channel_id = data.channel_id.id
                if(data.channel_id instanceof StageChannel) data.channel_id = data.channel_id.id
                if(data.channel_id !== null && typeof data.channel_id !== "string") return reject(new TypeError("The channel id must be set to null or a valid Id / VoiceChannel instance / StageChannel instance must be provided"))
            }
            if(typeof data.communication_disabled_until !== "undefined") {
                if(typeof data.communication_disabled_until !== "number") return reject(new TypeError("The communication disabled until state must be a number"))
            }
            if(typeof data.flags !== "undefined"){
                if(typeof data.flags !== "number") return reject(new TypeError("The flags state must be a number"))
            }
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
            }).catch(e=>{
                return reject(new Error(e))
            })
        })
    }
}