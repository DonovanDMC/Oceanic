/** @module Shard */
import type ShardManager from "./ShardManager";
import type Client from "../Client";
import TypedEmitter from "../util/TypedEmitter";
import Bucket from "../rest/Bucket";
import { GatewayCloseCodes, GatewayOPCodes, GATEWAY_VERSION, Intents } from "../Constants";
import type {
    UpdatePresenceOptions,
    RequestGuildMembersOptions,
    UpdateVoiceStateOptions,
    SendStatuses,
    BotActivity,
    ShardStatus
} from "../types/gateway";
import type Member from "../structures/Member";
import Base from "../structures/Base";
import type {  AnyReceivePacket, ReadyPacket } from "../types/gateway-raw";
import type { RawOAuthUser, RawUser } from "../types/users";
import type { RawGuild } from "../types/guilds";
import ExtendedUser from "../structures/ExtendedUser";
import type Guild from "../structures/Guild";
import type { ShardEvents } from "../types/events";
import GatewayError, { DependencyError } from "../util/Errors";
import ClientApplication from "../structures/ClientApplication";
import WebSocket, { type Data } from "ws";
import type Pako from "pako";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { Inflate } from "zlib-sync";
import { randomBytes } from "node:crypto";
import { inspect } from "node:util";
import assert from "node:assert";

/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, unicorn/prefer-module, @typescript-eslint/no-unsafe-member-access */
// @ts-ignore
let Erlpack: typeof import("erlpack") | undefined;
try {
    Erlpack = require("erlpack");
} catch {}
// @ts-ignore
let ZlibSync: typeof import("pako") | typeof import("zlib-sync") | undefined, zlibConstants: typeof import("pako").constants | typeof import("zlib-sync") | undefined;
try {
    ZlibSync = require("zlib-sync");
    zlibConstants = require("zlib-sync");
} catch {
    try {
        ZlibSync = require("pako");
        zlibConstants = require("pako").constants;
    } catch {}
}
/* eslint-enable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, unicorn/prefer-module */

/** Represents a gateway connection to Discord. See {@link ShardEvents | Shard Events} for a list of events. */
export default class Shard extends TypedEmitter<ShardEvents> {
    private _connectTimeout: NodeJS.Timeout | null;
    private _getAllUsersCount: Record<string, true>;
    private _getAllUsersQueue: Array<string>;
    private _guildCreateTimeout: NodeJS.Timeout | null;
    private _heartbeatInterval: NodeJS.Timeout | null;
    private _requestMembersPromise: Record<string, { members: Array<Member>; received: number; timeout: NodeJS.Timeout; reject(reason?: unknown): void; resolve(value: unknown): void; }>;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    private _sharedZLib!: Pako.Inflate | Inflate;
    client!: Client;
    connectAttempts: number;
    connecting: boolean;
    globalBucket!: Bucket;
    id: number;
    lastHeartbeatAck: boolean;
    lastHeartbeatReceived: number;
    lastHeartbeatSent: number;
    latency: number;
    manager!: ShardManager;
    preReady: boolean;
    presence!: Required<UpdatePresenceOptions>;
    presenceUpdateBucket!: Bucket;
    ready: boolean;
    reconnectInterval: number;
    resumeURL: string | null;
    sequence: number;
    sessionID: string | null;
    status: ShardStatus;
    ws!: WebSocket | null;
    constructor(id: number, manager: ShardManager) {
        super();
        Object.defineProperties(this, {
            client: {
                value:        manager.client,
                enumerable:   false,
                writable:     false,
                configurable: false
            },
            manager: {
                value:        manager,
                enumerable:   false,
                writable:     true,
                configurable: false
            },
            ws: {
                value:        null,
                enumerable:   false,
                writable:     true,
                configurable: false
            }
        });

        this.onPacket = this.onPacket.bind(this);
        this.onWSClose = this.onWSClose.bind(this);
        this.onWSError = this.onWSError.bind(this);
        this.onWSMessage = this.onWSMessage.bind(this);
        this.onWSOpen = this.onWSOpen.bind(this);
        this.connectAttempts = 0;
        this._connectTimeout = null;
        this.connecting = false;
        this._getAllUsersCount = {};
        this._getAllUsersQueue = [];
        this._guildCreateTimeout = null;
        this._heartbeatInterval = null;
        this.id = id;
        this.lastHeartbeatAck = true;
        this.lastHeartbeatReceived = 0;
        this.lastHeartbeatSent = 0;
        this.latency = Infinity;
        this.preReady = false;
        this.ready = false;
        this.reconnectInterval = 1000;
        this._requestMembersPromise = {};
        this.resumeURL = null;
        this.sequence = 0;
        this.sessionID = null;
        this.status = "disconnected";
        this.hardReset();
    }

