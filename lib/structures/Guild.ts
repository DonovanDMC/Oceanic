/** @module Guild */
import Role from "./Role";
import Base from "./Base";
import GuildChannel from "./GuildChannel";
import Member from "./Member";
import GuildScheduledEvent from "./GuildScheduledEvent";
import ThreadChannel from "./ThreadChannel";
import type User from "./User";
import type VoiceChannel from "./VoiceChannel";
import type ClientApplication from "./ClientApplication";
import type TextChannel from "./TextChannel";
import type CategoryChannel from "./CategoryChannel";
import Integration from "./Integration";
import AutoModerationRule from "./AutoModerationRule";
import Permission from "./Permission";
import VoiceState from "./VoiceState";
import StageInstance from "./StageInstance";
import Channel from "./Channel";
import type StageChannel from "./StageChannel";
import type GuildTemplate from "./GuildTemplate";
import type GuildPreview from "./GuildPreview";
import Invite from "./Invite";
import type Webhook from "./Webhook";
import AuditLogEntry from "./AuditLogEntry";
import type Entitlement from "./Entitlement";
import type TestEntitlement from "./TestEntitlement";
import {
    AllPermissions,
    Permissions,
    type DefaultMessageNotificationLevels,
    type ExplicitContentFilterLevels,
    type GuildFeature,
    type GuildNSFWLevels,
    type ImageFormat,
    type MFALevels,
    type PremiumTiers,
    type VerificationLevels,
    type GatewayOPCodes,
    type MutableGuildFeatures,
    type ChannelTypeMap,
    EntitlementOwnerTypes
} from "../Constants";
import * as Routes from "../util/Routes";
import type Client from "../Client";
import TypedCollection from "../util/TypedCollection";
import type {
    AnyGuildChannel,
    AnyGuildChannelWithoutThreads,
    AnyTextableGuildChannel,
    AnyThreadChannel,
    AnyInviteChannel,
    RawGuildChannel,
    RawThreadChannel,
    GuildChannelsWithoutThreads,
    RawInvite
} from "../types/channels";
import type {
    AddMemberOptions,
    BeginPruneOptions,
    CreateBanOptions,
    CreateChannelOptions,
    CreateGuildEmojiOptions,
    CreateRoleOptions,
    EditCurrentMemberOptions,
    EditCurrentUserVoiceStateOptions,
    EditGuildEmojiOptions,
    EditGuildOptions,
    EditMemberOptions,
    EditRoleOptions,
    EditRolePositionsEntry,
    EditUserVoiceStateOptions,
    EditWelcomeScreenOptions,
    GetBansOptions,
    GetMembersOptions,
    GetPruneCountOptions,
    GuildEmoji,
    ModifyChannelPositionsEntry,
    RawGuild,
    RawMember,
    RawRole,
    SearchMembersOptions,
    WelcomeScreen,
    WidgetImageStyle,
    WidgetSettings,
    RawIntegration,
    Widget,
    GetActiveThreadsResponse,
    Ban,
    GetVanityURLResponse,
    RawWidget,
    RawStageInstance,
    EditMFALevelOptions,
    RESTMember,
    CreateStickerOptions,
    Sticker,
    EditStickerOptions,
    Onboarding,
    EditOnboardingOptions,
    RawGuildEmoji,
    RawSticker,
    InventorySettings,
    EditIncidentActionsOptions,
    IncidentActions,
    BulkBanOptions,
    BulkBanResponse
} from "../types/guilds";
import type {
    CreateScheduledEventOptions,
    EditScheduledEventOptions,
    GetScheduledEventUsersOptions,
    RawScheduledEvent,
    ScheduledEventUser
} from "../types/scheduled-events";
import type { CreateAutoModerationRuleOptions, EditAutoModerationRuleOptions, RawAutoModerationRule } from "../types/auto-moderation";
import type { AuditLog, GetAuditLogOptions, RawAuditLogEntry } from "../types/audit-log";
import type { CreateTemplateOptions, EditGuildTemplateOptions } from "../types/guild-template";
import type { JoinVoiceChannelOptions, RawVoiceState, VoiceRegion } from "../types/voice";
import type { JSONGuild } from "../types/json";
import type { PresenceUpdate, RequestGuildMembersOptions } from "../types/gateway";
import type Shard from "../gateway/Shard";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-line
import { UncachedError } from "../util/Errors";
import SimpleCollection from "../util/SimpleCollection";
import type { SearchEntitlementsOptions } from "../types/applications";
import type { DiscordGatewayAdapterCreator, DiscordGatewayAdapterLibraryMethods, DiscordGatewayAdapterImplementerMethods, VoiceConnection } from "@discordjs/voice";

