module.exports.webhookType = {
    Incoming: 1,
    ChannelFollower: 2,
    Application: 3
}
module.exports.ActivityType = {
    Game: 0,
    Streaming: 1,
    Listening: 2,
    Watching: 3,
    Custom: 4,
    Competing: 5
}
module.exports.guildVerificationLevel = {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    VERY_HIGH: 4
}
module.exports.guildMfaLevel = {
    NONE: 0,
    ELEVATED: 1
}
module.exports.guildDefaultMessageNotifications = {
    ALL_MESSAGES: 0,
    ONLY_MENTIONS: 1
}
module.exports.guildExplicitContentFilterLevel = {
    DISABLED: 0,
    MEMBERS_WITHOUT_ROLES: 1,
    ALL_MEMBERS: 2
}
module.exports.guildBoostLevel = {
    NONE: 0,
    TIER_1: 1,
    TIER_2: 2,
    TIER_3: 3
}
module.exports.guildNsfwLevel = {
    DEFAULT: 0,
    EXPLICIT: 1,
    SAFE: 2,
    AGE_RESTRICTED: 3
}
module.exports.channelType = {
    GUILD_TEXT: 0,
    DM: 1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY: 4,
    GUILD_ANNOUNCEMENT: 5,
    ANNOUNCEMENT_THREAD: 10,
    PUBLIC_THREAD: 11,
    PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13,
    GUILD_DIRECTORY: 14,
    GUILD_FORUM: 15,
    GUILD_MEDIA: 16,
}
module.exports.videoQualityMode = {
    AUTO: 1,
    FULL: 2
}
module.exports.PermissionIdType = {
    ROLE: 0,
    USER: 1
}
module.exports.stagePrivacyLevel = {
    PUBLIC: 1,
    GUILD_ONLY: 2,
}
module.exports.ComponentsType = {
    ActionRow: 1,
    Button: 2,
    StringSelect: 3,
    TextInput: 4,
    UserSelect: 5,
    RoleSelect: 6,
    MentionableSelect: 7,
    ChannelSelect: 8
}

module.exports.ButtonStyle = {
    Primary: 1,
    Secondary: 2,
    Success: 3,
    Danger: 4,
    Link: 5
}
module.exports.commandType = {
    CHAT_INPUT: 1,
    USER: 2,
    MESSAGE: 3
}
module.exports.commandOptionsType = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11
}
module.exports.integrationExpireBehavior = {
    RemoveRole: 0,
    Kick: 1,
}
module.exports.interactionType = {
    PING: 1,
    APPLICATION_COMMAND: 2,
    MESSAGE_COMPONENT: 3,
    APPLICATION_COMMAND_AUTOCOMPLETE: 4,
    MODAL_SUBMIT: 5,
}
module.exports.textInputStyle = {
    Short: 1,
    Paragraph: 2
}
module.exports.Colors = {
    DEFAULT: 0x000000,
    WHITE: 0xffffff,
    AQUA: 0x1abc9c,
    GREEN: 0x57f287,
    BLUE: 0x3498db,
    YELLOW: 0xfee75c,
    PURPLE: 0x9b59b6,
    LUMINOUS_VIVID_PINK: 0xe91e63,
    FUCHSIA: 0xeb459e,
    GOLD: 0xf1c40f,
    ORANGE: 0xe67e22,
    RED: 0xed4245,
    GREY: 0x95a5a6,
    NAVY: 0x34495e,
    DARK_AQUA: 0x11806a,
    DARK_GREEN: 0x1f8b4c,
    DARK_BLUE: 0x206694,
    DARK_PURPLE: 0x71368a,
    DARK_VIVID_PINK: 0xad1457,
    DARK_GOLD: 0xc27c0e,
    DARK_ORANGE: 0xa84300,
    DARK_RED: 0x992d22,
    DARK_GREY: 0x979c9f,
    DARKER_GREY: 0x7f8c8d,
    LIGHT_GREY: 0xbcc0c0,
    DARK_NAVY: 0x2c3e50,
    BLURPLE: 0x5865f2,
    GREYPLE: 0x99aab5,
    DARK_BUT_NOT_BLACK: 0x2c2f33,
    NOT_QUITE_BLACK: 0x23272a,
  }
module.exports.AutoModEventType = {
    MESSAGE_SEND: 1
}
module.exports.AutoModTriggerType = {
    KEYWORD: 1,
    SPAM: 3,
    KEYWORD_PRESET: 4,
    MENTION_SPAM: 5
}
module.exports.AutoModTriggerPresets = {
    PROFANITY: 1,
    SEXUAL_CONTENT: 2,
    SLURS: 3
}
module.exports.AutoModActionType = {
    BLOCK_MESSAGE: 1,
    SEND_ALERT_MESSAGE: 2,
    TIMEOUT: 3
}
module.exports.eventPrivacyLevel = {
    GUILD_ONLY: 2
}
module.exports.eventEntityType = {
    STAGE_INSTANCE: 1,
    VOICE: 2,
    EXTERNAL: 3
}
module.exports.eventStatus = {
    SCHEDULED: 1,
    ACTIVE: 2,
    COMPLETED: 3,
    CANCELED: 4
}