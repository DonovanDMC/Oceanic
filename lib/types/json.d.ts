/** @module Types/JSON */
/* eslint-disable @typescript-eslint/no-empty-interface */
import type { InstallParams } from "./oauth";
import type { ApplicationCommandOptions, IntegrationTypesConfig, LocaleMap, TeamMember } from "./applications";
import type {
    ApplicationCommandInteractionData,
    AuthorizingIntegrationOwners,
    AutocompleteInteractionData,
    MessageComponentButtonInteractionData,
    MessageComponentSelectMenuInteractionData,
    ModalSubmitInteractionData
} from "./interactions";
import type { AutoModerationAction, TriggerMetadata } from "./auto-moderation";
import type {
    GuildEmoji,
    IntegrationAccount,
    RawGuild,
    RoleTags,
    RawSticker,
    WelcomeScreen,
    Sticker,
    Presence,
    IncidentActions
} from "./guilds";
import type {
    ChannelMention,
    MessageActivity,
    MessageReference,
    RawChannel,
    StickerItem,
    MessageReaction,
    ThreadMetadata,
    PrivateThreadMetadata,
    ForumTag,
    ForumEmoji,
    MessageActionRow,
    Embed,
    GuildChannels,
    TextableGuildChannels,
    ThreadChannels,
    VoiceChannels,
    ThreadOnlyChannels,
    PollQuestion,
    PollResults,
    PollAnswer
} from "./channels";
import type { ScheduledEventEntityMetadata } from "./scheduled-events";
import type { AvatarDecorationData } from "./users";
import type {
    ApplicationCommandTypes,
    AutoModerationEventTypes,
    AutoModerationTriggerTypes,
    ChannelTypes,
    DefaultMessageNotificationLevels,
    ExplicitContentFilterLevels,
    GuildFeature,
    GuildNSFWLevels,
    IntegrationExpireBehaviors,
    IntegrationType,
    InteractionTypes,
    InviteTargetTypes,
    MessageTypes,
    MFALevels,
    OverwriteTypes,
    PremiumTiers,
    RESTMethod,
    GuildScheduledEventEntityTypes,
    GuildScheduledEventPrivacyLevels,
    GuildScheduledEventStatuses,
    ThreadAutoArchiveDuration,
    VerificationLevels,
    VideoQualityModes,
    WebhookTypes,
    SortOrderTypes,
    StageInstancePrivacyLevels,
    ForumLayoutTypes,
    EntitlementTypes,
    ApplicationIntegrationTypes,
    InteractionContextTypes,
    PollLayoutType,
    ApplicationDiscoverabilityState,
    ApplicationExplicitContentFilterLevel,
    ApplicationMonetizationState,
    RPCApplicationState,
    StoreApplicationState,
    ApplicationVerificationState
} from "../Constants";

