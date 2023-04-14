import EventEmitter from "events"
import ws from 'ws'
import Store from '../util/Store/Store'
declare module 'devland.js' {
    
    type clientOptions = {
        connect: boolean;
        ws: wsOptions;
        presence: presenceOptions;
        intents: IntentFlagString[]|number;
        token: string;
        messagesLifeTime: number;
        guildsLifeTime: number;
        channelsLifeTime: number;
        usersLifeTime: number;
        threadsLifeTime: number;
        membersLifeTime: number;
        rolesLifeTime: number;
        invitesLifeTime: number;
        presencesLifeTime: number;
        voicesLifeTime: number;
        waitCacheBeforeReady: boolean;
    }
    type wsOptions = {
        large_threshold: number;
        compress: boolean;
        properties: propertiesOptions;
    }
    type propertiesOptions = {
        $os: string | NodeJS.Platform;
        $browser: string;
        $device: string;
    }
    type presenceOptions = {
        status: "dnd" | "online" | "invisible" | "idle" | "offline";
        afk: boolean;
        activities: simpleActivity[];
        since: number;
    }
    type simpleActivity = {
        name: string,
        type: ActivityType,
        url?: string,
    }
    export enum ActivityType {
        Game = 0,
        Streaming = 1,
        Listening = 2,
        Watching = 3,
        Custom = 4,
        Competing = 5
    }
    type wsClientData = {
        socket: ws,
        connected: boolean,
        gateway: gatewayClientData,
        ping: number|null,
    }
    type gatewayClientData = {
        url: string,
        obtainedAt: number,
        heartbeat: heartbeatClientData,
    }
    type heartbeatClientData = {
        interval: number,
        last: number,
        recieved: boolean,
        seq: any,
    }
    export type Awaitable<T> = T | PromiseLike<T>;
    export class Client extends EventEmitter {
        constructor(options: clientOptions);
        readonly ready: boolean;
        private _ENDPOINTS: object;
        readonly token: string;
        readonly readyAt: number;
        readonly ws: wsClientData;
        readonly sessionID: string;
        private rest: RESTHandler;
        private readonly guildsIds: [string];
        readonly user: Client.ClientUser;
        readonly messages: Store<string, Message>;
        readonly guilds: Store<string, Guild>;
        readonly textChannels: Store<string, TextChannel>;
        readonly voiceChannels: Store<string, VoiceChannel>;
        readonly categoryChannels: Store<string, CategoryChannel>;
        readonly announcementChannels: Store<string, AnnouncementChannel>;
        readonly threadChannels: Store<string, Thread>;
        readonly users: Store<string, User>;
        readonly stageChannels: Store<string, StageChannel>;
        readonly forumChannels: Store<string, ForumChannel>;
        private readonly dmChannels: Store<string, DmChannel>;
        private readonly collectorCache: Store<number, Collector>;
        private readonly deletedmessages: Store<string, Message>;
        readonly version: string;
        connect(token?: string): Client;
        toJSON(): JSON;
        fetchGuilds(max?: number): Promise<Store<string, Guild>>;
        fetchGuild(guildId: string | Guild): Promise<Guild>;
        fetchUser(userId: string | User): Promise<User>;

