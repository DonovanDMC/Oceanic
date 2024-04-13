/** @module Events */
import type {
    AnyGuildChannelWithoutThreads,
    AnyTextableGuildChannel,
    AnyTextableChannel,
    AnyThreadChannel,
    MinimalPossiblyUncachedThread,
    PossiblyUncachedInvite,
    PossiblyUncachedMessage,
    PossiblyUncachedThread,
    ThreadMember,
    UncachedThreadMember,
    AnyVoiceChannel,
    PollAnswer
} from "./channels";
import type { RawRequest } from "./request-handler";
import type { AutoModerationActionExecution, DeletedPrivateChannel, VoiceChannelEffect } from "./gateway";
import type { AnyDispatchPacket } from "./gateway-raw";
import type { Uncached } from "./shared";
import type {
    JSONAnnouncementChannel,
    JSONAnnouncementThreadChannel,
    JSONAutoModerationRule,
    JSONCategoryChannel,
    JSONThreadOnlyChannel,
    JSONGuild,
    JSONIntegration,
    JSONMember,
    JSONMessage,
    JSONPrivateThreadChannel,
    JSONPublicThreadChannel,
    JSONRole,
    JSONScheduledEvent,
    JSONStageChannel,
    JSONStageInstance,
    JSONTextChannel,
    JSONUser,
    JSONVoiceChannel,
    JSONVoiceState,
    JSONEntitlement,
    JSONTestEntitlement
} from "./json";
import type { GuildApplicationCommandPermissions } from "./applications";
import type {
    GuildEmoji,
    PartialEmoji,
    PossiblyUncachedIntegration,
    Sticker,
    Presence
} from "./guilds";
import type { AnyInteractionGateway } from "./interactions";
import type Guild from "../structures/Guild";
import type UnavailableGuild from "../structures/UnavailableGuild";
import type AutoModerationRule from "../structures/AutoModerationRule";
import type AnnouncementThreadChannel from "../structures/AnnouncementThreadChannel";
import type PublicThreadChannel from "../structures/PublicThreadChannel";
import type PrivateThreadChannel from "../structures/PrivateThreadChannel";
import type TextChannel from "../structures/TextChannel";
import type VoiceChannel from "../structures/VoiceChannel";
import type CategoryChannel from "../structures/CategoryChannel";
import type AnnouncementChannel from "../structures/AnnouncementChannel";
import type StageChannel from "../structures/StageChannel";
import type User from "../structures/User";
import type Member from "../structures/Member";
import type Role from "../structures/Role";
import type GuildScheduledEvent from "../structures/GuildScheduledEvent";
import type Integration from "../structures/Integration";
import type Invite from "../structures/Invite";
import type Message from "../structures/Message";
import type PrivateChannel from "../structures/PrivateChannel";
import type StageInstance from "../structures/StageInstance";
import type ForumChannel from "../structures/ForumChannel";
import type AuditLogEntry from "../structures/AuditLogEntry";
import type GroupChannel from "../structures/GroupChannel";
import type Entitlement from "../structures/Entitlement";
import type TestEntitlement from "../structures/TestEntitlement";


