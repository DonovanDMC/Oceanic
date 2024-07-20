/** @module Types/Gateway */
import type { PartialEmoji } from ".";
import type { RawUser } from "./users";
import type { AutoModerationAction, RawAutoModerationAction } from "./auto-moderation";
import type {
    ActivityTypes,
    AnimationTypes,
    AutoModerationTriggerTypes,
    ChannelTypes,
    IntentNames
} from "../Constants";
import type AutoModerationRule from "../structures/AutoModerationRule";
import type Shard from "../gateway/Shard";
import type { ClientOptions as WSClientOptions } from "ws";

export type ReconnectDelayFunction = (lastDelay: number, attempts: number) => number;
export type GetGatewayOverrideFunction = () => GetGatewayResponse;
export type GetBotGatewayOverrideFunction = (response: GetBotGatewayResponse) => GetBotGatewayResponse;
export type GetBotGatewayFullOverrideFunction = () => GetBotGatewayResponse;
interface GatewayOptions {
    /**
     * If dropped connections should be automatically reconnected.
     * @defaultValue true
     */
    autoReconnect?: boolean;
    /**
     * If packets to and from Discord should be compressed.
     * @defaultValue false
     */
    compress?: boolean;
    /**
     * The concurrency for shard connections. If you don't know what this is, don't mess with it. Only bots in >150,000 servers can use any non-default value.
     * @defaultValue 1
     */
    concurrency?: number | "auto";
    /**
     * The `properties` used when identifying.
     */
    connectionProperties?: {
        /**
         * The browser of the client. For example, "Discord Android" or "Discord iOS" to show as mobile.
         * @defaultValue Oceanic
         */
        browser?: string;
        /**
         * The device of the client.
         * @defaultValue Oceanic
         */
        device?: string;
        /**
         * The operating system of the client.
         * @defaultValue `process.platform()`
         */
        os?: string;
    };
    /**
     * The maximum amount of time in milliseconds to wait for a connection to be established.
     * @defaultValue 30000
     */
    connectionTimeout?: number;
    /**
     * The ID of the first shard to run for this client. Mutually exclusive with `shardIDs`.
     * @defaultValue 0
     */
    firstShardID?: number;
    /**
     * If the members of all guilds should be requested. Requires the `GUILD_MEMBERS` intent.
     * @defaultValue false
     */
    getAllUsers?: boolean;
    /**
     * The time in milliseconds after which the client will consider all guilds to have been received.
     * @defaultValue 2000
     */
    guildCreateTimeout?: number;
    /**
     * The [intents](https://discord.com/developers/docs/topics/gateway#list-of-intents) to use. Either a number, array of intent names, array of numbers, or "ALL"/"ALL_NON_PRIVILEGED". All non privileged intents are used by default.
     * @defaultValue {@link Constants~AllNonPrivilegedIntents | All Non Privileged Intents}
     */
    intents?: number | Array<IntentNames | "ALL" | "ALL_NON_PRIVILEGED" | number>;
    /**
     * The threshold at which guilds are considered "large" (after which offline members will not be loaded).
     * @defaultValue 250
     */
    largeThreshold?: number;
    /**
     * The ID of the last shard to run for this client. Mutually exclusive with `shardIDs`.
     * @defaultValue maxShards - 1
     */
    lastShardID?: number;
    /**
     * If upon recieving a disconnect for disallowed intents, we should request the application's flags and list the privileged intents that are missing in the error. This requires making a request to {@link REST/Applications.getCurrent | `/applications/@me`}.
     * @defaultValue false
     */
    lookupDisallowedIntents?: boolean;
    /**
     * The maximum number of attempts to reconnect.
     * @defaultValue Infinity
     */
    maxReconnectAttempts?: number;
    /**
     * The maximum number of attempts to resume a lost connection.
     * @defaultValue 10
     */
    maxResumeAttempts?: number;
    /**
     * The total number of shards across all running clients. Limit the number of shards per client via `firstShardID` & `lastShardID`.
     * @defaultValue 1
     */
    maxShards?: number | "auto";
    /** Options for overriding default gateway behavior. */
    override?: OverrideOptions;
    /** The initial presence to use when connecting. */
    presence?: UpdatePresenceOptions;
    /**
     * A function to calculate the delay between reconnect attempts.
     * @defaultValue (lastDelay, attempts) => Math.pow(attempts + 1, 0.7) * 20000
     */
    reconnectDelay?: ReconnectDelayFunction;
    /**
     * If a check should be made before connecting, which will remove any disallowed intents. This requires making a request to {@link REST/Applications.getCurrent | `/applications/@me`}. Any removed intents will be emitted via the `warn` event.
     * @defaultValue false
     */
    removeDisallowedIntents?: boolean;
    /**
     * If existing voice connections should be populated. This will disconnect connections from other sessions.
     * @defaultValue false
     */
    seedVoiceConnections?: boolean;
    /**
     * An array of shard IDs to run for this client. Mutually exclusive with `firstShardID` & `lastShardID`.
     * @defaultValue based on `firstShardID` & `lastShardID`
     */
    shardIDs?: Array<number>;
    /**
     * If the built-in dispatch handlers should be used. Disabling this will result in no dispatch packets being handled by the client.
     * Handlers for `READY` and `RESUMED` will always be registered. You must handle **everything else** manually.
     * @defaultValue true
     */
    useDefaultDispatchHandlers?: boolean;
    /** The options to pass to constructed websockets. */
    ws?: WSClientOptions;
}

