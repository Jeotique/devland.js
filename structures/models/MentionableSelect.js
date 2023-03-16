const { parseEmoji } = require("../util")

module.exports = class MentionableSelect {
    /**
     * 
     * @param {object} mentionableData 
     */
    constructor(mentionableData = {}){
        this.type = 7
        this.placeholder = mentionableData.placeholder
        this.max_values = mentionableData.max_values
        this.min_values = mentionableData.min_values
        this.custom_id = mentionableData.custom_id || mentionableData.customId
        this.customId = mentionableData.customId || mentionableData.custom_id
        this.disabled = mentionableData.disabled
    }

    pack(){
        if(this.placeholder && typeof this.placeholder !== "string") throw new TypeError("The placeholder must be a string")
        if(this.placeholder && this.placeholder.length > 150) throw new TypeError("Placeholder max length of 150")
        if(this.max_values && typeof this.max_values !== "number") throw new TypeError("The max_values must be a number")
        if(this.max_values && this.max_values < 1) throw new TypeError("max_values the minimum is 1")
        if(this.max_values && this.max_values > 25) throw new TypeError("max_values the maximum is 25")
        if(this.min_values && typeof this.min_values !== "number") throw new TypeError("The min_values must be a number")
        if(this.min_values && this.min_values < 0) throw new TypeError("min_values the minimum is 0")
        if(this.min_values && this.min_values > 25) throw new TypeError("min_values the maximum is 25")
        return {
            type: 7,
            placeholder: this.placeholder,
            max_values: this.max_values || 1,
            min_values: this.min_values || 0,
            custom_id: this.custom_id || this.customId,
            disabled: this.disabled
        }
    }
}