    private _ready(data: ReadyPacket["d"]): void {
        this.connectAttempts = 0;
        this.reconnectInterval = 1000;
        this.connecting = false;
        if (this._connectTimeout) {
            clearInterval(this._connectTimeout);
        }
        this.status = "ready";
        this.client.shards["_ready"](this.id);
        this.client["_application"] = new ClientApplication(data.application, this.client);
        if (this.client["_user"]) {
            this.client.users.update(data.user as unknown as RawUser);
        } else {
            this.client["_user"] = this.client.users.add(new ExtendedUser(data.user as RawOAuthUser, this.client));
        }

        let url = data.resume_gateway_url;
        if (url.includes("?")) {
            url = url.slice(0, url.indexOf("?"));
        }
        if (!url.endsWith("/")) {
            url += "/";
        }
        this.resumeURL = `${url}?v=${GATEWAY_VERSION}&encoding=${Erlpack ? "etf" : "json"}`;
        if (this.client.shards.options.compress) {
            this.resumeURL += "&compress=zlib-stream";
        }
        this.sessionID = data.session_id;

        for (const guild of data.guilds) {
            this.client.guilds.delete(guild.id);
            this.client.unavailableGuilds.update(guild);
        }

        this.preReady = true;
        this.emit("preReady");

        if (this.client.unavailableGuilds.size !== 0 && data.guilds.length !== 0) {
            void this.restartGuildCreateTimeout();
        } else {
            void this.checkReady();
        }
    }

    private _resume(): void {
        this.connectAttempts = 0;
        this.reconnectInterval = 1000;
        this.connecting = false;
        if (this._connectTimeout) {
            clearInterval(this._connectTimeout);
        }
        this.status = "ready";
        this.client.shards["_ready"](this.id);
        void this.checkReady();
        this.emit("resume");
    }

    private async checkReady(): Promise<void> {
        if (!this.ready) {
            if (this._getAllUsersQueue.length !== 0) {
                const id = this._getAllUsersQueue.shift()!;
                await this.requestGuildMembers(id);
                this._getAllUsersQueue.splice(this._getAllUsersQueue.indexOf(id), 1);
                return;
            }
            if (Object.keys(this._getAllUsersCount).length === 0) {
                this.ready = true;
                this.emit("ready");
            }
        }
    }

    private createGuild(data: RawGuild): Guild {
        this.client.guildShardMap[data.id] = this.id;
        const guild = this.client.guilds.update(data);
        if (this.client.shards.options.getAllUsers && guild.members.size < guild.memberCount) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
            void this.requestGuildMembers(guild.id, { presences: (this.client.shards.options.intents & Intents.GUILD_PRESENCES) === Intents.GUILD_PRESENCES });
        }