        public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof ClientEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof ClientEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
        public emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: unknown[]): boolean;
        public off<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof ClientEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public removeAllListeners<K extends keyof ClientEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ClientEvents>): this;
    }
    type invalid_Message = {
        error: string;
        guild: Guild;
        channel: TextChannel;
        id: string;
        data_is_available: boolean;
    }
    type invalid_Guild = {
        error: string;
        id: string;
        data_is_available: boolean;
    }
    type invalid_Channel = {
        error: string;
        id: string;
        data_is_available: boolean;
    }
    type invalid_Thread = {
        error: string,
        id: string,
        data_is_available: boolean,
    }
    type invalid_User = {
        error: string,
        id: string,
        data_is_available: boolean,
    }
    type invalid_Member = {
        error: string,
        id: string,
        data_is_available: boolean,
    }
    type invalid_Role = {
        error: string,
        id: string,
        data_is_available: boolean,
    }
    type invalid_Invite = {
        error: string,
        code: string,
        guild?: Guild,
        channel?: TextChannel | VoiceChannel | AnnouncementChannel | Thread | StageChannel | ForumChannel
        data_is_available: boolean,
    }
    type invalid_Presence = {
        error: string,
        id: string,
        guild?: Guild,
        data_is_available: boolean,
    }
    type invalid_VoiceState = {
        error: string,
        id: string,
        guild?: Guild,
        data_is_available: boolean,
    }
    type threadMembersUpdateData = {
        id: string,
        guild: Guild,
        guild_id: string,
        member_count: number,
        added_members: Store<String, Member>;
        removed_members?: string[];
    }
    interface ClientEvents {
        debug: [data: string];
        ready: [client: Client];
        message: [message: Message];
        messageUpdate: [message: Message | invalid_Message, message: Message];
        messageDelete: [message: Message | invalid_Message];
        guildAvailable: [guild: Guild];
        guildAdded: [guild: Guild];
        guildRemoved: [guild: Guild | invalid_Guild];
        guildUpdate: [old_guild: Guild | invalid_Guild, guild: Guild];
        channelCreate: [channel: TextChannel | VoiceChannel | CategoryChannel | AnnouncementChannel | StageChannel | ForumChannel];
        channelCreateText: [channel: TextChannel];
        channelCreateVoice: [channel: VoiceChannel];
        channelCreateCategory: [channel: CategoryChannel];
        channelCreateAnnouncement: [channel: AnnouncementChannel];
        channelCreateStage: [channel: StageChannel];
        channelCreateForum: [channel: ForumChannel];
        channelUpdate: [old_channel: TextChannel | VoiceChannel | CategoryChannel | AnnouncementChannel | StageChannel | ForumChannel | invalid_Channel, channel: TextChannel | VoiceChannel | CategoryChannel | AnnouncementChannel | StageChannel | ForumChannel];
        channelUpdateText: [old_channel: TextChannel | invalid_Channel, channel: TextChannel];
        channelUpdateVoice: [old_channel: VoiceChannel | invalid_Channel, channel: VoiceChannel];
        channelUpdateCategory: [old_channel: CategoryChannel | invalid_Channel, channel: CategoryChannel];
        channelUpdateAnnouncement: [old_channel: AnnouncementChannel | invalid_Channel, channel: AnnouncementChannel];
        channelUpdateStage: [old_channel: StageChannel | invalid_Channel, channel: StageChannel];
        channelUpdateForum: [old_channel: ForumChannel | invalid_Channel, channel: ForumChannel];
        channelDelete: [channel: TextChannel | VoiceChannel | CategoryChannel | AnnouncementChannel | StageChannel | ForumChannel | invalid_Channel];
        channelDeleteText: [channel: TextChannel | invalid_Channel];
        channelDeleteVoice: [channel: VoiceChannel | invalid_Channel];
        channelDeleteCategory: [channel: CategoryChannel | invalid_Channel];
        channelDeleteAnnouncement: [channel: AnnouncementChannel | invalid_Channel];
        channelDeleteStage: [channel: StageChannel | invalid_Channel];
        channelDeleteForum: [channel: ForumChannel | invalid_Channel];
        threadCreate: [thread: Thread];
        threadDelete: [thread: Thread | invalid_Thread];
        threadUpdate: [old_thread: Thread | invalid_Thread, thread: Thread];
        userUpdate: [old_user: User | invalid_User, user: User];
        stageInstanceCreate: [stage: StageInstance];
        stageInstanceUpdate: [stage: StageInstance];
        stageInstanceDelete: [stage: StageInstance];
        memberJoin: [member: Member];
        memberUpdate: [old_member: Member | invalid_Member, member: Member];
        memberLeave: [member: Member | invalid_Member];
        roleCreate: [role: Role];
        roleUpdate: [old_role: Role | invalid_Role, role: Role];
        roleFakeUpdate: [old_role: Role, role: Role];
        roleDelete: [role: Role | invalid_Role];
        memberBan: [user: User | invalid_User, guild: Guild];
        memberUnban: [user: User | invalid_User, guild: Guild];
        inviteCreate: [invite: Invite];
        inviteDelete: [invite: Invite | invalid_Invite];
        webhookCreate: [channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel];
        webhookUpdate: [channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel];
        webhookDelete: [channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel];
        channelPinsUpdate: [channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel];
        threadMemberUpdate: [member: Member];
        threadMembersUpdate: [data: threadMembersUpdateData];
        guildAuditLogEntryCreate: [log: Log];
        guildEmojisUpdate: [guild: Guild, emojis: Store<String, Emoji>];
        guildIntegrationsUpdate: [guild: Guild];
        integrationCreate: [integration: Integration];
        integrationUpdate: [integration: Integration];
        integrationDelete: [guild: Guild, application_id?: string];
        messageBulkDelete: [guild: Guild|undefined, channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel, messages: Store<String, Message>, messageIds: string[]];
        messageReactionAdd: [data: {
            guild?: Guild,
            channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel,
            message?: Message,
            user?: User,
            member?: Member,
            emoji: Emoji
        }];
        messageReactionRemove: [data: {
            guild?: Guild,
            channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel,
            message?: Message,
            user?: User,
            emoji: Emoji
        }];
        messageReactionAllRemove: [guild: Guild|undefined, channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel, message: Message|undefined];
        messageReactionRemoveEmoji: [guild: Guild|undefined, channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel, message: Message|undefined, emoji: Emoji];
        presenceUpdate: [old_presence: Presence | invalid_Presence, presence: Presence];
        webhooksUpdate: [channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel];
        userTypingStart: [guild: Guild|undefined, channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel, user: User, member: Member|undefined, timestamp: number];
        voiceStateUpdate: [old_voice_state: VoiceState | invalid_VoiceState, voice_state: VoiceState];
        voiceServerUpdate: [voice_server: {
            guild: Guild,
            token: string,
            endpoint: string,
        }];
        interaction: [interaction: Interaction];
        autoModRuleCreate: [rule: AutoModRule];
        autoModRuleUpdate: [rule: AutoModRule];
        autoModRuleDelete: [rule: AutoModRule];
        autoModRuleExecution: [data: AutoModExec];
    }
    type AutoModExec = {
        guild_id: string,
        action: AutoModActions,
        rule_id: string,
        rule_trigger_type: AutoModTriggerType,
        user_id: string,
        channel_id?: string,
        message_id?: string,
        alert_system_message_id?: string,
        content: string,
        matched_keyword?: string,
        matched_content?: string
    }
    class RESTHandler {
        private constructor(client: Client);
        readonly handling: boolean;
        readonly _ratelimits: [];
        queueRequest(token?: string, endpoint?: string, method?: string, data?: any, options?: any): Promise<any>;
        executeRequest(req: Request): Promise<any>;
        handle();
        request(endpoint?: string, method?: string, data?: any, options?: object);
        get(endpoint: string): Promise<any>
        getQuery(endpoint: string, query: any): Promise<any>;
        post(endpoint: string, body: any, options?: object): Promise<any>;
        put(endpoint: string, body: any, options?: object): Promise<any>;
        patch(endpoint: string, body: any, options?: object): Promise<any>;
        delete(endpoint: string, options?: object): Promise<any>;
    }
    export {Store} from '../util/Store/Store';
    namespace Client {
        export class ClientUser {
            private constructor(client: Client, data: object);
            private client: Client;
            readonly verified: boolean;
            readonly username: string;
            readonly mfa_enabled: boolean;
            readonly id: string;
            readonly flags: UserFlags;
            readonly email: string;
            readonly discriminator: string;
            readonly bot: boolean;
            readonly avatar: string;
            readonly tag: string;
            setPresence(presence: presenceOptions);
            setName(name: string): Promise<ClientUser>;
            setAvatar(avatar: string|Buffer): Promise<ClientUser>;
            private _patch(data: any);
            private _parse(data: object);
        }
    }
    type guildFeatures = "ANIMATED_BANNER" | "ANIMATED_ICON" | "APPLICATION_COMMAND_PERMISSIONS_V2" | "AUTO_MODERATOR" | "BANNER" | "COMMUNITY" | "CREATOR_MODETIZABLE_PROVISIONAL" | "CREATOR_STORE_PAGE" | "DEVELOPER_SUPPORT_SERVER" | "DISCOVERABLE" | "FEATURABLE" | "INVITES_DISABLED" | "INVITE_SPLASH" | "MEMBER_VERIFICATION_GATE_ENABLED" | "MORE_STICKERS" | "NEWS" | "PARTNERED" | "PREVIEW_ENABLED" | "ROLE_ICONS" | "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE" | "ROLE_SUBSCRIPTIONS_ENABLED" | "TICKETED_EVENTS_ENABLED" | "VANITY_URL" | "VERIFIED" | "VIP_REGIONS" | "WELCOME_SCREEN_ENABLED"
    export enum guildVerificationLevel {
        NONE = 0,
        LOW = 1,
        MEDIUM = 2,
        HIGH = 3,
        VERY_HIGH = 4
    }
    export enum guildMfaLevel {
        NONE = 0,
        ELEVATED = 1
    }
    export enum guildDefaultMessageNotifications {
        ALL_MESSAGES = 0,
        ONLY_MENTIONS = 1
    }
    export enum guildExplicitContentFilterLevel {
        DISABLED = 0,
        MEMBERS_WITHOUT_ROLES = 1,
        ALL_MEMBERS = 2
    }
    export enum guildBoostLevel {
        NONE = 0,
        TIER_1 = 1,
        TIER_2 = 2,
        TIER_3 = 3
    }
    type guildPreferredLocale = "id" | "da" | "de" | "en-GB" | "en-US" | "es-ES" | "fr" | "hr" | "it" | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "ro" | "fi" | "sv-SE" | "vi" | "tr" | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko"
    export enum guildNsfwLevel {
        DEFAULT = 0,
        EXPLICIT = 1,
        SAFE = 2,
        AGE_RESTRICTED = 3
    }
    type guildVanityData = {
        code: string | null,
        uses: number | null
    }
    type utilsChannels = {
        systemChannel: TextChannel | null;
        afkTimeout: number;
        afkChannel: VoiceChannel | null;
        widgetChannel: TextChannel | null;
        widgetEnabled: boolean;
        rulesChannel: TextChannel | null;
        safetyChannel: TextChannel | null;
        publicUpdatesChannel: TextChannel | null;
    }
    type createEmojiOptions = {
        name: string,
        roles?: string[],
        image: string|Buffer,
        reason?: string,
    }
    type editGuildOptions = {
        name?: string,
        verification_level?: guildVerificationLevel,
        default_message_notifications?: guildDefaultMessageNotifications,
        explicit_content_filter?: guildExplicitContentFilterLevel,
        afk_channel_id?: string | VoiceChannel,
        afk_timeout?: number,
        icon?: string|Buffer,
        owner_id?: User | string,
        splash?: any,
        discovery_splash?: any,
        banner?: any,
        system_channel_id?: string | TextChannel,
        system_channel_flags?: number | string,
        rules_channel_id?: string | TextChannel,
        public_updates_channel_id?: string | TextChannel,
        peferred_locale?: guildPreferredLocale,
        features?: guildFeatures[],
        description?: string,
        premium_progress_bar_enabled?: boolean,
    }
    type guildChannels = {
        text: Store<String, TextChannel>,
        voice: Store<String, VoiceChannel>,
        category: Store<String, CategoryChannel>,
        announcement: Store<String, AnnouncementChannel>,
        stage: Store<String, StageChannel>,
        forum: Store<String, ForumChannel>,
    }
    type createRoleOptions = {
        name?: string,
        permissions?: Permissions | PermissionResolvable | string[] | number | BitField<string, number>,
        color?: string | number,
        hoist?: boolean,
        unicode_emoji?: Emoji | string,
        icon?: string | Buffer,
        mentionable?: boolean,
        reason?: string,
    }
    type fetchLogsOptions = {
        limit?: number,
        user_id?: string,
        type?: logsType,
    }
    type pruneOptions = {
        days?: number,
        compute_prune_count?: boolean,
        include_roles?: Role[] | string[],
        reason?: string,
    }
    export class Guild {
        private constructor(client: Client, data: object);
        private client: Client;
        readonly id: string;
        readonly name: string;
        readonly icon: string | null;
        readonly description: string | null;
        readonly homeHeader: string | null;
        readonly splash: string | null;
        readonly discovery_splash: string | null;
        readonly features: guildFeatures[];
        readonly banner: string | null;
        readonly ownerId: string;
        readonly region: string;
        readonly member_count: number;
        readonly verification_level: guildVerificationLevel;
        readonly mfaLevel: guildMfaLevel;
        readonly default_message_notifications: guildDefaultMessageNotifications;
        readonly explicit_content_filter: guildExplicitContentFilterLevel;
        readonly max_members: number;
        readonly max_stage_video_channel_users: number;
        readonly max_video_channel_users: number;
        readonly boostLevel: guildBoostLevel;
        readonly boostCount: number;
        readonly system_channel_flags: number;
        readonly preferred_locale: guildPreferredLocale;
        readonly premium_progress_bar_enabled: boolean;
        readonly nsfw: boolean;
        readonly nsfw_level: guildNsfwLevel;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly members: Store<String, Member>;
        readonly roles: Store<String, Role>;
        readonly presences: Store<String, Presence>;
        readonly voicesStates: Store<String, VoiceState>;
        readonly premiumSubscriberRole: Role | null;
        readonly everyoneRole: Role | null;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        fetchVanity(): Promise<guildVanityData>;
        fetchUtilsChannels(): Promise<utilsChannels>;
        setCommands(...commands: GuildCommand[]): Promise<boolean>;
        getCommands(): Promise<GuildCommand[]>;
        deleteCommand(command: GuildCommand | object): Promise<boolean>;
        fetchEmojis(emoji_id?: string | Emoji): Promise<Store<String, Emoji> | Emoji>;
        createEmoji(options: createEmojiOptions): Promise<Emoji>;
        edit(options: editGuildOptions, reason?: string): Promise<Guild>;
        delete(): Promise<void>;
        fetchChannels(): Promise<guildChannels>;
        fetchTextChannels(): Promise<Store<String, TextChannel>>;
        fetchVoiceChannels(): Promise<Store<String, VoiceChannel>>;
        fetchCategoryChannels(): Promise<Store<String, CategoryChannel>>;
        fetchAnnouncementChannels(): Promise<Store<String, AnnouncementChannel>>;
        fetchStageChannels(): Promise<Store<String, StageChannel>>;
        fetchForumChannels(): Promise<Store<String, ForumChannel>>;
        fetchMember(user: User | Member | string): Promise<Member>;
        fetchMembers(options: fetchMembersOptions): Promise<Store<String, Member>>;
        fetchRoles(): Promise<Store<String, Role>>;
        createRole(options?: createRoleOptions): Promise<Role>;
        fetchLogs(options: fetchLogsOptions): Promise<AuditLogs>;
        leave(): Promise<void>;
        kickMember(user: string | User | Member, reason?: string): Promise<Member|undefined>;
        banMember(user: string | User | Member, delete_message_seconds?: number, reason?: string): Promise<Member|undefined>;
        unbanMember(user: string | User | Member, reason?: string): Promise<boolean>;
        fetchBans(): Promise<Store<String, Ban>>;
        fetchBan(user: string | User | Member): Promise<Ban>;
        prune(options: pruneOptions): Promise<Guild>;
        fetchInvite(): Promise<Store<String, Invite>>;
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        fetchIntegrations(): Promise<Store<String, Integration>>;
        fetchAutoModRules(): Promise<Store<String, AutoModRule>>;
        fetchAutoModRule(rule_id: string|AutoModRule): Promise<AutoModRule>;
        createAutoModRule(options: createAutoModRuleOptions): Promise<AutoModRule>;
    }
    type createAutoModRuleOptions = {
        name: string,
        event_type: AutoModEventType,
        trigger_type: AutoModTriggerType,
        trigger_metadata?: AutoModTriggerMetadata,
        actions: AutoModActions[],
        enabled?: boolean,
        exempt_roles?: string[],
        exempt_channels?: string[],
        reason?: string
    }
    type fetchMembersOptions = {
        limit: number,
        after: number
    }
    export class Member {
        constructor(client: Client, guild: Guild, data: any);
        readonly guild: Guild;
        readonly guildId: string;
        readonly id: string;
        readonly premium_since: string;
        readonly pending: boolean;
        readonly nick: string;
        readonly voice: VoiceState;
        readonly joined_at: string;
        readonly joinedTimestamp: number;
        readonly flags: MemberFlags;
        readonly communication_disabled_until: number;
        readonly avatar: string;
        readonly user: User | null;
        readonly roles: string[];
        readonly permissions: Permissions;
        readonly presence: Presence | null;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        edit(data: editMemberOptions): Promise<Member>;
        addRoles(roles: Role | Role[] | string | string[], reason?: string): Promise<Member>;
        removeRoles(roles: Role | Role[] | string | string[], reason?: string): Promise<Member>;
        hasPermissions(permission: string | PermissionResolvable): boolean;
        kick(reason?: string): Promise<Member|undefined>;
        ban(delete_message_seconds?: number, reason?: string): Promise<Member|undefined>;
        fetchRoles(): Promise<Store<String, Role>>;
    }
    type editMemberOptions = {
        nick?: string | null,
        roles?: Role[] | string[],
        mute?: boolean,
        deaf?: boolean,
        channel_id?: string | VoiceChannel | StageChannel | null,
        communication_disabled_until?: number | null,
        flags?: number,
        reason?: string,
    }
    export enum channelType {
        GUILD_TEXT = 0,
        DM = 1,
        GUILD_VOICE = 2,
        GROUP_DM = 3,
        GUILD_CATEGORY = 4,
        GUILD_ANNOUNCEMENT = 5,
        ANNOUNCEMENT_THREAD = 10,
        PUBLIC_THREAD = 11,
        PRIVATE_THREAD = 12,
        GUILD_STAGE_VOICE = 13,
        GUILD_DIRECTORY = 14,
        GUILD_FORUM = 15
    }
    type MessageOptions = {
        content: string,
        embeds: Embed[],
        components: ActionRow[],
        tts: boolean,
        nonce: number | string,
        allowedMentions: allowedMentionsList[],
        files: string[]|filesObject[]|Buffer[],
    }
    type filesObject = {
        attachment: string,
        name: string,
        description: string,
    }
    type allowedMentionsList = "roles" | "users" | "everyone"
    type fetchMessagesOptions = {
        limit?: number,
        around?: string,
        before?: string,
        after?: string
    }
    export enum videoQualityMode {
        AUTO = 1,
        FULL = 2
    }
    export enum PermissionIdType {
        ROLE = 0,
        USER = 1
    }
    type PermissionOverwritesResolvable = {
        id: string | User | Member | Role,
        type?: PermissionIdType,
        allow?: PermissionString[] | PermissionResolvable,
        deny?: PermissionString[] | PermissionResolvable,
    }
    type channelEditOptions = {
        name?: string,
        position?: number,
        topic?: string,
        nsfw?: boolean,
        rate_limit_per_user?: number,
        bitrate?: number,
        user_limit?: number,
        parent_id?: CategoryChannel | string,
        permission_overwrites?: PermissionOverwritesResolvable[],
        rtc_region?: string,
        video_quality_mode?: videoQualityMode,
        available_tags?: ForumTag[] | object,
        default_reaction_emoji?: APIEmoji | string,
        default_thread_rate_limit_per_user?: number,
        default_sort_order?: number,
        default_forum_layout?: number,
    }
    type createWebhookOptions = {
        name: string,
        avatar?: string|Buffer,
        reason?: string,
    }
    type createInviteOptions = {
        max_age?: number,
        max_uses?: number,
        temporary?: boolean,
        unique?: boolean,
        reason?: string
    }
    export class TextChannel {
        private constructor(client: Client, guild: Guild, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly last_message_id: string;
        readonly type: channelType;
        readonly name: string;
        readonly position: number;
        readonly flags: number;
        readonly parent_id: string | null;
        readonly topic: string | null;
        readonly guildId: string;
        readonly rate_limit_per_user: number;
        readonly nsfw: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly data_is_available: boolean;
        readonly permission_overwrites: PermissionOverwritesResolvable[];
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        edit(options: channelEditOptions, reason?: string): Promise<TextChannel>;
        delete(reason?: string, time?: number): Promise<TextChannel>;
        clone(reason?: string, time?: number): Promise<TextChannel>;
        setPosition(position: number): Promise<TextChannel>;
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        getPinnedMessages(): Promise<Store<String, Message>>;
        createWebhook(options: createWebhookOptions): Promise<Webhook>;
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        createCollector(options?: collectorOptions): Collector;
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        createInvite(options?: createInviteOptions): Promise<Invite>;
    }
    export class DmChannel {
        private constructor(client: Client, guild: Guild, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly last_message_id: string;
        readonly type: channelType;
        readonly name: string;
        readonly flags: number;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly user: User;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        getPinnedMessages(): Promise<Store<String, Message>>;
        createCollector(options?: collectorOptions): Collector;
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
    }
    export class ForumChannel {
        private constructor(client: Client, guild: Guild, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly last_message_id: string;
        readonly type: channelType;
        readonly name: string;
        readonly position: number;
        readonly flags: number;
        readonly parent_id: string | null;
        readonly topic: string | null;
        readonly guildId: string;
        readonly rate_limit_per_user: number;
        readonly nsfw: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly data_is_available: boolean;
        readonly permission_overwrites: PermissionOverwritesResolvable[];
        readonly available_tags: ForumTag[];
        readonly default_reaction_emoji: APIEmoji | Emoji | string;
        readonly default_sort_order: number;
        readonly default_forum_layout: number;
        readonly default_auto_archive_duration: 60|1440|4320|10080;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        edit(options: channelEditOptions, reason?: string): Promise<ForumChannel>;
        delete(reason?: string, time?: number): Promise<ForumChannel>;
        clone(reason?: string, time?: number): Promise<ForumChannel>;
        setPosition(position: number): Promise<ForumChannel>;
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        createCollector(options?: collectorOptions): Collector;
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        createInvite(options?: createInviteOptions): Promise<Invite>;
    }
    export type voiceBitrate = 8000 | 128000 | 256000 | 384000;
    export class VoiceChannel {
        private constructor(client: Client, guild: Guild, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly last_message_id: string;
        readonly type: channelType;
        readonly name: string;
        readonly position: number;
        readonly flags: number;
        readonly parent_id: string | null;
        readonly guildId: string;
        readonly rate_limit_per_user: number;
        readonly nsfw: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly data_is_available: boolean;
        readonly permission_overwrites: PermissionOverwritesResolvable[];
        readonly bitrate: voiceBitrate;
        readonly user_limit: number;
        readonly rtc_region: string;
        readonly video_quality_mode: videoQualityMode;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        edit(options: channelEditOptions, reason?: string): Promise<VoiceChannel>;
        delete(reason?: string, time?: number): Promise<VoiceChannel>;
        clone(reason?: string, time?: number): Promise<VoiceChannel>;
        setPosition(position: number): Promise<VoiceChannel>;
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        join();
        leave();
        createCollector(options?: collectorOptions): Collector;
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        createInvite(options?: createInviteOptions): Promise<Invite>;
    }
    type stageStartOptions = {
        topic: string,
        privacy_level?: stagePrivacyLevel,
        send_start_notification?: boolean,
        reason?: string,
    }
    type stageEditOptions = {
        topic?: string,
        privacy_level?: stagePrivacyLevel,
        reason?: string,
    }
    export enum stagePrivacyLevel {
        PUBLIC = 1,
        GUILD_ONLY = 2,
    }
    type StageInstance = {
        id: string,
        guild_id: string,
        channel_id: string,
        topic: string,
        privacy_level: stagePrivacyLevel,
        discoverable_disabled: boolean,
        guild_scheduled_event_id?: string,
    }
    export class StageChannel {
        private constructor(client: Client, guild: Guild, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly last_message_id: string;
        readonly type: channelType;
        readonly name: string;
        readonly position: number;
        readonly flags: number;
        readonly parent_id: string | null;
        readonly guildId: string;
        readonly rate_limit_per_user: number;
        readonly nsfw: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly data_is_available: boolean;
        readonly permission_overwrites: PermissionOverwritesResolvable[];
        readonly bitrate: voiceBitrate;
        readonly user_limit: number;
        readonly rtc_region: string;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        edit(options: channelEditOptions, reason?: string): Promise<StageChannel>;
        delete(reason?: string, time?: number): Promise<StageChannel>;
        clone(reason?: string, time?: number): Promise<StageChannel>;
        setPosition(position: number): Promise<StageChannel>;
        start_stage(options: stageStartOptions): Promise<StageInstance>;
        edit_stage(options: stageEditOptions): Promise<StageInstance>;
        delete_stage(reason?: string): Promise<void>;
        stage(): Promise<StageInstance | void>;
        createInvite(options?: createInviteOptions): Promise<Invite>;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        createCollector(options?: collectorOptions): Collector;
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
    }
    export class CategoryChannel {
        private constructor(client: Client, guild: Guild, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly type: channelType;
        readonly name: string;
        readonly position: number;
        readonly flags: number;
        readonly guildId: string;
        readonly childrens: string[];
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly data_is_available: boolean;
        readonly permission_overwrites: PermissionOverwritesResolvable[];
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        edit(options: channelEditOptions, reason?: string): Promise<CategoryChannel>;
        delete(reason?: string, time?: number): Promise<CategoryChannel>;
        clone(reason?: string, time?: number): Promise<CategoryChannel>;
        setPosition(position: number): Promise<CategoryChannel>;
        fetchTextChannels(): Promise<Store<String, TextChannel>>;
        fetchVoiceChannels(): Promise<Store<String, VoiceChannel>>;
        fetchAnnouncementChannels(): Promise<Store<String, AnnouncementChannel>>;
        fetchStageChannels(): Promise<Store<String, StageChannel>>;
        fetchForumChannels(): Promise<Store<String, ForumChannel>>;
    }
    export class AnnouncementChannel {
        private constructor(client: Client, guild: Guild, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly last_message_id: string;
        readonly type: channelType;
        readonly name: string;
        readonly position: number;
        readonly flags: number;
        readonly parent_id: string | null;
        readonly topic: string | null;
        readonly guildId: string;
        readonly rate_limit_per_user: number;
        readonly nsfw: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly data_is_available: boolean;
        readonly permission_overwrites: PermissionOverwritesResolvable[];
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        edit(options: channelEditOptions, reason?: string): Promise<AnnouncementChannel>;
        delete(reason?: string, time?: number): Promise<AnnouncementChannel>;
        clone(reason?: string, time?: number): Promise<AnnouncementChannel>;
        setPosition(position: number): Promise<AnnouncementChannel>;
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        getPinnedMessages(): Promise<Store<String, Message>>;
        crosspost(message: Message | string): Promise<Message>;
        createWebhook(options: createWebhookOptions): Promise<Webhook>;
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        createCollector(options?: collectorOptions): Collector;
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        createInvite(options?: createInviteOptions): Promise<Invite>;
    }
    type ThreadMetadata = {
        archived: boolean,
        active_timestamp: string,
        auto_archive_duration: number,
        locked: boolean,
        create_timestamp: string,
    }
    export class Thread {
        private constructor(client: Client, guild: Guild, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly last_message_id: string;
        readonly type: channelType;
        readonly name: string;
        readonly flags: number;
        readonly parent_id: string | null;
        readonly guildId: string;
        readonly rate_limit_per_user: number;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly thread_metadata: ThreadMetadata;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        edit(options: channelEditOptions, reason?: string): Promise<Thread>;
        delete(reason?: string, time?: number): Promise<Thread>;
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        getPinnedMessages(): Promise<Store<String, Message>>;
        join(): Promise<void>;
        leave(): Promise<void>;
        add(member: User | Member | string): Promise<void>;
        remove(member: User | Member | string): Promise<void>;
        createCollector(options?: collectorOptions): Collector;
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
    }
    type webhookId = string;
    type getUsersFromReactionOptions = {
        limit: number,
        after?: User | string,
    }
    type simpleInteraction = {
        id: string,
        type: interactionType,
        name?: string,
        user?: User,
    }
    export class Message {
        private constructor(client: Client, guild: Guild, channel: TextChannel, data: object)
        private client: Client;
        readonly guild?: Guild;
        readonly channel: TextChannel | AnnouncementChannel | VoiceChannel | Thread | ForumChannel | DmChannel;
        readonly id: string;
        readonly type: number;
        readonly content: string | undefined;
        readonly channelId: string;
        readonly attachments: Store<String, Attachment>;
        readonly embeds: Embed[];
        readonly memberMentions: Store<String, Member|User>;
        readonly roleMentions: Store<String, Role>;
        readonly channelMentions: Store<String, TextChannel>;
        readonly pinned: boolean;
        readonly mentionEveryone: boolean;
        readonly tts: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly guildId?: string;
        readonly editTimestamp: number | null;
        readonly flags: MessageFlags;
        readonly components: ActionRow[];
        readonly messageReplyied: Message | null;
        readonly deleted: boolean;
        readonly data_is_available: boolean;
        readonly author?: User;
        readonly member?: Member;
        readonly authorId: string | webhookId;
        readonly webhookId?: webhookId;
        readonly interaction?: simpleInteraction;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        edit(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        delete(delay: number): Promise<Message>;
        reply(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        crosspost(): Promise<Message>;
        pinMessage(reason?: string): Promise<void>;
        unpinMessage(reason?: string): Promise<void>;
        react(emoji: APIEmoji | string): Promise<void>;
        unreact(emoji: APIEmoji | string, user?: User | string): Promise<void>;
        getUsersFromReaction(emoji: APIEmoji | string, options?: getUsersFromReactionOptions): Promise<Store<String, User>>;
        deleteAllReactions(emoji?: APIEmoji | string): Promise<void>;
        createComponentsCollector(options?: collectorOptions): Collector;
    }

    export class Attachment {
        constructor(client: Client, message: Message, data: object);
        private client: Client;
        readonly message: Message;
        readonly id: string;
        readonly filename: string;
        readonly description: string | undefined;
        readonly contentType: string | undefined;
        readonly size: number;
        readonly url: string;
        readonly proxyUrl: string;
        readonly height: number | undefined;
        readonly width: number | undefined;
        readonly ephemeral: boolean | undefined;
    }
    type fieldOptions = {
        name: string,
        value: string,
        inline?: boolean
    }
    type authorOptions = {
        name: string,
        icon_url?: string,
        url?: string,
    }
    type footerOptions = {
        text: string,
        icon_url?: string
    }
    type imageOptions = {
        url: string
    }
    type thumbnailOptions = {
        url: string
    }
    type embedOptions = {
        fields?: fieldOptions[],
        title?: string,
        description?: string,
        color?: string | number,
        timestamp?: string | number | Date,
        author?: authorOptions,
        footer?: footerOptions,
        image?: imageOptions | string,
        thumbnail?: thumbnailOptions | string,
        url?: string
    }
    export class Embed {
        constructor(data?: embedOptions | undefined);
        fields: fieldOptions[];
        title: string | undefined;
        description: string | undefined;
        color: string | number | undefined;
        timestamp: string | number | Date | undefined;
        author: authorOptions | undefined;
        footer: footerOptions | undefined;
        image: imageOptions | string | undefined;
        thumbnail: thumbnailOptions;
        url: string | undefined;
    }

    export class User {
        private constructor(client: Client, data: object);
        private client: Client;
        readonly username: string;
        readonly flags: UserFlags;
        readonly id: string;
        readonly tag: string;
        readonly discriminator: string;
        readonly displayName: string | null;
        readonly bot: boolean;
        readonly avatarDecoration: null;
        readonly avatar: string | null;
        readonly createdAt: Date;
        readonly createdTimestamp: number;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchBanner(size?: number): Promise<string>;
    }

    export enum ComponentsType {
        ActionRow = 1,
        Button = 2,
        StringSelect = 3,
        TextInput = 4,
        UserSelect = 5,
        RoleSelect = 6,
        MentionableSelect = 7,
        ChannelSelect = 8
    }

    export enum ButtonStyle {
        Primary = 1,
        Secondary = 2,
        Success = 3,
        Danger = 4,
        Link = 5
    }
    type APIEmoji = {
        animated: boolean,
        id: string | null,
        name: string
    }
    type resolvableComponents = Button | StringSelect | RoleSelect | MentionableSelect | ChannelSelect | userData | buttonData | stringData | roleData | userData | mentionableData | channelData;
    export class ActionRow {
        constructor(...components: resolvableComponents[]);
        readonly components: resolvableComponents[];
        private readonly type: number;
        private pack();
        addComponents(...components: resolvableComponents[]);
    }
    type buttonData = {
        label?: string,
        style: ButtonStyle,
        custom_id?: string,
        customId: string,
        url?: string,
        emoji?: APIEmoji | string,
        disabled?: boolean
    }
    export class Button {
        constructor(button_data?: buttonData | undefined);
        private readonly type: number;
        label?: string | undefined;
        style: ButtonStyle;
        custom_id?: string;
        customId: string;
        url?: string;
        emoji?: APIEmoji | Emoji | string;
        disabled?: boolean;
        private pack();
    }
    type stringData = {
        placeholder?: string,
        custom_id?: string,
        customId: string,
        max_values?: number,
        min_values?: number,
        options: selectOptions[],
        disabled?: boolean
    }
    type selectOptions = {
        label: string,
        value: string,
        description?: string,
        emoji?: APIEmoji | Emoji | string,
        default?: string
    }
    export class StringSelect {
        constructor(string_select_data?: stringData | undefined);
        private readonly type: number;
        placeholder?: string;
        max_values?: number;
        min_values?: number;
        custom_id?: string;
        customId: string;
        options: selectOptions[];
        disabled?: boolean;
        addOptions(...options: selectOptions[]);
        setOptions(...options: selectOptions[]);
        private pack();
    }
    type roleData = {
        placeholder?: string,
        custom_id?: string,
        customId: string,
        max_values?: number,
        min_values?: number,
        disabled?: boolean
    }
    export class RoleSelect {
        constructor(role_select_data?: roleData | undefined);
        private readonly type: number;
        placeholder?: string;
        max_values?: number;
        min_values?: number;
        custom_id?: string;
        customId: string;
        disabled?: boolean;
        private pack();
    }
    type userData = {
        placeholder?: string,
        custom_id?: string,
        customId: string,
        max_values?: number,
        min_values?: number,
        disabled?: boolean
    }
    export class UserSelect {
        constructor(user_select_data?: userData | undefined);
        private readonly type: number;
        placeholder?: string;
        max_values?: number;
        min_values?: number;
        custom_id?: string;
        customId: string;
        disabled?: boolean;
        private pack();
    }
    type mentionableData = {
        placeholder?: string,
        custom_id?: string,
        customId: string,
        max_values?: number,
        min_values?: number,
        disabled?: boolean
    }
    export class MentionableSelect {
        constructor(mentionable_select_data?: mentionableData | undefined);
        private readonly type: number;
        placeholder?: string;
        max_values?: number;
        min_values?: number;
        custom_id?: string;
        customId: string;
        disabled?: boolean;
        private pack();
    }
    type channelData = {
        placeholder?: string,
        custom_id?: string,
        customId: string,
        max_values?: number,
        min_values?: number,
        disabled?: boolean,
        channel_types?: channelType[],
        channelTypes?: channelType[],
    }
    export class ChannelSelect {
        constructor(channel_select_data?: channelData | undefined);
        private readonly type: number;
        placeholder?: string;
        max_values?: number;
        min_values?: number;
        custom_id?: string;
        customId: string;
        disabled?: boolean;
        channel_types?: channelType[];
        channelTypes?: channelType[];
        private pack();
    }
    export function parseEmoji(text: string): APIEmoji;
    export function resolveEmoji(color: string|number): number;
    export type PermissionString =
        | 'CREATE_INSTANT_INVITE'
        | 'KICK_MEMBERS'
        | 'BAN_MEMBERS'
        | 'ADMINISTRATOR'
        | 'MANAGE_CHANNELS'
        | 'MANAGE_GUILD'
        | 'ADD_REACTIONS'
        | 'VIEW_AUDIT_LOG'
        | 'PRIORITY_SPEAKER'
        | 'STREAM'
        | 'VIEW_CHANNEL'
        | 'SEND_MESSAGES'
        | 'SEND_TTS_MESSAGES'
        | 'MANAGE_MESSAGES'
        | 'EMBED_LINKS'
        | 'ATTACH_FILES'
        | 'READ_MESSAGE_HISTORY'
        | 'MENTION_EVERYONE'
        | 'USE_EXTERNAL_EMOJIS'
        | 'VIEW_GUILD_INSIGHTS'
        | 'CONNECT'
        | 'SPEAK'
        | 'MUTE_MEMBERS'
        | 'DEAFEN_MEMBERS'
        | 'MOVE_MEMBERS'
        | 'USE_VAD'
        | 'CHANGE_NICKNAME'
        | 'MANAGE_NICKNAMES'
        | 'MANAGE_ROLES'
        | 'MANAGE_WEBHOOKS'
        | 'MANAGE_EMOJIS_AND_STICKERS'
        | 'USE_APPLICATION_COMMANDS'
        | 'REQUEST_TO_SPEAK'
        | 'MANAGE_THREADS'
        | 'USE_PUBLIC_THREADS'
        | 'CREATE_PUBLIC_THREADS'
        | 'USE_PRIVATE_THREADS'
        | 'CREATE_PRIVATE_THREADS'
        | 'USE_EXTERNAL_STICKERS'
        | 'SEND_MESSAGES_IN_THREADS'
        | 'START_EMBEDDED_ACTIVITIES'
        | 'MODERATE_MEMBERS'
        | 'MANAGE_EVENTS'
        | 'VIEW_CREATOR_MONETIZATION_ANALYTICS'
        | 'USE_SOUNDBOARD';
    export type PermissionFlags = Record<PermissionString, bigint>;
    export type PermissionResolvable = BitFieldResolvable<PermissionString, bigint>;
    export type BitFieldResolvable<T extends string, N extends number | bigint> =
        | RecursiveReadonlyArray<T | N | `${bigint}` | Readonly<BitField<T, N>>>
        | T
        | N
        | `${bigint}`
        | Readonly<BitField<T, N>>;
    export type RecursiveArray<T> = ReadonlyArray<T | RecursiveArray<T>>;

    export type RecursiveReadonlyArray<T> = ReadonlyArray<T | RecursiveReadonlyArray<T>>;
    export class Permissions extends BitField<PermissionString, bigint> {
        public any(permission: PermissionResolvable, checkAdmin?: boolean): boolean;
        public has(permission: PermissionResolvable, checkAdmin?: boolean): boolean;
        public missing(bits: BitFieldResolvable<PermissionString, bigint>, checkAdmin?: boolean): PermissionString[];
        public serialize(checkAdmin?: boolean): Record<PermissionString, boolean>;
        public toArray(): PermissionString[];

        public static ALL: bigint;
        public static DEFAULT: bigint;
        public static STAGE_MODERATOR: bigint;
        public static FLAGS: PermissionFlags;
        public static resolve(permission?: PermissionResolvable): bigint;
    }

    export class BitField<S extends string, N extends number | bigint = number> {
        public constructor(bits?: BitFieldResolvable<S, N>);
        public bitfield: N;
        public add(...bits: BitFieldResolvable<S, N>[]): BitField<S, N>;
        public any(bit: BitFieldResolvable<S, N>): boolean;
        public equals(bit: BitFieldResolvable<S, N>): boolean;
        public freeze(): Readonly<BitField<S, N>>;
        public has(bit: BitFieldResolvable<S, N>): boolean;
        public missing(bits: BitFieldResolvable<S, N>, ...hasParams: readonly unknown[]): S[];
        public remove(...bits: BitFieldResolvable<S, N>[]): BitField<S, N>;
        public serialize(...hasParams: readonly unknown[]): Record<S, boolean>;
        public toArray(...hasParams: readonly unknown[]): S[];
        public toJSON(): N extends number ? number : string;
        public valueOf(): N;
        public [Symbol.iterator](): IterableIterator<S>;
        public static FLAGS: Record<string, number | bigint>;
        public static resolve(bit?: BitFieldResolvable<string, number | bigint>): number | bigint;
    }
    export enum commandType {
        CHAT_INPUT = 1,
        USER = 2,
        MESSAGE = 3
    }
    export enum commandOptionsType {
        SUB_COMMAND = 1,
        SUB_COMMAND_GROUP = 2,
        STRING = 3,
        INTEGER = 4,
        BOOLEAN = 5,
        USER = 6,
        CHANNEL = 7,
        ROLE = 8,
        MENTIONABLE = 9,
        NUMBER = 10,
        ATTACHMENT = 11
    }
    type localizationsOptions = {
        id: string,
        da: string,
        de: string,
        "en-GB": string,
        "en-US": string,
        "es-ES": string,
        fr: string,
        hr: string,
        it: string,
        lt: string,
        hu: string,
        nl: string,
        no: string,
        pl: string,
        "pt-BR": string,
        ro: string,
        fi: string,
        "sv-SE": string,
        vi: string,
        tr: string,
        cs: string,
        el: string,
        bg: string,
        ru: string,
        uk: string,
        hi: string,
        th: string,
        "zh-CN": string,
        ja: string,
        "zh-TW": string,
        ko: string
    }
    type GuildCommandOptions = {
        name: string,
        type?: commandType,
        description?: string,
        options?: commandOptions[],
        default_member_permissions?: PermissionString[] | PermissionResolvable,
        name_localizations?: localizationsOptions,
        description_localizations?: localizationsOptions,
        nsfw?: boolean,
    }
    type commandChoicesOptions = {
        name: string,
        name_localizations?: localizationsOptions,
        value: string | number;
    }
    type commandOptions = {
        type: commandOptionsType,
        name: string,
        name_localizations?: localizationsOptions,
        description: string,
        description_localizations?: localizationsOptions,
        required?: boolean,
        choices?: commandChoicesOptions[],
        options?: commandOptions[],
        channel_types?: channelType[],
        min_value?: number,
        max_value?: number,
        min_length?: number,
        max_length?: number,
        autocomplete?: boolean,
    }
    export class GuildCommand {
        constructor(options: GuildCommandOptions);
        name: string;
        type?: commandType;
        description?: string;
        options?: commandOptions[];
        default_member_permissions?: PermissionString[] | PermissionResolvable;
        name_localizations?: localizationsOptions;
        description_localizations?: localizationsOptions;
        nsfw?: boolean;
    }
    type tagOptions = {
        id?: string,
        name: string,
        moderated?: boolean,
        emoji?: APIEmoji | string,
    }
    export class ForumTag {
        constructor(tag_options: tagOptions);
        id?: string;
        name: string;
        moderated?: boolean;
        emoji?: APIEmoji | Emoji | string;
        private pack();
    }
    type editEmojiOptions = {
        name?: string,
        roles?: string[],
        reason?: string,
    }
    export class Emoji {
        constructor(client: Client, guild: Guild, data: any);
        private client: Client;
        readonly guild?: Guild;
        readonly guildId?: string;
        readonly name: string;
        readonly id: string;
        readonly roles: [];
        readonly animated: boolean;
        readonly require_colons: boolean;
        readonly managed: boolean;
        readonly available: boolean;
        readonly user?: User;
        private pack();
        edit(options: editEmojiOptions): Promise<Emoji>;
        delete(reason?: string): Promise<void>;
    }
    type editRoleOptions = {
        name?: string,
        permissions?: Permissions | PermissionResolvable | string[] | number | BitField<string, number>,
        color?: string | number,
        hoist?: boolean,
        unicode_emoji?: Emoji | string,
        icon?: string|Buffer,
        mentionable?: boolean,
        position?: number,
        reason?: string,
    }
    export class Role {
        constructor(client: Client, guild: Guild, data: any);
        private client: Client;
        readonly guild: Guild;
        readonly id: string;
        readonly version: number;
        readonly unicode_emoji: string | null;
        readonly tags: object;
        readonly position: number;
        readonly permissions_new: Permissions;
        readonly permissions: Permissions;
        readonly name: string;
        readonly mentionable: boolean;
        readonly managed: boolean;
        readonly icon: string | null;
        readonly hoist: boolean;
        //readonly flags: number;
        readonly color: number;
        readonly data_is_available: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        edit(options: editRoleOptions): Promise<Role>;
        delete(reason?: string): Promise<Role>;
        readonly hexColor: string;
        comparePositions(role: Role | string): number;
    }
    export class AuditLogs {
        constructor(client: Client, data: any);
        private client: Client;
        readonly entries: Store<String, Log>;
    }
    type logsType = "GUILD_UPDATE" | "CHANNEL_CREATE" | "CHANNEL_UPDATE" | "CHANNEL_DELETE" | "CHANNEL_OVERWRITE_CREATE" | "CHANNEL_OVERWRITE_UPDATE" | "CHANNEL_OVERWRITE_DELETE" | "MEMBER_KICK" | "MEMBER_PRUNE" | "MEMBER_BAN_ADD" | "MEMBER_BAN_REMOVE" | "MEMBER_UPDATE" | "MEMBER_ROLE_UPDATE" | "MEMBER_MOVE" | "MEMBER_DISCONNECT" | "BOT_ADD" | "ROLE_CREATE" | "ROLE_UPDATE" | "ROLE_DELETE" | "INVITE_CREATE" | "INVITE_UPDATE" | "INVITE_DELETE" | "WEBHOOK_CREATE" | "WEBHOOK_UPDATE" | "WEBHOOK_DELETE" | "EMOJI_CREATE" | "EMOJI_UPDATE" | "EMOJI_DELETE" | "MESSAGE_DELETE" | "MESSAGE_BULK_DELETE" | "MESSAGE_PIN" | "MESSAGE_UNPIN" | "INTEGRATION_CREATE" | "INTEGRATION_UPDATE" | "INTEGRATION_DELETE" | "STAGE_INSTANCE_CREATE" | "STAGE_INSTANCE_UPDATE" | "STAGE_INSTANCE_DELETE" | "STICKER_CREATE" | "STICKER_UPDATE" | "STICKER_DELETE" | "GUILD_SCHEDULED_EVENT_CREATE" | "GUILD_SCHEDULED_EVENT_UPDATE" | "GUILD_SCHEDULED_EVENT_DELETE" | "THREAD_CREATE" | "THREAD_UPDATE" | "THREAD_DELETE";
    export class Log {
        constructor(client: Client, data: any);
        private client: Client;
        readonly id: string;
        readonly guild: Guild;
        readonly guildId: string;
        readonly executor: User;
        readonly type: logsType;
        readonly targetId?: string;
        readonly changes?: [];
        readonly reason: string | null;
        readonly extra?: [] | null;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
    }
    export class Ban {
        constructor(client: Client, data: any);
        readonly reason?: string;
        readonly user: User;
    }
    export class Invite {
        constructor(client: Client, guild: Guild, data: any, channel?: any);
        private client: Client;
        readonly code: string;
        readonly expire_At: string | number;
        readonly guild: Guild;
        readonly guildId: string;
        readonly channel?: TextChannel | VoiceChannel | AnnouncementChannel | Thread | StageChannel | ForumChannel | null;
        readonly channelId: string;
        readonly inviter?: User;
        readonly uses: number;
        readonly maxUses: number;
        readonly maxAge: number;
        readonly temporary: boolean;
        readonly createdAt: string | number;
        readonly guild_scheduled_event?: object;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        delete(reason?: string): Promise<Invite>;
    }
    export enum webhookType {
        Incoming = 1,
        ChannelFollower = 2,
        Application = 3
    }
    type partialGuild = {
        id: string,
        name: string,
        icon: string,
    }
    type partialChannel = {
        id: string,
        name: string,
    }
    type editWebhookOptions = {
        name: string,
        avatar?: string|Buffer,
        channel_id?: string | TextChannel | AnnouncementChannel | ForumChannel,
        reason?: string,
    }
    export class Webhook {
        constructor(client: Client, guild: Guild, data: any);
        private client: Client;
        readonly guild?: Guild;
        readonly guildId?: string;
        readonly id: string;
        readonly type: webhookType;
        readonly channel: TextChannel | AnnouncementChannel | null;
        readonly channelId?: string;
        readonly user: User | null;
        readonly name: string;
        readonly avatar: string;
        readonly token?: string;
        readonly application_id: string;
        readonly source_guild?: partialGuild;
        readonly source_channel?: partialChannel;
        readonly url?: string;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        edit(options: editWebhookOptions): Promise<Webhook>;
        delete(reason?: string): Promise<void>;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
    }
    export enum integrationExpireBehavior {
        RemoveRole = 0,
        Kick = 1,
    }
    type OAuth2Scopes = "activities.read" | "activities.write" | "applications.builds.read" | "applications.builds.upload" | "applications.commands" | "applications.commands.update" | "applications.commands.permissions.update" | "applications.entitlements" | "applications.store.update" | "bot" | "connections" | "dm_channels.read" | "email" | "gdm.join" | "guilds" | "guilds.join" | "guilds.members.read" | "identify" | "messages.read" | "relationships.read" | "role_connections.write" | "rpc" | "rpc.activities.write" | "rpc.notifications.read" | "rpc.voice.read" | "rpc.voice.write" | "voice" | "webhook.incoming";
    export class Integration {
        constructor(client: Client, guild: Guild, data: any);
        private client: Client;
        readonly guild: Guild;
        readonly guildId: string;
        readonly id: string;
        readonly name: string;
        readonly type: "twitch" | "youtube" | "discord" | "guild_subscription";
        readonly enabled: boolean;
        readonly syncing?: boolean;
        readonly role_id?: string;
        readonly enable_emoticons?: boolean;
        readonly expire_behavior?: integrationExpireBehavior;
        readonly expire_grace_period?: number;
        readonly user: User | null;
        readonly account: { id: string, name: string };
        readonly synced_at?: number;
        readonly subscriber_count?: number;
        readonly revoked?: boolean;
        readonly application?: {
            id: string,
            name: string,
            icon: string,
            description: string,
            bot?: User;
        };
        scopes?: OAuth2Scopes[];
        delete(reason?: string): Promise<void>;
    }
    export class VoiceState {
        constructor(client: Client, data: any);
        private client: Client;
        readonly guild?: Guild;
        readonly guildId?: string;
        readonly channel: VoiceChannel | StageChannel;
        readonly channelId: string;
        readonly user: User;
        readonly userId: string;
        readonly member?: Member;
        readonly session_id: string;
        readonly deaf: boolean;
        readonly mute: boolean;
        readonly self_deaf: boolean;
        readonly self_mute: boolean;
        readonly self_stream?: boolean;
        readonly self_video: boolean;
        readonly suppress: boolean;
        readonly request_to_speak_timestamp: number;
        readonly data_is_available: boolean;
        private readonly cachedAt: number;
        private readonly expireAt: number;
    }
    export enum interactionType {
        PING = 1,
        APPLICATION_COMMAND = 2,
        MESSAGE_COMPONENT = 3,
        APPLICATION_COMMAND_AUTOCOMPLETE = 4,
        MODAL_SUBMIT = 5,
    }
    type interactionData = {
        id: string,
        name: string,
        type: commandType,
        resolved?: interactionResolvedData,
        options?: ApplicationCommandInteractionData[],
        guild_id?: string,
        target_id?: string,
    }
    type ApplicationCommandInteractionData = {
        name: string,
        type: commandOptionsType,
        value?: string | number | boolean,
        options?: ApplicationCommandInteractionData[],
        focused?: boolean;
    }
    type interactionResolvedData = {
        users?: Map<string, User>,
        members?: Map<string, Member>,
        roles?: Map<string, Role>,
        channels?: Map<string, TextChannel | AnnouncementChannel | VoiceChannel | Thread | ForumChannel | DmChannel>,
        messages?: Map<string, Message>,
        attachments?: Map<string, Attachment>,
    }
    type MessageInteractionOptions = {
        content: string,
        embeds: Embed[],
        components: ActionRow[],
        tts: boolean,
        nonce: number | string,
        allowed_mentions: string[],
        ephemeral: boolean,
    }
    export class Interaction {
        constructor(client: Client, data: any);
        private client: Client;
        readonly guild?: Guild;
        readonly guildId?: string;
        readonly id: string;
        readonly application_id: string;
        readonly type: interactionType;
        private readonly data?: interactionData;
        readonly channel?: TextChannel | AnnouncementChannel | VoiceChannel | Thread | ForumChannel | DmChannel;
        readonly channelId?: string;
        readonly member?: Member;
        readonly user?: User;
        readonly userId?: string;
        readonly token: string;
        readonly version: string;
        readonly message?: Message;
        readonly app_permissions?: Permissions;
        readonly locale?: localizationsOptions;
        readonly guild_locale?: localizationsOptions;
        readonly commandName?: string;
        readonly customId?: string;
        readonly values?: string[];
        readonly isModal: boolean;
        readonly isMessageComponent: boolean;
        readonly isCommand: boolean;
        readonly isButton: boolean;
        readonly isActionRow: boolean;
        readonly isStringSelect: boolean;
        readonly isTextInput: boolean;
        readonly isUserSelect: boolean;
        readonly isRoleSelect: boolean;
        readonly isMentionableSelect: boolean;
        readonly isChannelSelect: boolean;
        readonly isSlashCommand: boolean;
        readonly isUserContext: boolean;
        readonly isMessageContext: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        private readonly deleted: boolean;
        private readonly followUpMessageId: string|null;
        deferUpdate(options?: { ephemeral: boolean }): Promise<Interaction>;
        reply(options: MessageInteractionOptions | string | Embed | ActionRow): Promise<Interaction>;
        deferReply(options?: { ephemeral: boolean }): Promise<Interaction>;
        followUp(options: MessageInteractionOptions | string | Embed | ActionRow): Promise<Message>;
        editFollowUp(options: MessageInteractionOptions | string | Embed | ActionRow): Promise<Message>;
        deleteFollowUp(delay?: number): Promise<Interaction>;
        submitModal(modal: Modal | modalOptions): Promise<Interaction>;
        getModalValue(input_id: string): string | null;
        getSelectedUsers(): User[];
        getSelectedRoles(): Role[];
        getSelectedMentionables(): User[];
        getSelectedChannels(): TextChannel[] | VoiceChannel[] | CategoryChannel[] | AnnouncementChannel[] | Thread[] | StageChannel[] | ForumChannel[];
        getCommandValue(name: string): string | number | boolean | User | Role | TextChannel | VoiceChannel | CategoryChannel | AnnouncementChannel | Thread | StageChannel | ForumChannel;
        getTargetUser(): User;
        getTargetMessage(): Message;
        sendAutoCompleteChoices(options: commandChoicesOptions[]): Promise<Interaction>;
    }
    type modalOptions = {
        name: string,
        custom_id?: string,
        customId?: string,
        components?: textInput[],
    }
    export enum textInputStyle {
        Short = 1,
        Paragraph = 2
    }
    type textInput = {
        type: number,
        custom_id: string,
        style: textInputStyle,
        label: string,
        min_length?: number,
        max_length?: number,
        required?: boolean,
        value?: string,
        placeholder?: string,
    }
    export class Modal {
        constructor(modal_data?: modalOptions);
        name: string;
        custom_id: string;
        customId: string;
        components: textInput[];
        private pack(): object;
    }
    type collectorOptions = {
        type: "message"|"component",
        count: number,
        time: number,
        componentType: ComponentsType,
        filter: Function
    }
    export class Collector {
        constructor(client: Client, guild: Guild, message: Message, channel: any, data: collectorOptions);
        private readonly client: Client;
        private readonly guild: Guild;
        private readonly message: Message;
        private readonly channel: any;
        private readonly defaultData: object;
        readonly data: collectorOptions;
        private readonly cache: Store<string, any>;
        private readonly ended: boolean;
        public on<K extends keyof CollectorEvents>(event: K, listener: (...args: CollectorEvents[K]) => Awaitable<void>): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof CollectorEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public once<K extends keyof CollectorEvents>(event: K, listener: (...args: CollectorEvents[K]) => Awaitable<void>): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof CollectorEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public emit<K extends keyof CollectorEvents>(event: K, ...args: CollectorEvents[K]): boolean;
        public emit<S extends string | symbol>(event: Exclude<S, keyof CollectorEvents>, ...args: unknown[]): boolean;
        public off<K extends keyof CollectorEvents>(event: K, listener: (...args: CollectorEvents[K]) => Awaitable<void>): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof CollectorEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public removeAllListeners<K extends keyof CollectorEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof CollectorEvents>): this;
    }
    interface CollectorEvents {
        collected: [collect: Message|Interaction];
        end: [];
        totalCollected: [collect: Store<string, Message|Interaction>];
    }
    export enum Colors {
        DEFAULT = 0x000000,
        WHITE = 0xffffff,
        AQUA = 0x1abc9c,
        GREEN = 0x57f287,
        BLUE = 0x3498db,
        YELLOW = 0xfee75c,
        PURPLE = 0x9b59b6,
        LUMINOUS_VIVID_PINK = 0xe91e63,
        FUCHSIA = 0xeb459e,
        GOLD = 0xf1c40f,
        ORANGE = 0xe67e22,
        RED = 0xed4245,
        GREY = 0x95a5a6,
        NAVY = 0x34495e,
        DARK_AQUA = 0x11806a,
        DARK_GREEN = 0x1f8b4c,
        DARK_BLUE = 0x206694,
        DARK_PURPLE = 0x71368a,
        DARK_VIVID_PINK = 0xad1457,
        DARK_GOLD = 0xc27c0e,
        DARK_ORANGE = 0xa84300,
        DARK_RED = 0x992d22,
        DARK_GREY = 0x979c9f,
        DARKER_GREY = 0x7f8c8d,
        LIGHT_GREY = 0xbcc0c0,
        DARK_NAVY = 0x2c3e50,
        BLURPLE = 0x5865f2,
        GREYPLE = 0x99aab5,
        DARK_BUT_NOT_BLACK = 0x2c2f33,
        NOT_QUITE_BLACK = 0x23272a,
      }
      export class Presence {
        constructor(client: Client, guild: Guild, data: any);
        private readonly client: Client;
        readonly guild?: Guild;
        readonly guildId?: string;
        readonly user: User;
        readonly userId: string;
        readonly status: "idle"|"dnd"|"online"|"offline";
        readonly activities: Activities[];
        readonly client_status: clientStatus;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined; 
      }
      type clientStatus = {
        desktop?: string,
        mobile?: string,
        web?: string
      }
      type Activities = {
        name: string,
        id?: string,
        type: ActivityType,
        url?: string,
        created_at: number,
        timestamps: timestampActivity,
        application_id: string,
        details?: string,
        state?: string,
        emoji?: APIEmoji,
        party?: activityParty,
        assets?: activityAssets,
        secrets?: activitySecrets,
        instance?: boolean,
        flags?: ActivityFlags,
        buttons?: ActivityButton[],
      }
      type timestampActivity = {
        start?: number,
        end?: number
      }
      type activityParty = {
        id?: string,
        size?: [current_size: number, max_size: number]
      }
      type activityAssets = {
        large_image?: string,
        large_text?: string,
        small_image?: string,
        small_text?: string
      }
      type activitySecrets = {
        join?: string,
        spectate?: string,
        match?: string
      }
      type ActivityButton = {
        label: string,
        url: string
      }
      export type ActivityFlagString =
        | 'INSTANCE'
        | 'JOIN'
        | 'SPECTATE'
        | 'JOIN_REQUEST'
        | 'SYNC'
        | 'PLAY'
        | 'PARTY_PRIVACY_FRIENDS'
        | 'PARTY_PRIVACY_VOICE_CHANNEL'
        | 'EMBEDDED';
    export type Activity_Flags = Record<ActivityFlagString, bigint>;
    export type ActivityFlagsResolvable = BitFieldResolvable<ActivityFlagString, bigint>;
    export class ActivityFlags extends BitField<ActivityFlagString, bigint> {
        public any(flag: ActivityFlagsResolvable): boolean;
        public has(flag: ActivityFlagsResolvable): boolean;
        public missing(bits: BitFieldResolvable<ActivityFlagString, bigint>): ActivityFlagString[];
        public serialize(): Record<ActivityFlagString, boolean>;
        public toArray(): ActivityFlagString[];
        public static ALL: bigint;
        public static DEFAULT: bigint;
        public static FLAGS: Activity_Flags;
        public static resolve(flag?: ActivityFlagsResolvable): bigint;
    }
    export type MemberFlagString =
        | 'DID_REJOIN'
        | 'COMPLETED_ONBOARDING'
        | 'BYPASSES_VERIFICATION'
        | 'STARTED_ONBOARDING';
    export type Member_Flags = Record<MemberFlagString, bigint>;
    export type MemberFlagsResolvable = BitFieldResolvable<MemberFlagString, bigint>;
    export class MemberFlags extends BitField<MemberFlagString, bigint> {
        public any(flag: MemberFlagsResolvable): boolean;
        public has(flag: MemberFlagsResolvable): boolean;
        public missing(bits: BitFieldResolvable<MemberFlagString, bigint>): MemberFlagString[];
        public serialize(): Record<MemberFlagString, boolean>;
        public toArray(): MemberFlagString[];
        public static ALL: bigint;
        public static DEFAULT: bigint;
        public static FLAGS: Member_Flags;
        public static resolve(flag?: MemberFlagsResolvable): bigint;
    }
    export type UserFlagString =
        | 'STAFF'
        | 'PARTNER'
        | 'HYPESQUAD'
        | 'BUG_HUNTER_LEVEL_1'
        | 'HYPESQUAD_BRAVEY'
        | 'HYPESQUAD_BRILLANCE'
        | 'HYPESQUAD_BALANCE'
        | 'EARLY_SUPPORTER'
        | 'TEAM_PSEUDO_USER'
        | 'BUG_HUNTER_LEVEL_2'
        | 'VERIFIED_BOT'
        | 'VERIFIED_DEVELOPER'
        | 'CERTIFIED_MODERATOR'
        | 'BOT_HTTP_INTERACTIONS'
        | 'ACTIVE_DEVELOPER';
    export type User_Flags = Record<UserFlagString, bigint>;
    export type UserFlagsResolvable = BitFieldResolvable<UserFlagString, bigint>;
    export class UserFlags extends BitField<UserFlagString, bigint> {
        public any(flag: UserFlagsResolvable): boolean;
        public has(flag: UserFlagsResolvable): boolean;
        public missing(bits: BitFieldResolvable<UserFlagString, bigint>): UserFlagString[];
        public serialize(): Record<UserFlagString, boolean>;
        public toArray(): UserFlagString[];
        public static ALL: bigint;
        public static DEFAULT: bigint;
        public static FLAGS: User_Flags;
        public static resolve(flag?: UserFlagsResolvable): bigint;
    }
    export type MessageFlagString =
        | 'CROSSPOSTED'
        | 'IS_CROSSPOST'
        | 'SUPPRESS_EMBEDS'
        | 'SOURCE_MESSAGE_DELETED'
        | 'URGENT'
        | 'HAS_THREAD'
        | 'EPHEMERAL'
        | 'LOADING'
        | 'FAILED_TO_MENTION_SOME_ROLES_IN_THREAD'
        | 'SUPPRESS_NOTIFICATIONS';
    export type Message_Flags = Record<MessageFlagString, bigint>;
    export type MessageFlagsResolvable = BitFieldResolvable<MessageFlagString, bigint>;
    export class MessageFlags extends BitField<MessageFlagString, bigint> {
        public any(flag: MessageFlagsResolvable): boolean;
        public has(flag: MessageFlagsResolvable): boolean;
        public missing(bits: BitFieldResolvable<MessageFlagString, bigint>): MessageFlagString[];
        public serialize(): Record<MessageFlagString, boolean>;
        public toArray(): MessageFlagString[];
        public static ALL: bigint;
        public static DEFAULT: bigint;
        public static FLAGS: Message_Flags;
        public static resolve(flag?: MessageFlagsResolvable): bigint;
    }
    export type IntentFlagString =
        | 'GUILDS'
        | 'GUILD_MEMBERS'
        | 'GUILD_MODERATION'
        | 'GUILD_EMOJIS_AND_STICKERS'
        | 'GUILD_INTEGRATIONS'
        | 'GUILD_WEBHOOKS'
        | 'GUILD_INVITES'
        | 'GUILD_VOICE_STATES'
        | 'GUILD_PRESENCES'
        | 'GUILD_MESSAGES'
        | 'GUILD_MESSAGE_REACTIONS'
        | 'GUILD_MESSAGE_TYPING'
        | 'DIRECT_MESSAGES'
        | 'DIRECT_MESSAGE_REACTIONS'
        | 'DIRECT_MESSAGE_TYPING'
        | 'MESSAGE_CONTENT'
        | 'GUILD_SCHEDULED_EVENTS'
        | 'AUTO_MODERATION_CONFIGURATION'
        | 'AUTO_MODERATION_EXECUTION';
    export type Intent_Flags = Record<IntentFlagString, bigint>;
    export type IntentFlagsResolvable = BitFieldResolvable<IntentFlagString, bigint>;
    export class IntentFlags extends BitField<IntentFlagString, bigint> {
        public any(flag: IntentFlagsResolvable): boolean;
        public has(flag: IntentFlagsResolvable): boolean;
        public missing(bits: BitFieldResolvable<IntentFlagString, bigint>): IntentFlagString[];
        public serialize(): Record<IntentFlagString, boolean>;
        public toArray(): IntentFlagString[];
        public static ALL: bigint;
        public static DEFAULT: bigint;
        public static FLAGS: Intent_Flags;
        public static resolve(flag?: IntentFlagsResolvable): bigint;
    }
    export class AutoModRule {
        constructor(client: Client, guild: Guild, data: any);
        readonly id: string;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly guildId: string;
        readonly guild?: Guild;
        readonly name: string;
        readonly creatorId: string;
        readonly creator?: User;
        readonly event_type: AutoModEventType;
        readonly trigger_type: AutoModTriggerType;
        readonly trigger_metadata: AutoModTriggerMetadata;
        readonly actions: AutoModActions[];
        readonly enabled: boolean;
        readonly exempt_roles: string[];
        readonly exempt_channels: string[];
        edit(options: editAutoModRuleOptions): Promise<AutoModRule>;
        delete(reason?: string): Promise<AutoModRule>;
    }
    type editAutoModRuleOptions = {
        name: string,
        event_type: AutoModEventType,
        trigger_metadata?: AutoModTriggerMetadata,
        actions: AutoModActions[],
        enabled?: boolean,
        exempt_roles?: string[],
        exempt_channels?: string[],
        reason?: string
    }
    enum AutoModEventType {
        MESSAGE_SEND = 1
    }
    export enum AutoModTriggerType {
        KEYWORD = 1,
        SPAM = 3,
        KEYWORD_PRESET = 4,
        MENTION_SPAM = 5
    }
    type AutoModTriggerMetadata = {
        keyword_filter: string[],
        regex_patterns:  string[],
        presets: AutoModTriggerPresets[],
        allow_list: string[],
        mention_total_limit: number,
    }
    export enum AutoModTriggerPresets {
        PROFANITY = 1,
        SEXUAL_CONTENT = 2,
        SLURS = 3
    }
    type AutoModActions = {
        type: AutoModActionType,
        metadata?: AutoModActionMetadata
    }
    export enum AutoModActionType {
        BLOCK_MESSAGE = 1,
        SEND_ALERT_MESSAGE = 2,
        TIMEOUT = 3
    }
    type AutoModActionMetadata = {
        channel_id: string,
        duration_seconds: number,
        custom_message?: string
    }
}