/** @module Types/Guilds */
import type { RawAvatarDecorationData, RawUser } from "./users";
import type {
    AnyThreadChannel,
    OverwriteOptions,
    RawChannel,
    RawGuildChannel,
    RawThreadChannel,
    ThreadMember,
    ForumEmoji,
    ForumTag,
    GuildChannelsWithoutThreads
} from "./channels";
import type { RawScheduledEvent } from "./scheduled-events";
import type { ClientStatus, PresenceUpdate, Activity as GatewayActivity } from "./gateway";
import type { RawVoiceState } from "./voice";
import { type File } from "./request-handler";
import type {
    ChannelTypes,
    DefaultMessageNotificationLevels,
    ExplicitContentFilterLevels,
    GuildFeature,
    GuildNSFWLevels,
    IntegrationExpireBehaviors,
    IntegrationType,
    MFALevels,
    PremiumTiers,
    StageInstancePrivacyLevels,
    StickerFormatTypes,
    StickerTypes,
    ThreadAutoArchiveDuration,
    VerificationLevels,
    VideoQualityModes,
    SortOrderTypes,
    ForumLayoutTypes,
    OnboardingModes
} from "../Constants";
import type User from "../structures/User";
import type Integration from "../structures/Integration";

// channels, guild_scheduled_events, joined_at, large, member_count, members, presences,
// stage_instances, threads, unavailable, voice_states - all gateway only
export interface RawGuild {
    afk_channel_id: string | null;
    afk_timeout: number;
    application_id: string | null;
    approximate_member_count?: number;
    approximate_presence_count?: number;
    banner: string | null;
    channels: Array<RawGuildChannel>;
    default_message_notifications: DefaultMessageNotificationLevels;
    description: string | null;
    discovery_splash: string | null;
    emojis: Array<RawGuildEmoji>;
    explicit_content_filter: ExplicitContentFilterLevels;
    features: Array<GuildFeature>;
    guild_scheduled_events: Array<RawScheduledEvent>;
    icon: string | null;
    icon_hash?: string | null;
    id: string;
    incident_actions: RawIncidentActions | null;
    inventory_settings: RawInventorySettings | null;
    joined_at: string | null;
    large: boolean;
    latest_onboarding_question_id?: string | null;
    max_members?: number;
    max_presences?: number;
    max_stage_video_channel_users?: number;
    max_video_channel_users?: number;
    member_count: number;
    members: Array<RawMember>;
    mfa_level: MFALevels;
    name: string;
    nsfw_level: GuildNSFWLevels;
    owner?: boolean;
    owner_id: string | null;
    permissions?: string;
    preferred_locale: string;
    premium_progress_bar_enabled: boolean;
    premium_subscription_count?: number;
    premium_tier: PremiumTiers;
    presences: Array<PresenceUpdate>;
    public_updates_channel_id: string | null;
    region?: string | null;
    roles: Array<RawRole>;
    rules_channel_id: string | null;
    safety_alerts_channel_id: string | null;
    splash: string | null;
    stage_instances: Array<RawStageInstance>;
    stickers?: Array<RawSticker>;
    system_channel_flags: number;
    system_channel_id: string | null;
    threads: Array<RawThreadChannel>;
    unavailable?: false;
    vanity_url_code: string | null;
    verification_level: VerificationLevels;
    voice_states: Array<RawVoiceState>;
    welcome_screen?: RawWelcomeScreen;
    widget_channel_id?: string | null;
    widget_enabled?: boolean;
}

export interface RawInviteGuild extends Pick<RawGuild, "id" | "name" | "splash" | "banner" | "description" | "icon" | "features" | "verification_level" | "vanity_url_code" | "premium_subscription_count" | "nsfw_level"> {}

