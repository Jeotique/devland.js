import EventEmitter from "events"
import ws from 'ws'
import Store from '../util/Store/Store'
declare module 'devland.js' {
    type clientOptions = {
        connect: boolean;
        ws: wsOptions;
        presence: presenceOptions;
        intents: number;
        token: string;
        messagesLifeTime: number;
        messagesLifeTimeResetAfterEvents: boolean;
        guildsLifeTime: number;
        guildsLifeTimeResetAfterEvents: boolean;
        channelsLifeTime: number;
        channelsLifeTimeResetAfterEvents: boolean;
        usersLifeTime: number;
        usersLifeTimeResetAfterEvents: boolean;
        threadsLifeTime: number;
        threadsLifeTimeResetAfterEvents: boolean;
        membersLifeTime: number;
        membersLifeTimeResetAfterEvents: boolean;
        rolesLifeTime: number;
        rolesLifeTimeResetAfterEvents: boolean;
        invitesLifeTime: number;
        invitesLifeTimeResetAfterEvents: boolean;
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
        status: string;
        afk: boolean;
    }
    type wsClientData = {
        socket: ws;
        connected: boolean;
        gateway: gatewayClientData;
    }
    type gatewayClientData = {
        url: string;
        obtainedAt: number;
        heartbeat: heartbeatClientData;
    }
    type heartbeatClientData = {
        interval: number;
        last: number;
        recieved: boolean;
        seq: any;
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
    interface ClientEvents {
        debug: [data: string];
        ready: [client: Client];
        message: [message: Message];
        messageUpdate: [message: Message | invalid_Message, message: Message];
        messageDelete: [message: Message | invalid_Message];
        guildAvailable: [guild: Guild];
        guildAdded: [guild: Guild];
        guildRemoved: [guild: Guild | invalid_Guild];
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
        memberBan: [user: User | invalid_User];
        memberUnban: [user: User | invalid_User];
        inviteCreate: [invite: Invite];
        inviteDelete: [invite: Invite | invalid_Invite];
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
    namespace Client {
        export class ClientUser {
            private constructor(client: Client, data: object);
            private client: Client;
            readonly verified: boolean;
            readonly username: string;
            readonly mfa_enabled: boolean;
            readonly id: string;
            readonly flags: number;
            readonly email: string;
            readonly discriminator: string;
            readonly bot: boolean;
            readonly avatar: string;
            readonly tag: string;
            fetchGuilds(max?: number): Promise<Store<String, Guild>>;
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
        image: any,
        reason?: string,
    }
    type editGuildOptions = {
        name?: string,
        verification_level?: guildVerificationLevel,
        default_message_notifications?: guildDefaultMessageNotifications,
        explicit_content_filter?: guildExplicitContentFilterLevel,
        afk_channel_id?: string | VoiceChannel,
        afk_timeout?: number,
        icon?: any,
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
        permissions?: Permissions | PermissionResolvable | string[] | number | BitField,
        color?: string | number,
        hoist?: boolean,
        unicode_emoji?: Emoji | string,
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
        kickMember(user: string | User | Member, reason?: string): Promise<Member?>;
        banMember(user: string | User | Member, delete_message_seconds?: number, reason?: string): Promise<Member?>;
        unbanMember(user: string | User | Member, reason?: string): Promise<boolean>;
        fetchBans(): Promise<Store<String, Ban>>;
        fetchBan(user: string | User | Member): Promise<Ban>;
        prune(options: pruneOptions): Promise<Guild>;
        fetchInvite(): Promise<Store<String, Invite>>;
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
        readonly voice: { mute: boolean, deaf: boolean };
        readonly joined_at: string;
        readonly joinedTimestamp: number;
        readonly flags: number;
        readonly communication_disabled_until: number;
        readonly avatar: string;
        readonly user: User;
        readonly roles: string[];
        readonly data_is_available: boolean;
        edit(data: editMemberOptions): Promise<Member>;
        addRoles(roles: Role | Role[] | string | string[], reason?: string): Promise<Member>;
        removeRoles(roles: Role | Role[] | string | string[], reason?: string): Promise<Member>;
        hasPermissions(permission: string | PermissionResolvable): boolean;
        kick(reason?: string): Promise<Member?>;
        ban(delete_message_seconds?: number, reason?: string): Promise<Member?>;
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
        embeds: Embed[];
        components: ActionRow[];
    }
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
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        edit(options: channelEditOptions, reason?: string): Promise<ForumChannel>;
        delete(reason?: string, time?: number): Promise<ForumChannel>;
        clone(reason?: string, time?: number): Promise<ForumChannel>;
        setPosition(position: number): Promise<ForumChannel>;
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
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
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        edit(options: channelEditOptions, reason?: string): Promise<VoiceChannel>;
        delete(reason?: string, time?: number): Promise<VoiceChannel>;
        clone(reason?: string, time?: number): Promise<VoiceChannel>;
        setPosition(position: number): Promise<VoiceChannel>;
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
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
    }
    type webhookId = string;
    type getUsersFromReactionOptions = {
        limit: number,
        after?: User | string,
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
        readonly mentions: object;
        readonly pinned: boolean;
        readonly mentionEveryone: boolean;
        readonly tts: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        readonly guildId?: string;
        readonly editTimestamp: number | null;
        readonly flags: number;
        readonly components: ActionRow[];
        readonly messageReplyied: Message | null;
        readonly deleted: boolean;
        readonly data_is_available: boolean;
        readonly author?: User;
        readonly member?: Member;
        readonly authorId: string | webhookId;
        readonly webhookId?: webhookId;
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
        icon_url?: string
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
        url: string | undefined;
    }

    export class User {
        private constructor(client: Client, data: object);
        private client: Client;
        readonly username: string;
        readonly publicFlags: number;
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
        channelType?: channelType[];
        private pack();
    }
    export function parseEmoji(text: string): APIEmoji;
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
        | 'MANAGE_EVENTS';
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
        readonly guild: Guild;
        readonly guildId: string;
        readonly name: string;
        readonly id: string;
        readonly roles: [];
        readonly animated: boolean;
        readonly require_colons: boolean;
        readonly managed: boolean;
        readonly available: boolean;
        readonly user: User;
        private pack();
        edit(options: editEmojiOptions): Promise<Emoji>;
        delete(reason?: string): Promise<void>;
    }
    type editRoleOptions = {
        name?: string,
        permissions?: Permissions | PermissionResolvable | string[] | number | BitField,
        color?: string | number,
        hoist?: boolean,
        unicode_emoji?: Emoji | string,
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
        readonly flags: number;
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
        readonly expireAt: string | number;
        readonly guild: Guild;
        readonly guildId: string;
        readonly channel?: TextChannel | VoiceChannel | AnnouncementChannel | Thread | StageChannel | ForumChannel | null;
        readonly channelId: string;
        readonly inviter: User;
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
}