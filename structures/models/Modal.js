const { parseEmoji } = require("../util")
const Collector = require("./Collector");
const Message = require("./Message");

module.exports = class Modal {
    /**
     * 
     * @param {object} modalData 
     */
    constructor(modalData = {}) {
        this.isModal = true
        this.name = modalData.name || modalData.title
        this.custom_id = modalData.custom_id || modalData.customId
        this.customId = modalData.customId || modalData.custom_id
        this.components = modalData.components || []
        if (!Array.isArray(this.components)) this.components = []
    }

    createListener(options = {}) {
        if (typeof options !== "object") throw new TypeError("You must provide options for the collector")
        if (typeof options.count !== "undefined") {
            if (typeof options.count !== "number") throw new TypeError("The count must be a number")
        }
        options.type = 'component'
        if (typeof options.time !== "undefined") {
            if (typeof options.time !== "number") throw new TypeError("The time must be a number")
        }
        if (typeof options.componentType !== "undefined") {
            if (typeof options.componentType !== "number") throw new TypeError("The componentType must be a number")
            if (options.componentType < 1 || options.componentType > 8) throw new TypeError("Invalid componentType for the collector")
        }
        options.componentType = 5
        if (typeof options.filter !== "undefined") {
            if (typeof options.filter !== "function") throw new TypeError("The filter must be a filter function for the collector, example : 'filter: (collected) => collected.author.id === message.author.id'")
        }
        if (typeof options.message !== "undefined"){
            if(!(options.message instanceof Message)) throw new TypeError("The message object must be defined")
        }
        let identifier = Date.now()
        this.client.collectorCache[identifier] = new Collector(this.client, this.client.guilds.get(this.guildId) || this.guild, options.message, this.channel, options)
        this.client.collectorCache[identifier]?.on('end', () => {
            delete this.client.collectorCache[identifier]
        })
        return this.client.collectorCache[identifier]
    }

    pack() {
        if (typeof this.name === "undefined") throw new TypeError("The modal name must be provided as a string")
        if (typeof this.customId !== "string" && typeof this.custom_id !== "string") throw new TypeError("The modal custom Id must be provided as a string")
        if (!Array.isArray(this.components)) throw new TypeError("The modal components must be provided as a array")
        if (this.components.length < 1) throw new TypeError("You must provided a minimum of one component in a modal")
        this.components.map(comp => {
            comp.type = 4
            if (typeof comp.custom_id !== "string") throw new TypeError("Component custom Id missing")
            if (typeof comp.label !== "string") throw new TypeError("Component label invalid")
            if (typeof comp.style === "undefined") comp.style = 1
            if (typeof comp.style !== "number") throw new TypeError("Component invalid style")
            if (comp.style < 1 || comp.style > 2) throw new TypeError("Component invalid style")
            if (typeof comp.min_length !== "undefined") {
                if (typeof comp.min_length !== "number") throw new TypeError("Component invalid min_length")
                if (comp.min_length < 0 || comp.min_length > 4000) throw new TypeError("Component invalid min_length (may be between 0 and 4000)")
            }
            if (typeof comp.max_length !== "undefined") {
                if (typeof comp.max_length !== "number") throw new TypeError("Component invalid max_length")
                if (comp.max_length < 1 || comp.max_length > 4000) throw new TypeError("Component invalid max_length (may be between 1 and 4000)")
            }
            if (typeof comp.required !== "boolean") comp.required = false
            if (typeof comp.value !== "undefined") {
                if (typeof comp.value === "number") comp.value = comp.value.toString()
                if (typeof comp.value !== "string") throw new TypeError("Component invalid value")
                if (comp.value.length > 4000) throw new TypeError("Component value invalid length (max 4000)")
            }
            if (typeof comp.placeholder !== "undefined") {
                if (typeof comp.placeholder !== "string") throw new TypeError("Component invalid place holder")
                if (comp.placeholder.length > 100) throw new TypeError("Component place holder invalid length (max 100)")
            }
        })
        let allComp = []
        this.components.map(comp => {
            allComp.push({
                type: 1,
                components: [comp]
            })
        })
        return {
            custom_id: this.custom_id || this.customId,
            title: this.name,
            components: allComp
        }
    }
}