export interface RawRole {
    color: number;
    flags: number;
    hoist: boolean;
    icon?: string | null;
    id: string;
    managed: boolean;
    mentionable: boolean;
    name: string;
    permissions: string;
    position: number;
    tags?: RawRoleTags;
    unicode_emoji?: string | null;
}
export interface RawRoleTags {
    available_for_purchase?: null;
    bot_id?: string;
    guild_connections?: null;
    integration_id?: string;
    premium_subscriber?: null;
    subscription_listing_id?: string;
}
export interface RoleTags {
    availableForPurchase: boolean;
    botID?: string;
    guildConnections: boolean;
    integrationID?: string;
    premiumSubscriber: boolean;
    subscriptionListingID?: string;
}
export interface Emoji {
    animated?: boolean;
    available?: boolean;
    id: string | null;
    managed?: boolean;
    name: string;
    require_colons?: boolean;
    roles?: Array<string>;
    user?: RawUser;
}
export interface RawGuildEmoji extends Required<Omit<Emoji, "user" | "id">>  { id: string; user?: RawUser; }
export interface GuildEmoji extends Omit<RawGuildEmoji, "user" | "id" | "require_colons"> { id: string; requireColons?: boolean; user?: User; }
export interface RawWelcomeScreen {
    description: string | null;
    welcome_channels: Array<RawWelcomeScreenChannel>;
}
export interface RawWelcomeScreenChannel {
    channel_id: string;
    description: string;
    emoji_id: string | null;
    emoji_name: string | null;
}
export interface WelcomeScreen {
    /** The description of the welcome screen. */
    description: string | null;
    /** If the welcome screen is enabled. */
    welcomeChannels: Array<WelcomeScreenChannel>;
}
export interface WelcomeScreenChannel {
    /** The ID of the welcome channel. */
    channelID: string;
    /** The description of the welcome channel. */
    description: string;
    /** The ID of the emoji to use on the welcome channel. */
    emojiID: string | null;
    /** The name (or unicode characters) of the emoji to use on the welcome channel. */
    emojiName: string | null;
}
export interface RawSticker {
    /** @deprecated */
    asset?: "";
    available?: boolean;
    description: string | null;
    format_type: StickerFormatTypes;
    guild_id?: string;
    id: string;
    name: string;
    pack_id?: string;
    sort_value?: number;
    tags: string;
    type: StickerTypes;
    user?: RawUser;
}
export interface Sticker {
    /** @deprecated */
    asset?: "";
    available?: boolean;
    description: string | null;
    formatType: StickerFormatTypes;
    guildID?: string;
    id: string;
    name: string;
    packID?: string;
    sortValue?: number;
    tags: string;
    type: StickerTypes;
    user?: User;
}

export interface RawMember {
    avatar?: string | null;
    avatar_decoration_data?: RawAvatarDecorationData | null;
    banner?: string | null;
    communication_disabled_until?: string | null;
    deaf: boolean;
    /** undocumented */
    flags?: number;
    /** undocumented */
    is_pending?: boolean;
    // this is nullable over gateway
    joined_at: string | null;
    mute: boolean;
    nick?: string | null;
    pending?: boolean;
    permissions?: string;
    premium_since?: string | null;
    roles: Array<string>;
    user?: RawUser;
}
export interface RESTMember extends Required<Omit<RawMember, "permissions" | "joined_at">> { joined_at: string; }
export interface InteractionMember extends Required<RawMember> {}

export interface RawIntegration {
    account: IntegrationAccount;
    application?: RawIntegrationApplication;
    enable_emoticons?: boolean;
    enabled?: boolean;
    expire_behavior?: IntegrationExpireBehaviors;
    expire_grace_period?: number;
    id: string;
    name: string;
    revoked?: boolean;
    role_id?: string;
    scopes?: Array<string>;
    subscriber_count?: number;
    synced_at?: string;
    syncing?: boolean;
    type: IntegrationType;
    user?: RawUser;
}

export interface IntegrationAccount {
    id: string;
    name: string;
}

export interface RawIntegrationApplication {
    bot?: RawUser;
    description: string;
    icon: string | null;
    id: string;
    name: string;
}