/** Represents a Discord server. */
export default class Guild extends Base {
    private _clientMember?: Member;
    // if the guild was retrieved from rest
    private _rest;
    private _shard?: Shard;
    /** This guild's afk voice channel. */
    afkChannel?: VoiceChannel | null;
    /** The ID of this guild's afk voice channel. */
    afkChannelID: string | null;
    /** The seconds after which voice users will be moved to the afk channel. */
    afkTimeout: number;
    /** The application that created this guild, if applicable. */
    application?: ClientApplication | null;
    /** The ID of the application that created this guild, if applicable. */
    applicationID: string | null;
    /** The approximate number of members in this guild (if retrieved with counts). */
    approximateMemberCount?: number;
    /** The approximate number of non-offline members in this guild (if retrieved with counts). */
    approximatePresenceCount?: number;
    /** The cached audit log entries. This requires both the {@link Constants~Intents.GUILD_MODERATION | GUILD_MODERATION} intent, as well as the {@link Constants~Permissions | VIEW_AUDIT_LOG } permission. */
    auditLogEntries: TypedCollection<RawAuditLogEntry, AuditLogEntry>;
    /** The auto moderation rules in this guild. */
    autoModerationRules: TypedCollection<RawAutoModerationRule, AutoModerationRule>;
    /** The hash of this guild's banner. */
    banner: string | null;
    /** The channels in this guild. */
    channels: TypedCollection<RawGuildChannel, AnyGuildChannelWithoutThreads>;
    /** The default [message notifications level](https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level) of this guild. */
    defaultMessageNotifications: DefaultMessageNotificationLevels;
    /** The description of this guild. */
    description: string | null;
    /** The discovery splash of this guild. Only present if the guild has the `DISCOVERABLE` feature. */
    discoverySplash: string | null;
    /** The custom emojis of this guild. */
    emojis: SimpleCollection<string, RawGuildEmoji, GuildEmoji>;
    /** The [explicit content filter](https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level) of this guild. */
    explicitContentFilter: ExplicitContentFilterLevels;
    /** The [features](https://discord.com/developers/docs/resources/guild#guild-object-guild-features) this guild has. */
    features: Array<GuildFeature>;
    /** The icon hash of this guild. */
    icon: string | null;
    incidentActions: IncidentActions | null;
    /** The integrations in this guild. */
    integrations: TypedCollection<RawIntegration, Integration, [guildID?: string]>;
    /** The guild's inventory settings. */
    inventorySettings: InventorySettings | null;
    /** The cached invites in this guild. This will only be populated by invites created while the client is active. */
    invites: SimpleCollection<string, RawInvite, Invite, "code">;
    /** The date at which this guild was joined. */
    joinedAt: Date | null;
    /** If this guild is considered large. */
    large: boolean;
    latestOnboardingQuestionID: string | null;
    /** The maximum amount of members this guild can have. */
    maxMembers?: number;
    /** The maximum amount of people that can be present at a time in this guild. Only present for very large guilds. */
    maxPresences?: number;
    /** The maximum amount of users that can be present in a stage video channel. */
    maxStageVideoChannelUsers?: number;
    /** The maximum amount of users that can be present in a video channel. */
    maxVideoChannelUsers?: number;
    /** The number of members in this guild. */
    memberCount: number;
    /** The cached members in this guild. */
    members: TypedCollection<RawMember | RESTMember, Member, [guildID: string]>;
    /** The required [mfa level](https://discord.com/developers/docs/resources/guild#guild-object-mfa-level) for moderators of this guild. */
    mfaLevel: MFALevels;
    /** The name of this guild. */
    name: string;
    /** The [nsfw level](https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level) of this guild. */
    nsfwLevel: GuildNSFWLevels;
    /** The owner of this guild. */
    owner?: User | null;
    /** The ID of the owner of this guild. */
    ownerID: string | null;
    /** The [preferred locale](https://discord.com/developers/docs/reference#locales) of this guild. */
    preferredLocale: string;
    /** If this guild has the boost progress bar enabled. */
    premiumProgressBarEnabled: boolean;
    /** The number of nitro boosts this guild has. */
    premiumSubscriptionCount?: number;
    /** The [boost level](https://discord.com/developers/docs/resources/guild#guild-object-premium-tier) of this guild. */
    premiumTier: PremiumTiers;
    /** The channel where notices from Discord are received. Only present in guilds with the `COMMUNITY` feature. */
    publicUpdatesChannel?: AnyTextableGuildChannel | null;
    /** The id of the channel where notices from Discord are received. Only present in guilds with the `COMMUNITY` feature. */
    publicUpdatesChannelID: string | null;
    /** @deprecated The region of this guild. */
    region?: string | null;
    /** The roles in this guild. */
    roles: TypedCollection<RawRole, Role, [guildID: string]>;
    /** The channel where rules/guidelines are displayed. Only present in guilds with the `COMMUNITY` feature. */
    rulesChannel?: TextChannel | null;
    /** The id of the channel where rules/guidelines are displayed. Only present in guilds with the `COMMUNITY` feature. */
    rulesChannelID: string | null;
    /** The channel where safety related notices are posted. */
    safetyAlertsChannel?: TextChannel | null;
    /** The ID if the channel where safety related notices are posted. */
    safetyAlertsChannelID: string | null;
    /** The scheduled events in this guild. */
    scheduledEvents: TypedCollection<RawScheduledEvent, GuildScheduledEvent>;
    /** The invite splash hash of this guild. */
    splash: string | null;
    /** The stage instances in this guild. */
    stageInstances: TypedCollection<RawStageInstance, StageInstance>;
    /** The custom stickers of this guild. */
    stickers: SimpleCollection<string, RawSticker, Sticker>;
    /** The channel where welcome messages and boosts notices are posted. */
    systemChannel?: TextChannel | null;
    /** The [flags](https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags) for the system channel. */
    systemChannelFlags: number;
    /** The ID of the channel where welcome messages and boosts notices are posted. */
    systemChannelID: string | null;
    /** The threads in this guild. */
    threads: TypedCollection<RawThreadChannel, AnyThreadChannel>;
    /** If this guild is unavailable. */
    unavailable: boolean;
    /** The vanity url of this guild. Only present in guilds with the `VANITY_URL` feature. */
    vanityURLCode: string | null;
    /** The [verification level](https://discord.com/developers/docs/resources/guild#guild-object-verification-level) of this guild. */
    verificationLevel: VerificationLevels;
    /** The voice states of members in voice channels. */
    voiceStates: TypedCollection<RawVoiceState, VoiceState>;
    /** The welcome screen configuration. Only present in guilds with the `WELCOME_SCREEN_ENABLED` feature. */
    welcomeScreen?: WelcomeScreen;
    /** The channel the widget will generate an invite to, or `null` if set to no invite. */
    widgetChannel?: Exclude<AnyGuildChannel, CategoryChannel> | null;
    /** The id of the channel the widget will generate an invite to, or `null` if set to no invite. */
    widgetChannelID: string | null;
    /** If the widget is enabled. */
    widgetEnabled?: boolean;
    constructor(data: RawGuild, client: Client, rest?: boolean) {
        super(data.id, client);
        this.afkChannelID = null;
        this.afkTimeout = 0;
        this.applicationID = data.application_id;
        this.auditLogEntries = new TypedCollection(AuditLogEntry, client, client.util._getLimit("auditLogEntries", this.id));
        this.autoModerationRules = new TypedCollection(AutoModerationRule, client, client.util._getLimit("autoModerationRules", this.id));
        this.banner = null;
        this.channels = new TypedCollection(GuildChannel, client, client.util._getLimit("channels", this.id), {
            construct: (channel): GuildChannel => {
                client.channelGuildMap[channel.id] = this.id;
                return Channel.from<AnyGuildChannelWithoutThreads>(channel, client);
            },
            delete: (id): void => {
                delete client.channelGuildMap[id];
            }
        }) as TypedCollection<RawGuildChannel, AnyGuildChannelWithoutThreads>;
        this.defaultMessageNotifications = data.default_message_notifications;
        this.description = null;
        this.discoverySplash = null;
        this.emojis = new SimpleCollection(rawEmoji => this.client.util.convertGuildEmoji(rawEmoji), client.util._getLimit("emojis", this.id), "merge");
        this.explicitContentFilter = data.explicit_content_filter;
        this.features = [];
        this.icon = null;
        this.incidentActions = null;
        this.integrations = new TypedCollection(Integration, client, client.util._getLimit("integrations", this.id));
        this.inventorySettings = null;
        this.invites = new SimpleCollection(rawInvite => new Invite(rawInvite, client), client.util._getLimit("invites", this.id), "update", "code");
        this.joinedAt = null;
        this.large = (data.member_count ?? data.approximate_member_count ?? 0) >= client.shards.options.largeThreshold;
        this.latestOnboardingQuestionID = null;
        this.memberCount = data.member_count ?? data.approximate_member_count ?? 0;
        this.members = new TypedCollection(Member, client, client.util._getLimit("members", this.id));
        this.mfaLevel = data.mfa_level;
        this.name = data.name;
        this.nsfwLevel = data.nsfw_level;
        this.owner = data.owner_id === null ? null : client.users.get(data.owner_id)!;
        this.ownerID = data.owner_id;
        this.preferredLocale = data.preferred_locale;
        this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
        this.premiumTier = data.premium_tier;
        this.publicUpdatesChannelID = null;
        this.roles = new TypedCollection(Role, client, client.util._getLimit("roles", this.id));
        this.rulesChannelID = null;
        this.safetyAlertsChannelID = null;
        this.scheduledEvents = new TypedCollection(GuildScheduledEvent, client, client.util._getLimit("scheduledEvents", this.id));
        this.splash = null;
        this.stageInstances = new TypedCollection(StageInstance, client, client.util._getLimit("stageInstances", this.id));
        this.stickers = new SimpleCollection(rawSticker => client.util.convertSticker(rawSticker), client.util._getLimit("stickers", this.id), "merge");
        this.systemChannelID = null;
        this.systemChannelFlags = data.system_channel_flags;
        this.threads = new TypedCollection(ThreadChannel, client, client.util._getLimit("guildThreads", this.id), {
            construct: (thread): ThreadChannel => {
                client.threadGuildMap[thread.id] = this.id;
                return Channel.from<AnyThreadChannel>(thread, client);
            },
            delete: (id): void => {
                delete client.threadGuildMap[id];
            }
        }) as TypedCollection<RawThreadChannel, AnyThreadChannel>;
        this.unavailable = !!data.unavailable;
        this.vanityURLCode = data.vanity_url_code;
        this.verificationLevel = data.verification_level;
        this.voiceStates = new TypedCollection(VoiceState, client, client.util._getLimit("voiceStates", this.id));
        this.widgetChannelID = data.widget_channel_id === null ? null : data.widget_channel_id!;
        for (const role of data.roles) {
            this.roles.update(role, data.id);
        }
        this.update(data);
        this._rest = !!rest;

        if (data.channels) {
            for (const channelData of data.channels) {
                channelData.guild_id = this.id;
                client.channelGuildMap[channelData.id] = this.id;
                this.channels.update(channelData);
            }
        }


        if (data.threads) {
            for (const threadData of data.threads) {
                threadData.guild_id = this.id;
                this.threads.update(threadData);
            }
        }


        if (data.members) {
            for (const rawMember of data.members) {
                const member = this.members.update({ ...rawMember, id: rawMember.user?.id }, this.id);
                if (this.client["_user"] && member.id === this.client.user.id) {
                    this._clientMember = member;
                }
            }
        }

        if (data.stage_instances) {
            for (const stageInstance of data.stage_instances) {
                stageInstance.guild_id = this.id;
                this.stageInstances.update(stageInstance);
            }
        }


        if (data.presences) {
            for (const presence of data.presences) {
                const member = this.members.get(presence.user.id);
                if (member) {
                    delete (presence as { user?: PresenceUpdate["user"]; }).user;
                    member.presence = {
                        clientStatus: presence.client_status,
                        guildID:      presence.guild_id,
                        status:       presence.status,
                        activities:   presence.activities?.map(activity => ({
                            createdAt:     activity.created_at,
                            name:          activity.name,
                            type:          activity.type,
                            applicationID: activity.application_id,
                            assets:        activity.assets ? {
                                largeImage: activity.assets.large_image,
                                largeText:  activity.assets.large_text,
                                smallImage: activity.assets.small_image,
                                smallText:  activity.assets.small_text
                            } : undefined,
                            buttons:    activity.buttons,
                            details:    activity.details,
                            emoji:      activity.emoji,
                            flags:      activity.flags,
                            instance:   activity.instance,
                            party:      activity.party,
                            secrets:    activity.secrets,
                            state:      activity.state,
                            timestamps: activity.timestamps,
                            url:        activity.url
                        }))
                    };
                } else {
                    client.emit("debug", `Rogue presence (user: ${presence.user.id}, guild: ${this.id})`);
                }

            }
        }


        if (data.voice_states) {
            for (const voiceState of data.voice_states) {
                if (!this.members.has(voiceState.user_id) || !voiceState.channel_id) {
                    continue;
                }
                voiceState.guild_id = this.id;
                this.voiceStates.update({ ...voiceState, id: voiceState.user_id });
                const channel = this.channels.get(voiceState.channel_id) as VoiceChannel | StageChannel;
                const member = this.members.update({ id: voiceState.user_id, deaf: voiceState.deaf, mute: voiceState.mute }, this.id);
                if (this._clientMember) {
                    this._clientMember["update"]({ deaf: voiceState.deaf, mute: voiceState.mute });
                }
                if (channel && "voiceMembers" in channel) {
                    channel.voiceMembers.add(member);
                }
                if (client.shards.options.seedVoiceConnections && voiceState.user_id === client.user.id && !this.client.getVoiceConnection(this.id)) {
                    this.client.joinVoiceChannel({
                        guildID:             this.id,
                        channelID:           voiceState.channel_id,
                        selfDeaf:            voiceState.self_deaf,
                        selfMute:            voiceState.self_mute,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        voiceAdapterCreator: this.voiceAdapterCreator
                    });
                }
            }
        }
    }

