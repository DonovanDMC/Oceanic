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
import StageChannel from "./StageChannel";
import type {
    DefaultMessageNotificationLevels,
    ExplicitContentFilterLevels,
    GuildFeature,
    GuildNSFWLevels,
    ImageFormat,
    MFALevels,
    PremiumTiers,
    VerificationLevels,
    GuildChannelTypesWithoutThreads
} from "../Constants";
import { AllPermissions, Permissions } from "../Constants";
import * as Routes from "../util/Routes";
import type Client from "../Client";
import Collection from "../util/Collection";
import type {
    AnyGuildChannel,
    AnyGuildChannelWithoutThreads,
    AnyGuildTextChannel,
    AnyThreadChannel,
    RawGuildChannel,
    RawThreadChannel
} from "../types/channels";
import type {
    AddMemberOptions,
    BeginPruneOptions,
    CreateBanOptions,
    CreateChannelOptions,
    CreateEmojiOptions,
    CreateRoleOptions,
    EditCurrentMemberOptions,
    EditCurrentUserVoiceStateOptions,
    EditEmojiOptions,
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
    Sticker,
    WelcomeScreen,
    WidgetImageStyle,
    WidgetSettings,
    RawIntegration
} from "../types/guilds";
import type { CreateScheduledEventOptions, EditScheduledEventOptions, GetScheduledEventUsersOptions, RawScheduledEvent } from "../types/scheduled-events";
import type { CreateAutoModerationRuleOptions, EditAutoModerationRuleOptions, RawAutoModerationRule } from "../types/auto-moderation";
import type { GetAuditLogOptions } from "../types/audit-log";
import type { CreateTemplateOptions, EditGuildTemplateOptions } from "../types/guild-template";
import type { Uncached } from "../types/shared";
import type { RawVoiceState } from "../types/voice";
import type { RawStageInstance } from "../types/stage-instances";
import type { JSONGuild } from "../types/json";
import type { PresenceUpdate, RequestGuildMembersOptions } from "../types/gateway";

