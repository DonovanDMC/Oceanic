/** @module Types/Gateway/Raw */
import type {
    PartialEmoji,
    RawGuild,
    RawGuildEmoji,
    RawIntegration,
    RawMember,
    RawRole,
    RawStageInstance,
    RawUnavailableGuild,
    RawSticker
} from "./guilds";
import type { RawAvatarDecorationData, RawExtendedUser, RawUser } from "./users";
import type {
    PresenceUpdate,
    RawAutoModerationActionExecution,
    RawDeletedPrivateChannel,
    RawMessagePollVote,
    RawVoiceChannelEffect
} from "./gateway";
import type {
    RawGuildApplicationCommandPermissions,
    RawEntitlement,
    RawTestEntitlement,
    RawClientApplication,
    RawPartialApplication
} from "./applications";
import type { RawAutoModerationRule } from "./auto-moderation";
import type {
    RawGroupChannel,
    RawGuildChannel,
    RawMessage,
    RawSoundboard,
    RawThreadChannel,
    RawThreadMember
} from "./channels";
import type { RawScheduledEvent } from "./scheduled-events";
import type { RawVoiceState } from "./voice";
import type { RawInteraction } from "./interactions";
import type { RawAuditLogEntry } from "./audit-log";
import type { GatewayOPCodes, InviteTargetTypes, ReactionType } from "../Constants";

export type AnyReceivePacket = AnyDispatchPacket | HeartbeatPacket | ReconnectPacket | InvalidSessionPacket | HelloPacket | HeartbeatAckPacket;
export interface RawPacket {
    d: unknown;
    op: GatewayOPCodes;
    s: number | null;
    t: string | null;
}

export interface BaseDispatchPacket {
    d: unknown;
    op: GatewayOPCodes.DISPATCH;
    s: number;
    t: string;
}

export interface HeartbeatPacket {
    d: number | null;
    op: GatewayOPCodes.HEARTBEAT;
}


export interface ReconnectPacket {
    d: null;
    op: GatewayOPCodes.RECONNECT;
}

export interface InvalidSessionPacket {
    d: boolean;
    op: GatewayOPCodes.INVALID_SESSION;
}

export interface HelloPacket {
    d: { heartbeat_interval: number; };
    op: GatewayOPCodes.HELLO;
    s: null;
    t: null;
}

export interface HeartbeatAckPacket {
    op: GatewayOPCodes.HEARTBEAT_ACK;
}

export interface ReadyPacket extends BaseDispatchPacket {
    d: {
        application: RawClientApplication;
        guilds: Array<RawUnavailableGuild>;
        resume_gateway_url: string;
        session_id: string;
        shard: [number, number]; // we always send shard
        user: RawExtendedUser;
        v: number;
    };
    t: "READY";
}

export interface ResumedPacket extends BaseDispatchPacket {
    d: unknown;
    t: "RESUMED";
}

export interface GuildCreatePacket extends BaseDispatchPacket {
    d: RawGuild | RawUnavailableGuild;
    t: "GUILD_CREATE";
}

export interface GuildDeletePacket extends BaseDispatchPacket {
    d: { id: string; unavailable?: true; };
    t: "GUILD_DELETE";
}

export interface GuildUpdatePacket extends BaseDispatchPacket {
    d: RawGuild;
    t: "GUILD_UPDATE";
}

export interface ApplicationCommandPermissionsUpdatePacket extends BaseDispatchPacket {
    d: RawGuildApplicationCommandPermissions;
    t: "APPLICATION_COMMAND_PERMISSIONS_UPDATE";
}

export interface AutoModerationRuleCreatePacket extends BaseDispatchPacket {
    d: RawAutoModerationRule;
    t: "AUTO_MODERATION_RULE_CREATE";
}

export interface AutoModerationRuleDeletePacket extends BaseDispatchPacket {
    d: RawAutoModerationRule;
    t: "AUTO_MODERATION_RULE_DELETE";
}