export interface PartialEmoji extends Pick<Emoji, "id" | "name" | "animated"> {}
export interface NullablePartialEmoji {
    id?: string | null;
    name?: string | null;
}

export interface CreateEmojiOptions {
    /** The image (buffer, or full data url). */
    image: Buffer | string;
    /** The name of the emoji. */
    name: string;
    /** The reason for creating the emoji. */
    reason?: string;
    /** The roles to restrict the emoji to. */
    roles?: Array<string>;
}

export interface EditEmojiOptions {
    /** The name of the emoji. */
    name?: string;
    /** The reason for creating the emoji. */
    reason?: string;
    /** The roles to restrict the emoji to. */
    roles?: Array<string> | null;
}

export interface RawGuildPreview {
    approximate_member_count: number;
    approximate_presence_count: number;
    description: string | null;
    discovery_splash: string | null;
    emojis: Array<RawGuildEmoji>;
    features: Array<GuildFeature>;
    icon: string | null;
    id: string;
    name: string;
    splash: string | null;
    stickers: Array<RawSticker>;
}

export interface CreateGuildOptions {
    /** The ID of the AFK voice channel. */
    afkChannelID?: string;
    /** The AFK timeout in seconds. */
    afkTimeout?: number;
    /** The initial channels of the guild. */
    channels?: Array<CreateChannelOptions>;
    /** The default message notification level. */
    defaultMessageNotifications?: DefaultMessageNotificationLevels;
    /** The explicit content filter level. */
    explicitContentFilter?: ExplicitContentFilterLevels;
    /** The icon of the guild. */
    icon?: Buffer | string;
    /** The name of the guild. */
    name: string;
    /** @deprecated The region of the guild. */
    region?: string | null;
    /** The initial roles of the guild. */
    roles?: Array<Omit<CreateRoleOptions, "reason">>;
    /** The system channel flags. */
    systemChannelFlags?: number;
    /** The ID of the system channel. */
    systemChannelID?: string;
    /** The verification level of the guild. */
    verificationLevel?: VerificationLevels;
}

export interface EditGuildOptions {
    /** The ID of the AFK voice channel. `null` to reset. */
    afkChannelID?: string | null;
    /** The AFK timeout in seconds. */
    afkTimeout?: number;
    /** The banner of the guild (buffer, or full data url). `null` to reset. */
    banner?: Buffer | string | null;
    /** The default message notification level. */
    defaultMessageNotifications?: DefaultMessageNotificationLevels;
    /** The description of the guild. `null` to reset. */
    description?: string | null;
    /** The discovery splash of the guild (buffer, or full data url). `null` to reset. */
    discoverySplash?: Buffer | string | null;
    /** The explicit content filter level. */
    explicitContentFilter?: ExplicitContentFilterLevels;
    /** The features of the guild. Only some can be added or removed. */
    features?: Array<GuildFeature>;
    /** The icon of the guild (buffer or full data url). `null` to reset. */
    icon?: Buffer | string | null;
    /** The name of the guild. */
    name?: string;
    /** The ID of the member to transfer guild ownership to. */
    ownerID?: string;
    /** The preferred [locale](https://discord.com/developers/docs/reference#locales) of the guild. `null` to reset. */
    preferredLocale?: string | null;
    /** If the premium progress bar is enabled. */
    premiumProgressBarEnabled?: boolean;
    /** The ID of the public updates channel. `null` to reset, or `1` to create a new channel. */
    publicUpdatesChannelID?: string | null;
    /** The reason for editing the guild. */
    reason?: string;
    /** @deprecated The region of the guild. */
    region?: string | null;
    /** The ID of the rules channel. `null` to reset, or `1` to create a new channel. */
    rulesChannelID?: string | null;
    /** The ID of the channel where safety alert are received. `null` to reset, or `1` to create a new channel. */
    safetyAlertsChannelID?: string | null;
    /** The splash of the guild (buffer, or full data url). `null` to reset. */
    splash?: Buffer | string | null;
    /** The system channel flags. */
    systemChannelFlags?: number;
    /** The ID of the system channel. `null` to reset. */
    systemChannelID?: string | null;
    /** The verification level of the guild. */
    verificationLevel?: VerificationLevels;
}