/** Represents a Discord server. */
export default class Guild extends Base {
    /** This guild's afk voice channel. This can be a partial object with just an `id` property. */
    afkChannel: VoiceChannel | Uncached | null;
    /** The seconds after which voice users will be moved to the afk channel. */
    afkTimeout: number;
    /** The application that created this guild, if applicable. This can be a partial object with just an `id` property. */
    application: ClientApplication | Uncached | null;
    /** The approximate number of members in this guild (if retreived with counts). */
    approximateMemberCount?: number;
    /** The approximate number of non-offline members in this guild (if retreived with counts). */
    approximatePresenceCount?: number;
    /** The auto moderation rules in this guild. */
    autoModerationRules: Collection<string, RawAutoModerationRule, AutoModerationRule>;
    /** The hash of this guild's banner. */
    banner: string | null;
    /** The channels in this guild. */
    channels: Collection<string, RawGuildChannel, AnyGuildChannelWithoutThreads>;
    /** The default [message notifications level](https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level) of this guild. */
    defaultMessageNotifications: DefaultMessageNotificationLevels;
    /** The description of this guild. */
    description: string | null;
    /** The discovery splash of this guild. Only present if the guild has the `DISCOVERABLE` feature. */
    discoverySplash: string | null;
    /** The custom emojis of this guild. */
    emojis: Array<GuildEmoji>;
    /** The [explicit content filter](https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level) of this guild. */
    explicitContentFilter: ExplicitContentFilterLevels;
    /** The [features](https://discord.com/developers/docs/resources/guild#guild-object-guild-features) this guild has. */
    features: Array<GuildFeature>;
    /** The icon hash of this guild. */
    icon: string | null;
    /** The integrations in this guild. */
    integrations: Collection<string, RawIntegration, Integration>;
    /** The date at which this guild was joined. */
    joinedAt: Date | null;
    /** If this guild is considered large. */
    large: boolean;
    /** The maximum amount of members this guild can have. */
    maxMembers?: number;
    /** The maximum amount of people that can be present at a time in this guild. Only present for very large guilds. */
    maxPresences?: number;
    /** The maximum amount of users that can be present in a video channel. */
    maxVideoChannelUsers?: number;
    /** The number of members in this guild. */
    memberCount: number;
    /** The cached members in this guild. */
    members: Collection<string, RawMember, Member, [guildID: string]>;
    /** The required [mfa level](https://discord.com/developers/docs/resources/guild#guild-object-mfa-level) for moderators of this guild. */
    mfaLevel: MFALevels;
    /** The name of this guild. */
    name: string;
    /** The [nsfw level](https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level) of this guild. */
    nsfwLevel: GuildNSFWLevels;
    /** If the current user is the owner of this guild (only present when getting the current user's guilds). */
    oauthOwner?: boolean;
    /** The id of the owner of this guild. */
    owner: User | Uncached;
    /** The permissions of the current user in this guild (only present when getting the current user's guilds). */
    permissions?: Permission;
    /** The [preferred locale](https://discord.com/developers/docs/reference#locales) of this guild. */
    preferredLocale: string;
    /** If this guild has the boost progress bar enabled. */
    premiumProgressBarEnabled: boolean;
    /** The number of nitro boosts this guild has. */
    premiumSubscriptionCount?: number;
    /** The [boost level](https://discord.com/developers/docs/resources/guild#guild-object-premium-tier) of this guild. */
    premiumTier: PremiumTiers;
    /** The id of the channel where notices from Discord are recieved. Only present in guilds with the `COMMUNITY` feature. */
    publicUpdatesChannel: AnyGuildTextChannel | Uncached | null;
    /** @deprecated The region of this guild.*/
    region?: string | null;
    /** The roles in this guild. */
    roles: Collection<string, RawRole, Role, [guildID: string]>;
    /** The id of the channel where rules/guidelines are displayed. Only present in guilds with the `COMMUNITY` feature. */
    rulesChannel: TextChannel | Uncached | null;
    /** The scheduled events in this guild. */
    scheduledEvents: Collection<string, RawScheduledEvent, GuildScheduledEvent>;
    /** The invite splash hash of this guild. */
    splash: string | null;
    /** The stage instances in this guild. */
    stageInstances: Collection<string, RawStageInstance, StageInstance>;
    /** The custom stickers of this guild. */
    stickers: Array<Sticker>;
    /** The id of the channel where welcome messages and boosts notices are posted. */
    systemChannel: TextChannel | Uncached | null;
    /** The [flags](https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags) for the system channel. */
    systemChannelFlags: number;
    /** The threads in this guild. */
    threads: Collection<string, RawThreadChannel, AnyThreadChannel>;
    /** If this guild is unavailable. */
    unavailable: boolean;
    /** The vanity url of this guild. Only present in guilds with the `VANITY_URL` feature. */
    vanityURLCode: string | null;
    /** The [verfication level](https://discord.com/developers/docs/resources/guild#guild-object-verification-level) of this guild. */
    verificationLevel: VerificationLevels;
    /** The voice states of members in voice channels. */
    voiceStates: Collection<string, RawVoiceState, VoiceState>;
    /** The welcome screen configuration. Only present in guilds with the `WELCOME_SCREEN_ENABLED` feature. */
    welcomeScreen?: WelcomeScreen;
    /** The id of the channel the widget will generate an invite to, or `null` if set to no invite. */
    widgetChannel?: Exclude<AnyGuildChannel, CategoryChannel> | Uncached | null;
    /** If the widget is enabled. */
    widgetEnabled?: boolean;
    constructor(data: RawGuild, client: Client) {
        super(data.id, client);
        this.afkChannel = null;
        this.afkTimeout = 0;
        this.application = null;
        this.autoModerationRules = new Collection(AutoModerationRule, client);
        this.banner = null;
        this.channels = new Collection(GuildChannel, client) as Collection<string, RawGuildChannel, AnyGuildChannelWithoutThreads>;
        this.defaultMessageNotifications = data.default_message_notifications;
        this.description = null;
        this.discoverySplash = null;
        this.emojis = [];
        this.explicitContentFilter = data.explicit_content_filter;
        this.features = [];
        this.icon = null;
        this.integrations = new Collection(Integration, client);
        this.joinedAt = null;
        this.large = (data.member_count || data.approximate_member_count || 0) >= client.shards.options.largeThreshold;
        this.memberCount = data.member_count || data.approximate_member_count || 0;
        this.members = new Collection(Member, client, typeof client.options.collectionLimits.members === "number" ? client.options.collectionLimits.members : client.options.collectionLimits.members[data.id] ?? Infinity);
        this.mfaLevel = data.mfa_level;
        this.name = data.name;
        this.nsfwLevel = data.nsfw_level;
        this.owner = { id: data.owner_id };
        this.preferredLocale = data.preferred_locale;
        this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
        this.premiumTier = data.premium_tier;
        this.publicUpdatesChannel = null;
        this.roles = new Collection(Role, client);
        this.rulesChannel = null;
        this.scheduledEvents = new Collection(GuildScheduledEvent, client);
        this.splash = null;
        this.stageInstances = new Collection(StageInstance, client);
        this.stickers = [];
        this.systemChannel = null;
        this.systemChannelFlags = data.system_channel_flags;
        this.threads = new Collection(ThreadChannel, client) as Collection<string, RawThreadChannel, AnyThreadChannel>;
        this.unavailable = !!data.unavailable;
        this.vanityURLCode = data.vanity_url_code;
        this.verificationLevel = data.verification_level;
        this.voiceStates = new Collection(VoiceState, client);
        data.roles.forEach(role => this.roles.update(role, data.id));
        this.update(data);

        if (data.channels) {
            for (const channelData of data.channels) {
                channelData.guild_id = this.id;
                client.channelGuildMap[channelData.id] = this.id;
                this.channels.add(Channel.from<AnyGuildChannelWithoutThreads>(channelData, client)).guild = this;
            }
        }

        if (data.threads) {
            for (const threadData of data.threads) {
                threadData.guild_id = this.id;
                this.threads.add(Channel.from<AnyThreadChannel>(threadData, client)).guild = this;
                client.threadGuildMap[threadData.id] = this.id;
            }
        }

        if (data.members) {
            for (const member of data.members) {
                this.members.update({ ...member, id: member.user!.id }, this.id).guild = this;
            }
        }

        if (data.stage_instances) {
            for (const stageInstance of data.stage_instances) {
                stageInstance.guild_id = this.id;
                this.stageInstances.update(stageInstance).guild = this;
            }
        }

        if (data.presences) {
            for (const presence of data.presences) {
                const member = this.members.get(presence.user.id);
                if (member) {
                    delete (presence as { user?: PresenceUpdate["user"]; }).user;
                    member.presence = presence;
                } else {
                    client.emit("debug", `Rogue presence (user: ${presence.user.id}, guild: ${this.id})`);
                }
            }
        }

        if (data.voice_states) {
            for (const voiceState of data.voice_states) {
                if (!this.members.has(voiceState.user_id) || !voiceState.channel_id) continue;
                voiceState.guild_id = this.id;
                const state = this.voiceStates.update({ ...voiceState, id: voiceState.user_id });
                state.guild = this;
                const channel = this.channels.get(voiceState.channel_id) as VoiceChannel | StageChannel;
                state.channel = channel;
                const member = this.members.update({ id: voiceState.user_id, deaf: voiceState.deaf, mute: voiceState.mute }, this.id);
                if (channel && "voiceMembers" in channel) channel.voiceMembers.add(member);
                // @TODO voice
                /* if (client.shards.options.seedVoiceConnections && voiceState.user_id === client.user!.id && !client.voiceConnections.has(this.id)) {
                    process.nextTick(() => client.joinVoiceChannel(voiceState.channel_id!));
                } */
            }
        }
    }

