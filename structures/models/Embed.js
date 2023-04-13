const Utils = require('../util/index')
module.exports = class Embed {
    /**
     * @typedef {object} fieldOptions
     * @property {string} name
     * @property {string} value
     * @property {boolean} inline
     */
    /**
     * @typedef {object} authorOptions
     * @property {string} name
     * @property {string} icon_url
     */
    /**
     * @typedef {object} footerOptions
     * @property {string} text
     * @property {string} icon_url
     */
    /**
     * @typedef {object} imageOptions
     * @property {string} url
     */
    /**
     * @typedef {object} thumbnailOptions
     * @property {string} url
     */
    /**
     * @typedef {object} embedOptions
     * @property {fieldOptions[]} fields
     * @property {string} title
     * @property {string} description
     * @property {string|number} color
     * @property {string|number|Date} timestamp
     * @property {authorOptions} author
     * @property {footerOptions} footer
     * @property {imageOptions|string} image
     * @property {thumbnailOptions|string} thumbnail
     * @property {string} url 
     */
    /**
     * 
     * @param {embedOptions} data 
     */
    constructor(data = {}){
        this.fields = data.fields || []
        this.title = data.title
        this.description = data.description
        this.color = data.color
        this.timestamp = data.timestamp
        this.author = data.author// || {name: undefined, icon_url: undefined}
        this.footer = data.footer// || {text: undefined, icon_url: undefined}
        this.image = data.image//|| {url: undefined}
        this.url = data.url
        this.thumbnail = data.thumbnail// || {url: undefined}
    }

    pack() {
        let packed = {}
        if(typeof this.color !== "undefined") this.color = Utils.resolveColor(this.color)
        if(typeof this.image === 'string') this.image = {url: this.image}
        if(typeof this.thumbnail === 'string') this.thumbnail = {url: this.thumbnail}
        if(typeof this.timestamp !== "undefined") this.timestamp = this.timestamp?.toString()
        for(const [key, value] of Object.entries(this)) packed[key] = value
        return packed
    }
}