export interface AutoModerationRuleUpdatePacket extends BaseDispatchPacket {
    d: RawAutoModerationRule;
    t: "AUTO_MODERATION_RULE_UPDATE";
}

export interface AutoModerationActionExecutionPacket extends BaseDispatchPacket {
    d: RawAutoModerationActionExecution;
    t: "AUTO_MODERATION_ACTION_EXECUTION";
}

export interface ChannelCreatePacket extends BaseDispatchPacket {
    d: RawGuildChannel | RawGroupChannel;
    t: "CHANNEL_CREATE";
}

export interface ChannelDeletePacket extends BaseDispatchPacket {
    d: RawGuildChannel | RawDeletedPrivateChannel;
    t: "CHANNEL_DELETE";
}

export interface ChannelUpdatePacket extends BaseDispatchPacket {
    d: RawGuildChannel;
    t: "CHANNEL_UPDATE";
}

export interface ThreadCreatePacket extends BaseDispatchPacket {
    d: RawThreadChannel;
    t: "THREAD_CREATE";
}

export interface ThreadDeletePacket extends BaseDispatchPacket {
    d: Pick<RawThreadChannel, "id" | "guild_id" | "parent_id" | "type">;
    t: "THREAD_DELETE";
}

export interface ThreadUpdatePacket extends BaseDispatchPacket {
    d: RawThreadChannel;
    t: "THREAD_UPDATE";
}

export interface ThreadListSyncPacket extends BaseDispatchPacket {
    d: {
        channel_ids: Array<string>;
        guild_id: string;
        members: Array<RawThreadMember>;
        threads: Array<RawThreadChannel>;
    };
    t: "THREAD_LIST_SYNC";
}

export interface ThreadMemberUpdatePacket extends BaseDispatchPacket {
    d: RawThreadMember & { guild_id: string; };
    t: "THREAD_MEMBER_UPDATE";
}

export interface ThreadMembersUpdatePacket extends BaseDispatchPacket {
    d: {
        added_members: Array<RawThreadMember & { member: RawMember; presence: PresenceUpdate | null; }>;
        guild_id: string;
        id: string;
        member_count: number;
        removed_member_ids: Array<string>;
    };
    t: "THREAD_MEMBERS_UPDATE";
}

export interface ChannelPinsUpdatePacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        guild_id?: string;
        last_pin_timestamp?: string | null;
    };
    t: "CHANNEL_PINS_UPDATE";
}

export interface GuildBanAddPacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        user: RawUser;
    };
    t: "GUILD_BAN_ADD";
}

export interface GuildBanRemovePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        user: RawUser;
    };
    t: "GUILD_BAN_REMOVE";
}

export interface GuildEmojisUpdatePacket extends BaseDispatchPacket {
    d: {
        emojis: Array<RawGuildEmoji>;
        guild_id: string;
    };
    t: "GUILD_EMOJIS_UPDATE";
}

export interface GuildStickersUpdatePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        stickers: Array<RawSticker>;
    };
    t: "GUILD_STICKERS_UPDATE";
}

export interface GuildIntegrationsUpdatePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
    };
    t: "GUILD_INTEGRATIONS_UPDATE";
}

export interface GuildMemberAddPacket extends BaseDispatchPacket {
    d: RawMember & { guild_id: string; };
    t: "GUILD_MEMBER_ADD";
}

export interface GuildMemberRemovePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        user: RawUser;
    };
    t: "GUILD_MEMBER_REMOVE";
}

export interface GuildMemberUpdatePacket extends BaseDispatchPacket {
    d: {
        avatar: string | null;
        avatar_decoration_data?: RawAvatarDecorationData | null;
        communication_disabled_until?: string | null;
        deaf?: boolean;
        flags?: number;
        guild_id: string;
        joined_at: string | null;
        mute?: boolean;
        nick?: string | null;
        pending?: boolean;
        premium_since?: string | null;
        roles: Array<string>;
        user: RawUser;
    };
    t: "GUILD_MEMBER_UPDATE";
}

