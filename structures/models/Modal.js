const { parseEmoji } = require("../util")

module.exports = class Modal {
    /**
     * 
     * @param {object} modalData 
     */
    constructor(modalData = {}) {
        this.isModal = true
        this.name = modalData.name
        this.custom_id = modalData.custom_id || modalData.customId
        this.customId = modalData.customId || modalData.custom_id
        this.components = modalData.components || []
        if (!Array.isArray(this.components)) this.components = []
    }

    pack() {
        if (typeof this.name !== "string") throw new TypeError("The modal name must be provided as a string")
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