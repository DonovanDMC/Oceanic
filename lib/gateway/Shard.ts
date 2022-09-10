import GatewayError from "./GatewayError";
import type Client from "../Client";
import Properties from "../util/Properties";
import TypedEmitter from "../util/TypedEmitter";
import Bucket from "../rest/Bucket";
import {
    ChannelTypes,
    GatewayCloseCodes,
    GatewayOPCodes,
    GATEWAY_VERSION,
    Intents
} from "../Constants";
import type {
    UpdatePresenceOptions,
    RequestGuildMembersOptions,
    UpdateVoiceStateOptions,
    PresenceUpdate,
    Presence,
    SendStatuses,
    BotActivity,
    ShardStatus
} from "../types/gateway";
import Member from "../structures/Member";
import Base from "../structures/Base";
import type { AnyDispatchPacket, AnyReceivePacket } from "../types/gateway-raw";
import ClientApplication from "../structures/ClientApplication";
import type { RawOAuthUser, RawUser } from "../types/users";
import type { RawGuild } from "../types/guilds";
import ExtendedUser from "../structures/ExtendedUser";
import AutoModerationRule from "../structures/AutoModerationRule";
import Channel from "../structures/Channel";
import type {
    AnyGuildChannelWithoutThreads,
    AnyTextChannel,
    AnyThreadChannel,
    InviteChannel,
    PossiblyUncachedThread,
    RawMessage,
    RawThreadChannel,
    ThreadMember
} from "../types/channels";
import type TextChannel from "../structures/TextChannel";
import type { JSONAnnouncementThreadChannel, JSONTextChannel } from "../types/json";
import type User from "../structures/User";
import VoiceChannel from "../structures/VoiceChannel";
import StageChannel from "../structures/StageChannel";
import GuildScheduledEvent from "../structures/GuildScheduledEvent";
import Invite from "../structures/Invite";
import Message from "../structures/Message";
import type { Uncached } from "../types/shared";
import StageInstance from "../structures/StageInstance";
import type AnnouncementThreadChannel from "../structures/AnnouncementThreadChannel";
import Interaction from "../structures/Interaction";
import { is } from "../util/Util";
import TypedCollection from "../util/TypedCollection";
import Guild from "../structures/Guild";
import { ShardEvents } from "../types/events";
import type PublicThreadChannel from "../structures/PublicThreadChannel";
import Role from "../structures/Role";
import Integration from "../structures/Integration";
import type { Data } from "ws";
import { WebSocket } from "ws";
import type Pako from "pako";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { Inflate } from "zlib-sync";
import VoiceState from "structures/VoiceState";
import { randomBytes } from "crypto";
import { inspect } from "util";
import assert from "assert";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let Erlpack: typeof import("erlpack") | undefined;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    Erlpack = require("erlpack");
} catch { }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let ZlibSync: typeof import("pako") | typeof import("zlib-sync") | undefined, zlibConstants: typeof import("pako").constants | typeof import("zlib-sync") | undefined;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    ZlibSync = require("zlib-sync");
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    zlibConstants = require("zlib-sync");
} catch {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
        ZlibSync = require("pako");
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        zlibConstants = require("pako").constants;
    } catch {}
}

/** Represents a gateway connection to Discord. See {@link types/events~ShardEvents | Shard Events} for a list of events. */
export default class Shard extends TypedEmitter<ShardEvents> {
    client!: Client;
    connectAttempts: number;
    #connectTimeout: NodeJS.Timeout | null;
    connecting: boolean;
    #getAllUsersCount: Record<string, true>;
    #getAllUsersQueue: Array<string>;
    globalBucket!: Bucket;
    #guildCreateTimeout: NodeJS.Timeout | null;
    #heartbeatInterval: NodeJS.Timeout | null;
    id: number;
    lastHeartbeatAck: boolean;
    lastHeartbeatReceived: number;
    lastHeartbeatSent: number;
    latency: number;
    preReady: boolean;
    presence!: Required<UpdatePresenceOptions>;
    presenceUpdateBucket!: Bucket;
    ready: boolean;
    reconnectInterval: number;
    #requestMembersPromise: Record<string, { members: Array<Member>; received: number; timeout: NodeJS.Timeout; reject(reason?: unknown): void; resolve(value: unknown): void; }>;
    resumeURL: string | null;
    sequence: number;
    sessionID: string | null;
    #sharedZLib!: Pako.Inflate | Inflate;
    status: ShardStatus;
    ws!: WebSocket | null;
    constructor(id: number, client: Client) {
        super();
        Properties.new(this)
            .define("client", client)
            .define("ws", null, true);

        this.onDispatch = this.onDispatch.bind(this);
        this.onPacket = this.onPacket.bind(this);
        this.onWSClose = this.onWSClose.bind(this);
        this.onWSError = this.onWSError.bind(this);
        this.onWSMessage = this.onWSMessage.bind(this);
        this.onWSOpen = this.onWSOpen.bind(this);
        this.connectAttempts = 0;
        this.#connectTimeout = null;
        this.connecting = false;
        this.#getAllUsersCount = {};
        this.#getAllUsersQueue = [];
        this.#guildCreateTimeout = null;
        this.#heartbeatInterval = null;
        this.id = id;
        this.lastHeartbeatAck = true;
        this.lastHeartbeatReceived = 0;
        this.lastHeartbeatSent = 0;
        this.latency = Infinity;
        this.preReady = false;
        this.ready = false;
        this.reconnectInterval = 1000;
        this.#requestMembersPromise = {};
        this.resumeURL = null;
        this.sequence = 0;
        this.sessionID = null;
        this.status = "disconnected";
        this.hardReset();
    }

