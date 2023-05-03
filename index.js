const Client = require('./structures/client/client')
const {Colors, parseEmoji, resolveColor} = require('./structures/util')
const Attachment = require('./structures/models/Attachment')
const Guild = require('./structures/models/Guild')
const Message = require('./structures/models/Message')
const Embed = require('./structures/models/Embed')
const TextChannel = require('./structures/models/TextChannel')
const VoiceChannel = require('./structures/models/VoiceChannel')
const CategoryChannel = require('./structures/models/CategoryChannel')
const Thread = require('./structures/models/Thread')
const AnnouncementChannel = require('./structures/models/AnnouncementChannel')
const StageChannel = require('./structures/models/StageChannel')
const ForumChannel = require('./structures/models/ForumChannel')
const DmChannel = require('./structures/models/DmChannel')
const User = require('./structures/models/User')
const ActionRow = require('./structures/models/ActionRow')
const Button = require('./structures/models/Button')
const StringSelect = require('./structures/models/StringSelect')
const RoleSelect = require('./structures/models/RoleSelect')
const UserSelect = require('./structures/models/UserSelect')
const MentionableSelect = require('./structures/models/MentionableSelect')
const ChannelSelect = require('./structures/models/ChannelSelect')
const Permissions = require('./structures/util/BitFieldManagement/Permissions')
const ActivityFlags = require('./structures/util/BitFieldManagement/ActivityFlags')
const MemberFlags = require('./structures/util/BitFieldManagement/MemberFlags')
const UserFlags = require('./structures/util/BitFieldManagement/UserFlags')
const MessageFlags = require('./structures/util/BitFieldManagement/MessageFlags')
const IntentFlags = require('./structures/util/BitFieldManagement/IntentFlags')
const GuildCommand = require('./structures/models/GuildCommand')
const ForumTag = require('./structures/models/ForumTag')
const {Store} = require('./structures/util/Store/Store')
const Emoji = require('./structures/models/Emoji')
const Member = require('./structures/models/Member')
const Role = require('./structures/models/Role')
const Log = require('./structures/models/Log')
const Invite = require('./structures/models/Invite')
const Webhook = require('./structures/models/Webhook')
const Integration = require('./structures/models/Integration')
const VoiceState = require('./structures/models/VoiceState')
const Interaction = require('./structures/models/Interaction')
const Modal = require('./structures/models/Modal')
const Collector = require('./structures/models/Collector')
const Presence = require('./structures/models/Presence')
const AutoModRule = require('./structures/models/AutoModRule')
const ShardingManager = require('./structures/sharding/ShardingManager')
const Shard = require('./structures/sharding/Shard')
const ShardClientUtil = require('./structures/sharding/ShardClientUtil')
const {webhookType, ActivityType, guildVerificationLevel, guildMfaLevel, guildDefaultMessageNotifications, guildExplicitContentFilterLevel, guildBoostLevel, guildNsfwLevel, channelType, videoQualityMode, PermissionIdType, stagePrivacyLevel, ComponentsType, ButtonStyle, commandType, commandOptionsType, integrationExpireBehavior, interactionType, textInputStyle, AutoModEventType, AutoModTriggerType, AutoModTriggerPresets, AutoModActionType, eventPrivacyLevel, eventEntityType, eventStatus} = require('./structures/types/enum')
const {version} = require('./package.json')
const RESTHandler = require('./structures/rest/RESTHandler')
const clientWebSocket = require('./structures/gateway/webSocket')
const ScheduledEvent = require('./structures/models/ScheduledEvent')
module.exports = {

    /** brut value */
    version,

    /** Functions */
    parseEmoji,
    resolveColor,
    
    /** All classes */
    RESTHandler,
    clientWebSocket,
    Client,
    Attachment,
    Guild,
    Message,
    Embed,
    TextChannel,
    VoiceChannel,
    CategoryChannel,
    AnnouncementChannel,
    Thread,
    StageChannel,
    ForumChannel,
    DmChannel,
    User,
    ActionRow,
    Button,
    StringSelect,
    RoleSelect,
    UserSelect,
    MentionableSelect,
    ChannelSelect,
    GuildCommand,
    ForumTag,
    Store,
    Emoji,
    Member,
    Role,
    Log,
    Invite,
    Webhook,
    Integration,
    VoiceState,
    Interaction,
    Modal,
    Collector,
    Presence,
    AutoModRule,
    ScheduledEvent,

    /** Shard system */
    ShardingManager,
    Shard,
    ShardClientUtil,

    /** Flags (bitfield) */
    Permissions,
    ActivityFlags,
    MemberFlags,
    UserFlags,
    MessageFlags,
    IntentFlags,

    /** All Enumerations */
    Colors,
    webhookType,
    ActivityType, 
    guildVerificationLevel,
    guildMfaLevel, 
    guildDefaultMessageNotifications, 
    guildExplicitContentFilterLevel, 
    guildBoostLevel, 
    guildNsfwLevel, 
    channelType, 
    videoQualityMode, 
    PermissionIdType, 
    stagePrivacyLevel, 
    ComponentsType, 
    ButtonStyle, 
    commandType, 
    commandOptionsType, 
    integrationExpireBehavior, 
    interactionType,
    textInputStyle, 
    AutoModEventType,
    AutoModTriggerType,
    AutoModTriggerPresets,
    AutoModActionType,
    eventPrivacyLevel,
    eventEntityType,
    eventStatus,
}