    // true = `memberCount`
    private updateMemberLimit(toAdd: true | number) {
        const original = this.members.limit;
        const num = toAdd === true ? this.memberCount : this.members.limit + toAdd;
        const round = 10 ** (Math.floor(Math.log10(num)) - 1);
        if (toAdd === true) {
            const limit = Math.round(num / round) * round + round;
            if (this.members.limit >= limit) return;
            this.members.limit = limit;
        } else {
            const limit = Math.round((this.members.size + toAdd) / round) * round + round;
            if (this.members.limit >= limit) return;
            this.members.limit = limit;
        }
        this.client.emit("debug", `The limit of the members collection of guild ${this.id} has been updated from ${original} to ${this.members.limit} to accomidate at least ${toAdd === true ? this.memberCount : this.members.size + toAdd} members.`);
    }

    protected update(data: Partial<RawGuild>) {
        if (data.afk_channel_id !== undefined) this.afkChannel = data.afk_channel_id === null ? null : this.client.getChannel(data.afk_channel_id) || { id: data.afk_channel_id };
        if (data.afk_timeout !== undefined) this.afkTimeout = data.afk_timeout;
        if (data.application_id !== undefined) this.application = data.application_id === null ? null : this.client.application?.id === data.application_id ? this.client.application : { id: data.application_id };
        if (data.approximate_member_count !== undefined) this.approximateMemberCount = data.approximate_member_count;
        if (data.approximate_presence_count !== undefined) this.approximatePresenceCount = data.approximate_presence_count;
        if (data.banner !== undefined) this.banner = data.banner;
        if (data.default_message_notifications !== undefined) this.defaultMessageNotifications = data.default_message_notifications;
        if (data.description !== undefined) this.description = data.description;
        if (data.discovery_splash !== undefined) this.discoverySplash = data.discovery_splash;
        if (data.emojis !== undefined) this.emojis = data.emojis.map(emoji => ({
            ...emoji,
            user: !emoji.user ? undefined : this.client.users.update(emoji.user)
        }));
        if (data.explicit_content_filter !== undefined) this.explicitContentFilter = data.explicit_content_filter;
        if (data.features !== undefined) this.features = data.features;
        if (data.icon !== undefined) this.icon = data.icon;
        if (data.joined_at !== undefined) this.joinedAt = new Date(data.joined_at);
        if (data.max_members !== undefined) this.maxMembers = data.max_members;
        if (data.max_presences !== undefined) this.maxPresences = data.max_presences;
        if (data.max_video_channel_users !== undefined) this.maxVideoChannelUsers = data.max_video_channel_users;
        if (data.member_count !== undefined) this.memberCount = data.member_count;
        if (data.mfa_level !== undefined) this.mfaLevel = data.mfa_level;
        if (data.name !== undefined) this.name = data.name;
        if (data.nsfw_level !== undefined) this.nsfwLevel = data.nsfw_level;
        if (data.owner !== undefined) this.oauthOwner = data.owner;
        if (data.owner_id !== undefined) this.owner = this.client.users.get(data.owner_id) || { id: data.owner_id };
        if (data.permissions !== undefined) this.permissions = new Permission(data.permissions);
        if (data.preferred_locale !== undefined) this.preferredLocale = data.preferred_locale;
        if (data.premium_progress_bar_enabled !== undefined) this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
        if (data.premium_subscription_count !== undefined) this.premiumSubscriptionCount = data.premium_subscription_count;
        if (data.premium_tier !== undefined) this.premiumTier = data.premium_tier;
        if (data.public_updates_channel_id !== undefined) this.publicUpdatesChannel = data.public_updates_channel_id === null ? null : this.client.getChannel(data.public_updates_channel_id) || { id: data.public_updates_channel_id };
        if (data.region !== undefined) this.region = data.region;
        if (data.rules_channel_id !== undefined) this.rulesChannel = data.rules_channel_id === null ? null : this.client.getChannel(data.rules_channel_id) || { id: data.rules_channel_id };
        if (data.splash !== undefined) this.splash = data.splash;
        if (data.stickers !== undefined) this.stickers = data.stickers;
        if (data.system_channel_flags !== undefined) this.systemChannelFlags = data.system_channel_flags;
        if (data.system_channel_id !== undefined) this.systemChannel = data.system_channel_id === null ? null : this.client.getChannel(data.system_channel_id) || { id: data.system_channel_id };
        if (data.vanity_url_code !== undefined) this.vanityURLCode = data.vanity_url_code;
        if (data.verification_level !== undefined) this.verificationLevel = data.verification_level;
        if (data.welcome_screen !== undefined) this.welcomeScreen = {
            description:     data.welcome_screen.description,
            welcomeChannels: data.welcome_screen.welcome_channels.map(channel => ({
                channelID:   channel.channel_id,
                description: channel.description,
                emojiID:     channel.emoji_id,
                emojiName:   channel.emoji_name
            }))
        };
        if (data.widget_channel_id !== undefined) this.widgetChannel = data.widget_channel_id === null ? null : this.client.getChannel(data.widget_channel_id) || { id: data.widget_channel_id };
        if (data.widget_enabled !== undefined) this.widgetEnabled = data.widget_enabled;
    }