export interface CreateChannelOptions<T extends GuildChannelsWithoutThreads = GuildChannelsWithoutThreads> {
    /** [Forum] The {@link Types/Channels.ForumTag | tags} available in the channel. */
    availableTags?: Array<Omit<ForumTag, "id">> | null;
    /** [Stage, Voice] The bitrate of the channel. Minimum 8000. */
    bitrate?: number | null;
    /** [Announcement, Text] The default auto archive duration for the channel. */
    defaultAutoArchiveDuration?: ThreadAutoArchiveDuration | null;
    /** [Forum] The default forum layout used to display threads. */
    defaultForumLayout?: ForumLayoutTypes;
    /** [Forum] The default reaction emoji for threads. */
    defaultReactionEmoji?: ForumEmoji | null;
    /** [Forum] The default sort order mode used to sort forum threads. */
    defaultSortOrder?: SortOrderTypes | null;
    /** The name of the channel. */
    name: string;
    /** [Announcement, Text, Voice] If the channel is age restricted. */
    nsfw?: boolean | null;
    /** The ID of the category to put this channel in. */
    parentID?: string | null;
    /** The permission overwrites to apply to the channel. */
    permissionOverwrites?: Array<OverwriteOptions> | null;
    /** The position of the channel. */
    position?: number | null;
    /** [Forum, Text] The seconds between sending messages for users. Between 0 and 21600. */
    rateLimitPerUser?: number | null;
    /** The reason for creating the channel. */
    reason?: string;
    /** [Stage, Voice] The voice region for the channel. */
    rtcRegion?: string | null;
    /** [Announcement, Forum, Text, Voice] The topic of the channel. In forum channels, this is the `Guidelines` section. */
    topic?: string | null;
    /** The [type](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) of channel to create. */
    type: T;
    /** [Voice] The maximum number of users that can be in the channel. Between 0 and 99. */
    userLimit?: number | null;
    /** [Voice] The [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) for the channel. */
    videoQualityMode?: VideoQualityModes | null;
}

export interface CreateTextChannelOptions extends Omit<CreateChannelOptions<ChannelTypes.GUILD_TEXT>, "rtcRegion" | "userLimit" | "videoQualityMode"> {}
export interface CreateVoiceChannelOptions extends Omit<CreateChannelOptions<ChannelTypes.GUILD_VOICE>, "defaultAutoArchiveDuration" | "topic"> {}
export interface CreateCategoryChannelOptions extends Omit<CreateChannelOptions<ChannelTypes.GUILD_CATEGORY>, "defaultAutoArchiveDuration" | "nsfw" | "parentID" | "rtcRegion" | "topic" | "userLimit" | "videoQualityMode"> {}
export interface CreateAnnouncementChannelOptions extends Omit<CreateChannelOptions<ChannelTypes.GUILD_ANNOUNCEMENT>, "rtcRegion" | "userLimit" | "videoQualityMode"> {}
export interface CreateStageChannelOptions extends Omit<CreateChannelOptions<ChannelTypes.GUILD_STAGE_VOICE>, "defaultAutoArchiveDuration" | "nsfw" | "rtcRegion" | "topic" | "userLimit" | "videoQualityMode"> {}

export interface CreateRoleOptions {
    /** The color of the role. */
    color?: number;
    /** If the role should be hoisted. */
    hoist?: boolean;
    /** The icon for the role (buffer, or full data url). Requires the `ROLE_ICONS` feature. */
    icon?: Buffer | string | null;
    /** If the role should be mentionable. */
    mentionable?: boolean;
    /** The name of the role. */
    name?: string;
    /** The permissions of the role. */
    permissions?: string;
    /** The reason for creating the role. */
    reason?: string;
    /** The unicode emoji for the role. Requires the `ROLE_ICONS` feature. */
    unicodeEmoji?: string | null;
}