export interface OverrideOptions {
    /**
     * If the compression/version information should be appended to the query.
     * @defaultValue true if `getBot` and `url` are undefined, false otherwise
     */
    appendQuery?: boolean;
    /**
     * If the gateway url should be used for resuming.
     * @defaultValue false if `getBot` or `url` are present, true otherwise
     */
    gatewayURLIsResumeURL?: boolean;
    /**
     * The amount time in milliseconds to wait between shard connects. Discord only allows one connection per 5 seconds.
     * @defaultValue 5000
     */
    timeBetweenShardConnects?: number;
    /** Replaces the response normally recieved from `GET /gateway/bot`. The `url` function below will override the value returned here. */
    getBot?(): Promise<GetBotGatewayResponse>;
    /** Replaces the `resume_url` recieved from Discord. */
    resumeURL?(shard: Shard, totalShards: number): Promise<string>;
    /** Replaces the gateway url shards connect to. This WILL be called multiple times if you have more than one shard, be sure to cache its results if you do anythng that isn't quickly repeatable. */
    url?(shard: Shard, totalShards: number): Promise<string>;
}

export interface ShardManagerInstanceOptions extends Required<Omit<GatewayOptions, "concurrency" | "connectionProperties" | "intents" | "maxShards" | "presence" | "override">> {
    concurrency: number;
    connectionProperties: Required<GatewayOptions["connectionProperties"]>;
    intents: number;
    maxShards: number;
    override: Omit<OverrideOptions, "appendQuery" | "gatewayURLIsResumeURL" | "timeBetweenShardConnects"> & Required<Pick<OverrideOptions, "appendQuery" | "gatewayURLIsResumeURL" | "timeBetweenShardConnects">>;
    presence: Required<UpdatePresenceOptions>;
}

export interface GetGatewayResponse {
    url: string;
}

export interface RawGetBotGatewayResponse extends GetGatewayResponse {
    session_start_limit: RawSessionStartLimit;
    shards: number;
}

export interface RawSessionStartLimit {
    max_concurrency: number;
    remaining: number;
    reset_after: number;
    total: number;
}

export interface SessionStartLimit {
    maxConcurrency: number;
    remaining: number;
    resetAfter: number;
    total: number;
}


export interface GetBotGatewayResponse extends GetGatewayResponse {
    sessionStartLimit: SessionStartLimit;
    shards: number;
}

export interface RequestGuildMembersOptions {
    /** The maximum number of members to request. */
    limit?: number;
    /**
     * If presences should be requested. Requires the `GUILD_PRESENCES` intent.
     * @defaultValue false
     */
    presences?: boolean;
    /** If provided, only members with a username that starts with this string will be returned. If empty or not provided, requires the `GUILD_MEMBERS` intent. */
    query?: string;
    /**
     * The maximum amount of time in milliseconds to wait.
     * @defaultValue `client.rest.options.requestTimeout`
     */
    timeout?: number;
    /** The IDs of up to 100 users to specifically request. */
    userIDs?: Array<string>;
}