    private toggleFeature(feature: MutableGuildFeatures, enable: boolean, reason?: string): Promise<Guild> {
        const newFeatures = enable ?
            (this.features.includes(feature) ? this.features : [...this.features, feature]) :
            this.features.filter(name => name !== feature);
        return this.edit({ features: newFeatures, reason });
    }

    // true = `memberCount`
    private updateMemberLimit(toAdd: true | number): void {
        if (this.members.limit === Infinity || this.client.options.disableMemberLimitScaling) {
            return;
        }
        const original = this.members.limit;
        const num = toAdd === true ? this.memberCount : this.members.limit + toAdd;
        const round = 10 ** (Math.floor(Math.log10(num)) - 1);
        if (toAdd === true) {
            const limit = Math.round(num / round) * round + round;
            if (this.members.limit >= limit) {
                return;
            }
            this.members.limit = limit;
        } else {
            const limit = Math.round((this.members.size + toAdd) / round) * round + round;
            if (this.members.limit >= limit) {
                return;
            }
            this.members.limit = limit;
        }
        this.client.emit("debug", `The limit of the members collection of guild ${this.id} has been updated from ${original} to ${this.members.limit} to accommodate at least ${toAdd === true ? this.memberCount : this.members.size + toAdd} members.`);
    }

    protected override update(data: Partial<RawGuild>): void {
        if (data.afk_channel_id !== undefined) {
            this.afkChannel = data.afk_channel_id === null ? null : this.client.getChannel<VoiceChannel>(data.afk_channel_id);
            this.afkChannelID = data.afk_channel_id;
        }
        if (data.afk_timeout !== undefined) {
            this.afkTimeout = data.afk_timeout;
        }
        if (data.application_id !== undefined) {
            this.application = this.client["_application"] && data.application_id === null ? null : (this.client.application.id === data.application_id ? this.client.application : undefined);
            this.applicationID = data.application_id;
        }
        if (data.approximate_member_count !== undefined) {
            this.approximateMemberCount = data.approximate_member_count;
        }
        if (data.approximate_presence_count !== undefined) {
            this.approximatePresenceCount = data.approximate_presence_count;
        }
        if (data.banner !== undefined) {
            this.banner = data.banner;
        }
        if (data.default_message_notifications !== undefined) {
            this.defaultMessageNotifications = data.default_message_notifications;
        }
        if (data.description !== undefined) {
            this.description = data.description;
        }
        if (data.discovery_splash !== undefined) {
            this.discoverySplash = data.discovery_splash;
        }
        if (data.emojis !== undefined) {
            this.emojis.clear();
            for (const emoji of data.emojis) {
                this.emojis.update(emoji);
            }
        }
        if (data.explicit_content_filter !== undefined) {
            this.explicitContentFilter = data.explicit_content_filter;
        }
        if (data.features !== undefined) {
            this.features = data.features;
        }
        if (data.icon !== undefined) {
            this.icon = data.icon;
        }
        if (data.incident_actions !== undefined) {
            this.incidentActions = {
                dmsDisabledUntil:     data.incident_actions!.dms_disabled_until,
                invitesDisabledUntil: data.incident_actions!.invites_disabled_until
            };
        }
        if (data.inventory_settings !== undefined) {
            this.inventorySettings = data.inventory_settings === null ? null : {
                isEmojiPackCollectible: data.inventory_settings.is_emoji_pack_collectible
            };
        }
        if (data.joined_at !== undefined) {
            this.joinedAt = data.joined_at === null ? null : new Date(data.joined_at);
        }
        if (data.large !== undefined) {
            this.large = data.large;
        }
        if (data.latest_onboarding_question_id !== undefined) {
            this.latestOnboardingQuestionID = data.latest_onboarding_question_id;
        }
        if (data.max_members !== undefined) {
            this.maxMembers = data.max_members;
        }
        if (data.max_presences !== undefined) {
            this.maxPresences = data.max_presences;
        }
        if (data.max_stage_video_channel_users !== undefined) {
            this.maxStageVideoChannelUsers = data.max_stage_video_channel_users;
        }
        if (data.max_video_channel_users !== undefined) {
            this.maxVideoChannelUsers = data.max_video_channel_users;
        }
        if (data.member_count !== undefined) {
            this.memberCount = data.member_count;
        }
        if (data.mfa_level !== undefined) {
            this.mfaLevel = data.mfa_level;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.nsfw_level !== undefined) {
            this.nsfwLevel = data.nsfw_level;
        }
        if (data.owner_id !== undefined) {
            this.ownerID = data.owner_id;
            this.owner = data.owner_id === null ? null : this.client.users.get(data.owner_id)!;
        }
        if (data.preferred_locale !== undefined) {
            this.preferredLocale = data.preferred_locale;
        }
        if (data.premium_progress_bar_enabled !== undefined) {
            this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
        }
        if (data.premium_subscription_count !== undefined) {
            this.premiumSubscriptionCount = data.premium_subscription_count;
        }
        if (data.premium_tier !== undefined) {
            this.premiumTier = data.premium_tier;
        }
        if (data.public_updates_channel_id !== undefined) {
            this.publicUpdatesChannel = data.public_updates_channel_id === null ? null : this.client.getChannel<AnyTextableGuildChannel>(data.public_updates_channel_id);
            this.publicUpdatesChannelID = data.public_updates_channel_id;
        }
        if (data.region !== undefined) {
            this.region = data.region;
        }
        if (data.rules_channel_id !== undefined) {
            this.rulesChannel = data.rules_channel_id === null ? null : this.client.getChannel<TextChannel>(data.rules_channel_id);
            this.rulesChannelID = data.rules_channel_id;
        }
        if (data.safety_alerts_channel_id !== undefined) {
            this.safetyAlertsChannel = data.safety_alerts_channel_id === null ? null : this.client.getChannel<TextChannel>(data.safety_alerts_channel_id);
            this.safetyAlertsChannelID = data.safety_alerts_channel_id;
        }
        if (data.splash !== undefined) {
            this.splash = data.splash;
        }
        if (data.stickers !== undefined) {
            this.stickers.clear();
            for (const sticker of data.stickers) this.stickers.update(sticker);
        }
        if (data.system_channel_flags !== undefined) {
            this.systemChannelFlags = data.system_channel_flags;
        }
        if (data.system_channel_id !== undefined) {
            this.systemChannel = data.system_channel_id === null ? null : this.client.getChannel<TextChannel>(data.system_channel_id);
            this.systemChannelID = data.system_channel_id;
        }
        if (data.vanity_url_code !== undefined) {
            this.vanityURLCode = data.vanity_url_code;
        }
        if (data.verification_level !== undefined) {
            this.verificationLevel = data.verification_level;
        }
        if (data.welcome_screen !== undefined) {
            this.welcomeScreen = {
                description:     data.welcome_screen.description,
                welcomeChannels: data.welcome_screen.welcome_channels.map(channel => ({
                    channelID:   channel.channel_id,
                    description: channel.description,
                    emojiID:     channel.emoji_id,
                    emojiName:   channel.emoji_name
                }))
            };
        }
        if (data.widget_channel_id !== undefined) {
            this.widgetChannel = data.widget_channel_id === null ? null : this.client.getChannel<Exclude<AnyGuildChannel, CategoryChannel>>(data.widget_channel_id);
            this.widgetChannelID = data.widget_channel_id;
        }
        if (data.widget_enabled !== undefined) {
            this.widgetEnabled = data.widget_enabled;
        }
    }