    /** The shard this guild is on. Gateway only. */
    get shard() { return this.client.shards.get(this.client.guildShardMap[this.id])!; }

    /**
     * Add a member to this guild. Requires an access token with the `guilds.join` scope.
     *
     * Returns the newly added member upon success, or void if the member is already in the guild.
     * @param userID The ID of the user to add.
     * @param options The options for adding the member.
     */
    async addMember(userID: string, options: AddMemberOptions) {
        return this.client.rest.guilds.addMember(this.id, userID, options);
    }

    /**
     * Add a role to a member.
     * @param memberID The ID of the member.
     * @param roleID The ID of the role to add.
     * @param reason The reason for adding the role.
     */
    async addMemberRole(memberID: string, roleID: string, reason?: string) {
        return this.client.rest.guilds.addMemberRole(this.id, memberID, roleID, reason);
    }

    /**
     * The url of this guild's banner.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    bannerURL(format?: ImageFormat, size?: number) {
        return this.banner === null ? null : this.client.util.formatImage(Routes.BANNER(this.id, this.banner), format, size);
    }

    /**
     * Begine a prune.
     * @param options The options for the prune.
     */
    async beginPrune(options?: BeginPruneOptions) {
        return this.client.rest.guilds.beginPrune(this.id, options);
    }