        return guild;
    }

    private async initialize(): Promise<void> {
        if (!this._token) {
            return this.disconnect(false, new TypeError("Invalid Token."));
        }
        this.status = "connecting";
        if (this.client.shards.options.compress) {
            if (!ZlibSync) {
                throw new DependencyError("Cannot use compression without pako or zlib-sync.");
            }
            this.client.emit("debug", "Initializing zlib-sync-based compression.");
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            this._sharedZLib = new ZlibSync.Inflate({ chunkSize: 128 * 1024 });
        }
        if (!this.client.shards.options.override.gatewayURLIsResumeURL && this.sessionID) {
            if (this.resumeURL === null) {
                this.client.emit("warn", "Resume url is not currently present. Discord may disconnect you quicker.", this.id);
            }

            this.ws = new WebSocket(this.resumeURL ?? await this.client.shards["_gatewayURLForShard"](this), this.client.shards.options.ws);
        } else {
            this.ws = new WebSocket(await this.client.shards["_gatewayURLForShard"](this), this.client.shards.options.ws);
        }


        /* eslint-disable @typescript-eslint/unbound-method */
        this.ws.on("close", this.onWSClose);
        this.ws.on("error", this.onWSError);
        this.ws.on("message", this.onWSMessage);
        this.ws.on("open", this.onWSOpen);
        /* eslint-enable @typescript-eslint/unbound-method */

        this._connectTimeout = setTimeout(() => {
            if (this.connecting) {
                this.disconnect(undefined, new Error("Connection timeout."));
            }

        }, this.client.shards.options.connectionTimeout);
    }

    private onPacket(packet: AnyReceivePacket): void {
        if ("s" in packet && packet.s) {
            if (packet.s > this.sequence + 1 && this.ws && this.status !== "resuming") {
                this.client.emit("warn", `Non-consecutive sequence (${this.sequence} -> ${packet.s})`, this.id);
            }

            this.sequence = packet.s;
        }

        switch (packet.op) {
            case GatewayOPCodes.DISPATCH: {
                this.client.emit("packet", packet, this.id);
                this.manager.dispatcher["handle"](packet, this);
                break;
            }

            case GatewayOPCodes.HEARTBEAT: {
                this.heartbeat(true);
                break;
            }

            case GatewayOPCodes.INVALID_SESSION: {
                if (packet.d) {
                    this.client.emit("warn", "Session Invalidated. Session may be resumable, attempting to resume..", this.id);
                    this.resume();
                } else {
                    this.sequence = 0;
                    this.sessionID = null;
                    this.client.emit("warn", "Session Invalidated. Session is not resumable, requesting a new session..", this.id);
                    this.identify();
                }
                break;
            }

            case GatewayOPCodes.RECONNECT: {
                this.client.emit("debug", "Reconnect requested by Discord.", this.id);
                this.disconnect(true);
                break;
            }

            case GatewayOPCodes.HELLO: {
                if (this._heartbeatInterval) {
                    clearInterval(this._heartbeatInterval);
                }
                this._heartbeatInterval = setInterval(() => this.heartbeat(false), packet.d.heartbeat_interval);

                this.connecting = false;
                if (this._connectTimeout) {
                    clearTimeout(this._connectTimeout);
                }
                this._connectTimeout = null;
                if (this.sessionID) {
                    this.resume();
                } else {
                    this.identify();
                    this.heartbeat();
                }

                this.client.emit("hello", packet.d.heartbeat_interval, this.id);
                break;
            }

            case GatewayOPCodes.HEARTBEAT_ACK: {
                this.lastHeartbeatAck = true;
                this.lastHeartbeatReceived = Date.now();
                this.latency = this.lastHeartbeatReceived - this.lastHeartbeatSent;
                if (isNaN(this.latency)) {
                    this.latency = Infinity;
                }
                break;
            }

            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            default: { this.client.emit("warn", `Unrecognized gateway packet: ${packet}`, this.id);
            }
        }
    }

    private async onWSClose(code: number, r: Buffer): Promise<void> {
        const reason = r.toString();
        let err: Error | undefined;
        let reconnect: boolean | undefined;
        if (code) {
            this.client.emit("debug", `${code === 1000 ? "Clean" : "Unclean"} WS close: ${code}: ${reason}`, this.id);
            switch (code) {
                case 1001: {
                    err = new GatewayError("CloudFlare WebSocket proxy restarting.", code);
                    break;
                }
                case 1006: {
                    err = new GatewayError("Connection reset by peer. This is a network issue. If you are concerned, talk to your ISP or host.", code);
                    break;
                }
                case GatewayCloseCodes.UNKNOWN_OPCODE: {
                    err = new GatewayError("Gateway received an unknown opcode.", code);
                    break;
                }

                case GatewayCloseCodes.DECODE_ERROR: {
                    err = new GatewayError("Gateway received an improperly encoded packet.", code);
                    break;
                }

                case GatewayCloseCodes.NOT_AUTHENTICATED: {
                    err = new GatewayError("Gateway received a packet before authentication.", code);
                    this.sessionID = null;
                    break;
                }

                case GatewayCloseCodes.AUTHENTICATION_FAILED: {
                    err = new GatewayError("Authentication failed.", code);
                    this.sessionID = null;
                    reconnect = false;
                    this.client.emit("error", new Error(`Invalid Token: ${this._token}`));
                    break;
                }

                case GatewayCloseCodes.ALREADY_AUTHENTICATED: {
                    err = new GatewayError("Gateway received an authentication attempt while already authenticated.", code);
                    break;
                }

                case GatewayCloseCodes.INVALID_SEQUENCE: {
                    err = new GatewayError("Gateway received an invalid sequence.", code);
                    this.sequence = 0;
                    break;
                }

                case GatewayCloseCodes.RATE_LIMITED: {
                    err = new GatewayError("Gateway connection was ratelimited.", code);
                    break;
                }

                case GatewayCloseCodes.INVALID_SHARD: {
                    err = new GatewayError("Invalid sharding specified.", code);
                    this.sessionID = null;
                    reconnect = false;
                    break;
                }

                case GatewayCloseCodes.SHARDING_REQUIRED: {
                    err = new GatewayError("Shard would handle too many guilds (>2500 each).", code);
                    this.sessionID = null;
                    reconnect = false;
                    break;
                }

                case GatewayCloseCodes.INVALID_API_VERSION: {
                    err = new GatewayError("Invalid API version.", code);
                    this.sessionID = null;
                    reconnect = false;
                    break;
                }

                case GatewayCloseCodes.INVALID_INTENTS: {
                    err = new GatewayError("Invalid intents specified.", code);
                    this.sessionID = null;
                    reconnect = false;
                    break;
                }

                case GatewayCloseCodes.DISALLOWED_INTENTS: {
                    const disallowed = this.client.shards.options.lookupDisallowedIntents ? await this.client.util.detectMissingPrivilegedIntents() : [];
                    let message = "Disallowed intents specified. Make sure any privileged intents you're trying to access have been enabled in the developer portal.";
                    if (disallowed.length !== 0) {
                        // application should always be present after the call to detectMissingPrivilegedIntents, but just in case it isn't, we don't want to swallow this disallowed intents error with a lib error
                        message = `Disallowed intents specified. You are missing: ${disallowed.join(", ")}. Make sure they are enabled here: https://discord.com/developers/applications/${this.client["_application"]?.id || "unknown"}/bot`;
                    }
                    err = new GatewayError(message, code);
                    this.sessionID = null;
                    reconnect = false;
                    break;
                }

                default: {
                    err = new GatewayError(`Unknown close: ${code}: ${reason}`, code);
                    break;
                }
            }

            this.disconnect(reconnect, err);
        }
    }

    private onWSError(err: Error): void {
        this.client.emit("error", err, this.id);
    }

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-argument */
    private onWSMessage(data: Data): void {
        if (typeof data === "string") {
            data = Buffer.from(data);
        }
        try {
            if (data instanceof ArrayBuffer) {
                if (this.client.shards.options.compress || Erlpack) {
                    data = Buffer.from(data);
                }

            } else if (Array.isArray(data)) {
                data = Buffer.concat(data);
            }

            const is = <T>(input: unknown): input is T => true;
            assert(is<Buffer>(data));
            if (this.client.shards.options.compress) {
                if (data.length >= 4 && data.readUInt32BE(data.length - 4) === 0xFFFF) {
                    // store the current pointer for slicing buffers after pushing.
                    const currentPointer: number | undefined = this._sharedZLib.strm?.next_out;
                    this._sharedZLib.push(data, zlibConstants!.Z_SYNC_FLUSH);
                    if (this._sharedZLib.err) {
                        this.client.emit("error", new GatewayError(`zlib error ${this._sharedZLib.err}: ${this._sharedZLib.msg ?? ""}`, 0));
                        return;
                    }

                    if (currentPointer === undefined) {
                        // decompression support by zlib-sync
                        data = Buffer.from(this._sharedZLib.result ?? "");
                    } else if (this._sharedZLib.chunks.length === 0) {
                        // decompression support by pako. The current buffer hasn't been flushed
                        data = Buffer.from(this._sharedZLib.strm!.output.slice(currentPointer));
                    } else {
                        // decompression support by pako. Buffers have been flushed once or more times.
                        data = Buffer.concat([
                            this._sharedZLib.chunks[0].slice(currentPointer),
                            ...this._sharedZLib.chunks.slice(1),
                            this._sharedZLib.strm.output
                        ]);
                        this._sharedZLib.chunks = [];
                    }

                    assert(is<Buffer>(data));

                    if (Erlpack) {
                        return this.onPacket(Erlpack.unpack(data as Buffer) as AnyReceivePacket);
                    } else {
                        // After the valid data, all the remaining octets are filled with zero, so remove them.
                        let last = data.length - 1;
                        if (data[last] === 0) {
                            while (data[last - 1] === 0 && last > 0) last--;
                            data = data.subarray(0, last);
                        }
                        return this.onPacket(JSON.parse(String(data)) as AnyReceivePacket);
                    }
                } else {
                    this._sharedZLib.push(data, false);
                }
            } else if (Erlpack) {
                return this.onPacket(Erlpack.unpack(data) as AnyReceivePacket);
            } else {
                return this.onPacket(JSON.parse(data.toString()) as AnyReceivePacket);
            }
        } catch (err) {
            this.client.emit("error", err as Error, this.id);
        }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-argument */

    private onWSOpen(): void {
        this.status = "handshaking";
        this.client.emit("connect", this.id);
        this.lastHeartbeatAck = true;
    }

    private async restartGuildCreateTimeout(): Promise<void> {
        if (this._guildCreateTimeout) {
            clearTimeout(this._guildCreateTimeout);
            this._guildCreateTimeout = null;
        }
        if (!this.ready) {
            if (this.client.unavailableGuilds.size === 0) {
                return this.checkReady();
            }

            this._guildCreateTimeout = setTimeout(this.checkReady.bind(this), this.client.shards.options.guildCreateTimeout);
        }
    }

    private sendPresenceUpdate(): void {
        this.send(GatewayOPCodes.PRESENCE_UPDATE, {
            activities: this.presence.activities,
            afk:        !!this.presence.afk,
            since:      this.presence.status === "idle" ? Date.now() : null,
            status:     this.presence.status
        });
    }

    private get _token(): string {
        return this.client.options.auth!;
    }

    /** Connect this shard. */
    async connect(): Promise<void> {
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            this.client.emit("error", new Error("Shard#connect called while existing connection is established."), this.id);
            return;
        }
        ++this.connectAttempts;
        this.connecting = true;
        await this.initialize();
    }

    disconnect(reconnect = this.client.shards.options.autoReconnect, error?: Error): void {
        if (!this.ws) {
            return;
        }

        if (this._heartbeatInterval) {
            clearInterval(this._heartbeatInterval);
            this._heartbeatInterval = null;
        }

        if (this.ws.readyState !== WebSocket.CLOSED) {
            this.ws.removeAllListeners();
            try {
                if (reconnect && this.sessionID) {
                    if (this.ws.readyState === WebSocket.OPEN) {
                        this.client.emit("debug", `Closing websocket (state: ${this.ws.readyState})`, this.id);
                        this.ws.terminate();
                    } else {
                        this.ws.close(4999, "Reconnect");
                    }
                } else {
                    this.ws.close(1000, "Normal Close");
                }

            } catch (err) {
                this.client.emit("error", err as Error, this.id);
            }
        }

        this.ws = null;
        this.reset();

        if (error) {
            if (error instanceof GatewayError && [1001, 1006].includes(error.code)) {
                this.client.emit("debug", error.message, this.id);
            } else {
                this.client.emit("error", error, this.id);
            }
        }


        this.emit("disconnect", error);

        if (this.sessionID && this.connectAttempts >= this.client.shards.options.maxReconnectAttempts) {
            this.client.emit("debug", `Automatically invalidating session due to excessive resume attempts | Attempt ${this.connectAttempts}`, this.id);
            this.sessionID = null;
        }

        if (reconnect) {
            if (this.sessionID) {
                this.client.emit("debug", `Immediately reconnecting for potential resume | Attempt ${this.connectAttempts}`, this.id);
                void this.client.shards["_connect"](this);
            } else {
                this.client.emit("debug", `Queueing reconnect in ${this.reconnectInterval}ms | Attempt ${this.connectAttempts}`, this.id);
                setTimeout(() => {
                    void this.client.shards["_connect"](this);
                }, this.reconnectInterval);
                this.reconnectInterval = Math.min(Math.round(this.reconnectInterval * (Math.random() * 2 + 1)), 30000);
            }
        } else {
            this.hardReset();
        }
    }

    /**
     * Edit this shard's status.
     * @param status The status.
     * @param activities An array of activities.
     */
    async editStatus(status: SendStatuses, activities: Array<BotActivity> = []): Promise<void> {
        this.presence.status = status;
        this.presence.activities = activities;
        return this.sendPresenceUpdate();
    }

    hardReset(): void {
        this.reset();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        for (const [,voiceAdapter] of this.client.voiceAdapters) voiceAdapter.destroy();
        this.sequence = 0;
        this.sessionID = null;
        this.reconnectInterval = 1000;
        this.connectAttempts = 0;
        this.ws = null;
        this._heartbeatInterval = null;
        this._guildCreateTimeout = null;
        this.globalBucket = new Bucket(120, 60000, { reservedTokens: 5 });
        this.presence = structuredClone(this.client.shards.options.presence) as Shard["presence"];
        this.presenceUpdateBucket = new Bucket(5, 20000);
        this.resumeURL = null;
    }

    heartbeat(requested = false): void {
        // discord/discord-api-docs#1619
        if (this.status === "resuming" || this.status === "identifying") {
            return;
        }
        if (!requested) {
            if (!this.lastHeartbeatAck) {
                this.client.emit("debug", "Heartbeat timeout; " + JSON.stringify({
                    lastReceived: this.lastHeartbeatReceived,
                    lastSent:     this.lastHeartbeatSent,
                    interval:     this._heartbeatInterval,
                    status:       this.status,
                    timestamp:    Date.now()
                }));
                return this.disconnect(undefined, new Error("Server didn't acknowledge previous heartbeat, possible lost connection."));
            }
            this.lastHeartbeatAck = false;
        }
        this.lastHeartbeatSent = Date.now();
        this.send(GatewayOPCodes.HEARTBEAT, this.sequence, true);
    }

    identify(): void {
        const data = {
            token:           this._token,
            properties:      this.client.shards.options.connectionProperties,
            compress:        this.client.shards.options.compress,
            large_threshold: this.client.shards.options.largeThreshold,
            shard:           [this.id, this.client.shards.options.maxShards],
            presence:        this.presence,
            intents:         this.client.shards.options.intents
        };
        this.send(GatewayOPCodes.IDENTIFY, data);
    }

    [inspect.custom](): this {
        return Base.prototype[inspect.custom].call(this) as never;
    }

    /**
     * Request the members of a guild.
     * @param guildID The ID of the guild to request the members of.
     * @param options The options for requesting the members.
     */
    async requestGuildMembers(guildID: string, options?: RequestGuildMembersOptions): Promise<Array<Member>> {
        const opts = {
            guild_id:  guildID,
            limit:     options?.limit ?? 0,
            user_ids:  options?.userIDs,
            query:     options?.query,
            nonce:     randomBytes(16).toString("hex"),
            presences: options?.presences ?? false
        };
        if (!opts.user_ids && !opts.query) {
            opts.query = "";
        }
        if (!opts.query && !opts.user_ids) {
            if (!(this.client.shards.options.intents & Intents.GUILD_MEMBERS)) {
                throw new TypeError("Cannot request all members without the GUILD_MEMBERS intent.");
            }
            const guild = this.client.guilds.get(guildID);
            if (guild) {
                guild["updateMemberLimit"](true);
            }
        }
        if (opts.presences && (!(this.client.shards.options.intents & Intents.GUILD_PRESENCES))) {
            throw new TypeError("Cannot request presences without the GUILD_PRESENCES intent.");
        }
        if (opts.user_ids && opts.user_ids.length > 100) {
            throw new TypeError("Cannot request more than 100 users at once.");
        }
        this.send(GatewayOPCodes.REQUEST_GUILD_MEMBERS, opts);
        return new Promise<Array<Member>>((resolve, reject) => this._requestMembersPromise[opts.nonce] = {
            members:  [],
            received: 0,
            timeout:  setTimeout(() => {
                resolve(this._requestMembersPromise[opts.nonce].members);
                delete this._requestMembersPromise[opts.nonce];
            }, options?.timeout ?? this.client.rest.options.requestTimeout),
            resolve,
            reject
        });
    }

    reset(): void {
        this.connecting = false;
        this.ready = false;
        this.preReady = false;
        if (this._requestMembersPromise !== undefined) {
            for (const guildID in this._requestMembersPromise) {
                if (!this._requestMembersPromise[guildID]) {
                    continue;
                }

                clearTimeout(this._requestMembersPromise[guildID].timeout);
                this._requestMembersPromise[guildID].resolve(this._requestMembersPromise[guildID].received);
            }
        }

        this._requestMembersPromise = {};
        this._getAllUsersCount = {};
        this._getAllUsersQueue = [];
        this.latency = Infinity;
        this.lastHeartbeatAck = true;
        this.lastHeartbeatReceived = 0;
        this.lastHeartbeatSent = 0;
        this.status = "disconnected";
        if (this._connectTimeout) {
            clearTimeout(this._connectTimeout);
        }
        this._connectTimeout = null;
    }

    resume(): void {
        this.status = "resuming";
        this.send(GatewayOPCodes.RESUME, {
            token:      this._token,
            session_id: this.sessionID,
            seq:        this.sequence
        });
    }

    send(op: GatewayOPCodes, data: unknown, priority = false): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            let i = 0, waitFor = 1;
            const func = (): void => {
                if (++i >= waitFor && this.ws && this.ws.readyState === WebSocket.OPEN) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const d: string = Erlpack ? Erlpack.pack({ op, d: data }) : JSON.stringify({ op, d: data });
                    this.ws.send(d);
                    if (typeof data === "object" && data && "token" in data) {
                        (data as { token: string; }).token = "[REMOVED]";
                    }
                    this.client.emit("debug", JSON.stringify({ op, d: data }), this.id);
                }
            };
            if (op === GatewayOPCodes.PRESENCE_UPDATE) {
                ++waitFor;
                this.presenceUpdateBucket.queue(func, priority);
            }
            this.globalBucket.queue(func, priority);
        }
    }

    override toString(): string {
        return Base.prototype.toString.call(this);
    }

    /**
     * Update the voice state of this shard.
     * @param guildID The ID of the guild to update the voice state of.
     * @param channelID The ID of the voice channel to join. Null to disconnect.
     * @param options The options for updating the voice state.
     */
    updateVoiceState(guildID: string, channelID: string | null, options?: UpdateVoiceStateOptions): void {
        this.send(GatewayOPCodes.VOICE_STATE_UPDATE, {
            channel_id: channelID,
            guild_id:   guildID,
            self_deaf:  options?.selfDeaf ?? false,
            self_mute:  options?.selfMute ?? false
        });
    }
}
