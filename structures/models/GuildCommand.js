const Permissions = require("../util/BitFieldManagement/Permissions")

module.exports = class GuildCommand {
    constructor(options = {}) {
        this.name = options?.name
        this.name_localizations = options?.name_localizations
        this.type = options?.type
        this.description = options?.description
        this.description_localizations = options?.description_localizations
        this.options = options?.options || []
        this.default_member_permissions = options?.default_member_permissions || null
        this.nsfw = options?.nsfw
        this.id = options?.id,
            this.application_id = options?.application_id
        this.guild_id = options?.guild_id
    }

    pack() {
        if (!this.type || typeof this.type !== "number") this.type = 1
        if (!this.name) throw new TypeError("A name must be provided")
        if (typeof this.name !== "string") throw new TypeError("The name must be a string")
        if (this.name.length > 32) throw new TypeError("Command name have a max length of 32")
        if (this.name_localizations && typeof this.name_localizations === "object") if (Object.keys(this.name_localizations).find(key => this.name_localizations[key].length > 32)) throw new TypeError("Name localizations max length of 32")
        else this.name_localizations = undefined
        if (this.name.includes(" ") && this.type === 1) throw new TypeError("Slash command name cannot contains space")
        if (this.name_localizations && Object.keys(this.name_localizations).find(k => this.name_localizations[k].includes(" "))) throw new TypeError("Slash command name localizations cannot contains space")
        if (this.description && typeof this.description === "string" && this.description.length > 100) throw new TypeError("Command description have a max length of 100")
        else if (this.type !== 1 && this.description) throw new TypeError("Description is available for only CHAT_INPUT command")
        if (typeof this.description !== "string") this.description = undefined
        if (!this.description && this.type === 1) throw new TypeError("You must provide a description for CHAT_INPUT command")
        if (this.description_localizations && typeof this.description_localizations === "object") if (Object.keys(this.description_localizations).find(key => this.description_localizations[key].length > 100)) throw new TypeError("Description localizations max length of 100")
        else if (this.type !== 1 && this.description_localizations && typeof this.description_localizations === "object") throw new TypeError("Description localizations is available for only CHAT_INPUT command")
        else this.description_localizations = undefined
        if (this.options && !Array.isArray(this.options)) throw new TypeError("Command options must be a array")
        if (this.options && this.options.length > 25) throw new TypeError("Command max options length is 25")
        if (this.options && this.options.length > 0 && this.type !== 1) throw new TypeError("Command options are available for CHAT_INPUT type only")
        if (this.options && this.options.length > 0 && this.options.find(op => op.autocomplete && (op.type !== 3 && op.type !== 4 && op.type !== 10))) throw new TypeError("Autocomplete option can only be from the type 'STRING' 'INTEGER' 'NUMBER'")
        else if (typeof this.options !== "object") this.options = undefined
        if (this.default_member_permissions && this.default_member_permissions instanceof Permissions) {
            this.default_member_permissions = this.default_member_permissions.bitfield
        } else if (this.default_member_permissions && typeof this.default_member_permissions === "number") {
            this.default_member_permissions = new Permissions(this.default_member_permissions).bitfield.toString()
        } else if (this.default_member_permissions && typeof this.default_member_permissions === "object") {
            this.default_member_permissions = new Permissions(...this.default_member_permissions).bitfield.toString()
        } else this.default_member_permissions = undefined
        if (typeof this.nsfw !== "undefined" && typeof this.nsfw !== "boolean") throw new TypeError("Command nsfw value must be a boolean")

        return {
            type: this.type,
            name: this.name,
            name_localizations: this.name_localization,
            description: this.description,
            description_localizations: this.description_localizations,
            options: this.options,
            default_member_permissions: this.default_member_permissions,
            nsfw: this.nsfw
        }
    }
}