    /** The client's member for this guild. This will throw an error if the member is not cached. */
    get clientMember(): Member {
        this._clientMember ??= this.client["_user"] === undefined ? undefined : this.members.get(this.client["_user"].id);
        if (!this._clientMember) {
            if (this._rest) {
                throw new UncachedError(`${this.constructor.name}#clientMember is not present when the guild is obtained via rest.`);
            }

            throw new UncachedError(`The client's member has not been cached for ${this.constructor.name}#clientMember.`);
        }

        return this._clientMember;
    }

    /** The shard this guild is on. Gateway only. */
    get shard(): Shard {
        this._shard ??= this.client.shards["_forGuild"](this.id);
        if (this.client.options.restMode) {
            throw new TypeError(`${this.constructor.name}#shard will not be present with rest mode enabled.`);
        }

        if (!this.client.shards.connected) {
            throw new TypeError(`${this.constructor.name}#shard will not be present without a gateway connection.`);
        }

        if (!this._shard) {
            throw new TypeError(`Failed to determine shard for ${this.constructor.name}#shard (guild: ${this.id})`);
        }
        return this._shard;
    }

    /** The voice adapter creator for this guild that can be used with [@discordjs/voice](https://discord.js.org/#/docs/voice/main/general/welcome) to play audio in voice and stage channels. */
    get voiceAdapterCreator(): DiscordGatewayAdapterCreator {
        this._shard ??= this.client.shards["_forGuild"](this.id);
        if (this.client.options.restMode) {
            throw new TypeError(`${this.constructor.name}#voiceAdapterCreator cannot be used with rest mode enabled.`);
        }

        if (!this.client.shards.connected) {
            throw new TypeError(`${this.constructor.name}#shard cannot be used without a gateway connection.`);
        }

        if (!this._shard) {
            throw new TypeError(`Failed to determine shard for ${this.constructor.name}#voiceAdapterCreator (guild: ${this.id})`);
        }

        return (methods: DiscordGatewayAdapterLibraryMethods): DiscordGatewayAdapterImplementerMethods => {
            this.client.voiceAdapters.set(this.id, methods);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return {
                sendPayload: (payload: { d: unknown; op: GatewayOPCodes; }): true => {
                    this.shard.send(payload.op, payload.d);

                    return true;
                },
                destroy: () => this.client.voiceAdapters.delete(this.id)
            };
        };
    }