export interface ModifyChannelPositionsEntry {
    /** The ID of the channel to move. */
    id: string;
    /** If the permissions should be synced with the category. */
    lockPermissions?: boolean | null;
    /** The ID of the new parent category. */
    parentID?: string | null;
    /** The position to move the channel to. */
    position?: number | null;
}

export interface GetActiveThreadsResponse {
    members: Array<ThreadMember>;
    threads: Array<AnyThreadChannel>;
}

export interface GetMembersOptions {
    /** The last id on the previous page, for pagination. */
    after?: string;
    /** The maximum number of members to get. */
    limit?: number;
}

export interface SearchMembersOptions {
    /** The maximum number of entries to get. */
    limit?: number;
    /** The query to search for. */
    query: string;
}

export interface AddMemberOptions {
    /** The access token of the user to add. */
    accessToken: string;
    /** If the user should be deafened or not. */
    deaf?: boolean;
    /** If the user should be muted or not. */
    mute?: boolean;
    /** The nickname of the user to add. */
    nick?: string;
    /** The IDs of the roles to add to the user. This bypasses membership screening and verification levels. */
    roles?: Array<string>;
}

export interface EditMemberOptions {
    /** The ID of the channel to move the member to. `null` to disconnect. */
    channelID?: string | null;
    /** An ISO8601 timestamp to time out until. `null` to reset. */
    communicationDisabledUntil?: string | null;
    /** If the member should be deafened. */
    deaf?: boolean;
    /** The member's [flags](https://discord.com/developers/docs/resources/guild#guild-member-object-flags). */
    flags?: number;
    /** If the member should be muted. */
    mute?: boolean;
    /** The new nickname of the member. `null` to reset. */
    nick?: string | null;
    /** The reason for editing the member. */
    reason?: string;
    /** The new roles of the member. */
    roles?: Array<string>;
}

export interface EditCurrentMemberOptions extends Pick<EditMemberOptions, "nick" | "reason"> {}

export interface EditOnboardingOptions {
    /** Channel IDs that members get opted into automatically. */
    defaultChannelIDs?: Array<string>;
    /** If onboarding is enabled. */
    enabled?: boolean;
    /** The mode for onboarding, used to determine requirements. */
    mode?: OnboardingModes;
    /** The prompts shown during onboarding. */
    prompts?: Array<OnboardingPrompt>;
    /** The reason for editing the onboarding configuration. */
    reason?: string;
}

export interface GetBansOptions {
    /** The ID of the user to get bans after. */
    after?: string;
    /** The ID of the user to get bans before. */
    before?: string;
    /** The maximum number of bans to get. Defaults to 1000. Use Infinity if you wish to get as many bans as possible. */
    limit?: number;
}

export interface RawBan {
    reason: string | null;
    user: RawUser;
}

export interface Ban {
    reason: string | null;
    user: User;
}

export interface CreateBanOptions {
    /** The number of days to delete messages from. Technically DEPRECATED. This is internally converted in to `deleteMessageSeconds`. */
    deleteMessageDays?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    /** The number of seconds to delete messages from. Takes precedence over `deleteMessageDays`. */
    deleteMessageSeconds?: number;
    /** The reason for creating the ban. */
    reason?: string;
}

export interface EditRolePositionsEntry {
    /** The ID of the role to move. */
    id: string;
    /** The position to move the role to. */
    position?: number | null;
}

export interface EditRoleOptions extends CreateRoleOptions {}

export interface GetPruneCountOptions {
    /** The number of days to prune. */
    days?: number;
    /** The roles to include. */
    includeRoles?: Array<string>;
}

export interface BeginPruneOptions extends GetPruneCountOptions {
    /** If the number of members to prune should be computed. If false, the return will be `null`. */
    computePruneCount?: boolean;
    /** The reason for the prune. */
    reason?: string;
}