    /**
     * Create an auto moderation rule for this guild.
     * @param options The options for the rule.
     */
    async createAutoModerationRule(options: CreateAutoModerationRuleOptions) {
        return this.client.rest.guilds.createAutoModerationRule(this.id, options);
    }

    /**
     * Create a bon for a user.
     * @param userID The ID of the user.
     * @param options The options for creating the bon.
     */
    async createBan(userID: string, options?: CreateBanOptions) {
        return this.client.rest.guilds.createBan(this.id, userID, options);
    }

    /**
     * Create a channel in this guild.
     * @param options The options for creating the channel.
     */
    async createChannel<T extends GuildChannelTypesWithoutThreads>(type: T, options: Omit<CreateChannelOptions, "type">) {
        return this.client.rest.guilds.createChannel(this.id, type, options);
    }

    /**
     * Create an emoji in this guild.
     * @param options The options for creating the emoji.
     */
    async createEmoji(options: CreateEmojiOptions) {
        return this.client.rest.guilds.createEmoji(this.id, options);
    }

    /**
     * Create a role.
     * @param options The options for creating the role.
     */
    async createRole(options?: CreateRoleOptions) {
        return this.client.rest.guilds.createRole(this.id, options);
    }

    /**
     * Create a scheduled event in this guild.
     * @param options The options for creating the scheduled event.
     */
    async createScheduledEvent(options: CreateScheduledEventOptions) {
        return this.client.rest.guilds.createScheduledEvent(this.id, options);
    }

    /**
     * Create a guild template.
     * @param options The options for creating the template.
     */
    async createTemplate(options: CreateTemplateOptions) {
        return this.client.rest.guilds.createTemplate(this.id, options);
    }

    /**
     * Delete this guild.
     */
    async delete() {
        return this.client.rest.guilds.delete(this.id);
    }

    /**
     * Delete an auto moderation rule in this guild.
     * @param ruleID The ID of the rule to delete.
     * @param reason The reason for deleting the rule.
     */
    async deleteAutoModerationRule(ruleID: string, reason?: string) {
        return this.client.rest.guilds.deleteAutoModerationRule(this.id, ruleID, reason);
    }

    /**
     * Delete an emoji in this guild.
     * @param emojiID The ID of the emoji.
     * @param reason The reason for deleting the emoji.
     */
    async deleteEmoji(emojiID: string, reason?: string) {
        return this.client.rest.guilds.deleteEmoji(this.id, emojiID, reason);
    }

    /**
     * Delete an integration.
     * @param integrationID The ID of the integration.
     * @param reason The reason for deleting the integration.
     */
    async deleteIntegration(integrationID: string, reason?: string) {
        return this.client.rest.guilds.deleteIntegration(this.id, integrationID, reason);
    }

    /**
     * Delete a role.
     * @param roleID The ID of the role to delete.
     * @param reason The reason for deleting the role.
     */
    async deleteRole(roleID: string, reason?: string) {
        return this.client.rest.guilds.deleteRole(this.id, roleID, reason);
    }

    /**
     * Delete a scheduled event.
     * @param eventID The ID of the scheduled event.
     * @param reason The reason for deleting the scheduled event. Discord's docs do not explicitly state a reason can be provided, so it may not be used.
     */
    async deleteScheduledEvent(eventID: string, reason?: string) {
        return this.client.rest.guilds.deleteScheduledEvent(this.id, eventID, reason);
    }

    /**
     * Delete a template.
     * @param code The code of the template.
     */
    async deleteTemplate(code: string) {
        return this.client.rest.guilds.deleteTemplate(this.id, code);
    }

    /**
     * Edit this guild.
     * @param options The options for editing the guild.
     */
    async edit(options: EditGuildOptions) {
        return this.client.rest.guilds.edit(this.id, options);
    }

    /**
     * Edit an existing auto moderation rule in this guild.
     * @param ruleID The ID of the rule to edit.
     * @param options The options for editing the rule.
     */
    async editAutoModerationRule(ruleID: string, options: EditAutoModerationRuleOptions) {
        return this.client.rest.guilds.editAutoModerationRule(this.id, ruleID, options);
    }

    /**
     * Edit the positions of channels in this guild.
     * @param options The channels to move. Unedited channels do not need to be specifed.
     */
    async editChannelPositions(options: Array<ModifyChannelPositionsEntry>) {
        return this.client.rest.guilds.editChannelPositions(this.id, options);
    }

    /**
     * Modify the current member in this guild.
     * @param options The options for editing the member.
     */
    async editCurrentMember(options: EditCurrentMemberOptions) {
        return this.client.rest.guilds.editCurrentMember(this.id, options);
    }

