import EventEmitter from "events"
import ws from 'ws'
import Store from '../util/Store/Store'
declare module 'devland.js' {
    declare type clientOptions = {
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
    }
    declare type wsOptions = {
        large_threshold: number;
        compress: boolean;
        properties: propertiesOptions;
    }
    declare type propertiesOptions = {
        $os: string | NodeJS.Platform;
        $browser: string;
        $device: string;
    }
    declare type presenceOptions = {
        status: string;
        afk: boolean;
    }
    declare type wsClientData = {
        socket: ws;
        connected: boolean;
        gateway: gatewayClientData;
    }
    declare type gatewayClientData = {
        url: string;
        obtainedAt: number;
        heartbeat: heartbeatClientData;
    }
    declare type heartbeatClientData = {
        interval: number;
        last: number;
        recieved: boolean;
        seq: any;
    }
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
        readonly version: string;
        connect(token?: string): Client;
        toJSON(): JSON;
        fetchGuilds(max?: number): Promise<Store<string, Guild>>;
        fetchGuild(guildId: string | Guild): Promise<Guild>;

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
    export type invalid_Message = {
        error: string;
        guild: Guild;
        channel: TextChannel;
        id: string;
        data_is_available: boolean;
    }
    export type invalid_Guild = {
        error: string;
        id: string;
        data_is_available: boolean;
    }
    declare interface ClientEvents {
        debug: [data: string];
        ready: [client: Client];
        message: [message: Message];
        messageUpdate: [message: Message | invalid_Message, message: Message];
        messageDelete: [message: Message | invalid_Message];
        guildAvailable: [guild: Guild];
        guildAdded: [guild: Guild];
        guildRemoved: [guild: Guild | invalid_Guild];
    }
    declare class RESTHandler {
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
    declare namespace Client {
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
    export type guildFeatures = "ANIMATED_BANNER" | "ANIMATED_ICON" | "APPLICATION_COMMAND_PERMISSIONS_V2" | "AUTO_MODERATOR" | "BANNER" | "COMMUNITY" | "CREATOR_MODETIZABLE_PROVISIONAL" | "CREATOR_STORE_PAGE" | "DEVELOPER_SUPPORT_SERVER" | "DISCOVERABLE" | "FEATURABLE" | "INVITES_DISABLED" | "INVITE_SPLASH" | "MEMBER_VERIFICATION_GATE_ENABLED" | "MORE_STICKERS" | "NEWS" | "PARTNERED" | "PREVIEW_ENABLED" | "ROLE_ICONS" | "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE" | "ROLE_SUBSCRIPTIONS_ENABLED" | "TICKETED_EVENTS_ENABLED" | "VANITY_URL" | "VERIFIED" | "VIP_REGIONS" | "WELCOME_SCREEN_ENABLED"
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
    export type guildPreferredLocale = "id" | "da" | "de" | "en-GB" | "en-US" | "es-ES" | "fr" | "hr" | "it" | "lt" | "hu" | "nl" | "no" | "pl" | "pt-BR" | "ro" | "fi" | "sv-SE" | "vi" | "tr" | "cs" | "el" | "bg" | "ru" | "uk" | "hi" | "th" | "zh-CN" | "ja" | "zh-TW" | "ko"
    export enum guildNsfwLevel {
        DEFAULT = 0,
        EXPLICIT = 1,
        SAFE = 2,
        AGE_RESTRICTED = 3
    }
    export type guildVanityData = {
        code: string | null,
        uses: number | null
    }
    export type utilsChannels = {
        systemChannel: TextChannel | null;
        afkTimeout: number;
        afkChannel: VoiceChannel | null;
        widgetChannel: TextChannel | null;
        widgetEnabled: boolean;
        rulesChannel: TextChannel | null;
        safetyChannel: TextChannel | null;
        publicUpdatesChannel: TextChannel | null;
    }
    declare type createEmojiOptions = {
        name: string,
        roles?: string[],
        image: any,
        reason?: string,
    }
    declare type editGuildOptions = {
        name?: string,
        verification_level?: guildVerificationLevel,
        default_message_notifications?: guildDefaultMessageNotifications,
        explicit_content_filter?: guildExplicitContentFilterLevel,
        afk_channel_id?: string|VoiceChannel,
        afk_timeout?: number,
        icon?: any,
        owner_id?: User|string,
        splash?: any,
        discovery_splash?: any,
        banner?: any,
        system_channel_id?: string|TextChannel,
        system_channel_flags?: number|string,
        rules_channel_id?: string|TextChannel,
        public_updates_channel_id?: string|TextChannel,
        peferred_locale?: guildPreferredLocale,
        features?: guildFeatures[],
        description?: string,
        premium_progress_bar_enabled?: boolean,
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
        readonly data_is_available: boolean;
        private readonly cachedAt: number | undefined;
        private readonly expireAt: number | undefined;
        fetchVanity(): Promise<guildVanityData>;
        fetchUtilsChannels(): Promise<utilsChannels>;
        setCommands(...commands: GuildCommand): Promise<boolean>;
        getCommands(): Promise<GuildCommand[]>;
        deleteCommand(command: GuildCommand | object): Promise<boolean>;
        fetchEmojis(emoji_id?: string | Emoji): Promise<Store<String, Emoji> | Emoji>;
        createEmoji(options: createEmojiOptions): Promise<Emoji>;
        edit(options: editGuildOptions, reason?: string): Promise<Guild>;
        delete(): Promise<void>;
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
    declare type MessageOptions = {
        content: string,
        embeds: Embed[];
        components: ActionRow[];
    }
    declare type fetchMessagesOptions = {
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
    declare type PermissionOverwritesResolvable = {
        id: string | User | Member | Role,
        type?: PermissionIdType,
        allow?: PermissionString[] | PermissionResolvable,
        deny?: PermissionString[] | PermissionResolvable,
    }
    declare type channelEditOptions = {
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
        readonly parentId: string | null;
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
    declare type webhookId = string;
    declare type getUsersFromReactionOptions = {
        limit: number,
        after?: User | string,
    }
    export class Message {
        private constructor(client: Client, guild: Guild, channel: TextChannel, data: object)
        private client: Client;
        readonly guild: Guild;
        readonly channel: TextChannel;
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
        readonly guildId: string;
        readonly editTimestamp: number | null;
        readonly flags: number;
        readonly components: ActionRow[];
        readonly messageReplyied: Message | null;
        readonly deleted: boolean;
        readonly data_is_available: boolean;
        readonly author?: User;
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
        readonly width: number | indefined;
        readonly ephemeral: boolean | undefined;
    }
    declare type fieldOptions = {
        name: string,
        value: string,
        inline?: boolean
    }
    declare type authorOptions = {
        name: string,
        icon_url?: string
    }
    declare type footerOptions = {
        text: string,
        icon_url?: string
    }
    declare type imageOptions = {
        url: string
    }
    declare type thumbnailOptions = {
        url: string
    }
    declare type embedOptions = {
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
    declare type APIEmoji = {
        animated: boolean,
        id: string | null,
        name: string
    }
    declare type resolvableComponents = Button | StringSelect | RoleSelect | MentionableSelect | ChannelSelect | UserData | buttonData | stringData | roleData | userData | mentionableData | channelData;
    export class ActionRow {
        constructor(...components?: resolvableComponents);
        readonly components: resolvableComponents[];
        private readonly type: number;
        private pack();
        addComponents(...components: resolvableComponents);
    }
    declare type buttonData = {
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
    declare type stringData = {
        placeholder?: string,
        custom_id?: string,
        customId: string,
        max_values?: number,
        min_values?: number,
        options: selectOptions[],
        disabled?: boolean
    }
    declare type selectOptions = {
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
        addOptions(...options: selectOptions);
        setOptions(...options: selectOptions);
        private pack();
    }
    declare type roleData = {
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
    declare type userData = {
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
    declare type mentionableData = {
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
    declare type channelData = {
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
    declare type localizationsOptions = {
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
    declare type GuildCommandOptions = {
        name: string,
        type?: commandType,
        description?: string,
        options?: commandOptions[],
        default_member_permissions?: PermissionString[] | PermissionResolvable,
        name_localizations?: localizationsOptions,
        description_localizations?: localizationsOptions,
        nsfw?: boolean,
    }
    declare type commandChoicesOptions = {
        name: string,
        name_localizations?: localizationsOptions,
        value: string | number;
    }
    declare type commandOptions = {
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
        description_localizations?: localizationOptions;
        nsfw?: boolean;
    }
    declare type tagOptions = {
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
    declare type editEmojiOptions = {
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
}