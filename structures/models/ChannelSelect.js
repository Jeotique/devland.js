const { parseEmoji } = require("../util")
const Emoji = require('./Emoji')
module.exports = class ChannelSelect {
    /**
     * 
     * @param {object} channelData 
     */
    constructor(channelData = {}){
        this.type = 8
        this.placeholder = channelData.placeholder
        this.max_values = channelData.max_values
        this.min_values = channelData.min_values
        this.custom_id = channelData.custom_id || channelData.customId
        this.customId = channelData.customId || channelData.custom_id
        this.disabled = channelData.disabled
        this.channelTypes = channelData.channelTypes || []
        this.channel_types = channelData.channel_types || channelData.channelTypes || []
        this.default_values = channelData.default_values
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
        if(this.channelTypes.length < 1) this.channelTypes = undefined
        else if(this.channelTypes.find(type => type < 0 || type > 15)) throw new TypeError("invalid channel type provided")
        if(this.channelTypes && this.channelTypes.length > 0) this.channel_types = this.channelTypes
        else if(this.channel_types.length < 1) this.channel_types = undefined
        if(this.channel_types && this.channel_types.find(type => type > 0 || type > 15)) throw new TypeError("invalid channel type provided")
        if(this.default_values && !Array.isArray(this.default_values)) throw new TypeError("default_values must be a array")
        if(this.default_values && this.default_values.filter(d => !d.id).length > 0) throw new TypeError("default_values all values must have a 'id' field")
        if(this.default_values) this.default_values.map(d => d.type = "channel")
        if(this.default_values && this.min_values && this.default_values.length < this.min_values) throw new TypeError("default_values must have more (or equal) element of min_values")
        if(this.default_values && this.max_values && this.default_values.length > this.max_values) throw new TypeError("default_values must have less (or equal) element of max_values")
        return {
            type: 8,
            placeholder: this.placeholder,
            max_values: this.max_values || this.min_values ? this.min_values : 1,
            min_values: this.min_values || 0,
            custom_id: this.custom_id || this.customId,
            disabled: this.disabled,
            channel_types: this.channel_types,
            default_values: this.default_values
        }
    }
}