export interface ClientEvents {
    /** @event Emitted when an application command's permissions are updated. */
    applicationCommandPermissionsUpdate: [guild: Guild | Uncached, permissions: GuildApplicationCommandPermissions];
    /** @event Emitted when an auto moderation action is executed. Requires the `AUTO_MODERATION_EXECUTION` intent. */
    autoModerationActionExecution: [guild: Guild | Uncached, channel: AnyTextableGuildChannel | Uncached | null, user: User | Uncached, executionOptions: AutoModerationActionExecution];
    /** @event Emitted when an auto moderation rule is created. Requires the `AUTO_MODERATION_CONFIGURATION` intent. */
    autoModerationRuleCreate: [rule: AutoModerationRule];
    /** @event Emitted when an auto moderation rule is deleted. Requires the `AUTO_MODERATION_CONFIGURATION` intent. */
    autoModerationRuleDelete: [rule: AutoModerationRule];
    /** @event Emitted when an auto moderation rule is updated. Requires the `AUTO_MODERATION_CONFIGURATION` intent. */
    autoModerationRuleUpdate: [rule: AutoModerationRule, oldRule: JSONAutoModerationRule | null];
    /** @event Emitted when a channel is created. Guild channels require the `GUILDS` intent. */
    channelCreate: [channel: AnyGuildChannelWithoutThreads | GroupChannel];
    /** @event Emitted when channel is deleted. Requires the `GUILDS` intent. */
    channelDelete: [channel: AnyGuildChannelWithoutThreads | PrivateChannel | DeletedPrivateChannel];
    /** @event Emitted when a channel's pins are updated (message pinned, message unpinned). Requires the `GUILDS` intent for guild channels, and `DIRECT_MESSAGES` for direct messages. */
    channelPinsUpdate: [channel: AnyTextableChannel | Uncached, timestamp: Date | null];
    /** @event Emitted when a channel is updated. Requires the `GUILDS` intent. */
    channelUpdate: [channel: TextChannel, oldChannel: JSONTextChannel | null] | [channel: VoiceChannel, oldChannel: JSONVoiceChannel | null] | [channel: CategoryChannel, oldChannel: JSONCategoryChannel | null] | [channel: AnnouncementChannel, oldChannel: JSONAnnouncementChannel | null] | [channel: StageChannel, oldChannel: JSONStageChannel | null] | [channel: ForumChannel, oldChannel: JSONThreadOnlyChannel | null];
    /** @event Emitted when a shard connects. */
    connect: [id: number];
    /** @event Emitted with various information for debugging. */
    debug: [info: string, shard?: number];
    /** @event Emitted when all shards disconnect. */
    disconnect: [];
    /** @event Emitted when an entitlement is created. */
    entitlementCreate: [entitlement: Entitlement | TestEntitlement];
    /** @event Emitted when an entitlement is deleted. Note that expired entitlements are not deleted. */
    entitlementDelete: [entitlement: Entitlement | TestEntitlement];
    /** @event Emitted when an entitlement is updated. */
    entitlementUpdate: [entitlement: Entitlement | TestEntitlement, oldEntitlement: JSONEntitlement | JSONTestEntitlement | null];
    /** @event Emitted when an error happens. If an error is emitted and no handlers are present, the error will be thrown. */
    error: [info: Error | string, shard?: number];
    /** @event Emitted when an audit log entry is created. Requires both the `GUILD_MODERATION` intent, as well as the `VIEW_AUDIT_LOG` permission. */
    guildAuditLogEntryCreate: [guild: Guild | Uncached, auditLogEntry: AuditLogEntry];
    /** @event Emitted when a guild becomes available. Requires the `GUILDS` intent. */
    guildAvailable: [guild: Guild];
    /** @event Emitted when a guild ban is created. Requires the `GUILD_BANS` intent. */
    guildBanAdd: [guild: Guild | Uncached, user: User];
    /** @event Emitted when a guild ban is revoked. Requires the `GUILD_BANS` intent. */
    guildBanRemove: [guild: Guild | Uncached, user: User];
    /** @event Emitted when the client joins a new guild. Requires the `GUILDS` intent. */
    guildCreate: [guild: Guild];
    /** @event Emitted when the client leaves a guild. Requires the `GUILDS` intent. */
    guildDelete: [guild: Guild | Uncached];
    /** @event Emitted when a guild's emojis are updated. Requires the `GUILD_EMOJIS_AND_STICKERS` intent. */
    guildEmojisUpdate: [guild: Guild | Uncached, emojis: Array<GuildEmoji>, oldEmojis: Array<GuildEmoji> | null];
    /** @event Emitted when a guild's integrations are updated. Requires the `GUILD_INTEGRATIONS` intent. */
    guildIntegrationsUpdate: [guild: Guild | Uncached];
    /** @event Emitted when a member joins a guild. Requires the `GUILD_MEMBERS` intent. */
    guildMemberAdd: [member: Member];
    /** @event Emitted when a chunk of guild members is received from Discord. */
    guildMemberChunk: [members: Array<Member>];
    /** @event Emitted when a member leaves a guild. Requires the `GUILD_MEMBERS` intent. If the member is uncached, the first parameter will be a user. If the guild is uncached, the first parameter will be a user, and the second will be an object with only an `id`. */
    guildMemberRemove: [member: Member | User, guild: Guild | Uncached];
    /** @event Emitted when a guild member is updates. Requires the `GUILD_MEMBERS` intent. */
    guildMemberUpdate: [member: Member, oldMember: JSONMember | null];
    /** @event Emitted when a role is created. Requires the `GUILDS` intent. */
    guildRoleCreate: [role: Role];
    /** @event Emitted when a role is deleted. Requires the `GUILDS` intent. */
    guildRoleDelete: [role: Role | Uncached, guild: Guild | Uncached];
    /** @event Emitted when a role is updated. Requires the `GUILDS` intent. */
    guildRoleUpdate: [role: Role, oldRole: JSONRole | null];
    /** @event Emitted when a scheduled event is created. Requires the `GUILD_SCHEDULED_EVENTS` intent. */
    guildScheduledEventCreate: [event: GuildScheduledEvent];
    /** @event Emitted when a scheduled event is deleted. Requires the `GUILD_SCHEDULED_EVENTS` intent. */
    guildScheduledEventDelete: [event: GuildScheduledEvent];
    /** @event Emitted when a scheduled event is updated. Requires the `GUILD_SCHEDULED_EVENTS` intent. */
    guildScheduledEventUpdate: [event: GuildScheduledEvent, oldEvent: JSONScheduledEvent | null];
    /** @event Emitted when a user subscribes to a scheduled event. Requires the `GUILD_SCHEDULED_EVENTS` intent. */
    guildScheduledEventUserAdd: [event: GuildScheduledEvent | Uncached, user: User | Uncached];
    /** @event Emitted when a user unsubscribes from a scheduled event. Requires the `GUILD_SCHEDULED_EVENTS` intent. */
    guildScheduledEventUserRemove: [event: GuildScheduledEvent | Uncached, user: User | Uncached];
    /** @event Emitted when a guild's stickers are updated. Requires the `GUILD_EMOJIS_AND_STICKERS` intent. */
    guildStickersUpdate: [guild: Guild | Uncached, stickers: Array<Sticker>, oldStickers: Array<Sticker> | null];
    /** @event Emitted when a guild becomes unavailable. Requires the `GUILDS` intent. */
    guildUnavailable: [guild: UnavailableGuild];
    /** @event Emitted when a guild is updated. Requires the `GUILDS` intent. */
    guildUpdate: [guild: Guild, oldGuild: JSONGuild | null];
    /** @event Emitted when a shard receives the HELLO packet. */
    hello: [interval: number, shard: number];
    /** @event Emitted when an integration is created. Requires the `GUILD_INTEGRATIONS` intent. */
    integrationCreate: [guild: Guild | Uncached, integration: Integration];
    /** @event Emitted when an integration is deleted. Requires the `GUILD_INTEGRATIONS` intent. */
    integrationDelete: [guild: Guild | Uncached, integration: Integration | PossiblyUncachedIntegration];
    /** @event Emitted when an integration is updated. Requires the `GUILD_INTEGRATIONS` intent. */
    integrationUpdate: [guild: Guild | Uncached, integration: Integration, oldIntegration: JSONIntegration | null];
    /** @event Emitted when an interaction is created. */
    interactionCreate: [interaction: AnyInteractionGateway];
    /** @event Emitted when an invite is created. Requires the `GUILD_INVITES` intent, and the `MANAGE_CHANNELS` permission on the channel. */
    inviteCreate: [invite: Invite];
    /** @event Emitted when an invite is deleted. Requires the `GUILD_INVITES` intent, and the `MANAGE_CHANNELS` permission on the channel. */
    inviteDelete: [invite: PossiblyUncachedInvite];
    /** @event Emitted when a message is created. Requires the `GUILD_MESSAGES` intent for guild messages, `DIRECT_MESSAGES` for direct messages. The `MESSAGE_CONTENT` intent is required for `content`, `embeds`, and similar to be present on most messages. */
    messageCreate: [message: Message];
    /** @event Emitted when a message is created. Requires the `GUILD_MESSAGES` intent for guild messages, `DIRECT_MESSAGES` for direct messages. The `MESSAGE_CONTENT` intent is required for `content`, `embeds`, and similar to be present on most messages. */
    messageDelete: [message: PossiblyUncachedMessage];
    /** @event Emitted when messages are bulk deleted. Requires the `GUILD_MESSAGES` intent. The `MESSAGE_CONTENT` intent is required for `content`, `embeds`, and similar to be present on most messages. */
    messageDeleteBulk: [messages: Array<PossiblyUncachedMessage>];
    /** @event Emitted when a vote is added to a poll. Requires the `GUILD_MESSAGE_POLLS` for guild messages, and `DIRECT_MESSAGE_POLLS` for direct messages. */
    messagePollVoteAdd: [message: PossiblyUncachedMessage, user: User | Uncached, answer: PollAnswer | { answerID: number; }];
    /** @event Emitted when a vote is added to a poll. Requires the `GUILD_MESSAGE_POLLS` for guild messages, and `DIRECT_MESSAGE_POLLS` for direct messages. */
    messagePollVoteRemove: [message: PossiblyUncachedMessage, user: User | Uncached, answer: PollAnswer | { answerID: number; }];
    /** @event Emitted when a reaction is added to a message. For uncached messages, `author` will not be present if the reaction was added to a webhook message. Requires the `GUILD_MESSAGE_REACTIONS` for guild messages, and `DIRECT_MESSAGE_REACTIONS` for direct messages. */
    messageReactionAdd: [message: PossiblyUncachedMessage & { author?: Member | User | Uncached; }, reactor: Member | User | Uncached, reaction: PartialEmoji, burst: boolean];
    /** @event Emitted when a reaction is removed from a message. Requires the `GUILD_MESSAGE_REACTIONS` for guild messages, and `DIRECT_MESSAGE_REACTIONS` for direct messages. */
    messageReactionRemove: [message: PossiblyUncachedMessage, reactor: Member | User | Uncached, reaction: PartialEmoji, burst: boolean];
    /** @event Emitted when all reactions are removed from a message. Requires the `GUILD_MESSAGE_REACTIONS` for guild messages, and `DIRECT_MESSAGE_REACTIONS` for direct messages. */
    messageReactionRemoveAll: [message: PossiblyUncachedMessage];
    /** @event Emitted when a specific reaction is removed for all users from a message. Requires the `GUILD_MESSAGE_REACTIONS` for guild messages, and `DIRECT_MESSAGE_REACTIONS` for direct messages. */
    messageReactionRemoveEmoji: [message: PossiblyUncachedMessage, reaction: PartialEmoji];
    /** @event Emitted when a message is updated. Requires the `GUILD_MESSAGES` intent for guild messages, `DIRECT_MESSAGES` for direct messages. The `MESSAGE_CONTENT` intent is required for `content`, `embeds`, and similar to be present on most messages. */
    messageUpdate: [message: Message, oldMessage: JSONMessage | null];
    /** @event Emitted when a raw dispatch packet is received. */
    packet: [data: AnyDispatchPacket, shard: number];
    /** @event Emitted when a guild member's presence, or user is updated. Requires the `GUILD_PRESENCES` intent. */
    presenceUpdate: [guild: Guild | Uncached, member: Member | Uncached, presence: Presence, oldPresence: Presence | null];
    /** @event Emitted when all shards are ready. */
    ready: [];
    /** @event Emitted when a request is made. */
    request: [rawRequest: RawRequest];
    /** @event Emitted when this shard disconnects. */
    shardDisconnect: [err: Error | undefined, id: number];
    /** @event Emitted when this shard has processed the READY packet from Discord. */
    shardPreReady: [id: number];
    /** @event Emitted when a shard is fully ready. */
    shardReady: [id: number];
    /** @event Emitted when a shard resumes a connection. */
    shardResume: [id: number];
    /** @event Emitted when a stage instance is created. */
    stageInstanceCreate: [instance: StageInstance];
    /** @event Emitted when a stage instance is deleted. */
    stageInstanceDelete: [instance: StageInstance];
    /** @event Emitted when a stage instance is updated. */
    stageInstanceUpdate: [instance: StageInstance, oldInstance: JSONStageInstance | null];
    /** @event Emitted when a thread is created. Requires the `GUILDS` intent. */
    threadCreate: [thread: AnyThreadChannel];
    /** @event Emitted when a thread is deleted. Requires the `GUILDS` intent. */
    threadDelete: [thread: PossiblyUncachedThread];
    /** @event Emitted when a guild's threads are synced. Requires the `GUILDS` intent. */
    threadListSync: [threads: Array<AnyThreadChannel>, members: Array<ThreadMember>];
    /** @event Emitted when the client's thread member is updated. Requires the `GUILDS` intent. */
    threadMemberUpdate: [thread: MinimalPossiblyUncachedThread, member: ThreadMember, oldMember: ThreadMember | null];
    /** @event Emitted when the members of a thread are updated. Requires the `GUILDS` intent. The received information will be different if `GUILD_MEMBERS` is also used. */
    threadMembersUpdate: [thread: MinimalPossiblyUncachedThread, addedMembers: Array<ThreadMember>, removedMembers: Array<ThreadMember | UncachedThreadMember>];
    /** @event Emitted when a thread is updated. Requires the `GUILDS` intent. */
    threadUpdate: [thread: AnnouncementThreadChannel, oldThread: JSONAnnouncementThreadChannel | null] | [thread: PublicThreadChannel, oldThread: JSONPublicThreadChannel | null] | [thread: PrivateThreadChannel, oldThread: JSONPrivateThreadChannel | null];
    /** @event Emitted when a user starts typing. Requires the `GUILD_MESSAGE_TYPING` for guilds, and `DIRECT_MESSAGE_TYPING` for direct messages. */
    typingStart: [channel: PrivateChannel | Uncached, user: User | Uncached, startTimestamp: Date] | [channel: AnyTextableGuildChannel | Uncached, member: Member, startTimestamp: Date];
    /** @event Emitted when a guild is created, but is unavailable. Requires the `GUILDS` intent. */
    unavailableGuildCreate: [guild: UnavailableGuild];
    /** @event Emitted when a user is updated. */
    userUpdate: [user: User, oldUser: JSONUser | null];
    /** @event Emitted when a user uses an effect in a voice channel. Requires the `GUILD_VOICE_STATES` event. */
    voiceChannelEffectSend: [channel: AnyVoiceChannel | (Uncached & { guild: Guild | Uncached; }), user: Member | User | Uncached, effect: VoiceChannelEffect];
    /** @event Emitted when a user joins a voice channel. Requires the `GUILD_VOICE_STATES` intent. */
    voiceChannelJoin: [member: Member, channel: VoiceChannel | StageChannel | Uncached];
    /** @event Emitted when a user leaves a voice channel. Requires the `GUILD_VOICE_STATES` intent. */
    voiceChannelLeave: [member: Member, channel: VoiceChannel | StageChannel | Uncached | null];
    /** @event Emitted when a voice channel's status is updated. Requires the `GUILD_VOICE_STATES` intent. */
    voiceChannelStatusUpdate: [channel: VoiceChannel | Uncached, status: string | null];
    /** @event Emitted when a user switches voice channels. Requires the `GUILD_VOICE_STATES` intent. */
    voiceChannelSwitch: [member: Member, channel: VoiceChannel | StageChannel | Uncached, oldChannel: VoiceChannel | StageChannel | Uncached | null];
    /** @event Emitted when a user's voice state is updated. Requires the `GUILD_VOICE_STATES` intent. */
    voiceStateUpdate: [member: Member, oldState: JSONVoiceState | null];
    /** @event Emitted with various warning information. */
    warn: [info: string, shard?: number];
    /** @event Emitted when a guild's webhooks are updated. Requires the `GUILD_WEBHOOKS` intent. */
    webhooksUpdate: [guild: Guild | Uncached, channel: AnyGuildChannelWithoutThreads | Uncached];
}

export interface ShardEvents {
    /** @event Emitted with various information for debugging. */
    debug: [info: string];
    /** @event Emitted when this shard disconnects. */
    disconnect: [err?: Error];
    /** @event Emitted when an error happens. If an error is emitted and no handlers are present, the error will be thrown. */
    error: [info: Error | string];
    /** @event Emitted when this shard has processed the READY packet from Discord. */
    preReady: [];
    /** @event Emitted when this shard is fully ready. */
    ready: [];
    /** @event Emitted when this shard resumes a connection. */
    resume: [];
    /** @event Emitted with various warning information. */
    warn: [info: string];
}
