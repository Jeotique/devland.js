const { parseEmoji } = require("../util")

module.exports = class RoleSelect {
    /**
     * 
     * @param {object} roleData 
     */
    constructor(roleData = {}){
        this.type = 6
        this.placeholder = roleData.placeholder
        this.max_values = roleData.max_values
        this.min_values = roleData.min_values
        this.custom_id = roleData.custom_id || roleData.customId
        this.customId = roleData.customId || roleData.custom_id
        this.disabled = roleData.disabled
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
            type: 6,
            placeholder: this.placeholder,
            max_values: this.max_values || 1,
            min_values: this.min_values || 0,
            custom_id: this.custom_id || this.customId,
            disabled: this.disabled
        }
    }
}