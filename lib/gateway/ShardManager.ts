/** @module ShardManager */
import Shard from "./Shard.js";
import type Client from "../Client.js";
import {
    AllIntents,
    AllNonPrivilegedIntents,
    ApplicationFlags,
    GATEWAY_VERSION,
    Intents
} from "../Constants.js";
import type { GatewayOptions, GetBotGatewayResponse, ShardManagerInstanceOptions } from "../types/gateway.js";
import Collection from "../util/Collection.js";
import Guild from "../structures/Guild.js";

/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, unicorn/prefer-module */
// @ts-ignore
let Erlpack: typeof import("erlpack") | undefined;
try {
    Erlpack = require("erlpack");
} catch {}
/* eslint-enable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, unicorn/prefer-module */


/** A manager for all the client's shards. */
export default class ShardManager extends Collection<number, Shard> {
    private _gatewayURL?: string;
    #buckets: Record<number, number>;
    #client: Client;
    #connectQueue: Array<Shard>;
    #connectTimeout: NodeJS.Timeout | null;
    connected = false;
    options: ShardManagerInstanceOptions;
    constructor(client: Client, options: GatewayOptions = {}) {
        super();
        this.#buckets = {};
        this.#client = client;
        this.#connectQueue = [];
        this.#connectTimeout = null;
        this.options = {
            autoReconnect:        options.autoReconnect ?? true,
            compress:             options.compress ?? false,
            connectionProperties: {
                browser: options.connectionProperties?.browser ?? "Oceanic",
                device:  options.connectionProperties?.device ?? "Oceanic",
                os:      options.connectionProperties?.os ?? process.platform
            },
            concurrency:       options.concurrency === "auto" || options.concurrency && options.concurrency < 1 ? -1 : options.concurrency ?? -1,
            connectionTimeout: options.connectionTimeout ?? 30000,
            firstShardID:      options.firstShardID && options.firstShardID < 0 ? 0 : options.firstShardID ?? 0,
            getAllUsers:       options.getAllUsers ?? false,
            override:          options.override as ShardManagerInstanceOptions["override"] ?? {
                appendQuery:              true,
                gatewayURLIsResumeURL:    false,
                timeBetweenShardConnects: 5000
            },
            guildCreateTimeout:   options.guildCreateTimeout ?? 2000,
            intents:              typeof options.intents === "number" ? options.intents : 0,
            largeThreshold:       options.largeThreshold ?? 250,
            lastShardID:          options.lastShardID ?? -1,
            maxReconnectAttempts: options.maxReconnectAttempts ?? Infinity,
            maxResumeAttempts:    options.maxResumeAttempts ?? 10,
            maxShards:            options.maxShards === "auto" || options.maxShards && options.maxShards < 1 ? -1 : options.maxShards ?? -1,
            presence:			          {
                activities: options.presence?.activities ?? [],
                afk:		      options.presence?.afk ?? false,
                status:		   options.presence?.status ?? "online"
            },
            reconnectDelay:          options.reconnectDelay ?? ((lastDelay, attempts): number => Math.pow(attempts + 1, 0.7) * 20000),
            removeDisallowedIntents: options.removeDisallowedIntents ?? false,
            seedVoiceConnections:    options.seedVoiceConnections ?? false,
            shardIDs:                options.shardIDs ?? [],
            ws:                      options.ws ?? {}
        };
        this.options.override.appendQuery ??= (this.options.override.getBot === undefined && this.options.override.url === undefined);
        this.options.override.gatewayURLIsResumeURL ??= (this.options.override.getBot !== undefined || this.options.override.url !== undefined);
        this.options.override.timeBetweenShardConnects ??= 5000;
        if (this.options.lastShardID === -1 && this.options.maxShards !== -1) {
            this.options.lastShardID = this.options.maxShards - 1;
        }

        if (!Array.isArray(this.options.shardIDs)) {
            this.options.shardIDs = [];
        }

        if (Object.hasOwn(options, "intents")) {
            if (Array.isArray(options.intents)) {
                let bitmask = 0;
                for (const intent of options.intents) {
                    if (typeof intent === "number") {
                        bitmask |= intent;
                    } else if (Intents[intent as keyof typeof Intents]) {
                        bitmask |= Intents[intent as keyof typeof Intents];
                    } else {
                        if (intent === "ALL") {
                            bitmask = AllIntents;
                            break;
                        } else if (intent === "ALL_NON_PRIVILEGED") {
                            bitmask = AllNonPrivilegedIntents;
                            break;
                        }
                        this.#client.emit("warn", `Unknown intent: ${intent}`);
                    }
                }

                this.options.intents = bitmask;
            }
        } else {
            this.options.intents = AllNonPrivilegedIntents;
        }

        if (this.options.getAllUsers && !(this.options.intents & Intents.GUILD_MEMBERS)) {
            throw new TypeError("Guild members cannot be requested without the GUILD_MEMBERS intent");
        }

    }

