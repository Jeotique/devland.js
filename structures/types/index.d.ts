// @ts-ignore
import EventEmitter from "events"
// @ts-ignore
import ws from 'ws'
import Store from '../util/Store/Store'
declare module 'devland.js' {

    type clientOptions = {
        connect: boolean;
        ws: wsOptions;
        presence: presenceOptions;
        intents: IntentFlagString[] | number;
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
        shardId: number;
        shardCount: number;
        connectionTimeout: number;
        maxReconnectAttempts: number;
        maxResumeAttempts: number;
        invalidCommandValueReturnNull: boolean;
        fetchAllMembers: boolean;
        checkForUpdate: boolean;
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
    export type Awaitable<T> = T | PromiseLike<T>;
    export class Client extends EventEmitter {
        constructor(options: clientOptions);
        readonly ready: boolean;
        private _ENDPOINTS: object;
        private readonly token: string;
        readonly readyAt: number;
        readonly ws: clientWebSocket;
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
        readonly shard: ShardClientUtil | null;
        private readonly dmChannels: Store<string, DmChannel>;
        private readonly collectorCache: Store<number, Collector>;
        private readonly deletedmessages: Store<string, Message>;
        readonly version: string;
        readonly uptime: number;
        readonly allChannels: Store<string, TextChannel | VoiceChannel | CategoryChannel | AnnouncementChannel | StageChannel | ForumChannel | Thread>;
        /**
         * Connect the client to the token
         * @param token 
         */
        connect(token?: string): Client;
        disconnect(reopen?: boolean): Client;
        toJSON(): JSON;
        /**
         * Return all guilds where the bot is in
         * @param max the maximum of the store size (how many guilds you want)
         */
        fetchGuilds(max?: number): Promise<Store<string, Guild>>;
        /**
         * Return a specific guild
         * @param guildId the guild Id
         */
        fetchGuild(guildId: string | Guild): Promise<Guild>;
        /**
         * Fetch a user from the discord api
         * @param userId the user Id
         */
        fetchUser(userId: string | User): Promise<User>;
        /**
        * Register new GuildCommand on all guilds of the bot
        * @param commands the list of GuildCommand
        */
        setCommands(...commands: GuildCommand[]): Promise<boolean>;
        /**
         * Fetch all current commands on all guilds of the bot
         */
        getCommands(): Promise<GuildCommand[]>;
        /**
         * Delete a GuildCommand on all guilds of the bot
         * @param command the GuildCommand to delete
         */
        deleteCommand(command: GuildCommand | object): Promise<boolean>;
        /**
         * Fetch a channel and return it
         * @param channel the channel to fetch or a valid channel Id
         */
        fetchChannel(channel: string | TextChannel | VoiceChannel | AnnouncementChannel | CategoryChannel | Thread | StageChannel | ForumChannel | DmChannel): Promise<TextChannel | VoiceChannel | AnnouncementChannel | CategoryChannel | Thread | StageChannel | ForumChannel | DmChannel>;
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
    type rawData = {
        eventName: string,
        data: object | any;
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
        messageBulkDelete: [guild: Guild | undefined, channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel, messages: Store<String, Message>, messageIds: string[]];
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
        messageReactionAllRemove: [guild: Guild | undefined, channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel, message: Message | undefined];
        messageReactionRemoveEmoji: [guild: Guild | undefined, channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel, message: Message | undefined, emoji: Emoji];
        presenceUpdate: [old_presence: Presence | invalid_Presence, presence: Presence];
        webhooksUpdate: [channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel];
        userTypingStart: [guild: Guild | undefined, channel: TextChannel | AnnouncementChannel | ForumChannel | VoiceChannel | Thread | StageChannel | DmChannel, user: User, member: Member | undefined, timestamp: number];
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
        raw: [data: rawData];
        error: [info: string];
        rateLimit: [info: string];
        guildScheduledEventCreate: [event: ScheduledEvent];
        guildScheduledEventUpdate: [event: ScheduledEvent];
        guildScheduledEventDelete: [event: ScheduledEvent];
        guildScheduledEventUserAdd: [event: ScheduledEvent, user: User];
        guildScheduledEventUserRemove: [event: ScheduledEvent, user: User];
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
    export class clientWebSocket extends EventEmitter {
        constructor(client: Client);
        client: Client;
        connectAttempts: number;
        connecting: boolean;
        connectTimeout: NodeJS.Timeout | null;
        discordServerTrace?: string[];
        heartbeatInterval: NodeJS.Timeout | null;
        lastHeartbeatAck: boolean;
        lastHeartbeatReceived: number | null;
        lastHeartbeatSent: number | null;
        latency: number;
        preReady: boolean;
        ready: boolean;
        reconnectInterval: number;
        resumeURL: string | null;
        seq: number;
        sessionID: string | null;
        status: "connecting" | "disconnected" | "handshaking" | "identifying" | "ready" | "resuming";
        ws: ws | null;
        connect(): void;
        disconnect(options?: { reconnect?: boolean | "auto" }, error?: Error): void;
        hardReset(): void;
        reset(): void;
        heartbeat(normal?: boolean): void;
        identify(): void;
        initializeWS(): void;
        onPacket(packet: object): void;
        resume(): void;
        sendWS(op: number, _data: Record<string, unknown>, priority?: boolean): void;
        toJSON(): JSON;

        public on<K extends keyof clientWebSocketEvents>(event: K, listener: (...args: clientWebSocketEvents[K]) => Awaitable<void>): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof clientWebSocketEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public once<K extends keyof clientWebSocketEvents>(event: K, listener: (...args: clientWebSocketEvents[K]) => Awaitable<void>): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof clientWebSocketEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public emit<K extends keyof clientWebSocketEvents>(event: K, ...args: clientWebSocketEvents[K]): boolean;
        public emit<S extends string | symbol>(event: Exclude<S, keyof clientWebSocketEvents>, ...args: unknown[]): boolean;
        public off<K extends keyof clientWebSocketEvents>(event: K, listener: (...args: clientWebSocketEvents[K]) => Awaitable<void>): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof clientWebSocketEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public removeAllListeners<K extends keyof clientWebSocketEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof clientWebSocketEvents>): this;
    }
    interface clientWebSocketEvents {
        error: [error: Error, shardId?: number];
        warn: [message: string, shardId?: number];
        debug: [message: string, shardId?: number];
        hello: [trace?: string[], shardId?: number];
        unknow: [packet: any, shardId?: number];
        connect: [shardId: number];
        disconnect: [error?: Error];
    }
    export class RESTHandler {
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
    export { Store } from '../util/Store/Store';
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
            /**
             * Change the status and the activity of the bot
             * @param presence all is optionnal
             */
            setPresence(presence: presenceOptions);
            /**
             * Change the bot username
             * @param name new username
             */
            setName(name: string): Promise<ClientUser>;
            /**
             * Change the bot avatar
             * @param avatar local path or link
             */
            setAvatar(avatar: string | Buffer): Promise<ClientUser>;
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
        image: string | Buffer,
        reason?: string,
    }
    type editGuildOptions = {
        name?: string,
        verification_level?: guildVerificationLevel,
        default_message_notifications?: guildDefaultMessageNotifications,
        explicit_content_filter?: guildExplicitContentFilterLevel,
        afk_channel_id?: string | VoiceChannel,
        afk_timeout?: number,
        icon?: string | Buffer,
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
        readonly highestRole: Role | null;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        /**
         * Return the vanity url data, including 'code' and 'uses'
         */
        fetchVanity(): Promise<guildVanityData>;
        /**
         * Return the utils channels of the guild, like the system channel, afk channel and the afk timeout, etc
         */
        fetchUtilsChannels(): Promise<utilsChannels>;
        /**
         * Register new GuildCommand on the guild
         * @param commands the list of GuildCommand
         */
        setCommands(...commands: GuildCommand[]): Promise<boolean>;
        /**
         * Fetch all current commands on the guild
         */
        getCommands(): Promise<GuildCommand[]>;
        /**
         * Delete a GuildCommand on this guild
         * @param command the GuildCommand to delete
         */
        deleteCommand(command: GuildCommand | object): Promise<boolean>;
        /**
         * Return all emojis of the guild
         * @param emoji_id provid a emoji Id if you want only this one
         */
        fetchEmojis(emoji_id?: string | Emoji): Promise<Store<String, Emoji> | Emoji>;
        /**
         * Create a new emoji on the guild
         * @param options the emoji data
         */
        createEmoji(options: createEmojiOptions): Promise<Emoji>;
        /**
         * Update guild settings
         * @param options the new guild data
         * @param reason the reason of the update
         */
        edit(options: editGuildOptions, reason?: string): Promise<Guild>;
        /**
         * Delete the guild, the bot must be the owner of the guild
         */
        delete(): Promise<void>;
        /**
         * Return all channels of the guild
         */
        fetchChannels(): Promise<guildChannels>;
        /**
         * Fetch a specific channel with the discord api
         * @param channel_id the channel Id
         */
        fetchChannel(channel_id: string): Promise<TextChannel | VoiceChannel | AnnouncementChannel | CategoryChannel | StageChannel | ForumChannel>;
        /**
         * Return all text channels of the guild
         */
        fetchTextChannels(): Promise<Store<String, TextChannel>>;
        /**
         * Return all voice channels of the guild
         */
        fetchVoiceChannels(): Promise<Store<String, VoiceChannel>>;
        /**
         * Return all category channels of the guld
         */
        fetchCategoryChannels(): Promise<Store<String, CategoryChannel>>;
        /**
         * Return all announcement channels of the guild
         */
        fetchAnnouncementChannels(): Promise<Store<String, AnnouncementChannel>>;
        /**
         * Return all stage channels of the guild
         */
        fetchStageChannels(): Promise<Store<String, StageChannel>>;
        /**
         * Return all forum channels of the guild
         */
        fetchForumChannels(): Promise<Store<String, ForumChannel>>;
        /**
         * Fetch a member from the discord api
         * @param user the user Id or a User instance
         */
        fetchMember(user: User | Member | string): Promise<Member>;
        /**
         * Return all members from the guild (max 1000)
         * @param options fetch options
         */
        fetchMembers(options: fetchMembersOptions): Promise<Store<String, Member>>;
        /**
         * Return all roles from the guild
         */
        fetchRoles(): Promise<Store<String, Role>>;
        /**
         * Create a new role
         * @param options role data
         */
        createRole(options?: createRoleOptions): Promise<Role>;
        /**
         * Return a audit logs with all logs matching with your fetch options
         * @param options fetch options
         */
        fetchLogs(options: fetchLogsOptions): Promise<Store<String, Log>>;
        /**
         * Leave the guild, use .delete() if bot owner
         */
        leave(): Promise<void>;
        /**
         * Kick a user from the guild
         * @param user the user Id or a User instance
         * @param reason the reason of the kick
         */
        kickMember(user: string | User | Member, reason?: string): Promise<Member | undefined>;
        /**
         * Ban a user from the guild
         * @param user the user Id or a User instance
         * @param delete_message_seconds provid if you want for the bot to delete last messages of the user
         * @param reason the reason of the ban
         */
        banMember(user: string | User | Member, delete_message_seconds?: number, reason?: string): Promise<Member | undefined>;
        /**
         * Unban a user from the guild
         * @param user the user Id or a User instance
         * @param reason the reason of the unban
         */
        unbanMember(user: string | User | Member, reason?: string): Promise<boolean>;
        /**
         * Return all bans of the guild
         */
        fetchBans(): Promise<Store<String, Ban>>;
        /**
         * Fetch a ban from the guild, if error the user is not banned
         * @param user the user Id or a User instance
         */
        fetchBan(user: string | User | Member): Promise<Ban>;
        /**
         * Prune inactive members from the guild
         * @param options prune options
         */
        prune(options: pruneOptions): Promise<Guild>;
        /**
         * Return all invites of the guild
         */
        fetchInvite(): Promise<Store<String, Invite>>;
        /**
         * Return all webhooks of the guild
         */
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        /**
         * Return all integrations of the guild
         */
        fetchIntegrations(): Promise<Store<String, Integration>>;
        /**
         * Return all auto moderation rules of the guild
         */
        fetchAutoModRules(): Promise<Store<String, AutoModRule>>;
        /**
         * Return a specific auto moderation rule of the guild
         * @param rule_id the automod Id
         */
        fetchAutoModRule(rule_id: string | AutoModRule): Promise<AutoModRule>;
        /**
         * Create a new auto moderation rule on the guild
         * @param options automod rule data
         */
        createAutoModRule(options: createAutoModRuleOptions): Promise<AutoModRule>;
        /**
         * Create a new channel on the guild
         * @param options the channel data
         * @param reason the reason of the creation
         */
        createChannel(options: channelCreateOptions, reason?: string): Promise<TextChannel | VoiceChannel | AnnouncementChannel | CategoryChannel | Thread | StageChannel | ForumChannel>;
        /**
         * Create a new scheduled event on the guild
         * @param options the event data
         */
        createScheduledEvent(options: eventCreateOptions): Promise<ScheduledEvent>;
        /**
         * Fetch and return a scheduled event from the guild
         * @param event the event Id to fetch and return
         */
        getScheduledEvent(event: string | ScheduledEvent): Promise<ScheduledEvent>;
        /**
         * Fetch and return all scheduled event of the guild
         */
        listScheduledEvent(): Promise<Store<String, ScheduledEvent>>;
    }
    type eventCreateOptions = {
        channel_id: string | VoiceChannel | StageChannel | null,
        entity_metadata: eventEntityMetadata | null,
        name: string,
        privacy_level: eventPrivacyLevel,
        scheduled_start_time: number | Date,
        scheduled_end_time?: number | Date,
        description?: string,
        entity_type: eventEntityType,
        image?: string | Buffer,
        reason?: string,
    }
    export enum eventEntityType {
        STAGE_INSTANCE = 1,
        VOICE = 2,
        EXTERNAL = 3
    }
    export enum eventPrivacyLevel {
        GUILD_ONLY = 2
    }
    type eventEntityMetadata = {
        location: string
    }
    type channelCreateOptions = {
        name: string,
        type?: channelType,
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
        readonly highestRole: Role | null;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        /**
         * Fetch this member, useful to refresh is data
         */
        fetch(): Promise<Member>;
        /**
         * Send a private message to this member
         * @param options the message payload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Update the member status, like a timeout
         * @param data the data to update
         */
        edit(data: editMemberOptions): Promise<Member>;

        /**
         * Set or remove a timeout from a member
         * @param time the time of the timeout
         * @param reason the reason of the timeout
         */
        setTimeout(time?: number|null, reason?: string): Promise<Member>;
        /**
         * Give roles to this member
         * @param roles the roles to give
         * @param reason the reason of this action
         */
        addRoles(roles: Role | Role[] | string | string[], reason?: string): Promise<Member>;
        /**
         * Remove roles to this member
         * @param roles the roles to remove
         * @param reason the reason of this action
         */
        removeRoles(roles: Role | Role[] | string | string[], reason?: string): Promise<Member>;
        /**
         * Chech if this member have a specific permission
         * @param permission the resolvable permission to check
         */
        hasPermissions(permission: PermissionResolvable): boolean;
        /**
         * Kick this member from the guild
         * @param reason the reason of the kick
         */
        kick(reason?: string): Promise<Member | undefined>;
        /**
         * Ban this member from the guild
         * @param delete_message_seconds will delete all messages in this time
         * @param reason the reason of the ban
         */
        ban(delete_message_seconds?: number, reason?: string): Promise<Member | undefined>;
        /**
         * Fetch and returns all roles of the member
         */
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
        GUILD_FORUM = 15,
        GUILD_MEDIA = 16,
    }
    type MessageOptions = {
        content: string,
        embeds: Embed[] | embedOptions[],
        components: ActionRow[],
        tts: boolean,
        nonce: number | string,
        allowedMentions: allowedMentionsList[],
        files: string[] | filesObject[] | Buffer[],
        attachments: Attachment[],
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
        avatar?: string | Buffer,
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
        /**
         * Send a message in this channel
         * @param options the message payload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Fetch and returns a Store of messages in the channel
         * @param options the options before fetching
         */
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        /**
         * Edit the channel data
         * @param options new channel data
         * @param reason the reason of this edit
         */
        edit(options: channelEditOptions, reason?: string): Promise<TextChannel>;
        /**
         * Delete this channel
         * @param reason the reason of the delete
         * @param time the waiting time before deleting
         */
        delete(reason?: string, time?: number): Promise<TextChannel>;
        /**
         * Create a perfect copy of the channel
         * @param reason the reason of the clone
         * @param time the waiting time before cloning
         */
        clone(reason?: string, time?: number): Promise<TextChannel>;
        /**
         * Change the channel position
         * @param position the new position of the channel
         */
        setPosition(position: number): Promise<TextChannel>;
        /**
         * Delete multiples messages at once, max 99
         * @param data the messages to delete at once
         */
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        /**
         * Fetch and return all pinned messages in the channel
         */
        getPinnedMessages(): Promise<Store<String, Message>>;
        /**
         * Create a new webhook on this channel
         * @param options the webhook data
         */
        createWebhook(options: createWebhookOptions): Promise<Webhook>;
        /**
         * Fetch and return all webhooks of this channel
         */
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        /**
         * Create a collector to get all components/messages actions of this channel
         * @param options the collector options
         */
        createCollector(options?: collectorOptions): Collector;
        /**
         * Create a collector to get a Store of messages with the filter configured
         * @param options the collector options
         */
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        /**
         * Create a new invite for this channel
         * @param options the invite data
         */
        createInvite(options?: createInviteOptions): Promise<Invite>;
        /**
         * Mark the bot as typing in the channel
         */
        startTyping(): Promise<void>;
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
        readonly user: User | null;
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        /**
         * Send a message in this channel
         * @param options the message playload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Fetch and return a Store of messages from this channel
         * @param options the fetch options
         */
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        /**
         * Delete multiples messages at once, max 99
         * @param data the messages to delete at once
         */
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        /**
         * Fetch and return all pinned messages in the channel
         */
        getPinnedMessages(): Promise<Store<String, Message>>;
        /**
         * Create a collector to get all components/messages actions of this channel
         * @param options the collector options
         */
        createCollector(options?: collectorOptions): Collector;
        /**
         * Create a collector to get a Store of messages with the filter configured
         * @param options the collector options
         */
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        /**
         * Create a new invite for this channel
         * @param options the invite data
         */
        createInvite(options?: createInviteOptions): Promise<Invite>;
        /**
         * Mark the bot as typing in the channel
         */
        startTyping(): Promise<void>;
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
        readonly default_auto_archive_duration: 60 | 1440 | 4320 | 10080;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        /**
         * Send a message in this channel
         * @param options the message payload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Fetch and returns a Store of messages in the channel
         * @param options the options before fetching
         */
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        /**
         * Edit the channel data
         * @param options new channel data
         * @param reason the reason of this edit
         */
        edit(options: channelEditOptions, reason?: string): Promise<ForumChannel>;
        /**
         * Delete this channel
         * @param reason the reason of the delete
         * @param time the waiting time before deleting
         */
        delete(reason?: string, time?: number): Promise<ForumChannel>;
        /**
         * Create a perfect copy of the channel
         * @param reason the reason of the clone
         * @param time the waiting time before cloning
         */
        clone(reason?: string, time?: number): Promise<ForumChannel>;
        /**
         * Change the channel position
         * @param position the new position of the channel
         */
        setPosition(position: number): Promise<ForumChannel>;
        /**
         * Delete multiples messages at once, max 99
         * @param data the messages to delete at once
         */
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        /**
         * Fetch and return all pinned messages in the channel
         */
        getPinnedMessages(): Promise<Store<String, Message>>;
        /**
         * Create a new webhook on this channel
         * @param options the webhook data
         */
        createWebhook(options: createWebhookOptions): Promise<Webhook>;
        /**
         * Fetch and return all webhooks of this channel
         */
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        /**
         * Create a collector to get all components/messages actions of this channel
         * @param options the collector options
         */
        createCollector(options?: collectorOptions): Collector;
        /**
         * Create a collector to get a Store of messages with the filter configured
         * @param options the collector options
         */
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        /**
         * Create a new invite for this channel
         * @param options the invite data
         */
        createInvite(options?: createInviteOptions): Promise<Invite>;
        /**
         * Mark the bot as typing in the channel
         */
        startTyping(): Promise<void>;
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
        /**
         * Send a message in this channel
         * @param options the message payload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Fetch and returns a Store of messages in the channel
         * @param options the options before fetching
         */
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        /**
         * Edit the channel data
         * @param options new channel data
         * @param reason the reason of this edit
         */
        edit(options: channelEditOptions, reason?: string): Promise<VoiceChannel>;
        /**
         * Delete this channel
         * @param reason the reason of the delete
         * @param time the waiting time before deleting
         */
        delete(reason?: string, time?: number): Promise<VoiceChannel>;
        /**
         * Create a perfect copy of the channel
         * @param reason the reason of the clone
         * @param time the waiting time before cloning
         */
        clone(reason?: string, time?: number): Promise<VoiceChannel>;
        /**
         * Change the channel position
         * @param position the new position of the channel
         */
        setPosition(position: number): Promise<VoiceChannel>;
        /**
         * Delete multiples messages at once, max 99
         * @param data the messages to delete at once
         */
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        /**
         * Fetch and return all pinned messages in the channel
         */
        getPinnedMessages(): Promise<Store<String, Message>>;
        /**
         * Create a new webhook on this channel
         * @param options the webhook data
         */
        createWebhook(options: createWebhookOptions): Promise<Webhook>;
        /**
         * Fetch and return all webhooks of this channel
         */
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        /**
         * Create a collector to get all components/messages actions of this channel
         * @param options the collector options
         */
        createCollector(options?: collectorOptions): Collector;
        /**
         * Create a collector to get a Store of messages with the filter configured
         * @param options the collector options
         */
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        /**
         * Create a new invite for this channel
         * @param options the invite data
         */
        createInvite(options?: createInviteOptions): Promise<Invite>;
        /**
         * Mark the bot as typing in the channel
         */
        startTyping(): Promise<void>;
        /**
         * Connect the bot to this voice channel
         */
        join(): void;
        /**
         * Disconnect the bot from this voice channel
         */
        leave(): void;
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
        /**
         * Start the stage
         * @param options start stage options
         */
        start_stage(options: stageStartOptions): Promise<StageInstance>;
        /**
         * Edit the stage
         * @param options edit stage options
         */
        edit_stage(options: stageEditOptions): Promise<StageInstance>;
        /**
         * Delete the stage
         * @param reason the reason of the delete
         */
        delete_stage(reason?: string): Promise<void>;
        /**
         * Fetch and return the current stage
         */
        stage(): Promise<StageInstance | void>;
        /**
         * Send a message in this channel
         * @param options the message payload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Fetch and returns a Store of messages in the channel
         * @param options the options before fetching
         */
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        /**
         * Edit the channel data
         * @param options new channel data
         * @param reason the reason of this edit
         */
        edit(options: channelEditOptions, reason?: string): Promise<StageChannel>;
        /**
         * Delete this channel
         * @param reason the reason of the delete
         * @param time the waiting time before deleting
         */
        delete(reason?: string, time?: number): Promise<StageChannel>;
        /**
         * Create a perfect copy of the channel
         * @param reason the reason of the clone
         * @param time the waiting time before cloning
         */
        clone(reason?: string, time?: number): Promise<StageChannel>;
        /**
         * Change the channel position
         * @param position the new position of the channel
         */
        setPosition(position: number): Promise<StageChannel>;
        /**
         * Delete multiples messages at once, max 99
         * @param data the messages to delete at once
         */
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        /**
         * Fetch and return all pinned messages in the channel
         */
        getPinnedMessages(): Promise<Store<String, Message>>;
        /**
         * Create a new webhook on this channel
         * @param options the webhook data
         */
        createWebhook(options: createWebhookOptions): Promise<Webhook>;
        /**
         * Fetch and return all webhooks of this channel
         */
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        /**
         * Create a collector to get all components/messages actions of this channel
         * @param options the collector options
         */
        createCollector(options?: collectorOptions): Collector;
        /**
         * Create a collector to get a Store of messages with the filter configured
         * @param options the collector options
         */
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        /**
         * Create a new invite for this channel
         * @param options the invite data
         */
        createInvite(options?: createInviteOptions): Promise<Invite>;
        /**
         * Mark the bot as typing in the channel
         */
        startTyping(): Promise<void>;
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
        /**
         * Edit this category
         * @param options new channel data
         * @param reason the reason of the edit
         */
        edit(options: channelEditOptions, reason?: string): Promise<CategoryChannel>;
        /**
         * Delete this category
         * @param reason the reason of the delete
         * @param time the waiting time before deleting
         */
        delete(reason?: string, time?: number): Promise<CategoryChannel>;
        /**
         * Create a perfect copy of this category
         * @param reason the reason of the clone
         * @param time the waiting time before cloning
         */
        clone(reason?: string, time?: number): Promise<CategoryChannel>;
        /**
         * Update the category position
         * @param position the new position
         */
        setPosition(position: number): Promise<CategoryChannel>;
        /**
         * Fetch and return all text channels from this category
         */
        fetchTextChannels(): Promise<Store<String, TextChannel>>;
        /**
         * Fetch and return all voice channels from this category
         */
        fetchVoiceChannels(): Promise<Store<String, VoiceChannel>>;
        /**
         * Fetch and return all announcement channels from this category
         */
        fetchAnnouncementChannels(): Promise<Store<String, AnnouncementChannel>>;
        /**
         * Fetch and return all stage channels from this category
         */
        fetchStageChannels(): Promise<Store<String, StageChannel>>;
        /**
         * Fetch and return all forum channels from this category
         */
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
        /**
         * Crosspost a message in the announcement channel
         * @param message the message to cross post
         */
        crosspost(message: Message | string): Promise<Message>;
        /**
         * Send a message in this channel
         * @param options the message payload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Fetch and returns a Store of messages in the channel
         * @param options the options before fetching
         */
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        /**
         * Edit the channel data
         * @param options new channel data
         * @param reason the reason of this edit
         */
        edit(options: channelEditOptions, reason?: string): Promise<AnnouncementChannel>;
        /**
         * Delete this channel
         * @param reason the reason of the delete
         * @param time the waiting time before deleting
         */
        delete(reason?: string, time?: number): Promise<AnnouncementChannel>;
        /**
         * Create a perfect copy of the channel
         * @param reason the reason of the clone
         * @param time the waiting time before cloning
         */
        clone(reason?: string, time?: number): Promise<AnnouncementChannel>;
        /**
         * Change the channel position
         * @param position the new position of the channel
         */
        setPosition(position: number): Promise<AnnouncementChannel>;
        /**
         * Delete multiples messages at once, max 99
         * @param data the messages to delete at once
         */
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        /**
         * Fetch and return all pinned messages in the channel
         */
        getPinnedMessages(): Promise<Store<String, Message>>;
        /**
         * Create a new webhook on this channel
         * @param options the webhook data
         */
        createWebhook(options: createWebhookOptions): Promise<Webhook>;
        /**
         * Fetch and return all webhooks of this channel
         */
        fetchWebhooks(): Promise<Store<String, Webhook>>;
        /**
         * Create a collector to get all components/messages actions of this channel
         * @param options the collector options
         */
        createCollector(options?: collectorOptions): Collector;
        /**
         * Create a collector to get a Store of messages with the filter configured
         * @param options the collector options
         */
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        /**
         * Create a new invite for this channel
         * @param options the invite data
         */
        createInvite(options?: createInviteOptions): Promise<Invite>;
        /**
         * Mark the bot as typing in the channel
         */
        startTyping(): Promise<void>;
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
        /**
         * Send a message in this thread
         * @param options the message payload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Fetch and returns a Store of messages in the thread
         * @param options the options before fetching
         */
        fetchMessages(options?: fetchMessagesOptions | string): Promise<Store<String, Message>>;
        /**
         * Edit the thread data
         * @param options new thread data
         * @param reason the reason of this edit
         */
        edit(options: channelEditOptions, reason?: string): Promise<Thread>;
        /**
         * Delete this thread
         * @param reason the reason of the delete
         * @param time the waiting time before deleting
         */
        delete(reason?: string, time?: number): Promise<Thread>;
        /**
         * Delete multiples messages at once, max 99
         * @param data the messages to delete at once
         */
        bulkDelete(data: number | Message[] | string[]): Promise<void>;
        /**
         * Fetch and return all pinned messages in the thread
         */
        getPinnedMessages(): Promise<Store<String, Message>>;
        /**
         * Create a collector to get all components/messages actions of this thread
         * @param options the collector options
         */
        createCollector(options?: collectorOptions): Collector;
        /**
         * Create a collector to get a Store of messages with the filter configured
         * @param options the collector options
         */
        awaitMessages(options?: collectorOptions): Promise<Store<String, Message>>;
        /**
         * Create a new invite for this thread
         * @param options the invite data
         */
        createInvite(options?: createInviteOptions): Promise<Invite>;
        /**
         * Mark the bot as typing in the thread
         */
        startTyping(): Promise<void>;
        /**
         * Make the bot join this thread
         */
        join(): Promise<void>;
        /**
         * Make the bot leaving this thread
         */
        leave(): Promise<void>;
        /**
         * Add a member in this thread
         * @param member the member to add
         */
        add(member: User | Member | string): Promise<void>;
        /**
         * Remove a member from this thread
         * @param member the member to remove
         */
        remove(member: User | Member | string): Promise<void>;
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
        readonly memberMentions: Store<String, Member | User>;
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
        /**
         * Edit the message
         * @param options the message payload
         */
        edit(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Delete this message
         * @param delay the waiting time before deleting
         */
        delete(delay: number): Promise<Message>;
        /**
         * Reply to this message
         * @param options the message payload
         */
        reply(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Cross post this message in a announcement channel
         */
        crosspost(): Promise<Message>;
        /**
         * Pin this message in his channel
         * @param reason the reason of this action
         */
        pinMessage(reason?: string): Promise<void>;
        /**
         * Unpin this message from his channel
         * @param reason the reason of this action
         */
        unpinMessage(reason?: string): Promise<void>;
        /**
         * React to this message with a emoji
         * @param emoji the emoji to add
         */
        react(emoji: APIEmoji | string): Promise<void>;
        /**
         * Remove a reaction from this message, you can specify a user
         * @param emoji the emoji to react
         * @param user the user (optional)
         */
        unreact(emoji: APIEmoji | string, user?: User | string): Promise<void>;
        /**
         * Fetch and return all users who reacted with the given emoji
         * @param emoji the emoji to fetch
         * @param options the fetch options
         */
        getUsersFromReaction(emoji: APIEmoji | string, options?: getUsersFromReactionOptions): Promise<Store<String, User>>;
        /**
         * Remove all reactions from all emojis or from one specific emoji
         * @param emoji the emoji to remove
         */
        deleteAllReactions(emoji?: APIEmoji | string): Promise<void>;
        /**
         * Create a collector for all components which contains this message
         * @param options the collector options
         */
        createComponentsCollector(options?: collectorOptions): Collector;
        /**
         * Remove all attachments in this message (image, file, etc)
         */
        removeAttachments(): Promise<Message>;
        /**
         * Remove all embeds in this message
         */
        removeEmbeds(): Promise<Message>;
        /**
         * Remove all components in this message
         */
        removeComponents(): Promise<Message>;
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
        /**
         * Send a message to this user
         * @param options the message payload
         */
        send(options: MessageOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Fetch and return the banner of this user, return null if not
         * @param size the size of the banner
         */
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
        /**
         * Add components into this action rows
         * @param components components to add, only one type per action row
         */
        addComponents(...components: resolvableComponents[]): void;
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
        default?: boolean
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
        /**
         * Add options to this string select
         * @param options the options to add
         */
        addOptions(...options: selectOptions[]): void;
        /**
         * Remove options from this string select
         * @param options the options to remove
         */
        setOptions(...options: selectOptions[]): void;
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
        default_values?: selectDefaultValues[];
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
        default_values?: selectDefaultValues[];
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
    type selectDefaultValues = {
        id: string;
        type: "user"|"role"|"channel";
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
        default_values?: selectDefaultValues[];
        private pack();
    }
    export function parseEmoji(text: string): APIEmoji;
    export function resolveEmoji(color: string | number): number;
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
        /**
         * Edit this emoji
         * @param options the new emoji data
         */
        edit(options: editEmojiOptions): Promise<Emoji>;
        /**
         * Delete this emoji
         * @param reason the reason of the delete
         */
        delete(reason?: string): Promise<void>;
    }
    type editRoleOptions = {
        name?: string,
        permissions?: Permissions | PermissionResolvable | string[] | number | BitField<string, number>,
        color?: string | number,
        hoist?: boolean,
        unicode_emoji?: Emoji | string,
        icon?: string | Buffer,
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
        /**
         * Edit this role
         * @param options the new role data
         */
        edit(options: editRoleOptions): Promise<Role>;
        /**
         * Delete this role
         * @param reason the reason of the delete
         */
        delete(reason?: string): Promise<Role>;
        readonly hexColor: string;
        /**
         * Compare the position of this role with an other role, result inferior to 1 mean this role is under
         * @param role the role to compare
         */
        comparePositions(role: Role | string): number;
    }
    type logsType = "GUILD_UPDATE" | "CHANNEL_CREATE" | "CHANNEL_UPDATE" | "CHANNEL_DELETE" | "CHANNEL_OVERWRITE_CREATE" | "CHANNEL_OVERWRITE_UPDATE" | "CHANNEL_OVERWRITE_DELETE" | "MEMBER_KICK" | "MEMBER_PRUNE" | "MEMBER_BAN_ADD" | "MEMBER_BAN_REMOVE" | "MEMBER_UPDATE" | "MEMBER_ROLE_UPDATE" | "MEMBER_MOVE" | "MEMBER_DISCONNECT" | "BOT_ADD" | "ROLE_CREATE" | "ROLE_UPDATE" | "ROLE_DELETE" | "INVITE_CREATE" | "INVITE_UPDATE" | "INVITE_DELETE" | "WEBHOOK_CREATE" | "WEBHOOK_UPDATE" | "WEBHOOK_DELETE" | "EMOJI_CREATE" | "EMOJI_UPDATE" | "EMOJI_DELETE" | "MESSAGE_DELETE" | "MESSAGE_BULK_DELETE" | "MESSAGE_PIN" | "MESSAGE_UNPIN" | "INTEGRATION_CREATE" | "INTEGRATION_UPDATE" | "INTEGRATION_DELETE" | "STAGE_INSTANCE_CREATE" | "STAGE_INSTANCE_UPDATE" | "STAGE_INSTANCE_DELETE" | "STICKER_CREATE" | "STICKER_UPDATE" | "STICKER_DELETE" | "GUILD_SCHEDULED_EVENT_CREATE" | "GUILD_SCHEDULED_EVENT_UPDATE" | "GUILD_SCHEDULED_EVENT_DELETE" | "THREAD_CREATE" | "THREAD_UPDATE" | "THREAD_DELETE" | "APPLICATION_COMMAND_PERMISSION_UPDATE" | "AUTO_MODERATION_RULE_CREATE" | "AUTO_MODERATION_RULE_UPDATE" | "AUTO_MODERATION_RULE_DELETE" | "AUTO_MODERATION_BLOCK_MESSAGE" | "AUTO_MODERATION_FLAG_TO_CHANNEL" | "AUTO_MODERATION_USER_COMMUNICATION_DISABLED";
    export class Log {
        constructor(client: Client, data: any);
        private client: Client;
        readonly id: string;
        readonly guild?: Guild;
        readonly guildId?: string;
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
        /**
         * Delete this invite
         * @param reason the reason of the delete
         */
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
        avatar?: string | Buffer,
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
        /**
         * Edit this webhook
         * @param options the new webhook data
         */
        edit(options: editWebhookOptions): Promise<Webhook>;
        /**
         * Delete this webhook
         * @param reason the reason of this delete
         */
        delete(reason?: string): Promise<void>;
        /**
         * Send a message with this webhook
         * @param options the message payload
         */
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
        /**
         * Delete this integration
         * @param reason the reason of this delete
         */
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
        files: string[] | filesObject[] | Buffer[],
    }
    type deleteFollowUpOptions = {
        delay?: number,
        message_to_delete?: Message,
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
        readonly isSubCommand: boolean;
        readonly isSubCommandGroup: boolean;
        readonly isUserContext: boolean;
        readonly isMessageContext: boolean;
        readonly isAutoCompleteRequest: boolean;
        readonly isReplied: boolean;
        readonly isDeferUpdate: boolean;
        readonly isDeferReply: boolean;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        private readonly deleted: boolean;
        private readonly followUpMessageId: string | null;
        readonly subCommandName?: string|null;
        readonly subCommandGroupName?: string|null;
        /**
         * Mark this interaction as "replied" and remove the loading state, usable only on message component
         * @param options the reply options
         */
        deferUpdate(options?: { ephemeral: boolean }): Promise<Interaction>;
        /**
         * Reply to this interaction, this reply can't be edited
         * @param options the message payload
         */
        reply(options: MessageInteractionOptions | string | Embed | ActionRow): Promise<Interaction>;
        /**
         * Mark this interaction as "loading" to reply later with a followUp
         * @param options the reply options
         */
        deferReply(options?: { ephemeral: boolean }): Promise<Interaction>;
        /**
         * Reply to a message after the "loading" state created with the deferReply
         * @param options the message payload
         */
        followUp(options: MessageInteractionOptions | string | Embed | ActionRow): Promise<Message>;
        /**
         * Edit a followUp message
         * @param options the message payload
         * @param message_to_edit the followUp message to edit (optional, if null/undefined the bot will edit the first followUp sent) 
         */
        editFollowUp(options: MessageInteractionOptions | string | Embed | ActionRow, message_to_edit?: Message): Promise<Message>;
        /**
         * Delete a followUp message
         * @param options the delete options
         */
        deleteFollowUp(options?: deleteFollowUpOptions): Promise<Interaction>;
        /**
         * Reply to the interaction with a modal
         * @param modal the modal to send
         */
        submitModal(modal: Modal | modalOptions): Promise<Interaction>;
        /**
         * Return the value returned by the modal
         * @param input_id the text input Id
         */
        getModalValue(input_id: string): string | null;
        /**
         * Allows you to create a listerner for the submitted modal
         * @param options The options of the listener
         */
        createListener(options: collectorOptions): Collector;
        /**
         * Get the selected users from the UserSelect
         */
        getSelectedUsers(): User[];
        /**
         * Get the selected roles from the RoleSelect
         */
        getSelectedRoles(): Role[];
        /**
         * Get the selected mentionables from the MentionableSelect
         */
        getSelectedMentionables(): User[];
        /**
         * Get the selected channels from the ChannelSelect
         */
        getSelectedChannels(): TextChannel[] | VoiceChannel[] | CategoryChannel[] | AnnouncementChannel[] | Thread[] | StageChannel[] | ForumChannel[];
        /**
         * Get the option value received, slash command only
         * @param name the option name
         */
        getCommandValue(name: string): string | number | boolean | User | Role | TextChannel | VoiceChannel | CategoryChannel | AnnouncementChannel | Thread | StageChannel | ForumChannel;
        /**
         * Get the target user, context user only
         */
        getTargetUser(): User;
        /**
         * Get the target message, context message only
         */
        getTargetMessage(): Message;
        /**
         * Reply to a auto complete request, usable only on slash command
         * @param options array of choices
         */
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
        type: "message" | "component",
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
        collected: [collect: Message | Interaction];
        end: [];
        totalCollected: [collect: Store<string, Message | Interaction>];
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
        readonly status: "idle" | "dnd" | "online" | "offline";
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
        /**
         * Edit this auto moderation rule
         * @param options the new auto moderation rule data
         */
        edit(options: editAutoModRuleOptions): Promise<AutoModRule>;
        /**
         * Delete this auto moderation rule
         * @param reason the reason of the delete
         */
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
        regex_patterns: string[],
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
    type shardOptions = {
        totalShards: string | number,
        respawn: boolean,
        shardArgs: string[],
        execArgv: string[],
        token: string,
        autospawn: boolean,
    }
    export class ShardingManager extends EventEmitter {
        constructor(file: string, options: shardOptions);
        file: string;
        totalShards: string | number;
        respawn: boolean;
        shardArgs: string[];
        execArgv: string[];
        token: string | null;
        autospawn: boolean;
        shards: Store<number, Shard>;
        /**
         * Create a new shard
         * @param id the shard Id to create
         */
        createShard(id?: 0): Shard;
        /**
         * Spawn the shards
         * @param amount the amount of shard to spawn
         * @param delay the delay between all spawns
         * @param waitForReady wait for the shard to be ready before deploy
         */
        spawn(amount?: number | string, delay?: number, waitForReady?: boolean): Promise<Store<number, Shard>>;
        broadcast(message: any): Promise<Shard[]>;
        broadcastEval(script: string): Promise<Array<any>>;
        /**
         * Fetch a value trought all shards
         * @param prop the value to fetch
         */
        fetchClientValues(prop: string): Promise<Array<any>>;
        /**
         * Destroy and respawn all shards
         * @param shardDelay the delay between all shards deletion
         * @param respawnDelay the delay between all shards respawns
         * @param waitForReady wait for the shard to be ready before deploy
         */
        respawnAll(shardDelay?: number, respawnDelay?: number, waitForReady?: boolean): Promise<Store<number, Shard>>;
        public on<K extends keyof ShardingManagerEvents>(event: K, listener: (...args: ShardingManagerEvents[K]) => Awaitable<void>): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof ShardingManagerEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public once<K extends keyof ShardingManagerEvents>(event: K, listener: (...args: ShardingManagerEvents[K]) => Awaitable<void>): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof ShardingManagerEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public emit<K extends keyof ShardingManagerEvents>(event: K, ...args: ShardingManagerEvents[K]): boolean;
        public emit<S extends string | symbol>(event: Exclude<S, keyof ShardingManagerEvents>, ...args: unknown[]): boolean;
        public off<K extends keyof ShardingManagerEvents>(event: K, listener: (...args: ShardingManagerEvents[K]) => Awaitable<void>): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof ShardingManagerEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public removeAllListeners<K extends keyof ShardingManagerEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ShardingManagerEvents>): this;
    }
    interface ShardingManagerEvents {
        shardCreate: [shard: Shard];
    }
    import { ChildProcess } from 'child_process';
    export class Shard extends EventEmitter {
        constructor(manager: ShardingManager, id: number);
        readonly manager: ShardingManager;
        readonly id: number;
        readonly args: string[];
        readonly execArgv: string[] | null;
        readonly env: object;
        readonly ready: boolean;
        readonly process: ChildProcess;
        private readonly _evals: Map<string, Promise<any>>;
        private readonly _fetches: Map<string, Promise<any>>;
        private readonly _exitListener: Function;
        /**
         * Spawn this shard
         * @param waitForReady wait the shard to be ready before deploy
         */
        spawn(waitForReady?: boolean): Promise<ChildProcess>;
        /**
         * Kill & destroy this shard
         */
        kill(): void;
        /**
         * Destroy & respawn this shard
         * @param delay the delay before recreating this shard
         * @param waitForReady wait for the shard to be ready before deploy
         */
        respawn(delay?: number, waitForReady?: boolean): Promise<ChildProcess>;
        /**
         * Send a message to this shard
         * @param message the message to send
         */
        send(message: any): Promise<Shard>;
        /**
        * Fetch a value of this shard
        * @param prop the value to fetch
        */
        fetchClientValue(prop: string): Promise<any>;
        eval(script: string | Function): Promise<any>;
        private _handleMessage(message: any);
        private _handleExit(respawn?: boolean);
        public on<K extends keyof ShardEvents>(event: K, listener: (...args: ShardEvents[K]) => Awaitable<void>): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof ShardEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public once<K extends keyof ShardEvents>(event: K, listener: (...args: ShardEvents[K]) => Awaitable<void>): this;
        public once<S extends string | symbol>(
            event: Exclude<S, keyof ShardEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public emit<K extends keyof ShardEvents>(event: K, ...args: ShardEvents[K]): boolean;
        public emit<S extends string | symbol>(event: Exclude<S, keyof ShardEvents>, ...args: unknown[]): boolean;
        public off<K extends keyof ShardEvents>(event: K, listener: (...args: ShardEvents[K]) => Awaitable<void>): this;
        public off<S extends string | symbol>(
            event: Exclude<S, keyof ShardEvents>,
            listener: (...args: any[]) => Awaitable<void>,
        ): this;
        public removeAllListeners<K extends keyof ShardEvents>(event?: K): this;
        public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ShardEvents>): this;
    }
    interface ShardEvents {
        ready: [];
        disconnect: [];
        reconnecting: [];
        message: [message: any];
        death: [process: ChildProcess];
        error: [error: any];
        spawn: [process: ChildProcess];
    }
    export class ShardClientUtil {
        constructor(client: Client);
        private readonly client: Client;
        readonly id: number;
        readonly count: number;
        /**
         * Send a message into this shard
         * @param message the message to send
         */
        send(message: any): Promise<void>;
        /**
        * Fetch a value trought all shards
        * @param prop the value to fetch
        */
        fetchClientValues(prop: string): Promise<Array<any>>;
        broadcastEval(script: string | Function): Promise<Array<any>>;
        /**
         * Destroy and respawn all shards
         * @param shardDelay the delay between all shards deletion
         * @param respawnDelay the delay between all shards respawns
         * @param waitForReady wait for the shard to be ready before deploy
         */
        respawnAll(shardDelay?: number, respawnDelay?: 500, waitForReady?: boolean): Promise<void>;
        private _handleMessage(message: any);
        private _respond(type: string, message: any);
        /**
         * Link a client with this shard
         * @param client the client to link
         */
        singleton(client: Client): Promise<ShardClientUtil>;
    }
    export class ScheduledEvent {
        constructor(client: Client, guild: Guild, data: any);
        private readonly client: Client;
        readonly id: string;
        readonly guildId: string;
        readonly guild: Guild;
        readonly channel_id?: string;
        readonly channel: VoiceChannel | StageChannel | null;
        readonly creatorId: string;
        readonly creator: User | null;
        readonly name: string;
        readonly description?: string;
        readonly scheduled_start_time: Date;
        readonly scheduled_end_time: Date | null;
        readonly privacy_level: eventPrivacyLevel;
        readonly status: eventStatus;
        readonly entity_type: eventEntityType;
        readonly entity_id: string;
        readonly entity_metadata: eventEntityMetadata | null;
        readonly user_count: number;
        readonly image?: string;
        readonly createdTimestamp: number;
        readonly createdAt: Date;
        /**
         * Edit this scheduled event
         * @param options the new event data
         */
        edit(options: eventEditOptions): Promise<ScheduledEvent>;
        /**
         * Delete this scheduled event
         */
        delete(): Promise<void>;
    }
    export enum eventStatus {
        SCHEDULED = 1,
        ACTIVE = 2,
        COMPLETED = 3,
        CANCELED = 4
    }
    type eventEditOptions = {
        channel_id: string | VoiceChannel | StageChannel | null,
        entity_metadata: eventEntityMetadata | null,
        name?: string,
        privacy_level?: eventPrivacyLevel,
        scheduled_start_time?: number | Date,
        scheduled_end_time?: number | Date,
        description?: string,
        entity_type?: eventEntityType,
        status?: eventStatus,
        image?: string | Buffer,
        reason?: string,
    }
}