export interface GuildMembersChunkPacket extends BaseDispatchPacket {
    d: {
        chunk_count: number;
        chunk_index: number;
        guild_id: string;
        members: Array<RawMember>;
        nonce?: string;
        not_found?: Array<string>;
        presences?: Array<PresenceUpdate>;
    };
    t: "GUILD_MEMBERS_CHUNK";
}

export interface GuildRoleCreatePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        role: RawRole;
    };
    t: "GUILD_ROLE_CREATE";
}

export interface GuildRoleDeletePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        role_id: string;
    };
    t: "GUILD_ROLE_DELETE";
}

export interface GuildRoleUpdatePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        role: RawRole;
    };
    t: "GUILD_ROLE_UPDATE";
}

export interface GuildScheduledEventCreatePacket extends BaseDispatchPacket {
    d: RawScheduledEvent;
    t: "GUILD_SCHEDULED_EVENT_CREATE";
}

export interface GuildScheduledEventDeletePacket extends BaseDispatchPacket {
    d: RawScheduledEvent;
    t: "GUILD_SCHEDULED_EVENT_DELETE";
}

export interface GuildScheduledEventUpdatePacket extends BaseDispatchPacket {
    d: RawScheduledEvent;
    t: "GUILD_SCHEDULED_EVENT_UPDATE";
}

export interface GuildScheduledEventUserAddPacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        guild_scheduled_event_id: string;
        user_id: string;
    };
    t: "GUILD_SCHEDULED_EVENT_USER_ADD";
}

export interface GuildScheduledEventUserRemovePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        guild_scheduled_event_id: string;
        user_id: string;
    };
    t: "GUILD_SCHEDULED_EVENT_USER_REMOVE";
}

export interface GuildSoundboardSoundCreatePacket extends BaseDispatchPacket {
    d: RawSoundboard & { guild_id: string; };
    t: "GUILD_SOUNDBOARD_SOUND_CREATE";
}

export interface GuildSoundboardSoundDeletePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        sound_id: string;
    };
    t: "GUILD_SOUNDBOARD_SOUND_DELETE";
}

export interface GuildSoundboardSoundUpdatePacket extends BaseDispatchPacket {
    d: RawSoundboard & { guild_id: string; };
    t: "GUILD_SOUNDBOARD_SOUND_UPDATE";
}

export interface GuildSoundboardSoundsUpdatePacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        soundboard_sounds: Array<RawSoundboard & { guild_id: string; }>;
    };
    t: "GUILD_SOUNDBOARD_SOUNDS_UPDATE";
}

export interface IntegrationCreatePacket extends BaseDispatchPacket {
    d: RawIntegration & { guild_id: string; };
    t: "INTEGRATION_CREATE";
}

export interface IntegrationDeletePacket extends BaseDispatchPacket {
    d: {
        application_id?: string;
        guild_id: string;
        id: string;
    };
    t: "INTEGRATION_DELETE";
}

export interface IntegrationUpdatePacket extends BaseDispatchPacket {
    d: RawIntegration & { guild_id: string; };
    t: "INTEGRATION_UPDATE";
}

export interface InviteCreatePacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        code: string;
        created_at: string;
        guild_id?: string;
        inviter?: RawUser;
        max_age: number;
        max_uses: number;
        target_application?: RawPartialApplication;
        target_type?: InviteTargetTypes;
        target_user?: RawUser;
        temporary: boolean;
        uses: number;
    };
    t: "INVITE_CREATE";
}
export interface InviteDeletePacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        code: string;
        guild_id?: string;
    };
    t: "INVITE_DELETE";
}

export interface MessageCreatePacket extends BaseDispatchPacket {
    d: RawMessage & { guild_id?: string; };
    t: "MESSAGE_CREATE";
}