    private _connect(shard: Shard): void {
        this.#connectQueue.push(shard);
        this.tryConnect();
    }

    private async _gatewayURLForShard(shard: Shard): Promise<string> {
        if (this.options.override.url !== undefined) {
            return this.options.override.url(shard, this.options.shardIDs.length);
        }

        if (this._gatewayURL) {
            return this._gatewayURL;
        }

        // how did we manage to get all the way to connecting without gatewayURL being set?
        return (this._gatewayURL = (await (this.options.override.getBot?.() ?? this.#client.rest.getBotGateway())).url);
    }

    private _ready(id: number): void {
        const rateLimitKey = (id % this.options.concurrency) ?? 0;
        this.#buckets[rateLimitKey] = Date.now();

        this.tryConnect();
    }

    private _resetConnectQueue(): void {
        this.#connectQueue = [];
    }

    async connect(): Promise<void> {
        if (this.connected) {
            throw new Error("Already connected.");
        }

        let url: string | null, data: GetBotGatewayResponse | undefined;
        const overrideURL = (this.options.override.getBot || this.options.override.url) !== undefined;
        try {
            if (this.options.maxShards === -1 || this.options.concurrency === -1) {
                data = await (this.options.override.getBot?.() ?? this.#client.rest.getBotGateway());
                url = data.url;
            } else {
                url = overrideURL ? null : (await this.#client.rest.getGateway()).url;
            }
        } catch (err) {
            throw new TypeError("Failed to get gateway information.", { cause: err as Error });
        }
        if (url && this.options.override.appendQuery) {
            if (url.includes("?")) {
                url = url.slice(0, url.indexOf("?"));
            }
            if (!url.endsWith("/")) {
                url += "/";
            }
        }
        const privilegedIntentMapping = [
            [Intents.GUILD_PRESENCES, [ApplicationFlags.GATEWAY_PRESENCE, ApplicationFlags.GATEWAY_PRESENCE_LIMITED]],
            [Intents.GUILD_MEMBERS, [ApplicationFlags.GATEWAY_GUILD_MEMBERS, ApplicationFlags.GATEWAY_GUILD_MEMBERS_LIMITED]],
            [Intents.MESSAGE_CONTENT, [ApplicationFlags.GATEWAY_MESSAGE_CONTENT, ApplicationFlags.GATEWAY_MESSAGE_CONTENT_LIMITED]]
        ] as Array<[intent: Intents, allowed: Array<ApplicationFlags>]>;

        /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
        if (this.options.removeDisallowedIntents && privilegedIntentMapping.some(([intent]) => (this.options.intents & intent) === intent)) {
            const { flags } = await this.#client.rest.misc.getApplication();
            const check = (intent: Intents, allowed: Array<ApplicationFlags>): void => {
                if ((this.options.intents & intent) === intent && !allowed.some(flag => (flags & flag) === flag)) {
                    this.#client.emit("warn", `removeDisallowedIntents is enabled, and ${Intents[intent]} was included but not found to be allowed. It has been removed.`);
                    this.options.intents &= ~intent;
                }
            };
            for (const [intent, allowed] of privilegedIntentMapping) {
                check(intent, allowed);
            }
        }
        /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */

        if (url && this.options.override.appendQuery) {
            url += `?v=${GATEWAY_VERSION}&encoding=${Erlpack ? "etf" : "json"}`;
            if (this.options.compress) {
                url += "&compress=zlib-stream";
            }
            this._gatewayURL = url;
        }

        if (this.options.maxShards === -1) {
            if (!data || !data.shards) {
                throw new TypeError("AutoSharding failed, missing required information from Discord.");
            }
            this.options.maxShards = data.shards;
            if (this.options.lastShardID === -1) {
                this.options.lastShardID = data.shards - 1;
            }
        }

        if (this.options.concurrency === -1) {
            if (!data) {
                throw new TypeError("AutoConcurrency failed, missing required information from Discord.");
            }
            this.options.concurrency = data.sessionStartLimit.maxConcurrency;
        }

        if (this.options.shardIDs.length === 0 && this.options.firstShardID !== undefined && this.options.lastShardID !== undefined) {
            for (let i = this.options.firstShardID; i <= this.options.lastShardID; i++) {
                this.options.shardIDs.push(i);
            }
        }

        this.connected = true;
        for (const id of this.options.shardIDs) {
            this.spawn(id);
        }
    }

    /**
     * Disconnect all shards.
     * @param reconnect If shards should be reconnected. Defaults to {@link Types/Gateway~GatewayOptions#autoReconnect | GatewayOptions#autoReconnect}
     */
    disconnect(reconnect = this.options.autoReconnect): void {
        if (!reconnect) {
            this.connected = false;
        }

        this.#client.ready = false;
        for (const [,shard] of this) shard.disconnect(reconnect);
        this._resetConnectQueue();
    }

    forGuild(guild: string | Guild): Shard | undefined {
        if (guild instanceof Guild) {
            guild = guild.id;
        }

        if (this.options.maxShards === -1) {
            return undefined;
        }
        return this.get((this.#client.guildShardMap[guild] ??= Number((BigInt(guild) >> 22n) % BigInt(this.options.maxShards))));
    }

    spawn(id: number): void {
        let shard = this.get(id);
        if (!shard) {
            shard = new Shard(id, this.#client);
            this.set(id, shard);
            shard
                .on("ready", () => {
                    this.#client.emit("shardReady", id);
                    if (this.#client.ready) {
                        return;
                    }
                    for (const other of this.values()) {
                        if (!other.ready) {
                            return;
                        }
                    }

                    this.#client.ready = true;
                    this.#client.startTime = Date.now();
                    this.#client.emit("ready");
                })
                .on("resume", () => {
                    this.#client.emit("shardResume", id);
                    if (this.#client.ready) {
                        return;
                    }
                    for (const other of this.values()) {
                        if (!other.ready) {
                            return;
                        }
                    }

                    this.#client.ready = true;
                    this.#client.startTime = Date.now();
                    this.#client.emit("ready");
                })
                .on("disconnect", error => {
                    this.#client.emit("shardDisconnect", error, id);
                    for (const other of this.values()) {
                        if (other.ready) {
                            return;
                        }
                    }

                    this.#client.ready = false;
                    this.#client.startTime = 0;
                    this.#client.emit("disconnect");
                })
                .on("preReady", () => {
                    this.#client.emit("shardPreReady", id);
                });
        }

        if (shard.status === "disconnected") {
            this._connect(shard);
        }
    }

    tryConnect(): void {
        if (this.#connectQueue.length === 0) {
            return;
        }

        for (const shard of this.#connectQueue) {
            const rateLimitKey = (shard.id % this.options.concurrency) ?? 0;
            const lastConnect = this.#buckets[rateLimitKey] ?? 0;
            if (!shard.sessionID && Date.now() - lastConnect < this.options.override.timeBetweenShardConnects) {
                continue;
            }

            if (this.some(s => s.connecting && ((s.id % this.options.concurrency) || 0) === rateLimitKey)) {
                continue;
            }
            void shard.connect();
            this.#buckets[rateLimitKey] = Date.now();
            this.#connectQueue.splice(this.#connectQueue.findIndex(s => s.id === shard.id), 1);
        }
        if (!this.#connectTimeout && this.#connectQueue.length !== 0) {
            this.#connectTimeout = setTimeout(() => {
                this.#connectTimeout = null;
                this.tryConnect();
            }, 500);
        }

    }
}