export interface JSONAnnouncementChannel extends JSONThreadableChannel {
    rateLimitPerUser: 0;
    type: ChannelTypes.GUILD_ANNOUNCEMENT;
}
export interface JSONAnnouncementThreadChannel extends JSONThreadChannel {
    threadMetadata: ThreadMetadata;
    type: ChannelTypes.ANNOUNCEMENT_THREAD;
}
export interface JSONApplication extends JSONClientApplication {
    approximateGuildCount: number;
    botPublic?: boolean;
    botRequireCodeGrant?: boolean;
    coverImage: string | null;
    customInstallURL?: string;
    description: string;
    discoverabilityState?: ApplicationDiscoverabilityState;
    discoveryEligibilityFlags?: number;
    explicitContentFilter?: ApplicationExplicitContentFilterLevel;
    guild: JSONOAuthGuild | null;
    guildID: string | null;
    hook: boolean;
    icon: string | null;
    installParams?: InstallParams;
    integrationTypes: Array<ApplicationIntegrationTypes>;
    integrationTypesConfig: IntegrationTypesConfig;
    interactionsEndpointURL: string | null;
    interactionsEventTypes?: Array<string>;
    interactionsVersion?: number;
    isMonetized: boolean;
    monetizationEligibilityFlags?: number;
    monetizationState?: ApplicationMonetizationState;
    name: string;
    owner: JSONUser | null;
    primarySKUID?: string;
    privacyPolicyURL?: string;
    redirectURIs: Array<string>;
    roleConnectionsVerificationURL: string | null;
    rpcApplicationState?: RPCApplicationState;
    rpcOrigins: Array<string>;
    slug?: string;
    storeApplicationState?: StoreApplicationState;
    tags: Array<string>;
    team: JSONTeam | null;
    termsOfServiceURL?: string;
    type: number | null;
    verificationState?: ApplicationVerificationState;
    verifyKey: string;
}
export interface JSONApplicationCommand extends JSONBase {
    applicationID: string;
    contexts: Array<InteractionContextTypes>;
    defaultMemberPermissions?: JSONPermission;
    description: string;
    descriptionLocalizations?: LocaleMap | null;
    dmPermission?: boolean;
    guildID?: string;
    integrationTypes: Array<ApplicationIntegrationTypes>;
    name: string;
    nameLocalizations?: LocaleMap | null;
    nsfw?: boolean;
    options?: Array<ApplicationCommandOptions>;
    type: ApplicationCommandTypes;
    version: string;
}
export interface JSONAttachment extends JSONBase {
    contentType?: string;
    description?: string;
    ephemeral?: boolean;
    filename: string;
    flags: number;
    height?: number;
    proxyURL: string;
    size: number;
    title?: string;
    url: string;
    width?: number;
}
export interface JSONAutocompleteInteraction extends JSONInteraction {
    appPermissions: JSONPermission;
    authorizingIntegrationOwners: AuthorizingIntegrationOwners;
    channelID: string;
    context?: InteractionContextTypes;
    data: AutocompleteInteractionData;
    guildID?: string;
    guildLocale?: string;
    locale: string;
    member?: JSONMember;
    type: InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE;
    user: JSONUser;
}
export interface JSONAutoModerationRule extends JSONBase {
    actions: Array<AutoModerationAction>;
    creatorID: string;
    enabled: boolean;
    eventType: AutoModerationEventTypes;
    exemptChannels: Array<string>;
    exemptRoles: Array<string>;
    guildID: string;
    name: string;
    triggerMetadata: TriggerMetadata;
    triggerType: AutoModerationTriggerTypes;
}
export interface JSONBase {
    createdAt: number;
    id: string;
}
export interface JSONBaseEntitlement extends JSONBase {
    applicationID: string;
    consumed: boolean;
    deleted: boolean;
    giftCodeFlags: number;
    guildID: string | null;
    promotionID: string | null;
    skuID: string;
    type: EntitlementTypes;
    userID: string | null;
}
export interface JSONCategoryChannel extends JSONGuildChannel {
    channels: Array<string>;
    permissionOverwrites: Array<JSONPermissionOverwrite>;
    position: number;
    type: ChannelTypes.GUILD_CATEGORY;
}
export interface JSONChannel extends JSONBase {
    type: ChannelTypes;
}
export interface JSONClan {
    badge: string;
    identityEnabled: boolean;
    identityGuildID: string;
    tag: string;
}
export interface JSONClientApplication extends JSONBase {
    flags: number;
}
export interface JSONClientUser extends JSONUser {
    email: string | null;
    flags: number;
    locale: string;
    mfaEnabled: boolean;
    verified: boolean;
}
export interface JSONCommandInteraction extends JSONInteraction {
    appPermissions: JSONPermission;
    authorizingIntegrationOwners: AuthorizingIntegrationOwners;
    channelID: string;
    context?: InteractionContextTypes;
    data: ApplicationCommandInteractionData;
    guildID?: string;
    guildLocale?: string;
    locale: string;
    member?: JSONMember;
    type: InteractionTypes.APPLICATION_COMMAND;
    user: JSONUser;
}
export interface JSONComponentInteraction extends JSONInteraction {
    appPermissions: JSONPermission;
    authorizingIntegrationOwners: AuthorizingIntegrationOwners;
    channelID: string;
    context?: InteractionContextTypes;
    data: MessageComponentButtonInteractionData | MessageComponentSelectMenuInteractionData;
    guildID?: string;
    guildLocale?: string;
    locale: string;
    member?: JSONMember;
    type: InteractionTypes.MESSAGE_COMPONENT;
    user: JSONUser;
}
export interface JSONEntitlement extends JSONBaseEntitlement {
    endsAt: number;
    startsAt: number;
    subscriptionID: string;
}
export interface JSONDiscordHTTPError {
    message: string;
    method: RESTMethod;
    name: string;
    resBody: Record<string, unknown> | null;
    stack: string;
}
export interface JSONDiscordRESTError {
    message: string;
    method: RESTMethod;
    name: string;
    resBody: Record<string, unknown> | null;
    stack: string;
}
export interface JSONExtendedUser extends JSONUser {
    email: string | null;
    flags: number;
    locale?: string;
    mfaEnabled: boolean;
    verified: boolean;
}
export interface JSONForumChannel extends JSONThreadOnlyChannel {
    type: ChannelTypes.GUILD_FORUM;
}
export interface JSONGroupChannel extends JSONChannel {
    applicationID: string;
    icon: string | null;
    managed: boolean;
    name: string | null;
    nicks: Array<Record<"id" | "nick", string>>;
    ownerID: string;
    recipients: Array<JSONUser>;
    type: ChannelTypes.GROUP_DM;
}
export interface JSONGuild extends JSONBase {
    afkChannelID: string | null;
    afkTimeout: number;
    application?: string;
    approximateMemberCount?: number;
    approximatePresenceCount?: number;
    autoModerationRules: Array<JSONAutoModerationRule>;
    banner: string | null;
    channels: Array<string>;
    defaultMessageNotifications: DefaultMessageNotificationLevels;
    description: string | null;
    discoverySplash: string | null;
    emojis: Array<GuildEmoji>;
    explicitContentFilter: ExplicitContentFilterLevels;
    features: Array<GuildFeature>;
    icon: string | null;
    incidentActions: IncidentActions | null;
    joinedAt: number | null;
    large: boolean;
    maxMembers?: number;
    maxPresences?: number;
    maxStageVideoChannelUsers?: number;
    maxVideoChannelUsers?: number;
    memberCount: number;
    members: Array<string>;
    mfaLevel: MFALevels;
    name: string;
    nsfwLevel: GuildNSFWLevels;
    ownerID: string | null;
    preferredLocale: string;
    premiumProgressBarEnabled: boolean;
    premiumSubscriptionCount?: number;
    premiumTier: PremiumTiers;
    publicUpdatesChannelID: string | null;
    region?: string | null;
    roles: Array<JSONRole>;
    rulesChannelID: string | null;
    scheduledEvents: Array<JSONScheduledEvent>;
    splash: string | null;
    stageInstances: Array<JSONStageInstance>;
    stickers?: Array<Sticker>;
    systemChannelFlags: number;
    systemChannelID: string | null;
    threads: Array<string>;
    unavailable: boolean;
    vanityURLCode: string | null;
    verificationLevel: VerificationLevels;
    voiceStates: Array<JSONVoiceState>;
    welcomeScreen?: WelcomeScreen;
    widgetChannelID: string | null;
    widgetEnabled?: boolean;
}
export interface JSONGuildChannel extends JSONChannel {
    guildID: string;
    name: string;
    parentID: string | null;
    type: GuildChannels;
}
export interface JSONGuildPreview extends JSONBase {
    approximateMemberCount: number;
    approximatePresenceCount: number;
    description: string | null;
    discoverySplash: string | null;
    emojis: Array<GuildEmoji>;
    features: Array<GuildFeature>;
    icon: string | null;
    name: string;
    splash: string | null;
    stickers: Array<RawSticker>;
}
export interface JSONGuildTemplate {
    code: string;
    createdAt: number;
    creator: JSONUser;
    description: string | null;
    isDirty: boolean | null;
    name: string;
    serializedSourceGuild: Partial<RawGuild>;
    sourceGuildID: string;
    updatedAt: number;
    usageCount: number;
}
export interface JSONIntegration extends JSONBase {
    account: IntegrationAccount;
    application?: JSONPartialApplication;
    enableEmoticons?: boolean;
    enabled?: boolean;
    expireBehavior?: IntegrationExpireBehaviors;
    expireGracePeriod?: number;
    name: string;
    revoked?: boolean;
    roleID: string | null;
    scopes?: Array<string>;
    subscriberCount?: number;
    syncedAt?: number;
    syncing?: boolean;
    type: IntegrationType;
    user?: JSONUser;
}
export interface JSONInteraction extends JSONBase {
    applicationID: string;
    type: InteractionTypes;
    version: 1;
}
export interface JSONInvite {
    approximateMemberCount?: number;
    approximatePresenceCount?: number;
    channelID?: string;
    code: string;
    createdAt?: number;
    expiresAt?: number;
    guild?: JSONInviteGuild;
    guildID?: string;
    guildScheduledEvent?: JSONScheduledEvent;
    inviter?: string;
    maxAge?: number;
    maxUses?: number;
    stageInstance?: {
        members: Array<string>;
        participantCount: number;
        speakerCount: number;
        topic: string;
    };
    targetApplication?: JSONPartialApplication;
    targetType?: InviteTargetTypes;
    targetUser?: string;
    temporary?: boolean;
    uses?: number;
}
export interface JSONInviteGuild extends JSONBase {
    banner: string | null;
    description: string | null;
    features: Array<GuildFeature>;
    icon: string | null;
    name: string;
    nsfwLevel: GuildNSFWLevels;
    premiumSubscriptionCount?: number;
    splash: string | null;
    vanityURLCode: string | null;
    verificationLevel: VerificationLevels;
}
export interface JSONMediaChannel extends JSONThreadOnlyChannel {
    type: ChannelTypes.GUILD_MEDIA;
}
export interface JSONMember extends JSONBase {
    avatar: string | null;
    avatarDecorationData: AvatarDecorationData | null;
    banner: string | null;
    communicationDisabledUntil: number | null;
    deaf: boolean;
    flags?: number;
    guildID: string;
    isPending?: boolean;
    joinedAt: number | null;
    mute: boolean;
    nick: string | null;
    pending: boolean;
    premiumSince: number | null;
    presence?: Presence;
    roles: Array<string>;
    user: JSONUser;
}
export interface JSONMessage extends JSONBase {
    activity?: MessageActivity;
    applicationID?: string;
    attachments: Array<JSONAttachment>;
    author: JSONUser;
    channelID: string;
    components?: Array<MessageActionRow>;
    content: string;
    editedTimestamp: number | null;
    embeds: Array<Embed>;
    flags?: number;
    guildID?: string;
    interaction?: {
        id: string;
        member?: JSONMember;
        name: string;
        type: InteractionTypes;
        user: JSONUser;
    };
    interactionMetadata?: {
        authorizingIntegrationOwners: AuthorizingIntegrationOwners;
        id: string;
        interactedMessageID?: string;
        name?: string;
        originalResponseMessageID?: string;
        triggeringInteractionMetadata?: {
            authorizingIntegrationOwners: AuthorizingIntegrationOwners;
            id: string;
            interactedMessageID?: string;
            originalResponseMessageID?: string;
            type: InteractionTypes;
            user: JSONUser;
        };
        type: InteractionTypes;
        user: JSONUser;
    };
    mentionChannels?: Array<ChannelMention>;
    mentions: {
        channels: Array<string>;
        everyone: boolean;
        members: Array<JSONMember>;
        roles: Array<string>;
        users: Array<JSONUser>;
    };
    messageReference?: MessageReference;
    messageSnapshots?: Array<{
        message: {
            attachments: Array<JSONAttachment>;
            content: string;
            editedTimestamp: number | null;
            embeds: Array<Embed>;
            flags: number;
            mentions: {
                channels: Array<string>;
                roles: Array<string>;
                users: Array<JSONUser>;
            };
            timestamp: number;
            type: MessageTypes;
        };
    }>;
    nonce?: number | string;
    pinned: boolean;
    position?: number;
    reactions: Array<MessageReaction>;
    referencedMessage?: JSONMessage | null;
    stickerItems?: Array<StickerItem>;
    thread?: JSONAnnouncementThreadChannel | JSONPublicThreadChannel | JSONPrivateThreadChannel;
    timestamp: number;
    tts: boolean;
    type: MessageTypes;
    webhook?: string;
}
export interface JSONModalSubmitInteraction extends JSONInteraction {
    appPermissions: JSONPermission;
    authorizingIntegrationOwners: AuthorizingIntegrationOwners;
    channelID: string;
    context?: InteractionContextTypes;
    data: ModalSubmitInteractionData;
    guildID?: string;
    guildLocale?: string;
    locale: string;
    member?: JSONMember;
    type: InteractionTypes.MODAL_SUBMIT;
    user: JSONUser;
}
export interface JSONOAuthApplication extends JSONBase {
    botPublic: boolean;
    botRequireCodeGrant: boolean;
    coverImage: string | null;
    customInstallURL?: string;
    description: string;
    flags: number;
    guildID: string | null;
    icon: string | null;
    installParams?: InstallParams;
    integrationTypes: Array<ApplicationIntegrationTypes>;
    integrationTypesConfig?: IntegrationTypesConfig;
    name: string;
    owner: JSONUser;
    ownerID: string;
    primarySKUID?: string;
    privacyPolicyURL?: string;
    roleConnectionsVerificationURL?: string;
    rpcOrigins: Array<string>;
    slug?: string;
    tags?: Array<string>;
    team: JSONTeam | null;
    termsOfServiceURL?: string;
    type: number | null;
    verifyKey: string;
}
export interface JSONOAuthGuild extends JSONBase {
    approximateMemberCount?: number;
    approximatePresenceCount?: number;
    banner: string | null;
    features: Array<GuildFeature>;
    icon: string | null;
    name: string;
    owner: boolean;
    permissions: JSONPermission;
}
export interface JSONPartialApplication extends JSONBase {
    botPublic?: boolean;
    botRequireCodeGrant?: boolean;
    description: string;
    icon: string | null;
    name: string;
    verifyKey?: string;
}
export interface JSONPermission {
    allow: string;
    deny: string;
}
export interface JSONPermissionOverwrite extends JSONBase {
    permission: JSONPermission;
    type: OverwriteTypes;
}
export interface JSONPingInteraction extends JSONInteraction {
    type: InteractionTypes.PING;
}
export interface JSONPoll {
    allowMultiselect: boolean;
    answers: Array<PollAnswer>;
    expiry: string;
    layoutType: PollLayoutType;
    question: PollQuestion;
    results: PollResults;
}
export interface JSONPrivateChannel extends JSONChannel {
    lastMessageID: string | null;
    messages: Array<string>;
    recipient: JSONUser;
    type: ChannelTypes.DM;
}
export interface JSONPrivateThreadChannel extends JSONThreadChannel {
    threadMetadata: PrivateThreadMetadata;
    type: ChannelTypes.PRIVATE_THREAD;
}
export interface JSONPublicThreadChannel extends JSONThreadChannel {
    appliedTags: Array<string>;
    threadMetadata: ThreadMetadata;
    type: ChannelTypes.PUBLIC_THREAD;
}
export interface JSONRole extends JSONBase {
    color: number;
    guildID: string;
    hoist: boolean;
    icon: string | null;
    managed: boolean;
    mentionable: boolean;
    name: string;
    permissions: JSONPermission;
    position: number;
    tags: RoleTags;
    unicodeEmoji: string | null;
}
export interface JSONScheduledEvent extends JSONBase {
    channelID: string | null;
    creator?: JSONUser;
    description?: string | null;
    entityID: string | null;
    entityMetadata: ScheduledEventEntityMetadata | null;
    entityType: GuildScheduledEventEntityTypes;
    guildID: string;
    image?: string | null;
    name: string;
    privacyLevel: GuildScheduledEventPrivacyLevels;
    scheduledEndTime: number | null;
    scheduledStartTime: number;
    status: GuildScheduledEventStatuses;
    userCount?: number;
}
export interface JSONStageChannel extends JSONTextableVoiceChannel {
    type: ChannelTypes.GUILD_STAGE_VOICE;
}
export interface JSONStageInstance extends JSONBase {
    channelID: string;
    discoverableDisabled: boolean;
    guildID: string;
    privacyLevel: StageInstancePrivacyLevels;
    scheduledEventID: string | null;
    topic: string;
}
export interface JSONTeam extends JSONBase {
    icon: string | null;
    members: Array<TeamMember>;
    name: string;
    ownerID: string;
}
export interface JSONTestEntitlement extends JSONBaseEntitlement {}
export interface JSONTextableChannel extends JSONGuildChannel {
    lastMessageID: string | null;
    messages: Array<string>;
    nsfw: boolean;
    permissionOverwrites: Array<JSONPermissionOverwrite>;
    position: number;
    rateLimitPerUser: number;
    topic: string | null;
    type: TextableGuildChannels;
}