    /**
     * Edit the current member's voice state in this guild. `channelID` is required, and the current member must already be in that channel. See [Discord's docs](https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state-caveats) for more information.
     * @param options The options for editing the voice state.
     */
    async editCurrentUserVoiceState(options: EditCurrentUserVoiceStateOptions) {
        return this.client.rest.guilds.editCurrentUserVoiceState(this.id, options);
    }
    /**
     * Edit an existing emoji in this guild.
     * @param options The options for editing the emoji.
     */
    async editEmoji(emojiID: string, options: EditEmojiOptions) {
        return this.client.rest.guilds.editEmoji(this.id, emojiID, options);
    }

    /**
     * Edit the [mfa level](https://discord.com/developers/docs/resources/guild#guild-object-mfa-level) of this guild. This can only be used by the guild owner.
     * @param level The new MFA level.
     */
    async editMFALevel(level: MFALevels) {
        return this.client.rest.guilds.editMFALevel(this.id, level);
    }

    /**
     * Edit a member of this guild.
     * @param memberID The ID of the member.
     * @param options The options for editing the member.
     */
    async editMember(memberID: string, options: EditMemberOptions) {
        return this.client.rest.guilds.editMember(this.id, memberID, options);
    }

    /**
     * Edit an existing role.
     * @param options The options for editing the role.
     */
    async editRole(roleID: string, options: EditRoleOptions) {
        return this.client.rest.guilds.editRole(this.id, roleID, options);
    }

    /**
     * Edit the position of roles in this guild.
     * @param options The roles to move.
     */
    async editRolePositions(options: Array<EditRolePositionsEntry>, reason?: string) {
        return this.client.rest.guilds.editRolePositions(this.id, options, reason);
    }

    /**
     * Edit an existing scheduled event in this guild.
     * @param options The options for editing the scheduled event.
     */
    async editScheduledEvent(options: EditScheduledEventOptions) {
        return this.client.rest.guilds.editScheduledEvent(this.id, options);
    }

    /**
     * Edit a template.
     * @param code The code of the template.
     * @param options The options for editing the template.
     */
    async editTemplate(code: string, options: EditGuildTemplateOptions) {
        return this.client.rest.guilds.editTemplate(this.id, code, options);
    }

    /**
     * Edit a guild member's voice state. `channelID` is required, and the user must already be in that channel. See [Discord's docs](https://discord.com/developers/docs/resources/guild#modify-user-voice-state) for more information.
     * @param memberID The ID of the member.
     * @param options The options for editing the voice state.
     */
    async editUserVoiceState(memberID: string, options: EditUserVoiceStateOptions) {
        return this.client.rest.guilds.editUserVoiceState(this.id, memberID, options);
    }

    /**
     * Edit the welcome screen in this guild.
     * @param options The options for editing the welcome screen.
     */
    async editWelcomeScreen(options: EditWelcomeScreenOptions) {
        return this.client.rest.guilds.editWelcomeScreen(this.id, options);
    }

    /**
     * Edit the widget of this guild.
     * @param options The options for editing the widget.
     */
    async editWidget(options: WidgetSettings) {
        return this.client.rest.guilds.editWidget(this.id, options);
    }

    /**
     * Request members from this guild.
     * @param options The options for fetching the members.
     */
    async fetchMembers(options?: RequestGuildMembersOptions) {
        return this.shard.requestGuildMembers(this.id, options);
    }

    /**
     * Get the active threads in this guild.
     */
    async getActiveThreads() {
        return this.client.rest.guilds.getActiveThreads(this.id);
    }

    /**
     * Get this guild's audit log.
     * @param options The options for the audit log.
     */
    async getAuditLog(options?: GetAuditLogOptions) {
        return this.client.rest.guilds.getAuditLog(this.id, options);
    }

    /**
     * Get an auto moderation rule for this guild.
     * @param ruleID The ID of the rule to get.
     */
    async getAutoModerationRule(ruleID: string) {
        return this.client.rest.guilds.getAutoModerationRule(this.id, ruleID);
    }

    /**
     * Get the auto moderation rules for this guild.
     */
    async getAutoModerationRules() {
        return this.client.rest.guilds.getAutoModerationRules(this.id);
    }

    /**
     * Get a ban in this guild.
     * @param userID The ID of the user to get the ban of.
     */
    async getBan(userID: string) {
        return this.client.rest.guilds.getBan(this.id, userID);
    }

    /**
     * Get the bans in this guild.
     * @param options The options for getting the bans.
     */
    async getBans(options?: GetBansOptions) {
        return this.client.rest.guilds.getBans(this.id, options);
    }