    /**
     * Add a member to this guild. Requires an access token with the `guilds.join` scope.
     *
     * Returns the newly added member upon success, or void if the member is already in the guild.
     * @param userID The ID of the user to add.
     * @param options The options for adding the member.
     */
    async addMember(userID: string, options: AddMemberOptions):  Promise<void | Member> {
        return this.client.rest.guilds.addMember(this.id, userID, options);
    }

    /**
     * Add a role to a member.
     * @param memberID The ID of the member.
     * @param roleID The ID of the role to add.
     * @param reason The reason for adding the role.
     */
    async addMemberRole(memberID: string, roleID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.addMemberRole(this.id, memberID, roleID, reason);
    }

    /**
     * The url of this guild's banner.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    bannerURL(format?: ImageFormat, size?: number): string | null {
        return this.banner === null ? null : this.client.util.formatImage(Routes.BANNER(this.id, this.banner), format, size);
    }

    /**
     * Begin a prune.
     * @param options The options for the prune.
     */
    async beginPrune(options?: BeginPruneOptions): Promise<number | null> {
        return this.client.rest.guilds.beginPrune(this.id, options);
    }

    /**
     * Ban up to 200 members from this guild. This requires both the `BAN_MEMBERS` and `MANAGE_GUILD` permissions.
     * If no members were banned, a {@link Constants~JSONErrorCodes.FAILED_TO_BAN_USERS | FAILED_TO_BAN_USERS } will be returned.
     * The bot user is ignored.
     * @param options The options for banning.
     */
    async bulkBan(options: BulkBanOptions): Promise<BulkBanResponse> {
        return this.client.rest.guilds.bulkBan(this.id, options);
    }

    /**
     * Create an auto moderation rule for this guild.
     * @param options The options for the rule.
     */
    async createAutoModerationRule(options: CreateAutoModerationRuleOptions): Promise<AutoModerationRule> {
        return this.client.rest.guilds.createAutoModerationRule(this.id, options);
    }

    /**
     * Create a ban for a user.
     * @param userID The ID of the user.
     * @param options The options for creating the ban.
     */
    async createBan(userID: string, options?: CreateBanOptions): Promise<void> {
        return this.client.rest.guilds.createBan(this.id, userID, options);
    }

    /**
     * Create a channel in this guild.
     * @param options The options for creating the channel.
     */
    async createChannel<T extends GuildChannelsWithoutThreads>(type: T, options: Omit<CreateChannelOptions, "type">): Promise<ChannelTypeMap[T]> {
        return this.client.rest.guilds.createChannel<T>(this.id, type, options);
    }

    /**
     * Create an emoji in this guild.
     * @param options The options for creating the emoji.
     */
    async createEmoji(options: CreateGuildEmojiOptions): Promise<GuildEmoji> {
        return this.client.rest.guilds.createEmoji(this.id, options);
    }

    /**
     * Create a role.
     * @param options The options for creating the role.
     */
    async createRole(options?: CreateRoleOptions): Promise<Role> {
        return this.client.rest.guilds.createRole(this.id, options);
    }

    /**
     * Create a scheduled event in this guild.
     * @param options The options for creating the scheduled event.
     */
    async createScheduledEvent(options: CreateScheduledEventOptions): Promise<GuildScheduledEvent> {
        return this.client.rest.guilds.createScheduledEvent(this.id, options);
    }

    /**
     * Create a sticker.
     * @param options The options for creating the sticker.
     */
    async createSticker(options: CreateStickerOptions): Promise<Sticker> {
        return this.client.rest.guilds.createSticker(this.id, options);
    }

    /**
     * Create a guild template.
     * @param options The options for creating the template.
     */
    async createTemplate(options: CreateTemplateOptions): Promise<GuildTemplate> {
        return this.client.rest.guilds.createTemplate(this.id, options);
    }

    /**
     * Create a test entitlement for this guild.
     * @param skuID The ID of the SKU to create an entitlement for.
     * @param applicationID The ID of the application to create the entitlement for. If present, defaults to the logged in client's application id.
     */
    async createTestEntitlement(skuID: string, applicationID?: string): Promise<TestEntitlement> {
        if (applicationID === undefined && this.client["_application"] === undefined) {
            throw new UncachedError("Client#application is not present, you must provide an applicationID as a second argument. To not need to provide an ID, only call this after at least one shard is READY, or restMode is enabled.");
        }
        return this.client.rest.applications.createTestEntitlement(applicationID ?? this.client.application.id, {
            ownerID:   this.id,
            ownerType: EntitlementOwnerTypes.GUILD,
            skuID
        });
    }

    /**
     * Delete this guild.
     */
    async delete(): Promise<void> {
        return this.client.rest.guilds.delete(this.id);
    }

    /**
     * Delete an auto moderation rule in this guild.
     * @param ruleID The ID of the rule to delete.
     * @param reason The reason for deleting the rule.
     */
    async deleteAutoModerationRule(ruleID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.deleteAutoModerationRule(this.id, ruleID, reason);
    }

    /**
     * Delete an emoji in this guild.
     * @param emojiID The ID of the emoji.
     * @param reason The reason for deleting the emoji.
     */
    async deleteEmoji(emojiID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.deleteEmoji(this.id, emojiID, reason);
    }

    /**
     * Delete an integration.
     * @param integrationID The ID of the integration.
     * @param reason The reason for deleting the integration.
     */
    async deleteIntegration(integrationID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.deleteIntegration(this.id, integrationID, reason);
    }

    /**
     * Delete a role.
     * @param roleID The ID of the role to delete.
     * @param reason The reason for deleting the role.
     */
    async deleteRole(roleID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.deleteRole(this.id, roleID, reason);
    }

    /**
     * Delete a scheduled event.
     * @param eventID The ID of the scheduled event.
     * @param reason The reason for deleting the scheduled event. Discord's docs do not explicitly state a reason can be provided, so it may not be used.
     */
    async deleteScheduledEvent(eventID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.deleteScheduledEvent(this.id, eventID, reason);
    }

    /**
     * Delete a sticker.
     * @param stickerID The ID of the sticker to delete.
     * @param reason The reason for deleting the sticker.
     */
    async deleteSticker(stickerID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.deleteSticker(this.id, stickerID, reason);
    }

    /**
     * Delete a template.
     * @param code The code of the template.
     */
    async deleteTemplate(code: string): Promise<void> {
        return this.client.rest.guilds.deleteTemplate(this.id, code);
    }

    /**
     * Disable the `COMMUNITY` feature for this guild. Requires the **Administrator** permission.
     * @param reason The reason for disable the feature.
     */
    async disableCommunity(reason?: string): Promise<Guild> {
        return this.toggleFeature("COMMUNITY", false, reason);
    }

    /**
     * Disable the `DISCOVERABLE` feature for this guild. Requires the **Administrator** permission.
     * @param reason The reason for disabling the feature.
     */
    async disableDiscovery(reason?: string): Promise<Guild> {
        return this.toggleFeature("DISCOVERABLE", false, reason);
    }

    /**
     * Disable the `INVITES_DISABLED` feature for this guild. Requires the **Manage Guild** permission.
     * @param reason The reason for disabling the feature.
     */
    async disableInvites(reason?: string): Promise<Guild> {
        return this.toggleFeature("INVITES_DISABLED", true, reason);
    }

