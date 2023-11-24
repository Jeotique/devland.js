const { parseEmoji } = require("../util")
const Emoji = require('./Emoji')
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
        this.default_values = roleData.default_values
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
        if(this.default_values && !Array.isArray(this.default_values)) throw new TypeError("default_values must be a array")
        if(this.default_values && this.default_values.filter(d => !d.id).length > 0) throw new TypeError("default_values all values must have a 'id' field")
        if(this.default_values) this.default_values.map(d => d.type = "role")
        if(this.default_values && this.min_values && this.default_values.length < this.min_values) throw new TypeError("default_values must have more (or equal) element of min_values")
        if(this.default_values && this.max_values && this.default_values.length > this.max_values) throw new TypeError("default_values must have less (or equal) element of max_values")
        return {
            type: 6,
            placeholder: this.placeholder,
            max_values: this.max_values || this.min_values ? this.min_values : 1,
            min_values: this.min_values || 0,
            custom_id: this.custom_id || this.customId,
            disabled: this.disabled,
            default_values: this.default_values
        }
    }
}