export interface MessageDeletePacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        guild_id?: string;
        id: string;
    };
    t: "MESSAGE_DELETE";
}

export interface MessageDeleteBulkPacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        guild_id?: string;
        ids: Array<string>;
    };
    t: "MESSAGE_DELETE_BULK";
}

export interface MessageUpdatePacket extends BaseDispatchPacket {
    d: Partial<Omit<RawMessage, "id" | "channel_id">> & { channel_id: string; guild_id?: string; id: string; };
    t: "MESSAGE_UPDATE";
}

export interface MessageReactionAddPacket extends BaseDispatchPacket {
    d: {
        burst: boolean;
        burst_colors: Array<string>;
        channel_id: string;
        emoji: PartialEmoji;
        guild_id?: string;
        member?: RawMember;
        message_author_id?: string;
        message_id: string;
        type: ReactionType;
        user_id: string;
    };
    t: "MESSAGE_REACTION_ADD";
}

export interface MessageReactionRemovePacket extends BaseDispatchPacket {
    d: {
        burst: boolean;
        burst_colors: Array<string>;
        channel_id: string;
        emoji: PartialEmoji;
        guild_id?: string;
        message_id: string;
        type: ReactionType;
        user_id: string;
    };
    t: "MESSAGE_REACTION_REMOVE";
}

export interface MessageReactionRemoveAllPacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        guild_id?: string;
        message_id: string;
    };
    t: "MESSAGE_REACTION_REMOVE_ALL";
}

export interface MessageReactionRemoveEmojiPacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        emoji: PartialEmoji;
        guild_id?: string;
        message_id: string;
    };
    t: "MESSAGE_REACTION_REMOVE_EMOJI";
}

export interface PresenceUpdatePacket extends BaseDispatchPacket {
    d: PresenceUpdate;
    t: "PRESENCE_UPDATE";
}

export interface TypingStartPacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        guild_id?: string;
        member?: RawMember;
        timestamp: number;
        user_id: string;
    };
    t: "TYPING_START";
}

export interface UserUpdatePacket extends BaseDispatchPacket {
    d: RawUser;
    t: "USER_UPDATE";
}

export interface VoiceStateUpdatePacket extends BaseDispatchPacket {
    d: RawVoiceState;
    t: "VOICE_STATE_UPDATE";
}

export interface VoiceServerUpdatePacket extends BaseDispatchPacket {
    d: {
        endpoint: string | null;
        guild_id: string;
        token: string;
    };
    t: "VOICE_SERVER_UPDATE";
}

export interface WebhooksUpdatePacket extends BaseDispatchPacket {
    d: {
        channel_id: string;
        guild_id: string;
    };
    t: "WEBHOOKS_UPDATE";
}

export interface InteractionCreatePacket extends BaseDispatchPacket {
    d: RawInteraction;
    t: "INTERACTION_CREATE";
}

export interface SoundboardSoundsPacket extends BaseDispatchPacket {
    d: {
        guild_id: string;
        soundboard_sounds: Array<RawSoundboard>;
    };
    t: "SOUNDBOARD_SOUNDS";
}

export interface StageInstanceCreatePacket extends BaseDispatchPacket {
    d: RawStageInstance;
    t: "STAGE_INSTANCE_CREATE";
}

export interface StageInstanceDeletePacket extends BaseDispatchPacket {
    d: RawStageInstance;
    t: "STAGE_INSTANCE_DELETE";
}

export interface StageInstanceUpdatePacket extends BaseDispatchPacket {
    d: RawStageInstance;
    t: "STAGE_INSTANCE_UPDATE";
}

export interface GuildAuditLogEntryCreatePacket extends BaseDispatchPacket {
    d: RawAuditLogEntry & { guild_id: string; };
    t: "GUILD_AUDIT_LOG_ENTRY_CREATE";
}