    /**
     * Disable the `RAID_ALERTS_ENABLED` feature for this guild. Requires the **Manage Guild** permission.
     * @param reason The reason for disabling the feature.
     */
    async disableRaidAlerts(reason?: string): Promise<Guild> {
        return this.toggleFeature("RAID_ALERTS_ENABLED", false, reason);
    }

    /**
     * The url of this guild's discovery splash.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    discoverySplashURL(format?: ImageFormat, size?: number): string | null {
        return this.discoverySplash === null ? null : this.client.util.formatImage(Routes.GUILD_DISCOVERY_SPLASH(this.id, this.discoverySplash), format, size);
    }

    /**
     * Edit this guild.
     * @param options The options for editing the guild.
     */
    async edit(options: EditGuildOptions): Promise<Guild> {
        return this.client.rest.guilds.edit(this.id, options);
    }

    /**
     * Edit an existing auto moderation rule in this guild.
     * @param ruleID The ID of the rule to edit.
     * @param options The options for editing the rule.
     */
    async editAutoModerationRule(ruleID: string, options: EditAutoModerationRuleOptions): Promise<AutoModerationRule> {
        return this.client.rest.guilds.editAutoModerationRule(this.id, ruleID, options);
    }

    /**
     * Edit the positions of channels in this guild.
     * @param options The channels to move. Unedited channels do not need to be specified.
     */
    async editChannelPositions(options: Array<ModifyChannelPositionsEntry>): Promise<void> {
        return this.client.rest.guilds.editChannelPositions(this.id, options);
    }

    /**
     * Modify the current member in this guild.
     * @param options The options for editing the member.
     */
    async editCurrentMember(options: EditCurrentMemberOptions): Promise<Member> {
        return this.client.rest.guilds.editCurrentMember(this.id, options);
    }

    /**
     * Edit the current member's voice state in this guild. `channelID` is required, and the current member must already be in that channel. See [Discord's docs](https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state-caveats) for more information.
     * @param options The options for editing the voice state.
     */
    async editCurrentUserVoiceState(options: EditCurrentUserVoiceStateOptions): Promise<void> {
        return this.client.rest.guilds.editCurrentUserVoiceState(this.id, options);
    }
    /**
     * Edit an existing emoji in this guild.
     * @param options The options for editing the emoji.
     */
    async editEmoji(emojiID: string, options: EditGuildEmojiOptions): Promise<GuildEmoji> {
        return this.client.rest.guilds.editEmoji(this.id, emojiID, options);
    }

    /**
     * Edit the incident actions for this guild.
     * @param options The options for editing the incident actions.
     */
    async editIncidentActions(options: EditIncidentActionsOptions): Promise<IncidentActions> {
        return this.client.rest.guilds.editIncidentActions(this.id, options);
    }

    /**
     * Edit the [mfa level](https://discord.com/developers/docs/resources/guild#guild-object-mfa-level) of this guild. This can only be used by the guild owner.
     * @param options The options for editing the MFA level.
     */
    async editMFALevel(options: EditMFALevelOptions): Promise<MFALevels> {
        return this.client.rest.guilds.editMFALevel(this.id, options);
    }

    /**
     * Edit a member of this guild. Use \<Guild\>.editCurrentMember if you wish to update the nick of this client using the CHANGE_NICKNAME permission.
     * @param memberID The ID of the member.
     * @param options The options for editing the member.
     */
    async editMember(memberID: string, options: EditMemberOptions): Promise<Member> {
        return this.client.rest.guilds.editMember(this.id, memberID, options);
    }

    /**
     * Edit this guild's onboarding configuration.
     * @param options The options for editing the onboarding configuration.
     */
    async editOnboarding(options: EditOnboardingOptions): Promise<Onboarding> {
        return this.client.rest.guilds.editOnboarding(this.id, options);
    }

    /**
     * Edit an existing role.
     * @param options The options for editing the role.
     */
    async editRole(roleID: string, options: EditRoleOptions): Promise<Role> {
        return this.client.rest.guilds.editRole(this.id, roleID, options);
    }

    /**
     * Edit the position of roles in this guild.
     * @param options The roles to move.
     */
    async editRolePositions(options: Array<EditRolePositionsEntry>, reason?: string): Promise<Array<Role>> {
        return this.client.rest.guilds.editRolePositions(this.id, options, reason);
    }

    /**
     * Edit an existing scheduled event in this guild.
     * @param options The options for editing the scheduled event.
     */
    async editScheduledEvent(options: EditScheduledEventOptions): Promise<GuildScheduledEvent> {
        return this.client.rest.guilds.editScheduledEvent(this.id, options);
    }

    /**
     * Edit a sticker.
     * @param options The options for editing the sticker.
     */
    async editSticker(stickerID: string, options: EditStickerOptions): Promise<Sticker> {
        return this.client.rest.guilds.editSticker(this.id, stickerID, options);
    }

    /**
     * Edit a template.
     * @param code The code of the template.
     * @param options The options for editing the template.
     */
    async editTemplate(code: string, options: EditGuildTemplateOptions): Promise<GuildTemplate> {
        return this.client.rest.guilds.editTemplate(this.id, code, options);
    }

    /**
     * Edit a guild member's voice state. `channelID` is required, and the user must already be in that channel. See [Discord's docs](https://discord.com/developers/docs/resources/guild#modify-user-voice-state) for more information.
     * @param memberID The ID of the member.
     * @param options The options for editing the voice state.
     */
    async editUserVoiceState(memberID: string, options: EditUserVoiceStateOptions): Promise<void> {
        return this.client.rest.guilds.editUserVoiceState(this.id, memberID, options);
    }

    /**
     * Edit the welcome screen in this guild.
     * @param options The options for editing the welcome screen.
     */
    async editWelcomeScreen(options: EditWelcomeScreenOptions): Promise<WelcomeScreen> {
        return this.client.rest.guilds.editWelcomeScreen(this.id, options);
    }

    /**
     * Edit the widget of this guild.
     * @param options The options for editing the widget.
     */
    async editWidget(options: WidgetSettings): Promise<Widget> {
        return this.client.rest.guilds.editWidget(this.id, options);
    }


    /**
     * Enable the `COMMUNITY` feature for this guild. Requires the **Administrator** permission.
     * @param reason The reason for enabling the feature.
     */
    async enableCommunity(reason?: string): Promise<Guild> {
        return this.toggleFeature("COMMUNITY", true, reason);
    }

    /**
     * Enable the `DISCOVERABLE` feature for this guild. Requires the **Administrator** permission. The server must also be passing all discovery requirements.
     * @param reason The reason for enabling the feature.
     */
    async enableDiscovery(reason?: string): Promise<Guild> {
        return this.toggleFeature("DISCOVERABLE", true, reason);
    }

    /**
     * Enable the `INVITES_DISABLED` feature for this guild. Requires the **Manage Guild** permission.
     * @param reason The reason for enabling the feature.
     */
    async enableInvites(reason?: string): Promise<Guild> {
        return this.toggleFeature("INVITES_DISABLED", false, reason);
    }

    /**
     * Enable the `RAID_ALERTS_ENABLED` feature for this guild. Requires the **Manage Guild** permission.
     * @param reason The reason for enabling the feature.
     */
    async enableRaidAlerts(reason?: string): Promise<Guild> {
        return this.toggleFeature("RAID_ALERTS_ENABLED", true, reason);
    }