    /**
     * Get the channels in a guild. Does not include threads. Only use this if you need to. See the `channels` collection.
     */
    async getChannels() {
        return this.client.rest.guilds.getChannels(this.id);
    }

    /**
     * Get an emoji in this guild.
     * @param emojiID The ID of the emoji to get.
     */
    async getEmoji(emojiID: string) {
        return this.client.rest.guilds.getEmoji(this.id, emojiID);
    }

    /**
     * Get the emojis in this guild.
     */
    async getEmojis() {
        return this.client.rest.guilds.getEmojis(this.id);
    }

    /**
     * Get the integrations in this guild.
     */
    async getIntegrations() {
        return this.client.rest.guilds.getIntegrations(this.id);
    }

    /**
     * Get the invites of this guild.
     */
    async getInvites() {
        return this.client.rest.guilds.getInvites(this.id);
    }

    /**
     * Get a member of this guild.
     * @param memberID The ID of the member.
     */
    async getMember(memberID: string) {
        return this.client.rest.guilds.getMember(this.id, memberID);
    }

    /**
     * Get this guild's members. This requires the `GUILD_MEMBERS` intent.
     * @param options The options for getting the members.
     */
    async getMembers(options?: GetMembersOptions) {
        return this.client.rest.guilds.getMembers(this.id, options);
    }

    /**
     * Get a preview of this guild.
     */
    async getPreview() {
        return this.client.rest.guilds.getPreview(this.id);
    }

    /**
     * Get the prune count of this guild.
     * @param options The options for getting the prune count.
     */
    async getPruneCount(options?: GetPruneCountOptions) {
        return this.client.rest.guilds.getPruneCount(this.id, options);
    }

    /**
     * Get the roles in this guild. Only use this if you need to. See the `roles` collection.
     */
    async getRoles() {
        return this.client.rest.guilds.getRoles(this.id);
    }

    /**
     * Get a scheduled event.
     * @param eventID The ID of the scheduled event to get.
     * @param withUserCount If the number of users subscribed to the event should be included.
     */
    async getScheduledEvent(eventID: string, withUserCount?: number) {
        return this.client.rest.guilds.getScheduledEvent(this.id, eventID, withUserCount);
    }

    /**
     * Get the users subscribed to a scheduled event.
     * @param eventID The ID of the scheduled event to get the users of.
     * @param options The options for getting the users.
     */
    async getScheduledEventUsers(eventID: string, options?: GetScheduledEventUsersOptions) {
        return this.client.rest.guilds.getScheduledEventUsers(this.id, eventID, options);
    }

    /**
     * Get this guild's scheduled events
     * @param withUserCount If the number of users subscribed to the event should be included.
     */
    async getScheduledEvents(withUserCount?: number) {
        return this.client.rest.guilds.getScheduledEvents(this.id, withUserCount);
    }

    /**
     * Get this guild's templates.
     */
    async getTemplates() {
        return this.client.rest.guilds.getTemplates(this.id);
    }

    /**
     * Get the vanity url of this guild.
     */
    async getVanityURL() {
        return this.client.rest.guilds.getVanityURL(this.id);
    }

    /**
     * Get the list of usable voice regions for this guild. This will return VIP servers when the guild is VIP-enabled.
     */
    async getVoiceRegions() {
        return this.client.rest.guilds.getVoiceRegions(this.id);
    }

    /**
     * Get the welcome screen for this guild.
     */
    async getWelcomeScreen() {
        return this.client.rest.guilds.getWelcomeScreen(this.id);
    }

    /**
     * Get the widget of this guild.
     */
    async getWidget() {
        return this.client.rest.guilds.getWidget(this.id);
    }

    /**
     * Get the widget image of this guild.
     * @param style The style of the image.
     */
    async getWidgetImage(style?: WidgetImageStyle) {
        return this.client.rest.guilds.getWidgetImage(this.id, style);
    }

    /**
     * Get the raw JSON widget of this guild.
     */
    async getWidgetJSON() {
        return this.client.rest.guilds.getWidgetJSON(this.id);
    }

    /**
     * Get this guild's widget settings.
     */
    async getWidgetSettings() {
        return this.client.rest.guilds.getWidgetSettings(this.id);
    }

    /**
     * The url of this guild's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    iconURL(format?: ImageFormat, size?: number) {
        return this.icon === null ? null : this.client.util.formatImage(Routes.GUILD_ICON(this.id, this.icon), format, size);
    }

    /**
     * Leave this guild.
     */
    async leave() {
        return this.client.rest.guilds.delete(this.id);
    }