export interface JSONTextableVoiceChannel extends JSONTextableChannel {
    bitrate: number;
    rtcRegion: string | null;
    type: VoiceChannels;
    userLimit: number;
    videoQualityMode: VideoQualityModes;
    voiceMembers: Array<string>;
}

export interface JSONTextChannel extends JSONThreadableChannel {
    type: ChannelTypes.GUILD_TEXT;
}
export interface JSONThreadableChannel extends JSONTextableChannel {
    defaultAutoArchiveDuration: ThreadAutoArchiveDuration;
    threads: Array<string>;
    type: ChannelTypes.GUILD_TEXT | ChannelTypes.GUILD_ANNOUNCEMENT;
}
export interface JSONThreadChannel extends JSONGuildChannel {
    flags: number;
    lastMessageID: string | null;
    memberCount: number;
    messageCount: number;
    messages: Array<string>;
    ownerID: string;
    rateLimitPerUser: number;
    threadMetadata: ThreadMetadata | PrivateThreadMetadata;
    totalMessageSent: number;
    type: ThreadChannels;
}
export interface JSONThreadOnlyChannel extends JSONGuildChannel {
    availableTags: Array<ForumTag>;
    defaultAutoArchiveDuration: ThreadAutoArchiveDuration;
    defaultForumLayout: ForumLayoutTypes;
    defaultReactionEmoji: ForumEmoji | null;
    defaultSortOrder: SortOrderTypes | null;
    defaultThreadRateLimitPerUser: number;
    flags: number;
    lastThreadID: string | null;
    permissionOverwrites: Array<JSONPermissionOverwrite>;
    position: number;
    rateLimitPerUser: number;
    threads: Array<string>;
    topic: string | null;
    type: ThreadOnlyChannels;
}
export interface JSONUnavailableGuild extends JSONBase {
    unavailable: true;
}
export interface JSONUser extends JSONBase {
    accentColor?: number | null;
    avatar: string | null;
    avatarDecorationData: AvatarDecorationData | null;
    banner?: string | null;
    bot: boolean;
    discriminator: string;
    globalName: string | null;
    publicFlags: number;
    system: boolean;
    username: string;
}
export interface JSONVoiceChannel extends JSONTextableVoiceChannel {
    status: string | null;
    type: ChannelTypes.GUILD_VOICE;
}
export interface JSONVoiceState extends JSONBase {
    channelID: string | null;
    deaf: boolean;
    guildID?: string;
    member?: JSONMember;
    mute: boolean;
    requestToSpeakTimestamp: number | null;
    selfDeaf: boolean;
    selfMute: boolean;
    selfStream: boolean;
    selfVideo: boolean;
    sessionID: string;
    suppress: boolean;
    user?: JSONUser;
}
export interface JSONWebhook extends JSONBase {
    applicationID: string | null;
    avatar: string | null;
    channelID: string | null;
    guildID: string | null;
    name: string | null;
    sourceChannel?: Pick<RawChannel, "id" | "name">;
    sourceGuild?: Pick<RawGuild, "id" | "name" | "icon">;
    token?: string;
    type: WebhookTypes;
    user?: JSONUser;
}