    /**
     * Request members from this guild.
     * @param options The options for fetching the members.
     */
    async fetchMembers(options?: RequestGuildMembersOptions): Promise<Array<Member>> {
        return this.shard.requestGuildMembers(this.id, options);
    }

    /**
     * Get the active threads in this guild.
     */
    async getActiveThreads(): Promise<GetActiveThreadsResponse> {
        return this.client.rest.guilds.getActiveThreads(this.id);
    }

    /**
     * Get this guild's audit log.
     * @param options The options for the audit log.
     */
    async getAuditLog(options?: GetAuditLogOptions): Promise<AuditLog> {
        return this.client.rest.guilds.getAuditLog(this.id, options);
    }

    /**
     * Get an auto moderation rule for this guild.
     * @param ruleID The ID of the rule to get.
     */
    async getAutoModerationRule(ruleID: string): Promise<AutoModerationRule> {
        return this.client.rest.guilds.getAutoModerationRule(this.id, ruleID);
    }

    /**
     * Get the auto moderation rules for this guild.
     */
    async getAutoModerationRules(): Promise<Array<AutoModerationRule>> {
        return this.client.rest.guilds.getAutoModerationRules(this.id);
    }

    /**
     * Get a ban in this guild.
     * @param userID The ID of the user to get the ban of.
     */
    async getBan(userID: string): Promise<Ban> {
        return this.client.rest.guilds.getBan(this.id, userID);
    }

    /**
     * Get the bans in this guild.
     * @param options The options for getting the bans.
     */
    async getBans(options?: GetBansOptions): Promise<Array<Ban>> {
        return this.client.rest.guilds.getBans(this.id, options);
    }

    /**
     * Get the channels in a guild. Does not include threads. Only use this if you need to. See the `channels` collection.
     */
    async getChannels(): Promise<Array<AnyGuildChannelWithoutThreads>> {
        return this.client.rest.guilds.getChannels(this.id);
    }

    /**
     * Get an emoji in this guild.
     * @param emojiID The ID of the emoji to get.
     */
    async getEmoji(emojiID: string): Promise<GuildEmoji> {
        return this.client.rest.guilds.getEmoji(this.id, emojiID);
    }

    /**
     * Get the emojis in this guild.
     */
    async getEmojis(): Promise<Array<GuildEmoji>> {
        return this.client.rest.guilds.getEmojis(this.id);
    }

    /**
     * Get the entitlements for this guild.
     * @param options The options for getting the entitlements.
     * @param applicationID The ID of the application to create the entitlement for. If present, defaults to the logged in client's application id.
     */
    async getEntitlements(options?: Omit<SearchEntitlementsOptions, "guildID">, applicationID?: string): Promise<Array<Entitlement | TestEntitlement>> {
        if (applicationID === undefined && this.client["_application"] === undefined) {
            throw new UncachedError("Client#application is not present, you must provide an applicationID as a second argument. To not need to provide an ID, only call this after at least one shard is READY, or restMode is enabled.");
        }
        return this.client.rest.applications.getEntitlements(applicationID ?? this.client.application.id, { guildID: this.id, ...options });
    }

    /**
     * Get the integrations in this guild.
     */
    async getIntegrations(): Promise<Array<Integration>> {
        return this.client.rest.guilds.getIntegrations(this.id);
    }

    /**
     * Get the invites of this guild.
     */
    async getInvites(): Promise<Array<Invite<"withMetadata", AnyInviteChannel>>> {
        return this.client.rest.guilds.getInvites(this.id);
    }

    /**
     * Get a member of this guild.
     * @param memberID The ID of the member.
     */
    async getMember(memberID: string): Promise<Member> {
        return this.client.rest.guilds.getMember(this.id, memberID);
    }

    /**
     * Get this guild's members. This requires the `GUILD_MEMBERS` intent.
     * @param options The options for getting the members.
     */
    async getMembers(options?: GetMembersOptions): Promise<Array<Member>> {
        return this.client.rest.guilds.getMembers(this.id, options);
    }

    /**
     * Get the onboarding information for this guild.
     */
    async getOnboarding(): Promise<Onboarding> {
        return this.client.rest.guilds.getOnboarding(this.id);
    }

    /**
     * Get a preview of this guild.
     */
    async getPreview(): Promise<GuildPreview> {
        return this.client.rest.guilds.getPreview(this.id);
    }

    /**
     * Get the prune count of this guild.
     * @param options The options for getting the prune count.
     */
    async getPruneCount(options?: GetPruneCountOptions): Promise<number> {
        return this.client.rest.guilds.getPruneCount(this.id, options);
    }

    /**
     * Get the roles in this guild. Only use this if you need to. See the `roles` collection.
     */
    async getRoles(): Promise<Array<Role>> {
        return this.client.rest.guilds.getRoles(this.id);
    }

    /**
     * Get a scheduled event.
     * @param eventID The ID of the scheduled event to get.
     * @param withUserCount If the number of users subscribed to the event should be included.
     */
    async getScheduledEvent(eventID: string, withUserCount?: number): Promise<GuildScheduledEvent> {
        return this.client.rest.guilds.getScheduledEvent(this.id, eventID, withUserCount);
    }

    /**
     * Get the users subscribed to a scheduled event.
     * @param eventID The ID of the scheduled event to get the users of.
     * @param options The options for getting the users.
     */
    async getScheduledEventUsers(eventID: string, options?: GetScheduledEventUsersOptions): Promise<Array<ScheduledEventUser>> {
        return this.client.rest.guilds.getScheduledEventUsers(this.id, eventID, options);
    }

    /**
     * Get this guild's scheduled events
     * @param withUserCount If the number of users subscribed to the event should be included.
     */
    async getScheduledEvents(withUserCount?: number): Promise<Array<GuildScheduledEvent>> {
        return this.client.rest.guilds.getScheduledEvents(this.id, withUserCount);
    }

    /**
     * Get a sticker. Response will include a user if the client has the `MANAGE_EMOJIS_AND_STICKERS` permissions.
     * @param stickerID The ID of the sticker to get.
     */
    async getSticker(stickerID: string): Promise<Sticker> {
        return this.client.rest.guilds.getSticker(this.id, stickerID);
    }

    /**
     * Get this guild's stickers. Stickers will include a user if the client has the `MANAGE_EMOJIS_AND_STICKERS` permissions.
     */
    async getStickers(): Promise<Array<Sticker>> {
        return this.client.rest.guilds.getStickers(this.id);
    }

    /**
     * Get this guild's templates.
     */
    async getTemplates(): Promise<Array<GuildTemplate>> {
        return this.client.rest.guilds.getTemplates(this.id);
    }

    /**
     * Get the vanity url of this guild.
     */
    async getVanityURL(): Promise<GetVanityURLResponse>{
        return this.client.rest.guilds.getVanityURL(this.id);
    }

    /**
     * Get the list of usable voice regions for this guild. This will return VIP servers when the guild is VIP-enabled.
     */
    async getVoiceRegions(): Promise<Array<VoiceRegion>> {
        return this.client.rest.guilds.getVoiceRegions(this.id);
    }

