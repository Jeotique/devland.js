const { parseEmoji } = require("../util")
const Emoji = require('./Emoji')
module.exports = class Button {
    /**
     * 
     * @param {object} buttonData 
     */
    constructor(buttonData = {}){
        this.type = 2
        this.label = buttonData.label
        this.style = buttonData.style || 1
        this.custom_id = buttonData.custom_id || buttonData.customId
        this.customId = buttonData.customId || buttonData.custom_id
        this.url = buttonData.url
        this.emoji = buttonData.emoji
        this.disabled = buttonData.disabled
    }

    pack(){
        let testemoji = null;
        if((!this.label && !this.emoji) || (this.label && typeof this.label !== "string")) throw new TypeError("Button label is invalid")
        if(this.label && this.label.length > 80) throw new TypeError("Label max length of 80")
        if(typeof this.style !== "number") throw new TypeError("Button style is invalid")
        if(this.url && typeof this.url !== "string") throw new TypeError("Button url is invalid")
        if(this.emoji instanceof Emoji) this.emoji = this.emoji.pack()
        if(this.emoji && typeof this.emoji === "string") testemoji = parseEmoji(this.emoji)
        if(this.emoji && typeof this.emoji !== "object" && !testemoji || typeof testemoji !== 'object') throw new TypeError("Invalid button emoji")
        if(!testemoji && this.emoji && typeof this.emoji === "object" && this.emoji.name) testemoji = this.emoji
        return {
            type: 2,
            label: this.label,
            style: this.style,
            custom_id: this.style === 5 ? undefined : this.custom_id || this.customId,
            url: this.style === 5 ? this.url : undefined,
            emoji: testemoji,
            disabled: this.disabled
        }
    }
}