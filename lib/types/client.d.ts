/** @module Types/Client */
import type { AllowedMentions } from "./channels";
import type { GatewayOptions } from "./gateway";
import type { ImageFormat } from "../Constants";
import type { Dispatcher } from "undici-types";

export interface ClientOptions {
    /**
     * The default allowed mentions object.
     * @defaultValue { everyone: false, repliedUser: false, roles: true, users: true }
     */
    allowedMentions?: AllowedMentions;
    /** Fully qualified authorization string (e.x. Bot [TOKEN]) - you MUST prefix it yourself */
    auth?: string | null;
    /** The maximum number of items that can be present in various collections. */
    collectionLimits?: CollectionLimitsOptions;
    /**
     * The default image format to use.
     * @defaultValue png
     */
    defaultImageFormat?: ImageFormat;
    /**
     * The default image size to use.
     * @defaultValue 4096
     */
    defaultImageSize?: number;
    /**
     * Enable to disable as much caching as reasonably possible. You should only enable this option if you absolutely know what you are doing. This will break many features that rely on caching. Unless set to the literal string "no-warning", this will emit a node warning (via `process.emitWarning`) when the client is constructed.
     * @defaultValue false
     */
    disableCache?: boolean | "no-warning";
    /**
     * When member limits are set on guilds, the limit is automatically raised if needed when requesting members from the gateway. This can be buggy and may not function correctly.
     * @defaultValue false
     */
    disableMemberLimitScaling?: boolean;
    /** The gateway options. */
    gateway?: GatewayOptions;
    /** The options for the request handler. */
    rest?: RESTOptions;
}
export interface ClientInstanceOptions extends Required<Omit<ClientOptions, "rest" | "gateway" | "collectionLimits" | "disableCache">> {
    collectionLimits: Required<CollectionLimitsOptions>;
    disableCache: boolean;
    /** If rest mode has been enabled. */
    restMode: boolean;
}

export interface RESTOptions {
    /**
     * The agent to use for requests.
     * @defaultValue null
     */
    agent?: Dispatcher | null;
    /**
     * The base URL to use for requests - must be a fully qualified url.
     * @defaultValue https://discordapp.com/api/v\{REST_VERSION\}
     */
    baseURL?: string;
    /**
     * If the built-in latency compensator should be disabled.
     * @defaultValue false
     */
    disableLatencyCompensation?: boolean;
    /**
     * If redirects should be followed.
     * @defaultValue false
     */
    followRedirects?: boolean;
    /**
     * The `Host` header to use for requests.
     * @defaultValue Parsed from `baseURL`
     */
    host?: string;
    /**
     * In milliseconds, the average request latency at which to start emitting latency errors.
     * @defaultValue 30000
     */
    latencyThreshold?: number;
    /**
     * In milliseconds, the maximum ratelimit delay (in milliseconds) the lib will internally wait for to retry the request. If a ratelimit resets after this window, an error will be thrown instead.
     * @note This currently defaults to Infinity for backwards compatibility, but this will be changed in 1.12.0.
     * @defaultValue Infinity
     */
    maxRatelimitRetryWindow?: number;
    /**
     * In milliseconds, the time to offset ratelimit calculations by.
     * @defaultValue 0
     */
    ratelimiterOffset?: number;
    /**
     * In milliseconds, how long to wait until a request is timed out.
     * @defaultValue 15000
     */
    requestTimeout?: number;
    /**
     * A value for the `X-Super-Properties` header, sent with all requests if present. This can be used to reveal some properties only visible to >= client builds. Provide either an object, or a base64 encoded string.
     * @example eyJjbGllbnRfYnVpbGRfbnVtYmVyIjoxNjI5OTJ9
     * @example { client_build_number: 162992 }
     * @defaultValue null
     */
    superProperties?: string | Record<string, unknown> | null;
    /**
     * The `User-Agent` header to use for requests.
     * @defaultValue Oceanic/\{VERSION\} (https://github.com/OceanicJS/Oceanic)
     */
    userAgent?: string;
}

/**
 * Changing many of these may have the side effect of silently breaking various functionalities. Most of these are not intended to be changed, and are only exposed for advanced use cases.
 *
 * For the options which accept a number and an object:
 * - number: applies for all instances in which the limit would apply
 * - object: dictionary of ids to limits. When setting limits, if the id is present, the specific number listed with that id will be used. Else, the `default` key will be used. If the `default` key is not present, whatever the default for that specific option is will be used.
 *
 * See the `Dictionary Key` header for each option for what the `id` refers to.
 */
export interface CollectionLimitsOptions {
    /**
     * The maximum number of audit log entries to keep cached. Entries are only cached if recieved via the `GUILD_AUDIT_LOG_ENTRY_CREATE` gateway event.
     * @dictionaryKey guild id
     * @defaultValue 50
     */
    auditLogEntries?: number | Record<string, number>;
    /**
     * The maximum number of auto moderation rules to keep cached. Entries are only cached if fetched via REST, or recieved via the `AUTO_MODERATION_RULE_CREATE`/`AUTO_MODERATION_RULE_UPDATE` events.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    autoModerationRules?: number | Record<string, number>;
    /**
     * The maximum number of guild channels to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    channels?: number | Record<string, number>;
    /**
     * The maximum number of guild emojis to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    emojis?: number | Record<string, number>;
    /**
     * The maximum number of group channels to cache.
     * @defaultValue 10
     */
    groupChannels?: number;
    /**
     * The maximum number of threads to cache per guild. Setting this too low might cause channels to have missing threads, as they all pull from the guild.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    guildThreads?: number | Record<string, number>;
    /**
     * The maximum number of guilds to cache.
     * @defaultValue Infinity
     * @note Changing this WILL silently break a lot of things which rely on caching.
     */
    guilds?: number;
    /**
     * The maximum number of guild integrations to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    integrations?: number | Record<string, number>;
    /**
     * The maximum number of guild invites to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    invites?: number | Record<string, number>;
    /**
     * The maximum number of members to cache.
     *
     * Note: If you request members from the gateway, this will be increased (on the specific guild) as needed to accommodate those members.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    members?: number | Record<string, number>;
    /**
     * The maximum number of messages to cache.
     * @dictionaryKey channel id
     * @defaultValue 100
     */
    messages?: number | Record<string, number>;
    /**
     * The maximum number of private channels to cache.
     * @defaultValue 25
     */
    privateChannels?: number;
    /**
     * The maximum number of roles to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    roles?: number | Record<string, number>;
    /**
     * The maximum number of scheduled events to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    scheduledEvents?: number | Record<string, number>;
    /**
     * The maximum number of soundboard sounds to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    soundboardSounds?: number | Record<string, number>;
    /**
     * The maximum number of stage instances to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    stageInstances?: number | Record<string, number>;
    /**
     * The maximum number of guild stickers to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    stickers?: number | Record<string, number>;
    /**
     * The maximum number of unavailable guilds to cache.
     * @defaultValue Infinity
     * @note Changing this WILL break many things. The client may not even ready poperly.
     */
    unavailableGuilds?: number;
    /**
     * The maximum number of users to cache globally.
     * @defaultValue Infinity
     */
    users?: number;
    /**
     * The maximum number of voice members to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    voiceMembers?: number | Record<string, number>;
    /**
     * The maximum number of voice states to cache.
     * @dictionaryKey guild id
     * @defaultValue Infinity
     */
    voiceStates?: number | Record<string, number>;
}
