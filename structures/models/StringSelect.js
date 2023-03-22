const { parseEmoji } = require("../util")
const Emoji = require("./Emoji")

module.exports = class StringSelect {
    /**
     * 
     * @param {object} stringData 
     */
    constructor(stringData = {}){
        this.type = 3
        this.placeholder = stringData.placeholder
        this.max_values = stringData.max_values
        this.min_values = stringData.min_values
        this.custom_id = stringData.custom_id || stringData.customId
        this.customId = stringData.customId || stringData.custom_id
        this.options = []
        this.disabled = stringData.disabled
        if(stringData['options'] && stringData['options'].length > 0) {
            this.addOptions(...stringData['options'])
        }
    }

    addOptions(...options){
        options.map(op => {
            if(typeof op !== 'object') throw new TypeError("Option must be an object which contains : label and value for sure, optionnal is description, emoji, default")
            if(this.options.find(o => o.value === op.value)) throw new TypeError("Duplicated value")
            if(!op.label) throw new TypeError("A label must be provided for a string select")
            if(typeof op.label !== "string") throw new TypeError("The label must be a string")
            if(!op.value) throw new TypeError("A value must be provided for a string select")
            if(typeof op.value !== "string") throw new TypeError("The value must be a string")
            let testemoji = null
            if(op.emoji instanceof Emoji) op.emoji = op.emoji.pack()
            if(op.emoji && typeof op.emoji === "string") testemoji = parseEmoji(op.emoji)
            if(op.emoji && typeof op.emoji === "string" && (!testemoji || typeof testemoji !== 'object')) throw new TypeError("Invalid option emoji")
            if(typeof op.emoji === "object" && op.emoji.name) testemoji = op.emoji
            if(op.description && typeof op.description !== "string") throw new TypeError("The description must be a string")
            if(op.default && typeof op.default !== "string") throw new TypeError("The default value must be a string")
            if(op.label.length > 100) throw new TypeError("Label max length of 100")
            if(op.value.length > 100) throw new TypeError("Value max length of 100")
            if(op.description && op.description.length > 100) throw new TypeError("Description max length of 100")
            this.options.push({
                label: op.label,
                value: op.value,
                description: op.description,
                emoji: testemoji ? testemoji : undefined,
                default: op.default
            })
        })
    }

    setOptions(...options){
        this.options = []
        options.map(op => {
            if(typeof op !== 'object') throw new TypeError("Option must be an object which contains : label and value for sure, optionnal is description, emoji, default")
            if(this.options.find(o => o.value === op.value)) throw new TypeError("Duplicated value")
            if(!op.label) throw new TypeError("A label must be provided for a string select")
            if(typeof op.label !== "string") throw new TypeError("The label must be a string")
            if(!op.value) throw new TypeError("A value must be provided for a string select")
            if(typeof op.value !== "string") throw new TypeError("The value must be a string")
            let testemoji = null
            if(op.emoji instanceof Emoji) op.emoji = op.emoji.pack()
            if(op.emoji && typeof op.emoji === "string") testemoji = parseEmoji(op.emoji)
            if(typeof op.emoji === "object" && op.emoji.name) testemoji = op.emoji
            if(op.emoji && !testemoji || typeof testemoji !== 'object') throw new TypeError("Invalid option emoji")
            if(op.description && typeof op.description !== "string") throw new TypeError("The description must be a string")
            if(op.default && typeof op.default !== "string") throw new TypeError("The default value must be a string")
            if(op.label.length > 100) throw new TypeError("Label max length of 100")
            if(op.value.length > 100) throw new TypeError("Value max length of 100")
            if(op.description && op.description.length > 100) throw new TypeError("Description max length of 100")
            this.options.push({
                label: op.label,
                value: op.value,
                description: op.description,
                emoji: testemoji ? testemoji : undefined,
                default: op.default
            })
        })
    }

    pack(){
        if(this.placeholder && typeof this.placeholder !== "string") throw new TypeError("The placeholder must be a string")
        if(this.placeholder && this.placeholder.length > 150) throw new TypeError("Placeholder max length of 150")
        if(this.max_values && typeof this.max_values !== "number") throw new TypeError("The max_values must be a number")
        if(this.max_values && this.max_values < 1) throw new TypeError("max_values the minimum is 1")
        if(this.max_values && this.max_values > 25) throw new TypeError("max_values the maximum is 25")
        if(this.max_values && this.max_values > this.options.length) throw new TypeError("max_values is too big for the options count")
        if(this.min_values && typeof this.min_values !== "number") throw new TypeError("The min_values must be a number")
        if(this.min_values && this.min_values < 0) throw new TypeError("min_values the minimum is 0")
        if(this.min_values && this.min_values > 25) throw new TypeError("min_values the maximum is 25")
        if(this.min_values && this.min_values > this.options.length) throw new TypeError("min_values is too big for the options count")
        if(this.options.length < 1) throw new TypeError("You need to provide a minimum of one option") 
        return {
            type: 3,
            placeholder: this.placeholder,
            max_values: this.max_values || this.options.length,
            min_values: this.min_values || 0,
            custom_id: this.custom_id || this.customId,
            options: this.options,
            disabled: this.disabled
        }
    }
}