    /**
     * Get the webhooks in this guild.
     */
    async getWebhooks(): Promise<Array<Webhook>> {
        return this.client.rest.webhooks.getForGuild(this.id);
    }

    /**
     * Get the welcome screen for this guild.
     */
    async getWelcomeScreen(): Promise<WelcomeScreen> {
        return this.client.rest.guilds.getWelcomeScreen(this.id);
    }

    /**
     * Get the widget of this guild.
     */
    async getWidget(): Promise<Widget> {
        return this.client.rest.guilds.getWidget(this.id);
    }

    /**
     * Get the widget image of this guild.
     * @param style The style of the image.
     */
    async getWidgetImage(style?: WidgetImageStyle): Promise<Buffer> {
        return this.client.rest.guilds.getWidgetImage(this.id, style);
    }

    /**
     * Get the raw JSON widget of this guild.
     */
    async getWidgetJSON(): Promise<RawWidget> {
        return this.client.rest.guilds.getWidgetJSON(this.id);
    }

    /**
     * Get this guild's widget settings.
     */
    async getWidgetSettings(): Promise<WidgetSettings> {
        return this.client.rest.guilds.getWidgetSettings(this.id);
    }

    /**
     * The url of this guild's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    iconURL(format?: ImageFormat, size?: number): string | null {
        return this.icon === null ? null : this.client.util.formatImage(Routes.GUILD_ICON(this.id, this.icon), format, size);
    }

    /**
     * Join a voice or stage channel.
     * @param options The options to join the channel with.
     */
    joinChannel(options: Omit<JoinVoiceChannelOptions, "guildID" | "voiceAdapterCreator">): VoiceConnection {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        return this.client.joinVoiceChannel({
            ...options,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            voiceAdapterCreator: this.voiceAdapterCreator,
            guildID:             this.id
        });
    }

    /**
     * Leave this guild.
     */
    async leave(): Promise<void> {
        return this.client.rest.users.leaveGuild(this.id);
    }

    /** Leave the connected voice or stage channel on this guild. */
    leaveChannel(): void {
        return this.client.leaveVoiceChannel(this.id);
    }

    /**
     * Get the permissions of a member. If providing an id, the member must be cached.
     * @param member The member to get the permissions of.
     */
    permissionsOf(member: string | Member): Permission {
        if (typeof member === "string") {
            member = this.members.get(member)!;
        }
        if (!member) {
            throw new UncachedError(`Cannot use ${this.constructor.name}#permissionsOf with an ID when the member is not cached.`);
        }
        if (member.id === this.ownerID) {
            return new Permission(AllPermissions);
        } else {
            let permissions = this.roles.get(this.id)!.permissions.allow;
            if (permissions & Permissions.ADMINISTRATOR) {
                return new Permission(AllPermissions);
            }
            for (const id of member.roles) {
                const role = this.roles.get(id);
                if (!role) {
                    continue;
                }
                if (role.permissions.allow & Permissions.ADMINISTRATOR) {
                    permissions = AllPermissions;
                    break;
                } else {
                    permissions |= role.permissions.allow;
                }
            }
            return new Permission(permissions);
        }
    }

    /**
     * Remove a ban.
     * @param userID The ID of the user to remove the ban from.
     * @param reason The reason for removing the ban.
     */
    async removeBan(userID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.removeBan(this.id, userID, reason);
    }

    /**
     * Remove a member from this guild.
     * @param memberID The ID of the user to remove.
     * @param reason The reason for the removal.
     */
    async removeMember(memberID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.removeMember(this.id, memberID, reason);
    }

    /**
     * Remove a role from a member.
     * @param memberID The ID of the member.
     * @param roleID The ID of the role to remove.
     * @param reason The reason for removing the role.
     */
    async removeMemberRole(memberID: string, roleID: string, reason?: string): Promise<void> {
        return this.client.rest.guilds.removeMemberRole(this.id, memberID, roleID, reason);
    }

    /**
     * Search the username & nicknames of members in this guild.
     * @param options The options for the search.
     */
    async searchMembers(options: SearchMembersOptions): Promise<Array<Member>> {
        return this.client.rest.guilds.searchMembers(this.id, options);
    }

    /**
     * The url of this guild's invite splash.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    splashURL(format?: ImageFormat, size?: number): string | null {
        return this.splash === null ? null : this.client.util.formatImage(Routes.GUILD_SPLASH(this.id, this.splash), format, size);
    }

    /**
     * Sync a guild template.
     * @param code The code of the template to sync.
     */
    async syncTemplate(code: string): Promise<GuildTemplate> {
        return this.client.rest.guilds.syncTemplate(this.id, code);
    }

    override toJSON(): JSONGuild {
        return {
            ...super.toJSON(),
            afkChannelID:                this.afkChannelID,
            afkTimeout:                  this.afkTimeout,
            application:                 this.applicationID ?? undefined,
            approximateMemberCount:      this.approximateMemberCount,
            approximatePresenceCount:    this.approximatePresenceCount,
            autoModerationRules:         this.autoModerationRules.map(rule => rule.toJSON()),
            banner:                      this.banner,
            channels:                    this.channels.map(channel => channel.id),
            defaultMessageNotifications: this.defaultMessageNotifications,
            description:                 this.description,
            discoverySplash:             this.discoverySplash,
            emojis:                      this.emojis.toArray(),
            explicitContentFilter:       this.explicitContentFilter,
            features:                    this.features,
            icon:                        this.icon,
            incidentActions:             this.incidentActions,
            joinedAt:                    this.joinedAt?.getTime() ?? null,
            large:                       this.large,
            maxMembers:                  this.maxMembers,
            maxPresences:                this.maxPresences,
            maxStageVideoChannelUsers:   this.maxStageVideoChannelUsers,
            maxVideoChannelUsers:        this.maxVideoChannelUsers,
            memberCount:                 this.memberCount,
            members:                     this.members.map(member => member.id),
            mfaLevel:                    this.mfaLevel,
            name:                        this.name,
            nsfwLevel:                   this.nsfwLevel,
            ownerID:                     this.ownerID,
            preferredLocale:             this.preferredLocale,
            premiumProgressBarEnabled:   this.premiumProgressBarEnabled,
            premiumSubscriptionCount:    this.premiumSubscriptionCount,
            premiumTier:                 this.premiumTier,
            publicUpdatesChannelID:      this.publicUpdatesChannelID,
            region:                      this.region,
            roles:                       this.roles.map(role => role.toJSON()),
            rulesChannelID:              this.rulesChannelID,
            scheduledEvents:             this.scheduledEvents.map(event => event.toJSON()),
            splash:                      this.splash,
            stageInstances:              this.stageInstances.map(instance => instance.toJSON()),
            stickers:                    this.stickers.toArray(),
            systemChannelID:             this.systemChannelID,
            systemChannelFlags:          this.systemChannelFlags,
            threads:                     this.threads.map(thread => thread.id),
            unavailable:                 this.unavailable,
            vanityURLCode:               this.vanityURLCode,
            verificationLevel:           this.verificationLevel,
            voiceStates:                 this.voiceStates.map(state => state.toJSON()),
            welcomeScreen:               this.welcomeScreen,
            widgetChannelID:             this.widgetChannelID,
            widgetEnabled:               this.widgetEnabled
        };
    }
}
