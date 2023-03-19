const Client = require('../client/client')

module.exports = class ClientUser {
    constructor(client, data = {}){
        /**
         * @private
         */
        /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client })
        /**
         * @type {boolean}
         */
        this.verified = data.verified
        /**
         * @type {string}
         */
        this.username = data.username
        /**
         * @type {boolean}
         */
        this.mfa_enabled = data.mfa_enabled
        /**
         * @type {string}
         */
        this.id = data.id
        /**
         * @type {number}
         */
        this.flags = data.flags
        /**
         * @type {string}
         */
        this.email = data.email
        /**
         * @type {string}
         */
        this.discriminator = data.discriminator
        /**
         * @type {boolean}
         */
        this.bot = data.bot
        /**
         * @type {string}
         */
        this.avatar = data.avatar
        /**
         * @type {string}
         */
        this.tag = data.tag
    }
}