export interface VoiceChannelEffectSendPacket extends BaseDispatchPacket {
    d: RawVoiceChannelEffect;
    t: "VOICE_CHANNEL_EFFECT_SEND";
}

export interface VoiceChannelStatusUpdatePacket extends BaseDispatchPacket {
    d: { id: string; status: string | null; };
    t: "VOICE_CHANNEL_STATUS_UPDATE";
}

export interface EntitlementCreatePacket extends BaseDispatchPacket {
    d: RawEntitlement | RawTestEntitlement;
    t: "ENTITLEMENT_CREATE";
}

export interface EntitlementUpdatePacket extends BaseDispatchPacket {
    d: RawEntitlement | RawTestEntitlement;
    t: "ENTITLEMENT_UPDATE";
}

export interface EntitlementDeletePacket extends BaseDispatchPacket {
    d: RawEntitlement | RawTestEntitlement;
    t: "ENTITLEMENT_DELETE";
}

export interface MessagePollVoteAdd extends BaseDispatchPacket {
    d: RawMessagePollVote;
    t: "MESSAGE_POLL_VOTE_ADD";
}

export interface MessagePollVoteRemove extends BaseDispatchPacket {
    d: RawMessagePollVote;
    t: "MESSAGE_POLL_VOTE_REMOVE";
}

export type AnyDispatchPacket = PresenceUpdatePacket | ReadyPacket | ResumedPacket |
GuildCreatePacket | GuildDeletePacket | GuildUpdatePacket | ApplicationCommandPermissionsUpdatePacket | GuildAuditLogEntryCreatePacket |
AutoModerationRuleCreatePacket | AutoModerationRuleDeletePacket | AutoModerationRuleUpdatePacket | AutoModerationActionExecutionPacket |
ChannelCreatePacket | ChannelDeletePacket | ChannelUpdatePacket | ChannelPinsUpdatePacket |
ThreadCreatePacket | ThreadDeletePacket | ThreadUpdatePacket | ThreadListSyncPacket | ThreadMemberUpdatePacket | ThreadMembersUpdatePacket |
GuildBanAddPacket | GuildBanRemovePacket | GuildEmojisUpdatePacket | GuildStickersUpdatePacket | GuildIntegrationsUpdatePacket |
GuildMemberAddPacket | GuildMemberRemovePacket | GuildMemberUpdatePacket | GuildMembersChunkPacket |
GuildRoleCreatePacket | GuildRoleDeletePacket | GuildRoleUpdatePacket |
GuildScheduledEventCreatePacket | GuildScheduledEventDeletePacket | GuildScheduledEventUpdatePacket | GuildScheduledEventUserAddPacket | GuildScheduledEventUserRemovePacket | GuildSoundboardSoundCreatePacket | GuildSoundboardSoundDeletePacket | GuildSoundboardSoundUpdatePacket | GuildSoundboardSoundsUpdatePacket |
IntegrationCreatePacket | IntegrationDeletePacket | IntegrationUpdatePacket |
InviteCreatePacket | InviteDeletePacket |
MessageCreatePacket | MessageDeletePacket | MessageDeleteBulkPacket | MessageUpdatePacket | MessageReactionAddPacket | MessageReactionRemovePacket | MessageReactionRemoveAllPacket | MessageReactionRemoveEmojiPacket |
TypingStartPacket | UserUpdatePacket | VoiceStateUpdatePacket | VoiceChannelEffectSendPacket | VoiceChannelStatusUpdatePacket | VoiceServerUpdatePacket | WebhooksUpdatePacket | InteractionCreatePacket | SoundboardSoundsPacket | StageInstanceCreatePacket | StageInstanceDeletePacket | StageInstanceUpdatePacket |
EntitlementCreatePacket | EntitlementUpdatePacket | EntitlementDeletePacket |
MessagePollVoteAdd | MessagePollVoteRemove;