export interface RawWidgetSettings {
    channel_id: string;
    enabled: boolean;
}

export interface WidgetSettings {
    /** The ID of the channel the widget should lead to. */
    channelID: string;
    /** If the widget is enabled. */
    enabled: boolean;
}

export interface GetVanityURLResponse {
    code: string | null;
    uses: number;
}

export interface RawWidget {
    channels: Array<Required<Pick<RawChannel, "id" | "name" | "position">>>;
    id: string;
    instant_invite: string | null;
    members: Array<RawWidgetUser>;
    name: string;
    presence_count: number;
}

export interface Widget {
    channels: Array<Required<Pick<RawChannel, "id" | "name" | "position">>>;
    id: string;
    instantInvite: string | null;
    members: Array<WidgetUser>;
    name: string;
    presenceCount: number;
}

export interface RawWidgetUser {
    activity?: {
        name: string;
    };
    avatar: null;
    avatar_url: string;
    discriminator: string;
    id: string;
    status: "online" | "idle" | "dnd";
    username: string;
}

export interface WidgetUser {
    activity?: {
        name: string;
    };
    avatar: null;
    avatarURL: string;
    /** Always "0000" */
    discriminator: string;
    id: string;
    status: "online" | "idle" | "dnd";
    /** @deprecated Use `username` */
    tag: string;
    username: string;
}

export type WidgetImageStyle = "shield" | "banner1" | "banner2" | "banner3" | "banner4";

export interface EditWelcomeScreenOptions extends WelcomeScreen {
    /** Whether the welcome screen is enabled. */
    enabled?: boolean;
    /** The reason for editing the welcome screen. */
    reason?: string;
}

export interface EditUserVoiceStateOptions {
    /** The ID of the stage channel the member is in. */
    channelID: string;
    /** If the user should be suppressed. */
    suppress?: boolean;
}

export interface EditCurrentUserVoiceStateOptions extends Omit<EditUserVoiceStateOptions, "channelID"> {
    /** The ID of the stage channel the member is in. */
    channelID?: string;
    /** The timestamp of when the member should be able to speak. */
    requestToSpeakTimestamp?: string | null;
}

export interface RawUnavailableGuild {
    id: string;
    unavailable: true;
}

export type PossiblyUncachedIntegration = Integration | { applicationID?: string; id: string; };

export interface RawStageInstance {
    channel_id: string;
    /** @deprecated */
    discoverable_disabled: boolean;
    guild_id: string;
    guild_scheduled_event_id: string | null;
    id: string;
    privacy_level: StageInstancePrivacyLevels;
    topic: string;
}

export interface CreateStageInstanceOptions {
    /** The privacy level of the stage instance. */
    privacyLevel?: StageInstancePrivacyLevels;
    /** The reason for creating the stage instance. */
    reason?: string;
    /** Whether to notify @everyone that a stage instance has started. */
    sendStartNotification?: boolean;
    /** The topic of the stage instance. */
    topic: string;
}

export interface EditStageInstanceOptions extends Pick<CreateStageInstanceOptions, "topic" | "privacyLevel"> {
    /** The reason for editing the stage instance. */
    reason?: string;
}

export interface EditMFALevelOptions {
    /** The new MFA level. */
    level: MFALevels;
    /** The reason for editing the MFA level. */
    reason?: string;
}

export interface CreateStickerOptions {
    /** The description of the sticker. */
    description: string;
    /** The file contents of the sticker. PNG, APNG, or LOTTIE (only `VERIFIED` & `PARTNERED` servers can use lottie). */
    file: File;
    /** The name of the sticker. */
    name: string;
    /** The reason for creating the sticker. */
    reason?: string;
    /** The autocomplete/suggestions tags for the sticker. */
    tags: string;
}

export interface EditStickerOptions {
    /** The description of the sticker. */
    description?: string | null;
    /** The name of the sticker. */
    name?: string;
    /** The reason for editing the sticker. */
    reason?: string;
    /** The autocomplete/suggestions tags for the sticker. */
    tags?: string;
}

