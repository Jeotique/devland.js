const Client = require('../client/client')

module.exports = class ClientUser {
    constructor(client, data = {}){
        /**
         * @private
         */
        this.client = client
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