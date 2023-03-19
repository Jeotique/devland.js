const Utils = require('../util')
const Client = require('../client/client')

module.exports = class User {
    /**
     * 
     * @param {Client} client
     * @param {*} data 
     */
    constructor(client, data){
        /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client })
        this.username = data.username
        this.publicFlags = data.public_flags
        this.id = data.id
        this.tag = `${data.username}#${data.discriminator}`
        this.discriminator = data.discriminator
        this.displayName = data.displayName
        this.bot = data.bot ? true : false
        this.avatarDecoration = data.avatar_decoration
        this.avatar = data.avatar
        this.createdTimestamp = Utils.getTimestampFrom(this.id)
        this.createdAt = new Date(this.createdTimestamp)
    }
}