export type MutualStatuses = "online" | "dnd" | "idle";
export type SendStatuses = MutualStatuses | "invisible";
export type ReceiveStatuses = MutualStatuses | "offline";

export interface UpdatePresenceOptions {
    /** An array of activities. */
    activities?: Array<BotActivity>;
    /** If the client is afk. */
    afk?: boolean;
    /** The [status](https://discord.com/developers/docs/topics/gateway#update-presence-status-types). */
    status: SendStatuses;
}

export interface Activity {
    application_id?: string;
    assets?: Partial<Record<"large_image" | "large_text" | "small_image" | "small_text", string>>;
    buttons?: Array<ActivityButton>;
    created_at: number;
    details?: string | null;
    emoji?: ActivityEmoji | null;
    flags?: number;
    instance?: boolean;
    name: string;
    party?: ActivityParty;
    secrets?: Partial<Record<"join" | "spectate" | "match", string>>;
    state?: string | null;
    timestamps?: Partial<Record<"end" | "start", number>>;
    type: ActivityTypes;
    url?: string | null;
}

export interface BotStreamingActivity {
    name: string;
    type: ActivityTypes.STREAMING;
    url: string;
}

export interface BotCustomActivity {
    name: string;
    state: string;
    type: ActivityTypes.CUSTOM;
}
export interface BotOtherActivity {
    name: string;
    type: ActivityTypes.GAME | ActivityTypes.LISTENING | ActivityTypes.WATCHING;
}

export type BotActivity  = BotStreamingActivity | BotCustomActivity | BotOtherActivity;

export interface ActivityEmoji {
    animated?: boolean;
    id?: string;
    name: string;
}

export interface ActivityParty {
    id?: string;
    size?: [currentSize: number, maxSize: number];
}

export interface ActivityButton {
    label: string;
    url: string;
}

export interface PresenceUpdate {
    activities?: Array<Activity>;
    client_status: ClientStatus;
    guild_id: string;
    status: ReceiveStatuses;
    user: { id: string; } & Partial<Omit<RawUser, "id">>;
}

export interface ClientStatus {
    desktop?: string;
    mobile?: string;
    web?: string;
}

export interface UpdateVoiceStateOptions {
    /** If the client should be self deafened. */
    selfDeaf?: boolean;
    /** If the client should be self muted. */
    selfMute?: boolean;
}

export interface RawAutoModerationActionExecution {
    action: RawAutoModerationAction;
    alert_system_message_id?: string;
    channel_id?: string;
    content: string;
    guild_id: string;
    matched_content: string;
    matched_keyword: string | null;
    message_id?: string;
    rule_id: string;
    rule_trigger_type: AutoModerationTriggerTypes;
    user_id: string;
}

export interface AutoModerationActionExecution {
    action: AutoModerationAction;
    alertSystemMessageID?: string;
    content: string;
    matchedContent: string;
    matchedKeyword: string | null;
    messageID?: string;
    rule?: AutoModerationRule;
    ruleID: string;
    ruleTriggerType: AutoModerationTriggerTypes;
}

export type ShardStatus = "connecting" | "disconnected" | "handshaking" | "identifying" | "ready" | "resuming";

export interface RawDeletedPrivateChannel {
    flags: number;
    id: string;
    last_message_id: string | null;
    type: ChannelTypes.DM;
}

export interface DeletedPrivateChannel {
    flags: number;
    id: string;
    lastMessageID: string | null;
    type: ChannelTypes.DM;
}

export interface RawVoiceChannelEffect {
    animation_id?: number;
    animation_type?: AnimationTypes;
    channel_id: string;
    emoji?: PartialEmoji | null;
    guild_id: string;
    user_id: string;
}

export interface VoiceChannelEffect {
    animationID?: number;
    animationType?: AnimationTypes;
}

export interface RawMessagePollVote {
    answer_id: number;
    channel_id: string;
    guild_id?: string;
    message_id: string;
    user_id: string;
}
