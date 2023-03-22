const {parseEmoji} = require('../util/index')
const Emoji = require('./Emoji')
module.exports = class ForumTag {
    constructor(data = {}){
        this.id = data.id
        this.name = data.name
        this.moderated = data.moderated
        this.emoji = data.emoji
    }

    pack(){
        if(typeof this.name !== "string") throw new TypeError("The tag name must be a string")
        if(this.name.length < 1 || this.name.length > 20) throw new TypeError("The tag name must be less then 20 caracters and more than 1 caracter")
        if(typeof this.moderated === "undefined") this.moderated = false
        if(typeof this.moderated !== "boolean") throw new TypeError("The tag moderator value must be a boolean")
        let testemoji;
        if(this.emoji instanceof Emoji) this.emoji = this.emoji.pack()
        if(this.emoji && typeof this.emoji === "string") testemoji = parseEmoji(this.emoji)
        if(this.emoji && typeof this.emoji === "string" && (!testemoji || typeof testemoji !== 'object')) throw new TypeError("Invalid emoji")
        if(typeof this.emoji === "object" && this.emoji.name) testemoji = this.emoji
        return {
            id: this.id,
            name: this.name,
            moderated: this.moderated,
            emoji_id: testemoji?.id,
            emoji_name: testemoji?.name
        }
    }
}