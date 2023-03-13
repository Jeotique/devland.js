import EventEmitter from "events"
import ws from 'ws'
import Store from '../util/Store/Store'
declare type clientOptions = {
    connect: boolean;
    ws: wsOptions;
    presence: presenceOptions;
    intents: number;
    token: string;
    messagesLifeTime: number;
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
    readonly version: string;
    connect(token?: string): Client;
    toJSON(): JSON;
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
declare interface ClientEvents {
    debug: [data: string];
    ready: [client: Client];
    messageCreate: [message: Message];
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
        protected constructor(client: Client, data: object);
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
    afkChannel: TextChannel | null;
    widgetChannel: TextChannel | null;
    widgetEnabled: boolean;
    rulesChannel: TextChannel | null;
    safetyChannel: TextChannel | null;
    publicUpdatesChannel: TextChannel | null;
}
export class Guild {
    protected constructor(client: Client, data: object);
    private client: Client;
    readonly id: string;
    readonly name: string;
    readonly icon: string | null;
    readonly description: string | null;
    readonly homeHeader: string | null;
    readonly splash: string | null;
    readonly discoverySplash: string | null;
    readonly features: guildFeatures;
    readonly banner: string | null;
    readonly discoverySplash: string | null;
    readonly ownerId: string;
    readonly region: string;
    readonly verificationLevel: guildVerificationLevel;
    readonly mfaLevel: guildMfaLevel;
    readonly defaultMessageNotifications: guildDefaultMessageNotifications;
    readonly explicitContentFilterLevel: guildExplicitContentFilterLevel;
    readonly maxMembers: number;
    readonly maxStageVideoChannelUsers: number;
    readonly maxVideoChannelUsers: number;
    readonly boostLevel: guildBoostLevel;
    readonly boostCount: number;
    readonly systemChannelFlags: number;
    readonly preferredLocale: guildPreferredLocale;
    readonly boostProgressBar: boolean;
    readonly nsfw: boolean;
    readonly nsfwLevel: guildNsfwLevel;
    readonly createdTimestamp: number;
    readonly createdAt: Date;
    fetchVanity(): Promise<guildVanityData>;
    fetchUtilsChannels(): Promise<utilsChannels>;
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
    embeds: any[];

}
export class TextChannel {
    protected constructor(client: Client, guild: Guild, data: object)
    private client: Client;
    readonly guild: Guild;
    readonly id: string;
    readonly lastMessageId: string;
    readonly type: channelType;
    readonly name: string;
    readonly position: number;
    readonly flags: number;
    readonly parentId: string | null;
    readonly topic: string | null;
    readonly guildId: string;
    readonly rateLimitPerUser: number;
    readonly nsfw: boolean;
    readonly createdTimestamp: number;
    readonly createdAt: Date;
    send(options: MessageOptions|string|MessageEmbed): Promise<Message>;
}

export class Message {
    protected constructor(client: Client, guild: Guild, channel: TextChannel, data: object)
    private client: Client;
    readonly guild: Guild;
    readonly channel: TextChannel;
    readonly id: string;
    readonly type: number;
    readonly content: string | undefined;
    readonly channelId: string;
    readonly attachments: Store<String, Attachment>;
    readonly embeds: object;
    readonly mentions: object;
    readonly pinned: boolean;
    readonly mentionEveryone: boolean;
    readonly tts: boolean;
    readonly createdTimestamp: number;
    readonly createdAt: Date;
    readonly guildId: string;
    readonly editTimestamp: number|null;
    readonly flags: number;
    readonly components: object;
    readonly messageReplyied: Message|null;
    readonly deleted: boolean;
    edit(options: MessageOptions|string|MessageEmbed): Promise<Message>;
    delete(delay: number): Promise<Message>;
}

export class Attachment {
    protected constructor(client: Client, message: Message, data: object);
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
    inline: boolean
}
declare type authorOptions = {
    name: string,
    icon_url: string
}
declare type footerOptions = {
    text: string,
    icon_url: string
}
declare type imageOptions = {
    url: string
}
declare type thumbnailOptions = {
    url: string
}
declare type embedOptions = {
    fields: fieldOptions[],
    title: string,
    description: string,
    color: string|number,
    timestamp: string|number|Date,
    author: authorOptions,
    footer: footerOptions,
    image: imageOptions|string,
    thumbnail: thumbnailOptions|string,
    url: string
}
export class MessageEmbed {
    protected constructor(data: embedOptions|undefined);
    fields: fieldOptions[];
    title: string|undefined;
    description: string|undefined;
    color: string|number|undefined;
    timestamp: string|number|Date|undefined;
    author: authorOptions|undefined;
    footer: footerOptions|undefined;
    image: imageOptions|string|undefined;
    url: string|undefined;
}

export class User {
    protected constructor(client: Client, data: object);
    private client: Client;
    readonly username: string;
    readonly publicFlags: number;
    readonly id: string;
    readonly tag: string;
    readonly discriminator: string;
    readonly displayName: string|null;
    readonly bot: boolean;
    readonly avatarDecoration: null;
    readonly avatar: string|null;
    readonly createdAt: Date;
    readonly createdTimestamp: number;
}