const Client = require('../client/client')
const Guild = require('./Guild')
const Message = require('./Message')

module.exports = class Attachment {
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {*} data 
     */
    constructor(client, message, data) {
        this.client = client
        this.message = message
        this.id = data.id
        this.filename = data.filename
        this.description = data.description
        this.contentType = data.content_type
        this.size = data.size
        this.url = data.url
        this.proxyUrl = data.proxy_url
        this.height = data.height
        this.width = data.width
        this.ephemeral = data.ephemeral
    }
}