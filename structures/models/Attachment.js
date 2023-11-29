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
        /**
     * The client that instantiated this
     * @name Base#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client })
        this.message = message
        this.id = data.id
        this.filename = data.filename
        this.description = data.description
        this.contentType = data.content_type
        this.contentScanVersion = data.content_scan_version
        this.size = data.size
        this.url = data.url
        this.proxyUrl = data.proxy_url
        this.height = data.height
        this.width = data.width
        this.ephemeral = data.ephemeral
        this.isVoiceMessage = this.contentType?.includes("audio")
        this.durationSeconds = data.duration_secs
        this.waveform = data.waveform
    }

    pack(){
        return {
            id: this.id,
            filename: this.filename,
            description: this.description,
            content_type: this.content_type,
            size: this.size,
            url: this.url,
            proxy_url: this.proxy_url,
            height: this.height,
            width: this.width,
            ephemeral: this.ephemeral
        }
    }
}