    /**
     * Get the permissions of a member. If providing an id, the member must be cached.
     * @param member The member to get the permissions of.
     */
    permissionsOf(member: string | Member) {
        if (typeof member === "string") member = this.members.get(member)!;
        if (!member) throw new Error("Member not found");
        if (member.id === this.owner.id) return new Permission(AllPermissions);
        else {
            let permissions = this.roles.get(this.id)!.permissions.allow;
            if (permissions & Permissions.ADMINISTRATOR) return new Permission(AllPermissions);
            for (const id of member.roles) {
                const role = this.roles.get(id);
                if (!role) continue;
                if (role.permissions.allow & Permissions.ADMINISTRATOR) {
                    permissions = AllPermissions;
                    break;
                } else permissions |= role.permissions.allow;
            }
            return new Permission(permissions);
        }
    }

    /**
     * Remove a ban.
     * @param userID The ID of the user to remove the ban from.
     * @param reason The reason for removing the ban.
     */
    async removeBan(userID: string, reason?: string) {
        return this.client.rest.guilds.removeBan(this.id, userID, reason);
    }

    /**
     * Remove a member from this guild.
     * @param memberID The ID of the user to remove.
     * @param reason The reason for the removal.
     */
    async removeMember(memberID: string, reason?: string) {
        return this.client.rest.guilds.removeMember(this.id, memberID, reason);
    }

    /**
     * remove a role from a member.
     * @param memberID The ID of the member.
     * @param roleID The ID of the role to remove.
     * @param reason The reason for removing the role.
     */
    async removeMemberRole(memberID: string, roleID: string, reason?: string) {
        return this.client.rest.guilds.removeMemberRole(this.id, memberID, roleID, reason);
    }

    /**
     * Search the username & nicknames of members in this guild.
     * @param options The options for the search.
     */
    async searchMembers(options: SearchMembersOptions) {
        return this.client.rest.guilds.searchMembers(this.id, options);
    }

    /**
     * Sync a guild template.
     * @param code The code of the template to sync.
     */
    async syncTemplate(code: string) {
        return this.client.rest.guilds.syncTemplate(this.id, code);
    }

    override toJSON(): JSONGuild {
        return {
            ...super.toJSON(),
            afkChannel:                  this.afkChannel?.id || null,
            afkTimeout:                  this.afkTimeout,
            application:                 this.application?.id,
            approximateMemberCount:      this.approximateMemberCount,
            approximatePresenceCount:    this.approximatePresenceCount,
            autoModerationRules:         this.autoModerationRules.map(rule => rule.toJSON()),
            banner:                      this.banner,
            channels:                    this.channels.map(channel => channel.id),
            defaultMessageNotifications: this.defaultMessageNotifications,
            description:                 this.description,
            discoverySplash:             this.discoverySplash,
            emojis:                      this.emojis,
            explicitContentFilter:       this.explicitContentFilter,
            features:                    this.features,
            icon:                        this.icon,
            joinedAt:                    this.joinedAt?.getTime() || null,
            large:                       this.large,
            maxMembers:                  this.maxMembers,
            maxPresences:                this.maxPresences,
            maxVideoChannelUsers:        this.maxVideoChannelUsers,
            memberCount:                 this.memberCount,
            members:                     this.members.map(member => member.id),
            mfaLevel:                    this.mfaLevel,
            name:                        this.name,
            nsfwLevel:                   this.nsfwLevel,
            owner:                       this.owner?.id,
            permissions:                 this.permissions?.toJSON(),
            preferredLocale:             this.preferredLocale,
            premiumProgressBarEnabled:   this.premiumProgressBarEnabled,
            premiumSubscriptionCount:    this.premiumSubscriptionCount,
            premiumTier:                 this.premiumTier,
            publicUpdatesChannel:        this.publicUpdatesChannel?.id || null,
            region:                      this.region,
            roles:                       this.roles.map(role => role.toJSON()),
            rulesChannel:                this.rulesChannel?.id || null,
            scheduledEvents:             this.scheduledEvents.map(event => event.toJSON()),
            splash:                      this.splash,
            stageInstances:              this.stageInstances.map(instance => instance.toJSON()),
            stickers:                    this.stickers,
            systemChannel:               this.systemChannel?.id || null,
            systemChannelFlags:          this.systemChannelFlags,
            threads:                     this.threads.map(thread => thread.id),
            unavailable:                 this.unavailable,
            vanityURLCode:               this.vanityURLCode,
            verificationLevel:           this.verificationLevel,
            voiceStates:                 this.voiceStates.map(state => state.toJSON()),
            welcomeScreen:               this.welcomeScreen,
            widgetChannel:               this.widgetChannel === null ? null : this.widgetChannel?.id,
            widgetEnabled:               this.widgetEnabled
        };
    }
}