export interface RawStickerPack {
    banner_asset_id?: string;
    cover_sticker_id?: string;
    description: string;
    id: string;
    name: string;
    sku_id: string;
    stickers: Array<RawSticker>;
}

export interface StickerPack {
    bannerAssetID?: string;
    coverStickerID?: string;
    description: string;
    id: string;
    name: string;
    skuID: string;
    stickers: Array<Sticker>;
}

export interface RawOAuthGuild {
    approximate_member_count?: number;
    approximate_presence_count?: number;
    banner: string | null;
    features: Array<GuildFeature>;
    icon: string | null;
    id: string;
    name: string;
    owner: boolean;
    permissions: string;
}

export interface PresenceActivity extends Omit<GatewayActivity, "application_id" | "assets" | "created_at"> {
    applicationID?: string;
    assets?: Partial<Record<"largeImage" | "largeText" | "smallImage" | "smallText", string>>;
    createdAt: number;
}

export interface Presence extends Omit<PresenceUpdate, "user" | "guild_id" | "client_status" | "activities"> {
    activities?: Array<PresenceActivity>;
    clientStatus: ClientStatus;
    guildID: string;
}

export interface RawOnboardingPromptOption {
    channel_ids: Array<string>;
    description: string | null;
    emoji: PartialEmoji;
    id: string;
    role_ids: Array<string>;
    title: string;
}

export interface RawOnboardingPrompt {
    id: string;
    in_onboarding: boolean;
    options: Array<RawOnboardingPromptOption>;
    required: boolean;
    single_select: boolean;
    title: string;
}

export interface RawOnboarding {
    default_channel_ids: Array<string>;
    enabled: boolean;
    guild_id: string;
    mode: OnboardingModes;
    prompts: Array<RawOnboardingPrompt>;
}

export interface OnboardingPromptOption {
    channelIDs: Array<string>;
    description: string | null;
    emoji: PartialEmoji;
    id: string;
    roleIDs: Array<string>;
    title: string;
}

export interface OnboardingPrompt {
    id: string;
    inOnboarding: boolean;
    options: Array<OnboardingPromptOption>;
    required: boolean;
    singleSelect: boolean;
    title: string;
}

export interface Onboarding {
    defaultChannelIDs: Array<string>;
    enabled: boolean;
    guildID: string;
    mode: OnboardingModes;
    prompts: Array<OnboardingPrompt>;
}

export interface RawInventorySettings {
    is_emoji_pack_collectible: boolean;
}

export interface InventorySettings {
    isEmojiPackCollectible: boolean;
}

export interface EditIncidentActionsOptions {
    /** When disabled direct messages will expire (up to 24 hours in the future) */
    dmsDisabledUntil?: string | null;
    /** When disabled invites will expire (up to 24 hours in the future). */
    invitesDisabledUntil?: string | null;
    /** The reason for editing the incident actions. */
    reason?: string;
}

export interface RawIncidentActions {
    dms_disabled_until: string | null;
    invites_disabled_until: string | null;
}

export interface IncidentActions {
    /** When disabled direct messages will expire (up to 24 hours in the future) */
    dmsDisabledUntil: string | null;
    /** When disabled invites will expire (up to 24 hours in the future). */
    invitesDisabledUntil: string | null;
}

export interface BulkBanOptions {
    /** Number of seconds to deleted messages for, between 0 and 604800 (7 days). */
    deleteMessageSeconds?: number;
    reason?: string;
    /** list of user ids to ban (max 200) */
    userIDs: Array<string>;
}

export interface RawBulkBanResponse {
    banned_users: Array<string>;
    failed_users: Array<string>;
}

export interface BulkBanResponse {
    /** The users that were successfully banned. */
    bannedUsers: Array<string>;
    /** The users that could not be banned. */
    failedUsers: Array<string>;
}