    private async checkReady(): Promise<void> {
        if (!this.ready) {
            if (this.#getAllUsersQueue.length > 0) {
                const id = this.#getAllUsersQueue.shift()!;
                await this.requestGuildMembers(id);
                this.#getAllUsersQueue.splice(this.#getAllUsersQueue.indexOf(id), 1);
                return;
            }
            if (Object.keys(this.#getAllUsersCount).length === 0) {
                this.ready = true;
                this.emit("ready");
            }
        }
    }

    private createGuild(data: RawGuild): Guild {
        this.client.guildShardMap[data.id] = this.id;
        const guild = this.client.guilds.update(data);
        if (this.client.shards.options.getAllUsers && guild.members.size > guild.memberCount) {
            void this.requestGuildMembers(guild.id, { presences: (this.client.shards.options.intents & Intents.GUILD_PRESENCES) === Intents.GUILD_PRESENCES });
        }


        return guild;
    }

    private initialize(): void {
        if (!this._token) {
            return this.disconnect(false, new Error("Invalid Token"));
        }
        this.status = "connecting";
        if (this.client.shards.options.compress) {
            if (!ZlibSync) {
                throw new Error("Cannot use compression without pako or zlib-sync.");
            }
            this.client.emit("debug", "Initializing zlib-sync-based compression");
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            this.#sharedZLib = new ZlibSync.Inflate({ chunkSize: 128 * 1024 });
        }
        if (this.sessionID) {
            if (this.resumeURL === null) {
                this.client.emit("warn", "Resume url is not currently present. Discord may disconnect you quicker.", this.id);
            }

            this.ws = new WebSocket(this.resumeURL || this.client.gatewayURL, this.client.shards.options.ws);
        } else {
            this.ws = new WebSocket(this.client.gatewayURL, this.client.shards.options.ws);
        }


        /* eslint-disable @typescript-eslint/unbound-method */
        this.ws.on("close", this.onWSClose);
        this.ws.on("error", this.onWSError);
        this.ws.on("message", this.onWSMessage);
        this.ws.on("open", this.onWSOpen);
        /* eslint-enable @typescript-eslint/unbound-method */

        this.#connectTimeout = setTimeout(() => {
            if (this.connecting) {
                this.disconnect(undefined, new Error("Connection timeout"));
            }

        }, this.client.shards.options.connectionTimeout);
    }

    private async onDispatch(packet: AnyDispatchPacket): Promise<void> {
        this.client.emit("packet", packet, this.id);
        switch (packet.t) {
            case "APPLICATION_COMMAND_PERMISSIONS_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                this.client.emit("applicationCommandPermissionsUpdate", guild || { id: packet.d.guild_id }, {
                    application: packet.d.application_id === this.client.application!.id ? this.client.application! : { id: packet.d.application_id },
                    id:          packet.d.id,
                    permissions: packet.d.permissions
                });
                break;
            }

            case "AUTO_MODERATION_ACTION_EXECUTION": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const channel = !packet.d.channel_id ? null : this.client.getChannel(packet.d.channel_id) || { id: packet.d.channel_id };
                this.client.emit("autoModerationActionExecution", guild || { id: packet.d.guild_id }, channel, this.client.users.get(packet.d.user_id) || { id: packet.d.user_id },{
                    action: {
                        metadata: {
                            channelID:       packet.d.action.metadata.channel_id,
                            durationSeconds: packet.d.action.metadata.duration_seconds
                        },
                        type: packet.d.action.type
                    },
                    alertSystemMessageID: packet.d.alert_system_message_id,
                    content:              packet.d.content,
                    matchedContent:       packet.d.matched_content,
                    matchedKeyword:       packet.d.matched_keyword,
                    messageID:            packet.d.message_id,
                    rule:                 guild?.autoModerationRules.get(packet.d.rule_id),
                    ruleID:               packet.d.rule_id,
                    ruleTriggerType:      packet.d.rule_trigger_type
                });
                break;
            }

            case "AUTO_MODERATION_RULE_CREATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let rule: AutoModerationRule;
                if (guild) {
                    rule = guild.autoModerationRules.update(packet.d);
                } else {
                    rule = new AutoModerationRule(packet.d, this.client);
                }
                this.client.emit("autoModerationRuleCreate", rule);
                break;
            }

            case "AUTO_MODERATION_RULE_DELETE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let rule: AutoModerationRule;
                if (guild) {
                    rule = guild.autoModerationRules.update(packet.d);
                    guild.autoModerationRules.delete(packet.d.id);
                } else {
                    rule = new AutoModerationRule(packet.d, this.client);
                }
                this.client.emit("autoModerationRuleDelete", rule);
                break;
            }

            case "AUTO_MODERATION_RULE_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const oldRule = guild?.autoModerationRules.get(packet.d.id)?.toJSON() || null;
                let rule: AutoModerationRule;
                if (guild) {
                    rule = guild.autoModerationRules.update(packet.d);
                    guild.autoModerationRules.delete(packet.d.id);
                } else {
                    rule = new AutoModerationRule(packet.d, this.client);
                }
                this.client.emit("autoModerationRuleUpdate", rule, oldRule);
                break;
            }

            case "CHANNEL_CREATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let channel: AnyGuildChannelWithoutThreads;
                if (guild?.channels.has(packet.d.id)) {
                    channel = guild.channels.update(packet.d);
                } else {
                    channel = guild?.channels.add(Channel.from(packet.d, this.client)) || Channel.from(packet.d, this.client);
                    this.client.channelGuildMap[packet.d.id] = packet.d.guild_id;
                }
                this.client.emit("channelCreate", channel);
                break;
            }

            case "CHANNEL_DELETE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let channel: AnyGuildChannelWithoutThreads;
                if (guild?.channels.has(packet.d.id)) {
                    channel = guild.channels.get(packet.d.id)!;
                } else {
                    channel = Channel.from(packet.d, this.client);
                }
                if (channel instanceof VoiceChannel || channel instanceof StageChannel) {
                    channel.voiceMembers.forEach(member => {
                        (channel as VoiceChannel).voiceMembers.delete(member.id);
                        this.client.emit("voiceChannelLeave", member, channel as VoiceChannel);
                    });
                }

                guild?.channels.delete(packet.d.id);
                this.client.emit("channelDelete", channel);
                break;
            }

            case "CHANNEL_PINS_UPDATE": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                this.client.emit("channelPinsUpdate", channel || { id: packet.d.channel_id }, !packet.d.last_pin_timestamp ? null : new Date(packet.d.last_pin_timestamp));
                break;
            }

            case "CHANNEL_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let oldChannel: ReturnType<AnyGuildChannelWithoutThreads["toJSON"]> | null = null;
                let channel: AnyGuildChannelWithoutThreads;
                if (guild?.channels.has(packet.d.id)) {
                    oldChannel = guild.channels.get(packet.d.id)!.toJSON();
                    channel = guild.channels.update(packet.d);
                } else {
                    channel = guild?.channels.add(Channel.from(packet.d, this.client)) || Channel.from(packet.d, this.client);
                    this.client.channelGuildMap[packet.d.id] = packet.d.guild_id;
                }
                this.client.emit("channelUpdate", channel as TextChannel, oldChannel as JSONTextChannel);
                break;
            }

            case "GUILD_BAN_ADD": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                this.client.emit("guildBanAdd", guild || { id: packet.d.guild_id }, this.client.users.update(packet.d.user));
                break;
            }

            case "GUILD_BAN_REMOVE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                this.client.emit("guildBanRemove", guild || { id: packet.d.guild_id }, this.client.users.update(packet.d.user));
                break;
            }

            case "GUILD_CREATE": {
                if (!packet.d.unavailable) {
                    const guild = this.createGuild(packet.d);
                    if (this.ready) {
                        if (this.client.unavailableGuilds.delete(guild.id)) {
                            this.client.emit("guildAvailable", guild);
                        } else {
                            this.client.emit("guildCreate", guild);
                        }
                    } else {
                        this.client.unavailableGuilds.delete(guild.id);
                        void this.restartGuildCreateTimeout();
                    }
                } else {
                    this.client.guilds.delete(packet.d.id);
                    this.client.emit("unavailableGuildCreate", this.client.unavailableGuilds.update(packet.d));
                }
                break;
            }

            case "GUILD_DELETE": {
                // @TODO disconnect voice
                delete this.client.guildShardMap[packet.d.id];
                const guild = this.client.guilds.get(packet.d.id);
                this.client.guilds.delete(packet.d.id);
                if (guild) {
                    guild.channels.forEach(channel => {
                        delete this.client.channelGuildMap[channel.id];
                    });
                }
                if (packet.d.unavailable) {
                    this.client.emit("guildUnavailable", this.client.unavailableGuilds.update(packet.d));
                } else {
                    this.client.emit("guildDelete", guild || { id: packet.d.id });
                }
                break;
            }

            case "GUILD_EMOJIS_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const oldEmojis = guild?.emojis ? [...guild.emojis] : null;
                if (guild) {
                    guild["update"]({ emojis: packet.d.emojis });
                }
                this.client.emit("guildEmojisUpdate", guild || { id: packet.d.guild_id }, guild?.emojis || packet.d.emojis.map(emoji => ({
                    ...emoji,
                    user: emoji.user === undefined ? undefined : this.client.users.update(emoji.user)
                })), oldEmojis);
                break;
            }

            case "GUILD_INTEGRATIONS_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                this.client.emit("guildIntegrationsUpdate", guild || { id: packet.d.guild_id });
                break;
            }

            case "GUILD_MEMBER_ADD": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const member = this.client.util.updateMember(packet.d.guild_id, packet.d.user?.id, packet.d);
                if (guild) {
                    guild.memberCount++;
                }
                this.client.emit("guildMemberAdd", member);
                break;
            }

            case "GUILD_MEMBERS_CHUNK": {
                const guild = this.client.guilds.get(packet.d.guild_id);

                if (guild) {
                    guild["updateMemberLimit"](packet.d.members.length);
                }
                const members = packet.d.members.map(member => this.client.util.updateMember(packet.d.guild_id, member.user?.id, member));
                if (packet.d.presences) {
                    packet.d.presences.forEach(presence => {
                        const member = members.find(m => m.id === presence.user.id);
                        if (member) {
                            member.presence = presence;
                        }
                    });
                }
                if (!packet.d.nonce) {
                    this.client.emit("warn", "Received GUILD_MEMBERS_CHUNK without a nonce.");
                    break;
                }
                if (this.#requestMembersPromise[packet.d.nonce]) {
                    this.#requestMembersPromise[packet.d.nonce].members.push(...members);
                }

                if (packet.d.chunk_index >= packet.d.chunk_count - 1) {
                    if (this.#requestMembersPromise[packet.d.nonce]) {
                        clearTimeout(this.#requestMembersPromise[packet.d.nonce].timeout);
                        this.#requestMembersPromise[packet.d.nonce].resolve(this.#requestMembersPromise[packet.d.nonce].members);
                        delete this.#requestMembersPromise[packet.d.nonce];
                    }
                    if (this.#getAllUsersCount[packet.d.guild_id]) {
                        delete this.#getAllUsersCount[packet.d.guild_id];
                        void this.checkReady();
                    }
                }

                this.client.emit("guildMemberChunk", members);
                this.lastHeartbeatAck = true;
                break;
            }

            case "GUILD_MEMBER_REMOVE": {
                if (packet.d.user.id === this.client.user.id) {
                    break;
                }
                const guild = this.client.guilds.get(packet.d.guild_id);
                let member: Member | User;
                if (guild) {
                    guild.memberCount--;
                    if (guild.members.has(packet.d.user.id)) {
                        member = guild.members.get(packet.d.user.id)!;
                        member["update"]({ user: packet.d.user });
                        guild.members.delete(packet.d.user.id);
                    } else {
                        member = this.client.users.update(packet.d.user);
                    }
                } else {
                    member = this.client.users.update(packet.d.user);
                }
                this.client.emit("guildMemberRemove", member, guild || { id: packet.d.guild_id });
                break;
            }

            case "GUILD_MEMBER_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const oldMember = guild?.members.get(packet.d.user!.id)?.toJSON() || null;
                const member = this.client.util.updateMember(packet.d.guild_id, packet.d.user.id, {  deaf: false, mute: false, ...packet.d });
                this.client.emit("guildMemberUpdate", member, oldMember);
                break;
            }

            case "GUILD_ROLE_CREATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let role: Role;
                if (guild) {
                    role = guild.roles.update(packet.d.role, packet.d.guild_id);
                } else {
                    role = new Role(packet.d.role, this.client, packet.d.guild_id);
                }
                this.client.emit("guildRoleCreate", role);
                break;
            }

            case "GUILD_ROLE_DELETE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                if (!guild) {
                    this.client.emit("debug", `Missing guild in GUILD_ROLE_DELETE: ${packet.d.guild_id}`);
                    break;
                }
                const role = guild.roles.get(packet.d.role_id)!;
                guild.roles.delete(packet.d.role_id);

                this.client.emit("guildRoleDelete", role);
                break;
            }

            case "GUILD_ROLE_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const oldRole = guild?.roles.get(packet.d.role.id)?.toJSON() || null;
                let role: Role;
                if (guild) {
                    role = guild.roles.update(packet.d.role, packet.d.guild_id);
                } else {
                    role = new Role(packet.d.role, this.client, packet.d.guild_id);
                }
                this.client.emit("guildRoleUpdate", role, oldRole);
                break;
            }

            case "GUILD_SCHEDULED_EVENT_CREATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let event: GuildScheduledEvent;
                if (guild) {
                    event = guild.scheduledEvents.update(packet.d);
                } else {
                    event = new GuildScheduledEvent(packet.d, this.client);
                }
                this.client.emit("guildScheduledEventCreate", event);
                break;
            }

            case "GUILD_SCHEDULED_EVENT_DELETE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let event: GuildScheduledEvent;
                if (guild?.scheduledEvents.has(packet.d.id)) {
                    event = guild.scheduledEvents.get(packet.d.id)!;
                } else {
                    event = new GuildScheduledEvent(packet.d, this.client);
                }
                this.client.emit("guildScheduledEventDelete", event);
                break;
            }

            case "GUILD_SCHEDULED_EVENT_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id)!;
                const oldEvent = guild?.scheduledEvents.get(packet.d.id)?.toJSON() || null;
                let event: GuildScheduledEvent;
                if (guild) {
                    event = guild.scheduledEvents.update(packet.d);
                } else {
                    event = new GuildScheduledEvent(packet.d, this.client);
                }
                this.client.emit("guildScheduledEventUpdate", event, oldEvent);
                break;
            }

            case "GUILD_SCHEDULED_EVENT_USER_ADD": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const event = guild && guild.scheduledEvents.get(packet.d.guild_scheduled_event_id) || { id: packet.d.guild_scheduled_event_id };
                if ("userCount" in event) {
                    event.userCount++;
                }
                const user = this.client.users.get(packet.d.user_id) || { id: packet.d.user_id };
                this.client.emit("guildScheduledEventUserAdd", event, user);
                break;
            }

            case "GUILD_SCHEDULED_EVENT_USER_REMOVE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const event = guild && guild.scheduledEvents.get(packet.d.guild_scheduled_event_id) || { id: packet.d.guild_scheduled_event_id };
                if ("userCount" in event) {
                    event.userCount--;
                }
                const user = this.client.users.get(packet.d.user_id) || { id: packet.d.user_id };
                this.client.emit("guildScheduledEventUserRemove", event, user);
                break;
            }

            case "GUILD_STICKERS_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const oldStickers = guild?.stickers ? [...guild.stickers] : null;
                if (guild) {
                    guild["update"]({ stickers: packet.d.stickers });
                }
                this.client.emit("guildStickersUpdate", guild || { id: packet.d.guild_id }, guild?.stickers || packet.d.stickers, oldStickers);
                break;
            }

            case "GUILD_UPDATE": {
                const guild = this.client.guilds.get(packet.d.id);
                const oldGuild = guild?.toJSON() || null;
                this.client.emit("guildUpdate", this.client.guilds.update(packet.d), oldGuild);
                break;
            }

            case "INTEGRATION_CREATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let integration: Integration;
                if (guild) {
                    integration = guild.integrations.update(packet.d);
                } else {
                    integration = new Integration(packet.d, this.client);
                }
                this.client.emit("integrationCreate", guild || { id: packet.d.guild_id }, integration);
                break;
            }

            case "INTEGRATION_DELETE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                this.client.emit("integrationDelete", guild || { id: packet.d.guild_id }, guild?.integrations.get(packet.d.id) || { applicationID: packet.d.application_id, id: packet.d.id });
                break;
            }

            case "INTEGRATION_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const oldIntegration = guild?.integrations.get(packet.d.id)?.toJSON() || null;
                let integration: Integration;
                if (guild) {
                    integration = guild.integrations.update(packet.d);
                } else {
                    integration = new Integration(packet.d, this.client);
                }
                this.client.emit("integrationUpdate", guild || { id: packet.d.guild_id }, integration, oldIntegration);
                break;
            }

            case "INTERACTION_CREATE": {
                this.client.emit("interactionCreate", Interaction.from(packet.d, this.client));
                break;
            }

            case "INVITE_CREATE": {
                const guild = packet.d.guild_id ? this.client.guilds.get(packet.d.guild_id) || { id: packet.d.guild_id } : null;
                const channel = this.client.getChannel<InviteChannel>(packet.d.channel_id) || { id: packet.d.channel_id };
                this.client.emit("inviteCreate", guild, channel, new Invite(packet.d, this.client));
                break;
            }

            case "INVITE_DELETE": {
                const guild = packet.d.guild_id ? this.client.guilds.get(packet.d.guild_id) || { id: packet.d.guild_id } : null;
                const channel = this.client.getChannel<InviteChannel>(packet.d.channel_id) || { id: packet.d.channel_id };
                this.client.emit("inviteDelete", guild, channel, packet.d.code);
                break;
            }

            case "MESSAGE_CREATE": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                const message = channel ? channel.messages.update(packet.d) : new Message(packet.d, this.client);
                if (channel) {
                    channel.lastMessage = message;
                }
                this.client.emit("messageCreate", message);
                break;
            }

            case "MESSAGE_DELETE": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                const message = channel?.messages.get(packet.d.id) || { channel: channel || { id: packet.d.channel_id }, id: packet.d.id };
                if (channel) {
                    channel.messages.delete(packet.d.id);
                }
                this.client.emit("messageDelete", message);
                break;
            }

            case "MESSAGE_DELETE_BULK": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                this.client.emit("messageDeleteBulk", packet.d.ids.map(id => {
                    if (channel && channel.messages.has(id)) {
                        const message = channel.messages.get(id)!;
                        channel.messages.delete(id);
                        return message;
                    } else {
                        return {
                            channel: channel || { id: packet.d.channel_id },
                            id
                        };
                    }

                }));
                break;
            }

            case "MESSAGE_REACTION_ADD": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                const message = channel?.messages.get(packet.d.message_id) || { channel: channel || { id: packet.d.channel_id }, id: packet.d.message_id };
                let reactor: Member | User | Uncached;
                if (packet.d.member) {
                    if (packet.d.guild_id) {
                        reactor = this.client.util.updateMember(packet.d.guild_id, packet.d.user_id, packet.d.member);
                    } else {
                        reactor = this.client.users.get(packet.d.user_id) || { id: packet.d.user_id };
                    }
                } else {
                    reactor = this.client.users.get(packet.d.user_id) || { id: packet.d.user_id };
                }

                if (message instanceof Message) {
                    const name = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                    if (message.reactions[name]) {
                        message.reactions[name].count++;
                        if (packet.d.user_id === this.client.user.id) {
                            message.reactions[name].me = true;
                        }
                    } else {
                        message.reactions[name] = {
                            count: 1,
                            me:    packet.d.user_id === this.client.user.id
                        };
                    }

                }
                this.client.emit("messageReactionAdd", message, reactor, packet.d.emoji);
                break;
            }

            case "MESSAGE_REACTION_REMOVE": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                const message = channel?.messages.get(packet.d.message_id) || { channel: channel || { id: packet.d.channel_id }, id: packet.d.message_id };
                const reactor = this.client.users.get(packet.d.user_id) || { id: packet.d.user_id };

                if (message instanceof Message) {
                    const name = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                    if (message.reactions[name]) {
                        message.reactions[name].count--;
                        if (packet.d.user_id === this.client.user.id) {
                            message.reactions[name].me = false;
                        }
                        if (message.reactions[name].count === 0) {
                            delete message.reactions[name];
                        }
                    }
                }
                this.client.emit("messageReactionRemove", message, reactor, packet.d.emoji);
                break;
            }

            case "MESSAGE_REACTION_REMOVE_ALL": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                const message = channel?.messages.get(packet.d.message_id) || { channel: channel || { id: packet.d.channel_id }, id: packet.d.message_id };

                if (message instanceof Message) {
                    message.reactions = {};
                }
                this.client.emit("messageReactionRemoveAll", message);
                break;
            }

            case "MESSAGE_REACTION_REMOVE_EMOJI": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                const message = channel?.messages.get(packet.d.message_id) || { channel: channel || { id: packet.d.channel_id }, id: packet.d.message_id };

                if (message instanceof Message) {
                    const name = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                    if (message.reactions[name]) {
                        delete message.reactions[name];
                    }
                }
                this.client.emit("messageReactionRemoveEmoji", message, packet.d.emoji);
                break;
            }

            case "MESSAGE_UPDATE": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id);
                const oldMessage = channel && "messages" in channel ? channel.messages.get(packet.d.id)?.toJSON() || null : null;
                if (!oldMessage && !packet.d.author) {
                    this.client.emit("debug", `Got partial MESSAGE_UPDATE for uncached message ${packet.d.id} for channel ${packet.d.channel_id}, discarding..`);
                    break;
                }
                const message = channel && "messages" in channel ? channel.messages.update(packet.d) : new Message(packet.d as RawMessage, this.client);
                this.client.emit("messageUpdate", message, oldMessage);
                break;
            }

            case "PRESENCE_UPDATE": {
                const user = this.client.users.get(packet.d.user.id);
                if (user) {
                    const oldUser = user.toJSON();
                    user["update"](packet.d.user);
                    if (JSON.stringify(oldUser) !== JSON.stringify(user.toJSON())) {
                        this.client.emit("userUpdate", user, oldUser);
                    }
                }

                const guild = this.client.guilds.get(packet.d.guild_id);
                const member = guild?.members.get(packet.d.user.id);
                let oldPresence: Presence | null = null;
                if (member && member.presence) {
                    oldPresence = member.presence;
                    delete (packet.d as { user?: PresenceUpdate["user"]; }).user;
                    member.presence = packet.d;
                }
                this.client.emit("presenceUpdate", guild || { id: packet.d.guild_id }, member || { id: packet.d.user.id },packet.d, oldPresence);
                break;
            }

            case "READY": {
                this.connectAttempts = 0;
                this.reconnectInterval = 1000;
                this.connecting = false;
                if (this.#connectTimeout) {
                    clearInterval(this.#connectTimeout);
                }
                this.status = "ready";
                this.client.shards["_ready"](this.id);
                this.client["_application"] = new ClientApplication(packet.d.application, this.client);
                if (!this.client["_user"]) {
                    this.client["_user"] = this.client.users.add(new ExtendedUser(packet.d.user as RawOAuthUser, this.client));
                } else {
                    this.client.users.update(packet.d.user as unknown as RawUser);
                }

                let url = packet.d.resume_gateway_url;
                if (url.includes("?")) {
                    url = url.slice(0, url.indexOf("?"));
                }
                if (!url.endsWith("/")) {
                    url += "/";
                }
                this.resumeURL = `${url}?v=${GATEWAY_VERSION}&encoding=${Erlpack ? "etf" : "json"}`;

                packet.d.guilds.forEach(guild => {
                    this.client.guilds.delete(guild.id);
                    this.client.unavailableGuilds.update(guild);
                });

                this.preReady = true;
                this.emit("preReady");

                if (this.client.unavailableGuilds.size > 0 && packet.d.guilds.length > 0) {
                    void this.restartGuildCreateTimeout();
                } else {
                    void this.checkReady();
                }
                break;
            }

            case "RESUMED": {
                this.connectAttempts = 0;
                this.reconnectInterval = 1000;
                this.connecting = false;
                if (this.#connectTimeout) {
                    clearInterval(this.#connectTimeout);
                }
                this.status = "ready";
                this.client.shards["_ready"](this.id);
                break;
            }

            case "STAGE_INSTANCE_CREATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let stateInstance: StageInstance;
                if (guild) {
                    stateInstance = guild.stageInstances.update(packet.d);
                } else {
                    stateInstance = new StageInstance(packet.d, this.client);
                }
                this.client.emit("stageInstanceCreate", stateInstance);
                break;
            }

            case "STAGE_INSTANCE_DELETE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let stateInstance: StageInstance;
                if (guild) {
                    stateInstance = guild.stageInstances.update(packet.d);
                    guild.stageInstances.delete(packet.d.id);
                } else {
                    stateInstance = new StageInstance(packet.d, this.client);
                }
                this.client.emit("stageInstanceDelete", stateInstance);
                break;
            }

            case "STAGE_INSTANCE_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const oldStageInstance = guild?.stageInstances.get(packet.d.id)?.toJSON() || null;
                let stateInstance: StageInstance;
                if (guild) {
                    stateInstance = guild.stageInstances.update(packet.d);
                } else {
                    stateInstance = new StageInstance(packet.d, this.client);
                }
                this.client.emit("stageInstanceUpdate", stateInstance, oldStageInstance);
                break;
            }

            case "THREAD_CREATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                let thread: AnyThreadChannel;
                if (guild?.threads.has(packet.d.id)) {
                    thread = guild.threads.update(packet.d);
                } else {
                    thread = guild?.threads.add(Channel.from(packet.d, this.client)) || Channel.from(packet.d, this.client);
                    this.client.threadGuildMap[packet.d.id] = packet.d.guild_id;
                }
                const channel = this.client.getChannel(packet.d.parent_id!);
                if (channel) {
                    if ("threads" in channel) {
                        (channel.threads as TypedCollection<string, RawThreadChannel, AnyThreadChannel>).add(thread);
                    }
                    if (channel.type === ChannelTypes.GUILD_FORUM) {
                        channel.lastThread = thread as PublicThreadChannel;
                        channel.lastThreadID = thread.id;
                    }
                }
                this.client.emit("threadCreate", thread);
                break;
            }

            case "THREAD_DELETE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const channel = this.client.getChannel(packet.d.parent_id!);
                let thread: PossiblyUncachedThread;
                if (guild?.threads.has(packet.d.id)) {
                    thread = guild.threads.get(packet.d.id)!;
                    guild.threads.delete(packet.d.id);
                    if (channel) {
                        if ("threads" in channel) {
                            channel.threads.delete(packet.d.id);
                        }
                        if (channel.type === ChannelTypes.GUILD_FORUM && channel.lastThread?.id === packet.d.id) {
                            channel.lastThread = null;
                        }
                    }
                } else {
                    thread = {
                        id:       packet.d.id,
                        type:     packet.d.type,
                        parentID: packet.d.parent_id!
                    };
                }
                this.client.emit("threadDelete", thread);
                break;
            }

            case "THREAD_LIST_SYNC": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                if (!guild) {
                    this.client.emit("debug", `Missing guild in THREAD_LIST_SYNC: ${packet.d.guild_id}`);
                    break;
                }
                for (const thread of packet.d.threads) {
                    if (guild.threads.has(thread.id)) {
                        guild.threads.update(thread);
                    } else {
                        guild.threads.add(Channel.from<AnyThreadChannel>(thread, this.client));
                    }
                }

                break;
            }

            case "THREAD_MEMBER_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const thread = guild?.threads.get(packet.d.id);
                const threadMember: ThreadMember = {
                    id:            packet.d.id,
                    flags:         packet.d.flags,
                    joinTimestamp: new Date(packet.d.join_timestamp),
                    userID:        packet.d.user_id
                };
                let oldMember: ThreadMember | null = null;
                if (thread) {
                    const index = thread.members.findIndex(m => m.userID === packet.d.user_id);
                    if (index === -1) {
                        thread.members.push(threadMember);
                    } else {
                        oldMember = { ...thread.members[index] };
                        thread.members[index] = threadMember;
                    }
                }

                this.client.emit("threadMemberUpdate", thread || { id: packet.d.id }, threadMember, oldMember);
                break;
            }

            case "THREAD_MEMBERS_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const thread = guild?.threads.get(packet.d.id);
                const addedMembers: Array<ThreadMember> = packet.d.added_members.map(rawMember => ({
                    flags:         rawMember.flags,
                    id:            rawMember.id,
                    joinTimestamp: new Date(rawMember.join_timestamp),
                    userID:        rawMember.user_id
                }));
                const removedMembers: Array<ThreadMember | Uncached> = packet.d.removed_member_ids.map(id => ({ id }));
                if (thread) {
                    thread.memberCount = packet.d.member_count;
                    addedMembers.forEach(rawMember => {
                        const index = thread.members.findIndex(m => m.userID === rawMember.id);
                        if (index === -1) {
                            thread.members.push(rawMember);
                        } else {
                            thread.members[index] = rawMember;
                        }
                    });

                    removedMembers.forEach(({ id }, index) => {
                        const member = thread.members.find(m => m.userID === id);
                        if (member) {
                            removedMembers[index] = member;
                            thread.members.splice(thread.members.indexOf(member), 1);
                        }
                    });
                }
                this.client.emit("threadMembersUpdate", thread || { id: packet.d.id }, addedMembers, removedMembers);
                break;
            }

            case "THREAD_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const channel = this.client.getChannel(packet.d.parent_id!);
                let oldThread: ReturnType<AnyThreadChannel["toJSON"]> | null = null;
                let thread: AnyThreadChannel;
                if (guild?.threads.has(packet.d.id)) {
                    oldThread = guild.threads.get(packet.d.id)!.toJSON();
                    thread = guild.threads.update(packet.d);
                } else {
                    thread = guild?.threads.add(Channel.from(packet.d, this.client)) || Channel.from(packet.d, this.client);
                    this.client.threadGuildMap[packet.d.id] = packet.d.guild_id;
                }
                if (channel && "threads" in channel) {
                    const threads = channel.threads as TypedCollection<string, RawThreadChannel, AnyThreadChannel>;
                    if (threads.has(packet.d.id)) {
                        threads.update(packet.d);
                    } else {
                        threads.add(thread);
                    }
                }
                this.client.emit("threadUpdate", thread as AnnouncementThreadChannel, oldThread as JSONAnnouncementThreadChannel);
                break;
            }

            case "TYPING_START": {
                const channel = this.client.getChannel<AnyTextChannel>(packet.d.channel_id) || { id: packet.d.channel_id };
                const startTimestamp = new Date(packet.d.timestamp);
                if (packet.d.member) {
                    const member = this.client.util.updateMember(packet.d.guild_id!, packet.d.user_id, packet.d.member);
                    this.client.emit("typingStart", channel, member, startTimestamp);
                }
                const user = this.client.users.get(packet.d.user_id);
                this.client.emit("typingStart", channel, user || { id: packet.d.user_id }, startTimestamp);
                break;
            }

            case "USER_UPDATE": {
                const oldUser = this.client.users.get(packet.d.id)?.toJSON() || null;
                this.client.emit("userUpdate", this.client.users.update(packet.d), oldUser);
                break;
            }

            case "VOICE_STATE_UPDATE": {
                // @TODO voice states without guilds?
                if (!packet.d.guild_id) {
                    break;
                }
                // @TODO voice
                packet.d.self_stream = !!packet.d.self_stream;
                const guild = this.client.guilds.get(packet.d.guild_id);
                const member = this.client.util.updateMember(packet.d.guild_id, packet.d.user_id, packet.d.member!);
                const oldState = member.voiceState?.toJSON() || null;
                const state = guild?.voiceStates.update({ ...packet.d, id: member.id }) || new VoiceState(packet.d, this.client);
                member["update"]({ deaf: state.deaf, mute: state.mute });
                if (oldState?.channelID !== state.channelID) {
                    let oldChannel: VoiceChannel | StageChannel | Uncached | null = null, newChannel: VoiceChannel | StageChannel | Uncached;
                    if (oldState?.channelID) {
                        oldChannel = this.client.getChannel<VoiceChannel | StageChannel>(oldState.channelID) || { id: oldState.channelID };
                    }
                    if (packet.d.channel_id && (newChannel = this.client.getChannel<VoiceChannel | StageChannel>(packet.d.channel_id) || { id: packet.d.channel_id })) {
                        if (newChannel instanceof Channel) {
                            newChannel.voiceMembers.add(member);
                        }
                        if (oldChannel instanceof Channel) {
                            oldChannel.voiceMembers.delete(member.id);
                        }
                        if (oldChannel) {
                            this.client.emit("voiceChannelSwitch", member, newChannel, oldChannel);
                        } else {
                            this.client.emit("voiceChannelJoin", member, newChannel);
                        }
                    } else if (oldChannel) {
                        if (oldChannel instanceof Channel) {
                            oldChannel.voiceMembers.delete(member.id);
                        }
                        this.client.emit("voiceChannelLeave", member, oldChannel);
                    }
                }

                if (JSON.stringify(oldState) !== JSON.stringify(state.toJSON())) {
                    this.client.emit("voiceStateUpdate", member, oldState);
                }

                break;
            }

            case "VOICE_SERVER_UPDATE": {
                // @TODO voice
                break;
            }

            case "WEBHOOKS_UPDATE": {
                const guild = this.client.guilds.get(packet.d.guild_id);
                const channel = this.client.getChannel<AnyGuildChannelWithoutThreads>(packet.d.channel_id) || { id: packet.d.channel_id };
                this.client.emit("webhooksUpdate", guild || { id: packet.d.guild_id }, channel);
                break;
            }
        }
    }

    private onPacket(packet: AnyReceivePacket): void {
        if ("s" in packet && packet.s) {
            if (packet.s > this.sequence + 1 && this.ws && this.status !== "resuming") {
                this.client.emit("warn", `Non-consecutive sequence (${this.sequence} -> ${packet.s})`, this.id);
            }

            this.sequence = packet.s;
        }

        switch (packet.op) {
            case GatewayOPCodes.DISPATCH: void this.onDispatch(packet); break;
            case GatewayOPCodes.HEARTBEAT: this.heartbeat(true); break;
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
                if (this.#heartbeatInterval) {
                    clearInterval(this.#heartbeatInterval);
                }
                this.#heartbeatInterval = setInterval(() => this.heartbeat(false), packet.d.heartbeat_interval);

                this.connecting = false;
                if (this.#connectTimeout) {
                    clearTimeout(this.#connectTimeout);
                }
                this.#connectTimeout = null;
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
            default: this.client.emit("warn", `Unrecognized gateway packet: ${packet}`, this.id);
        }
    }

    private onWSClose(code: number, r: Buffer): void {
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
                    err = new GatewayError("Disallowed intents specified. Make sure any privileged intents you're trying to access have been enabled in the developer portal.", code);
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

            assert(is<Buffer>(data));
            if (this.client.shards.options.compress) {
                if (data.length >= 4 && data.readUInt32BE(data.length - 4) === 0xFFFF) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    this.#sharedZLib.push(data, zlibConstants!.Z_SYNC_FLUSH);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (this.#sharedZLib.err) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
                        this.client.emit("error", new Error(`zlib error ${this.#sharedZLib.err}: ${this.#sharedZLib.msg || ""}`));
                        return;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                    data = Buffer.from(this.#sharedZLib.result || "");
                    if (Erlpack) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                        return this.onPacket(Erlpack.unpack(data as Buffer) as AnyReceivePacket);
                    } else {
                        return this.onPacket(JSON.parse(data.toString()) as AnyReceivePacket);
                    }

                } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    this.#sharedZLib.push(data, false);
                }
            } else if (Erlpack) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                return this.onPacket(Erlpack.unpack(data) as AnyReceivePacket);
            } else {
                return this.onPacket(JSON.parse(data.toString()) as AnyReceivePacket);
            }

        } catch (err) {
            this.client.emit("error", err as Error, this.id);
        }
    }

    private onWSOpen(): void {
        this.status = "handshaking";
        this.client.emit("connect", this.id);
        this.lastHeartbeatAck = true;
    }

    private async restartGuildCreateTimeout(): Promise<void> {
        if (this.#guildCreateTimeout) {
            clearTimeout(this.#guildCreateTimeout);
            this.#guildCreateTimeout = null;
        }
        if (!this.ready) {
            if (this.client.unavailableGuilds.size === 0) {
                return this.checkReady();
            }

            this.#guildCreateTimeout = setTimeout(this.checkReady.bind(this), this.client.shards.options.guildCreateTimeout);
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
    connect(): void {
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            this.client.emit("error", new Error("Shard#connect called while existing connection is established."), this.id);
            return;
        }
        ++this.connectAttempts;
        this.connecting = true;
        this.initialize();
    }

    disconnect(reconnect = this.client.shards.options.autoReconnect, error?: Error): void {
        if (!this.ws) {
            return;
        }

        if (this.#heartbeatInterval) {
            clearInterval(this.#heartbeatInterval);
            this.#heartbeatInterval = null;
        }

        if (this.ws.readyState !== WebSocket.CLOSED) {
            this.ws.removeAllListeners();
            try {
                if (reconnect && this.sessionID) {
                    if (this.ws.readyState !== WebSocket.OPEN) {
                        this.ws.close(4999, "Reconnect");
                    } else {
                        this.client.emit("debug", `Closing websocket (state: ${this.ws.readyState})`, this.id);
                        this.ws.terminate();
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
                this.client.shards.connect(this);
            } else {
                this.client.emit("debug", `Queueing reconnect in ${this.reconnectInterval}ms | Attempt ${this.connectAttempts}`, this.id);
                setTimeout(() => {
                    this.client.shards.connect(this);
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
        this.sequence = 0;
        this.sessionID = null;
        this.reconnectInterval = 1000;
        this.connectAttempts = 0;
        this.ws = null;
        this.#heartbeatInterval = null;
        this.#guildCreateTimeout = null;
        this.globalBucket = new Bucket(120, 60000, { reservedTokens: 5 });
        this.presence = JSON.parse(JSON.stringify(this.client.shards.options.presence)) as Shard["presence"];
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
                    interval:     this.#heartbeatInterval,
                    status:       this.status,
                    timestamp:    Date.now()
                }));
                return this.disconnect(undefined, new Error("Server didn't acknowledge previous heartbeat, possible lost connection"));
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
                throw new Error("Cannot request all members without the GUILD_MEMBERS intent.");
            }
            const guild = this.client.guilds.get(guildID);
            if (guild) {
                guild["updateMemberLimit"](true);
            }
        }
        if (opts.presences && (!(this.client.shards.options.intents & Intents.GUILD_PRESENCES))) {
            throw new Error("Cannot request presences without the GUILD_PRESENCES intent.");
        }
        if (opts.user_ids && opts.user_ids.length > 100) {
            throw new Error("Cannot request more than 100 users at once.");
        }
        this.send(GatewayOPCodes.REQUEST_GUILD_MEMBERS, opts);
        return new Promise<Array<Member>>((resolve, reject) => this.#requestMembersPromise[opts.nonce] = {
            members:  [],
            received: 0,
            timeout:  setTimeout(() => {
                resolve(this.#requestMembersPromise[opts.nonce].members);
                delete this.#requestMembersPromise[opts.nonce];
            }, options?.timeout ?? this.client.rest.options.requestTimeout),
            resolve,
            reject
        });
    }

    reset(): void {
        this.connecting = false;
        this.ready = false;
        this.preReady = false;
        if (this.#requestMembersPromise !== undefined) {
            for (const guildID in this.#requestMembersPromise) {
                if (!this.#requestMembersPromise[guildID]) {
                    continue;
                }

                clearTimeout(this.#requestMembersPromise[guildID].timeout);
                this.#requestMembersPromise[guildID].resolve(this.#requestMembersPromise[guildID].received);
            }
        }

        this.#requestMembersPromise = {};
        this.#getAllUsersCount = {};
        this.#getAllUsersQueue = [];
        this.latency = Infinity;
        this.lastHeartbeatAck = true;
        this.lastHeartbeatReceived = 0;
        this.lastHeartbeatSent = 0;
        this.status = "disconnected";
        if (this.#connectTimeout) {
            clearTimeout(this.#connectTimeout);
        }
        this.#connectTimeout = null;
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
                    const d = Erlpack ? Erlpack.pack({ op, d: data }) : JSON.stringify({ op, d: data });
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

    toString(): string {
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
