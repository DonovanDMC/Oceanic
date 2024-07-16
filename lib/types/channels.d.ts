/** @module Types/Channels */
import type { NullablePartialEmoji, PartialEmoji, RawInviteGuild, RawMember } from "./guilds";
import type { RawApplication, RawPartialApplication } from "./applications";
import type { RawUser, RawUserWithMember } from "./users";
import type { File } from "./request-handler";
import type { RawScheduledEvent } from "./scheduled-events";
import { type  Uncached } from "./shared";
import type { AuthorizingIntegrationOwners, SelectMenuDefaultValue } from "./interactions";
import type { Nullable } from "./misc";
import type {
    ButtonStyles,
    ChannelTypes,
    ComponentTypes,
    InteractionTypes,
    InviteTargetTypes,
    MessageActivityTypes,
    MessageTypes,
    OverwriteTypes,
    SelectMenuTypes,
    SortOrderTypes,
    StickerFormatTypes,
    TextInputStyles,
    ThreadAutoArchiveDuration,
    VideoQualityModes,
    ForumLayoutTypes,
    ChannelTypeMap,
    PrivateChannelTypes,
    NotImplementedChannelTypes,
    GuildChannelTypes,
    ThreadChannelTypes,
    GuildChannelsWithoutThreadsTypes,
    EditableChannelTypes,
    TextableChannelTypes,
    TextableGuildChannelTypes,
    TextableChannelsWithoutThreadsTypes,
    TextableGuildChannelsWithoutThreadsTypes,
    VoiceChannelTypes,
    InteractionChannelTypes,
    InviteChannelTypes,
    ImplementedChannelTypes,
    ThreadOnlyChannelTypes,
    ReactionType,
    PollLayoutType
} from "../Constants";
import type Member from "../structures/Member";
import type AnnouncementChannel from "../structures/AnnouncementChannel";
import type AnnouncementThreadChannel from "../structures/AnnouncementThreadChannel";
import type PrivateThreadChannel from "../structures/PrivateThreadChannel";
import type PublicThreadChannel from "../structures/PublicThreadChannel";
import type TextChannel from "../structures/TextChannel";
import type User from "../structures/User";
import type ForumChannel from "../structures/ForumChannel";
import type Message from "../structures/Message";
import type Guild from "../structures/Guild";
import type Invite from "../structures/Invite";
import type Attachment from "../structures/Attachment";

export interface RawChannel {
    application_id?: string;
    applied_tags?: Array<string>;
    available_tags?: Array<RawForumTag>;
    bitrate?: number;
    default_auto_archive_duration?: ThreadAutoArchiveDuration;
    default_forum_layout?: ForumLayoutTypes;
    default_reaction_emoji?: {
        emoji_id: string | null;
        emoji_name: string | null;
    } | null;
    default_sort_order?: SortOrderTypes | null;
    default_thread_rate_limit_per_user?: number;
    flags?: number;
    guild_id?: string;
    icon?: string | null;
    id: string;
    last_message_id?: string | null;
    last_pin_timestamp?: string | null;
    managed?: boolean;
    member?: RawChannelThreadMember;
    member_count?: number;
    message_count?: number;
    name?: string | null;
    newly_created?: boolean;
    nsfw?: boolean;
    owner_id?: string;
    parent_id?: string | null;
    permission_overwrites?: Array<RawOverwrite>;
    permissions?: string;
    position?: number;
    rate_limit_per_user?: number;
    recipients?: Array<RawUser>;
    rtc_region?: string | null;
    status?: string | null;
    thread_metadata?: RawThreadMetadata;
    topic?: string | null;
    total_message_sent?: number;
    type: ChannelTypes;
    user_limit?: number;
    video_quality_mode?: VideoQualityModes;
}
export interface RawGuildChannel extends Required<Pick<RawChannel, "id" | "guild_id" | "parent_id">> { name: string; type: GuildChannels; }
export interface RawPrivateChannel extends Required<Pick<RawChannel, "id" | "last_message_id" | "recipients">> { type: ChannelTypes.DM; }
// nicks is undocumented, creating a group dm DOES work, and they show in the client, so we're supporting them
export interface RawGroupChannel extends Required<Pick<RawChannel, "id" | "recipients" | "application_id" | "icon" | "owner_id" | "nsfw" | "last_message_id">> { managed: boolean; name: string; nicks?: Array<Record<"id" | "nick", string>>; type: ChannelTypes.GROUP_DM; }
export interface RawTextChannel extends Omit<RawGuildChannel, "type">, Required<Pick<RawChannel, "default_auto_archive_duration" | "last_message_id" | "last_pin_timestamp" | "rate_limit_per_user" | "topic" | "nsfw" | "permission_overwrites" | "position">> { type: ChannelTypes.GUILD_TEXT; }
export interface RawCategoryChannel extends Omit<RawGuildChannel, "type">, Required<Pick<RawChannel,  "permission_overwrites" | "position">> { type: ChannelTypes.GUILD_CATEGORY; }
export interface RawAnnouncementChannel extends Omit<RawTextChannel, "type"> { type: ChannelTypes.GUILD_ANNOUNCEMENT; }
export interface RawVoiceChannel extends Omit<RawGuildChannel, "type">, Required<Pick<RawChannel, "bitrate" | "user_limit" | "video_quality_mode" | "rtc_region" | "nsfw" | "topic" | "permission_overwrites" | "position" | "last_message_id" | "rate_limit_per_user" | "status">> { type: ChannelTypes.GUILD_VOICE; }
export interface RawStageChannel extends Omit<RawVoiceChannel, "type"> { type: ChannelTypes.GUILD_STAGE_VOICE; }
export type RawThreadChannel = RawAnnouncementThreadChannel | RawPublicThreadChannel | RawPrivateThreadChannel;
export interface RawAnnouncementThreadChannel extends Required<Pick<RawChannel, "id" | "guild_id" | "parent_id" | "owner_id" | "last_message_id" | "thread_metadata" | "message_count" | "member_count" | "rate_limit_per_user" | "flags" | "total_message_sent" | "newly_created" | "member">> { name: string; type: ChannelTypes.ANNOUNCEMENT_THREAD; }
export interface RawPublicThreadChannel extends Omit<RawAnnouncementThreadChannel, "type">, Required<Pick<RawChannel, "applied_tags">> { type: ChannelTypes.PUBLIC_THREAD; }
export interface RawPrivateThreadChannel extends Omit<RawAnnouncementThreadChannel, "type" | "member"> { member: RawChannel["member"]; type: ChannelTypes.PRIVATE_THREAD; }
export interface RawThreadOnlyChannel extends Omit<RawGuildChannel, "type">, Required<Pick<RawChannel, "position" | "topic" | "flags" | "permission_overwrites" | "rate_limit_per_user" | "nsfw" | "available_tags" | "default_reaction_emoji" | "last_message_id" | "default_sort_order" | "default_thread_rate_limit_per_user" | "default_auto_archive_duration" | "default_forum_layout">> { type: ThreadOnlyChannels; }
export interface RawForumChannel extends Omit<RawThreadOnlyChannel, "type"> { type: ChannelTypes.GUILD_FORUM; }
export interface RawMediaChannel extends Omit<RawThreadOnlyChannel, "type"> { type: ChannelTypes.GUILD_MEDIA; }

export interface PartialChannel extends Pick<RawChannel, "id" | "name" | "type"> {}
export interface RawInteractionResolvedChannel extends Omit<Required<Pick<RawChannel, "id" | "type">>, "name">, Pick<RawChannel, "thread_metadata" | "parent_id" | "permissions"> { name: string | null; }

export interface RawOverwrite {
    allow: string;
    deny: string;
    id: string;
    type: OverwriteTypes;
}

export interface Overwrite {
    allow: string | bigint;
    deny: string | bigint;
    id: string;
    type: OverwriteTypes;
}

export interface OverwriteOptions {
    /** The permissions to allow. */
    allow?: string | bigint | null;
    /** The permissions to deny. */
    deny?: string | bigint | null;
    /** The ID of the user or role to apply the permissions to. */
    id: string;
    /** `0` for role, `1` for user. */
    type: OverwriteTypes;
}

export interface RawThreadMetadata {
    archive_timestamp: string;
    archived: boolean;
    auto_archive_duration: ThreadAutoArchiveDuration;
    create_timestamp?: string | null;
    invitable?: boolean;
    locked: boolean;
}

export interface RawThreadMember {
    flags: number;
    id: string;
    join_timestamp: string;
    member?: RawMember;
    user_id: string;
}
export type RawChannelThreadMember = Pick<RawThreadMember, "flags" | "join_timestamp">;

export interface ThreadMember extends UncachedThreadMember {
    /** The flags for this thread member. Used for notifications. */
    flags: number;
    /** The time at which this member joined the thread. */
    joinTimestamp: Date;
    /** The guild member associated with this thread member, if fetched with `withMember` set to true. */
    member?: Member;
}

export interface GetThreadMembersOptions {
    /** Get members after this member id. */
    after?: string;
    /** The maximum number of thread members returned, defaults to 100. */
    limit?: number;
    /** If the results should include a `member` object. This also enables pagination. */
    withMember?: boolean;
}

export interface UncachedThreadMember {
    /** The ID of the thread this member is for. */
    id: string;
    /** The ID of the associated user. */
    userID: string;
}

export interface GatewayThreadMember {
    flags: number;
    joinTimestamp: Date;
}
export interface EditGroupDMOptions {
    /** [Group DM] The icon of the channel. */
    icon?: string | Buffer;
    /** The name of the channel. */
    name?: string;
}

export interface EditGuildChannelOptions {
    /** [Forum Thread] The ID of the forum available tags applied on the channel. A maximum of 5 can be applied. */
    appliedTags?: Array<string>;
    /** [Thread] If the thread is archived. */
    archived?: boolean;
    /** [Thread] The duration after which the thread will be archived. */
    autoArchiveDuration?: ThreadAutoArchiveDuration;
    /** [Forum] The {@link Types/Channels.ForumTag | tags} available in the channel. A maximum of 20 can be present. */
    availableTags?: Array<Omit<ForumTag, "id"> & {
        /** The ID of this tag. Omit if you want to create a new tag. */
        id?: string;
    }>;
    /** [Stage, Voice] The bitrate of the channel. Minimum 8000. */
    bitrate?: number | null;
    /** [Announcement, Text] The default auto archive duration for threads made in this channel. */
    defaultAutoArchiveDuration?: ThreadAutoArchiveDuration | null;
    /** [Forum] The default forum layout used to display threads. */
    defaultForumLayout?: ForumLayoutTypes;
    /** [Forum] The default reaction emoji for threads. */
    defaultReactionEmoji?: ForumEmoji | null;
    /** [Forum] The default sort order mode used to sort forum threads. */
    defaultSortOrder?: SortOrderTypes;
    /** [Text, Forum] The default reaction emoji for threads. */
    defaultThreadRateLimitPerUser?: number;
    /** [Forum, Forum Thread] The {@link Constants.ChannelFlags | Channel Flags} to set on the channel. */
    flags?: number;
    /** [Private Thread] If non-moderators can add other non-moderators to the thread. */
    invitable?: boolean;
    /** [Thread] If the thread should be locked. */
    locked?: boolean;
    /** The name of the channel. */
    name?: string;
    /** [Announcement, Text, Voice] If the channel is age gated. */
    nsfw?: string | null;
    /** [Announcement, Forum, Text, Voice] The id of the parent category channel. */
    parentID?: string | null;
    /** Channel or category specific permissions. */
    permissionOverwrites?: Array<OverwriteOptions> | null;
    /** The position of the channel in the channel list. */
    position?: number | null;
    /** [Forum, Text, Thread] The seconds between sending messages for users. Between 0 and 21600. */
    rateLimitPerUser?: number | null;
    /** The reason to be displayed in the audit log. */
    reason?: string;
    /** [Stage, Voice] The voice region id of the channel, null for automatic. */
    rtcRegion?: string | null;
    /** [Announcement, Forum, Text, Voice] The topic of the channel. In forum channels, this is the `Guidelines` section. */
    topic?: string | null;
    /** [Announcement, Text] Provide the opposite type to convert the channel. */
    type?: ChannelTypes.GUILD_TEXT | ChannelTypes.GUILD_ANNOUNCEMENT;
    /** [Voice] The maximum amount of users in the channel. `0` is unlimited, values range 1-99. */
    userLimit?: number | null;
    /** [Voice] The [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) of the channel. */
    videoQualityMode?: VideoQualityModes | null;
}

export interface EditChannelOptions extends EditGroupDMOptions, EditGuildChannelOptions {}
export interface EditAnyGuildChannelOptions extends Pick<EditGuildChannelOptions, "name" | "position" | "permissionOverwrites"> {}
export interface EditTextChannelOptions extends EditAnyGuildChannelOptions, Pick<EditGuildChannelOptions, "topic" | "nsfw" | "rateLimitPerUser" | "parentID" | "defaultAutoArchiveDuration"> { type?: ChannelTypes.GUILD_ANNOUNCEMENT; }
export interface EditAnnouncementChannelOptions extends Omit<EditTextChannelOptions, "rateLimitPerUser" | "type"> { type?: ChannelTypes.GUILD_TEXT; }
export interface EditVoiceChannelOptions extends EditAnyGuildChannelOptions, Pick<EditGuildChannelOptions, "nsfw" | "bitrate" | "userLimit" | "parentID" | "rtcRegion" | "videoQualityMode"> {}
export interface EditStageChannelOptions extends EditAnyGuildChannelOptions, Pick<EditGuildChannelOptions, "bitrate" | "rtcRegion"> {}
export interface EditThreadChannelOptions extends EditPublicThreadChannelOptions, EditPrivateThreadChannelOptions {}
export interface EditPublicThreadChannelOptions extends Pick<EditGuildChannelOptions, "name" | "archived" | "autoArchiveDuration" | "locked" | "rateLimitPerUser" | "flags" | "appliedTags"> {}
export interface EditPrivateThreadChannelOptions extends EditPublicThreadChannelOptions, Pick<EditGuildChannelOptions, "invitable"> {}
export interface EditForumChannelOptions extends EditAnyGuildChannelOptions, Pick<EditGuildChannelOptions, "availableTags" | "defaultReactionEmoji" | "defaultSortOrder" |"defaultThreadRateLimitPerUser" | "flags" | "nsfw"  | "rateLimitPerUser" | "topic" | "defaultForumLayout"> {}
export interface EditMediaChannelOptions extends EditAnyGuildChannelOptions, Pick<EditGuildChannelOptions, "availableTags" | "defaultReactionEmoji" | "defaultSortOrder" |"defaultThreadRateLimitPerUser" | "flags" | "nsfw"  | "rateLimitPerUser" | "topic"> {}

/* eslint-disable @typescript-eslint/member-ordering */
export interface EditChannelOptionsMap {
    [ChannelTypes.GUILD_TEXT]: EditTextChannelOptions;
    [ChannelTypes.DM]: never;
    [ChannelTypes.GUILD_VOICE]: EditVoiceChannelOptions;
    [ChannelTypes.GROUP_DM]: EditGroupDMOptions;
    [ChannelTypes.GUILD_CATEGORY]: EditAnyGuildChannelOptions;
    [ChannelTypes.GUILD_ANNOUNCEMENT]: EditAnnouncementChannelOptions;
    [ChannelTypes.ANNOUNCEMENT_THREAD]: EditPublicThreadChannelOptions;
    [ChannelTypes.PUBLIC_THREAD]: EditPublicThreadChannelOptions;
    [ChannelTypes.PRIVATE_THREAD]: EditPrivateThreadChannelOptions;
    [ChannelTypes.GUILD_STAGE_VOICE]: EditStageChannelOptions;
    [ChannelTypes.GUILD_DIRECTORY]: never;
    [ChannelTypes.GUILD_FORUM]: EditForumChannelOptions;
    [ChannelTypes.GUILD_MEDIA]: EditMediaChannelOptions;
}
/* eslint-enable @typescript-eslint/member-ordering */

export interface AddGroupRecipientOptions {
    /** The access token of the user to add. */
    accessToken: string;
    /** The nickname of the user to add. */
    nick?: string;
    /** The id of the user to add. */
    userID: string;
}

// make sure to add to ExecuteWebhookOptions & InteractionContent
export interface CreateMessageOptions {
    /** An object that specifies the allowed mentions in this message. */
    allowedMentions?: AllowedMentions;
    /** An array of [partial attachments](https://discord.com/developers/docs/resources/channel#attachment-object) related to the sent files. */
    attachments?: Array<MessageAttachment>;
    /** An array of [components](https://discord.com/developers/docs/interactions/message-components) to send. `snake_case` keys should be converted to `camelCase`, or passed through {@link Util.rawMessageComponents | Util#rawMessageComponents}. */
    components?: Array<MessageActionRow>;
    /** The content of the message. */
    content?: string;
    /** An array of [embeds](https://discord.com/developers/docs/resources/channel#embed-object) to send. `snake_case` keys should be converted to `camelCase`, or passed through {@link Util.rawEmbeds | Util#rawEmbeds}. */
    embeds?: Array<EmbedOptions>;
    /** If Discord should enforce the unique nonce. This prevents duplicate messages being sent within a few minutes. */
    enforceNonce?: boolean;
    /** The files to send. */
    files?: Array<File>;
    /** The [flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) to send with the message. */
    flags?: number;
    /** Reply to a message. */
    messageReference?: MessageReference;
    /** A unique number or string used to dedupe this message. `enforceNonce` must be set to true for Discord to dedupe message sends. */
    nonce?: string | number;
    /**
     * A poll to send. Messages with a poll cannot be edited.
     * @note As of [4/18/24](https://github.com/discord/discord-api-docs/pull/6746#issuecomment-2064810908), `attachments` cannot be sent with polls.
     */
    poll?: MessagePollOptions;
    /** The IDs of up to 3 stickers from the current guild to send. */
    stickerIDs?: Array<string>;
    /** If the message should be spoken aloud. */
    tts?: boolean;
}

export interface EmbedOptionsBase {
    color?: number;
    description?: string;
    timestamp?: string;
    title?: string;
    url?: string;
}

export interface RawEmbedOptions extends EmbedOptionsBase {
    author?: RawEmbedAuthorOptions;
    fields?: Array<EmbedField>;
    footer?: RawEmbedFooterOptions;
    image?: EmbedImageOptions;
    thumbnail?: EmbedImageOptions;
}

export interface EmbedOptions extends EmbedOptionsBase {
    author?: EmbedAuthorOptions;
    fields?: Array<EmbedField>;
    footer?: EmbedFooterOptions;
    image?: EmbedImageOptions;
    thumbnail?: EmbedImageOptions;
}

export interface EmbedBase extends EmbedOptionsBase {
    type?: EmbedType;
}

export interface RawEmbed extends EmbedBase {
    author?: RawEmbedAuthor;
    fields?: Array<EmbedField>;
    footer?: RawEmbedFooter;
    image?: RawEmbedImage;
    provider?: EmbedProvider;
    thumbnail?: RawEmbedImage;
    video?: RawEmbedVideo;
}

export interface Embed extends EmbedBase {
    author?: EmbedAuthor;
    fields?: Array<EmbedField>;
    footer?: EmbedFooter;
    image?: EmbedImage;
    provider?: EmbedProvider;
    thumbnail?: EmbedImage;
    video?: EmbedVideo;
}

export type EmbedType = "rich" | "image" | "video" | "gifv" | "article" | "link";

export interface EmbedAuthorBase {
    name: string;
    url?: string;
}

export interface RawEmbedAuthor extends EmbedAuthorBase {
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface EmbedAuthorOptions extends EmbedAuthorBase {
    iconURL?: string;
}

export interface RawEmbedAuthorOptions extends EmbedAuthorBase {
    icon_url?: string;
}

export interface EmbedAuthor extends EmbedAuthorOptions {
    iconURL?: string;
    proxyIconURL?: string;
}
export interface EmbedFooterBase {
    text: string;
}

export interface EmbedFooterOptions extends EmbedFooterBase {
    iconURL?: string;
}

export interface RawEmbedFooterOptions extends EmbedFooterBase {
    icon_url?: string;
}

export interface RawEmbedFooter extends EmbedFooterBase {
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface EmbedFooter extends EmbedFooterOptions {
    iconURL?: string;
    proxyIconURL?: string;
}

export interface EmbedImageBase {
    height?: number;
    width?: number;
}

export interface RawEmbedImage extends EmbedImageBase, EmbedImageOptions {
    proxy_url?: string;
}

export interface EmbedImageOptions {
    url: string;
}

export interface EmbedImage extends EmbedImageBase, EmbedImageOptions {
    proxyURL?: string;
}

export interface EmbedField {
    inline?: boolean;
    name: string;
    value: string;
}

export interface EmbedVideoBase {
    height?: number;
    url?: string;
    width?: number;
}

export interface RawEmbedVideo extends EmbedVideoBase {
    proxy_url?: string;
}

export interface EmbedVideo extends EmbedVideoBase {
    proxyURL?: string;
}

export interface EmbedProvider {
    name?: string;
    url?: string;
}

export interface AllowedMentions {
    /** If `@everyone`/`@here` mentions should be allowed. */
    everyone?: boolean;
    /** If the replied user (`messageReference`) should be mentioned. */
    repliedUser?: boolean;
    /** An array of role ids that are allowed to be mentioned, or a boolean value to allow all or none. */
    roles?: boolean | Array<string>;
    /** An array of user ids that are allowed to be mentioned, or a boolean value to allow all or none. */
    users?: boolean | Array<string>;
}

export interface MessageReference {
    /** The ID of the channel the replied message is in. */
    channelID?: string;
    /** If creating the message should fail if the message to reply to does not exist. */
    failIfNotExists?: boolean;
    /** The ID of the guild the replied message is in. */
    guildID?: string;
    /** The ID of the message to reply to. */
    messageID?: string;
}

export type RawComponent = RawMessageComponent | RawModalComponent;
export type RawMessageComponent = RawButtonComponent | RawSelectMenuComponent;
export type RawModalComponent = RawTextInput;
export type RawButtonComponent = RawTextButton | URLButton | RawPremiumButton;
export type RawSelectMenuComponent = RawStringSelectMenu | RawUserSelectMenu | RawRoleSelectMenu | RawMentionableSelectMenu | RawChannelSelectMenu;
export type ToComponentFromRaw<T extends RawComponent> =
    T extends RawTextButton ? TextButton :
        T extends URLButton ? URLButton :
            T extends RawStringSelectMenu ? StringSelectMenu :
                T extends RawUserSelectMenu ? UserSelectMenu :
                    T extends RawRoleSelectMenu ? RoleSelectMenu :
                        T extends RawMentionableSelectMenu ? MentionableSelectMenu :
                            T extends RawChannelSelectMenu ? ChannelSelectMenu :
                                T extends RawTextInput ? TextInput :
                                    never;
export type ToRawFromComponent<T extends Component> =
    T extends TextButton ? RawTextButton :
        T extends URLButton ? URLButton :
            T extends StringSelectMenu ? RawStringSelectMenu :
                T extends UserSelectMenu ? RawUserSelectMenu :
                    T extends RoleSelectMenu ? RawRoleSelectMenu :
                        T extends MentionableSelectMenu ? RawMentionableSelectMenu :
                            T extends ChannelSelectMenu ? RawChannelSelectMenu :
                                T extends TextInput ? RawTextInput :
                                    never;
export interface RawActionRowBase<T extends RawComponent> {
    components: Array<T>;
    type: ComponentTypes.ACTION_ROW;
}

export interface RawMessageActionRow extends RawActionRowBase<RawMessageComponent> {}
export interface RawModalActionRow extends RawActionRowBase<RawModalComponent> {}
export type ActionRowToRaw<T extends MessageActionRow | ModalActionRow> =
T extends MessageActionRow ? RawMessageActionRow :
    T extends ModalActionRow ? RawModalActionRow : never;

export type Component = MessageComponent | ModalComponent;
export type MessageComponent = ButtonComponent | SelectMenuComponent;
export type ModalComponent = TextInput;
export type ButtonComponent = TextButton | URLButton | PremiumButton;
export type SelectMenuComponent = StringSelectMenu | UserSelectMenu | RoleSelectMenu | MentionableSelectMenu | ChannelSelectMenu;

export interface ActionRowBase<T extends Component> {
    components: Array<T>;
    type: ComponentTypes.ACTION_ROW;
}

export interface MessageActionRow extends ActionRowBase<MessageComponent> {}
export interface ModalActionRow extends ActionRowBase<ModalComponent> {}

export interface ButtonBase {
    disabled?: boolean;
    emoji?: NullablePartialEmoji;
    label?: string;
    style: ButtonStyles;
    type: ComponentTypes.BUTTON;
}

export interface RawTextButton extends ButtonBase {
    custom_id: string;
    style: ButtonStyles.PRIMARY | ButtonStyles.SECONDARY | ButtonStyles.SUCCESS | ButtonStyles.DANGER;
}

export interface TextButton extends ButtonBase {
    customID: string;
    style: ButtonStyles.PRIMARY | ButtonStyles.SECONDARY | ButtonStyles.SUCCESS | ButtonStyles.DANGER;
}

export interface URLButton extends ButtonBase {
    style: ButtonStyles.LINK;
    url: string;
}

export interface RawPremiumButton extends Omit<ButtonBase, "label" | "emoji"> {
    sku_id: string;
    style: ButtonStyles.PREMIUM;
}

export interface PremiumButton extends Omit<ButtonBase, "label" | "emoji"> {
    skuID: string;
    style: ButtonStyles.PREMIUM;
}

export interface RawSelectMenuBase<T extends SelectMenuTypes> {
    custom_id: string;
    disabled?: boolean;
    max_values?: number;
    min_values?: number;
    placeholder?: string;
    type: T;
}

export interface RawStringSelectMenuOptions {
    options: Array<SelectOption>;
}

export interface RawChannelSelectMenuOptions {
    channel_types: Array<ChannelTypes>;
}

export interface RawStringSelectMenu extends RawSelectMenuBase<ComponentTypes.STRING_SELECT>, RawStringSelectMenuOptions {}
export interface RawUserSelectMenu extends RawSelectMenuBase<ComponentTypes.USER_SELECT>, DefaultValuesRaw {}
export interface RawRoleSelectMenu extends RawSelectMenuBase<ComponentTypes.ROLE_SELECT>, DefaultValuesRaw {}
export interface RawMentionableSelectMenu extends RawSelectMenuBase<ComponentTypes.MENTIONABLE_SELECT>, DefaultValuesRaw {}
export interface RawChannelSelectMenu extends RawSelectMenuBase<ComponentTypes.CHANNEL_SELECT>, RawChannelSelectMenuOptions, DefaultValuesRaw {}


export interface SelectMenuBase<T extends SelectMenuTypes> {
    customID: string;
    disabled?: boolean;
    maxValues?: number;
    minValues?: number;
    placeholder?: string;
    type: T;
}

interface DefaultValuesRaw {
    default_values?: Array<SelectMenuDefaultValue>;
}

interface DefaultValues {
    defaultValues?: Array<SelectMenuDefaultValue>;
}

export interface StringSelectMenuOptions {
    options: Array<SelectOption>;
}

export interface ChannelSelectMenuOptions {
    channelTypes: Array<ChannelTypes>;
}

export interface StringSelectMenu extends SelectMenuBase<ComponentTypes.STRING_SELECT>, StringSelectMenuOptions {}
export interface UserSelectMenu extends SelectMenuBase<ComponentTypes.USER_SELECT>, DefaultValues {}
export interface RoleSelectMenu extends SelectMenuBase<ComponentTypes.ROLE_SELECT>, DefaultValues {}
export interface MentionableSelectMenu extends SelectMenuBase<ComponentTypes.MENTIONABLE_SELECT>, DefaultValues {}
export interface ChannelSelectMenu extends SelectMenuBase<ComponentTypes.CHANNEL_SELECT>, ChannelSelectMenuOptions, DefaultValues {}

export interface SelectOption {
    default?: boolean;
    description?: string;
    emoji?: NullablePartialEmoji;
    label: string;
    value: string;
}

export interface RawTextInput {
    custom_id: string;
    label: string;
    max_length?: number;
    min_length?: number;
    placeholder?: string;
    required?: boolean;
    style: TextInputStyles;
    type: ComponentTypes.TEXT_INPUT;
    value?: string;
}

export interface TextInput {
    customID: string;
    label: string;
    maxLength?: number;
    minLength?: number;
    placeholder?: string;
    required?: boolean;
    style: TextInputStyles;
    type: ComponentTypes.TEXT_INPUT;
    value?: string;
}

export interface RawAttachment {
    content_type?: string;
    description?: string;
    duration_secs?: number;
    ephemeral?: boolean;
    filename: string;
    flags?: number;
    height?: number;
    id: string;
    proxy_url: string;
    size: number;
    title?: string;
    url: string;
    waveform?: string | null;
    width?: number;
}
// @TODO verify what can be sent with `attachments` in message creation/deletion, this is an assumption
export interface MessageAttachment extends Partial<Pick<RawAttachment, "description" | "filename">> {
    /** The id of the attachment to edit, or the index of `files` to reference. */
    id?: string | number;
}

export interface RawAllowedMentions {
    parse: Array<"everyone" | "roles" | "users">;
    replied_user?: boolean;
    roles?: Array<string>;
    users?: Array<string>;
}

export interface RawMessage {
    activity?: MessageActivity;
    application?: RawApplication; // @TODO specific properties sent
    application_id?: string;
    attachments: Array<RawAttachment>;
    author: RawUser; // this can be an invalid user if `webhook_id` is set
    call?: RawCall;
    channel_id: string;
    components?: Array<RawMessageActionRow>;
    content: string;
    edited_timestamp: string | null;
    embeds: Array<RawEmbed>;
    flags?: number;
    guild_id?: string;
    id: string;
    /** @deprecated */
    interaction?: RawMessageInteraction;
    interaction_metadata?: RawMessageInteractionMetadata;
    member?: RawMember;
    mention_channels?: Array<ChannelMention>;
    mention_everyone: boolean;
    mention_roles: Array<string>;
    mentions: Array<RawUserWithMember>;
    message_reference?: RawMessageReference;
    message_snapshots?: Array<RawMessageSnapshot>;
    nonce?: number | string;
    pinned: boolean;
    poll?: RawPoll;
    position?: number;
    reactions?: Array<RawMessageReaction>;
    referenced_message?: RawMessage | null;
    role_subscription_data?: RawRoleSubscriptionData;
    // stickers exists, but is deprecated
    sticker_items?: Array<StickerItem>;
    thread?: RawAnnouncementThreadChannel | RawPublicThreadChannel | RawPrivateThreadChannel;
    timestamp: string;
    tts: boolean;
    type: MessageTypes;
    webhook_id?: string;
}

export interface RawCall {
    ended_timestamp?: string | null;
    participants: Array<string>;
}

export interface Call {
    endedTimestamp: Date | null;
    participants: Array<string>;
}

export interface ChannelMention {
    guild_id: string;
    id: string;
    name: string;
    type: ChannelTypes;
}

export interface MessageReactionCountDetails {
    burst: number;
    normal: number;
}

export interface RawMessageReaction {
    burst_colors: Array<string>;
    count: number;
    count_details: MessageReactionCountDetails;
    emoji: PartialEmoji;
    me: boolean;
    me_burst: boolean;
}

export interface MessageReaction {
    burstColors: Array<string>;
    count: number;
    countDetails: MessageReactionCountDetails;
    emoji: PartialEmoji;
    me: boolean;
    meBurst: boolean;
}

export interface MessageActivity {
    party_id?: string;
    type: MessageActivityTypes;
}


export interface RawMessageReference {
    channel_id: string;
    fail_if_not_exists: boolean;
    guild_id: string;
    message_id: string;
}

export interface RawMessageInteraction {
    id: string;
    member?: RawMember;
    name: string;
    type: InteractionTypes;
    user: RawUser;
}

/** @deprecated */
export interface MessageInteraction {
    id: string;
    member?: Member;
    name: string;
    type: InteractionTypes;
    user: User;
}

export interface RawMessageInteractionMetadata {
    authorizing_integration_owners: AuthorizingIntegrationOwners;
    id: string;
    interacted_message_id?: string;
    name?: string;
    original_response_message_id?: string;
    triggering_interaction_metadata?: Omit<RawMessageInteractionMetadata, "triggering_interaction_metadata">;
    type: InteractionTypes;
    user: RawUser;
}

export interface MessageInteractionMetadata {
    /** Details about the authorizing user or server for the installation(s) relevant to the interaction. See [Discord's docs](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object) for more information. */
    authorizingIntegrationOwners: AuthorizingIntegrationOwners;
    id: string;
    /** The ID of the message that contained interactive component, present only on messages created from component interactions */
    interactedMessageID?: string;
    /** Name of the command, including subcommands and subcommand groups, present only on application command interactions. */
    name?: string;
    /** The ID of the original response message, present only on follow-up messages. */
    originalResponseMessageID?: string;
    /** Metadata for the interaction that was used to open the modal, present only on modal submit interactions. */
    triggeringInteractionMetadata?: Omit<MessageInteractionMetadata, "triggeringInteractionMetadata" | "name">;
    type: InteractionTypes;
    user: User;
}


export interface StickerItem {
    format_type: StickerFormatTypes;
    id: string;
    name: string;
}

export type NotImplementedChannels = typeof NotImplementedChannelTypes[number];
export type ImplementedChannels = typeof ImplementedChannelTypes[number];
export type GuildChannels = typeof GuildChannelTypes[number];
export type ThreadChannels = typeof ThreadChannelTypes[number];
export type GuildChannelsWithoutThreads = typeof GuildChannelsWithoutThreadsTypes[number];
export type PrivateChannels = typeof PrivateChannelTypes[number];
export type EditableChannels = typeof EditableChannelTypes[number];
export type TextableChannels = typeof TextableChannelTypes[number];
export type TextableGuildChannels = typeof TextableGuildChannelTypes[number];
export type TextableChannelsWithoutThreads = typeof TextableChannelsWithoutThreadsTypes[number];
export type TextableGuildChannelsWithoutThreads = typeof TextableGuildChannelsWithoutThreadsTypes[number];
export type VoiceChannels = typeof VoiceChannelTypes[number];
export type InviteChannels = typeof InviteChannelTypes[number];
export type InteractionChannels = typeof InteractionChannelTypes[number];
export type ThreadOnlyChannels = typeof ThreadOnlyChannelTypes[number];


export type AnyChannel = ChannelTypeMap[ChannelTypes];
export type AnyNotImplementedChannel = ChannelTypeMap[NotImplementedChannels];
export type AnyImplementedChannel = ChannelTypeMap[ImplementedChannels];
export type AnyGuildChannel = ChannelTypeMap[GuildChannels];
export type AnyThreadChannel = ChannelTypeMap[ThreadChannels];
export type AnyGuildChannelWithoutThreads = ChannelTypeMap[GuildChannelsWithoutThreads];
export type AnyPrivateChannel = ChannelTypeMap[PrivateChannels];
export type AnyEditableChannel = ChannelTypeMap[EditableChannels];
export type AnyTextableChannel = ChannelTypeMap[TextableChannels];
export type AnyTextableGuildChannel = ChannelTypeMap[TextableGuildChannels];
export type AnyTextableChannelWithoutThreads = ChannelTypeMap[TextableChannelsWithoutThreads];
export type AnyTextableGuildChannelWithoutThreads = ChannelTypeMap[TextableGuildChannelsWithoutThreads];
export type AnyVoiceChannel = ChannelTypeMap[VoiceChannels];
export type AnyInviteChannel = ChannelTypeMap[InviteChannels];
export type AnyInteractionChannel = ChannelTypeMap[InteractionChannels];
export type AnyThreadOnlyChannel = ChannelTypeMap[ThreadOnlyChannels];

export interface PartialInviteChannel {
    icon?: string | null;
    id: string;
    name: string | null;
    type: InviteChannels;
}

export type PossiblyUncachedInvite = Invite | UncachedInvite;
export interface UncachedInvite {
    channel?: AnyInviteChannel | Uncached;
    code: string;
    guild?: Guild | Uncached;
}

export interface GetChannelMessagesOptions<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached> {
    /** Get messages after this message ID. IDs don't need to be valid, an ID can be generated for any timestamp via {@link Base.generateID | Base#generateID}. */
    after?: string;
    /** Get messages around this message ID. IDs don't need to be valid, an ID can be generated for any timestamp via {@link Base.generateID | Base#generateID}. */
    around?: string;
    /** Get messages before this message ID. IDs don't need to be valid, an ID can be generated for any timestamp via {@link Base.generateID | Base#generateID}. */
    before?: string;
    /** The maximum amount of messages to get. Defaults to 100. Use Infinity if you wish to get as many messages as possible. */
    limit?: number;
    /**
     * A function used to reject certain messages. If `"break"` is returned, further iteration of messages will stop and the previously allowed messages will be returned.
     * @param message The message to filter.
     */
    filter?(message: Message<T>): boolean | "break" | PromiseLike<boolean | "break">;
}

export interface GetChannelMessagesIteratorOptions<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached> {
    /** Get messages after this message ID. IDs don't need to be valid, an ID can be generated for any timestamp via {@link Base.generateID | Base#generateID}. */
    after?: string;
    /** Get messages before this message ID. IDs don't need to be valid, an ID can be generated for any timestamp via {@link Base.generateID | Base#generateID}. */
    before?: string;
    /** The maximum amount of messages to get. Defaults to 100. Use Infinity if you wish to get as many messages as possible. */
    limit?: number;
    /**
     * A function used to reject certain messages. If `"break"` is returned, the iterator will immediately exit and yield the previously allowed messages.
     * @param message The message to filter.
     */
    filter?(message: Message<T>): boolean | "break" | PromiseLike<boolean | "break">;
}

export interface MessagesIterator<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached> extends AsyncIterable<Array<Message<T>>> {
    /** The most recent "last" message seen by the iterator, used for future requests. */
    lastMessage?: string;
    /** The current limit of remaining messages to get. */
    limit: number;
}

export interface GetReactionsOptions {
    /** The ID of the user to get reactions after. */
    after?: string;
    /** The maximum amount of reactions to get. Defaults to 100. Use Infinity if you wish to get as many reactions as possible. */
    limit?: number;
    /** The type of reactions to get. Defaults to normal. */
    type?: ReactionType;
}

export interface EditMessageOptions extends Nullable<Pick<CreateMessageOptions, "content" | "embeds" | "allowedMentions" | "components" | "attachments" | "files" | "flags">> {}

export interface EditPermissionOptions {
    /** The permissions to allow. */
    allow?: bigint | string;
    /** The permissions to deny. */
    deny?: bigint | string;
    /** The reason for editing the permission. */
    reason?: string;
    /** The type of the permission overwrite. */
    type: OverwriteTypes;
}

export interface RawInvite {
    approximate_member_count?: number;
    approximate_presence_count?: number;
    // this is partial because the gateway only gets an id
    channel?: PartialChannel;
    // gateway
    channel_id?: string;
    code: string;
    expires_at?: string;
    flags?: number;
    guild?: RawInviteGuild;
    guild_scheduled_event?: RawScheduledEvent;
    inviter?: RawUser;
    /** @deprecated */
    stage_instance?: RawInviteStageInstance;
    target_application?: RawPartialApplication;
    target_type?: InviteTargetTypes;
    target_user?: RawUser;
}

export interface RawInviteWithMetadata extends RawInvite {
    created_at: string;
    max_age: number;
    max_uses: number;
    temporary: boolean;
    uses: number;
}


export interface RawInviteStageInstance {
    members: Array<RawMember>;
    participant_count: number;
    speaker_count: number;
    topic: string;
}


export interface InviteStageInstance {
    members: Array<Member>;
    participantCount: number;
    speakerCount: number;
    topic: string;
}

export interface CreateInviteOptions {
    /** How long the invite should last. */
    maxAge?: number;
    /** How many times the invite can be used. */
    maxUses?: number;
    /** The reason for creating the invite. */
    reason?: string;
    /** The id of the embedded application to open for this invite. */
    targetApplicationID?: string;
    /** The [type of target](https://discord.com/developers/docs/resources/channel#invite-target-types) for the invite. */
    targetType?: InviteTargetTypes;
    /** The ID of the user whose stream to display for this invite. */
    targetUserID?: string;
    /** If the invite should be temporary. */
    temporary?: boolean;
    /** If the invite should be unique. */
    unique?: boolean;
}

export interface RawFollowedChannel {
    channel_id: string;
    webhook_id: string;
}

export interface FollowedChannel {
    channelID: string;
    webhookID: string;
}

export interface StartThreadFromMessageOptions {
    /** The duration of no activity after which this thread will be automatically archived. */
    autoArchiveDuration?: ThreadAutoArchiveDuration;
    /** The name of the thread. */
    name: string;
    /** The amount of seconds a user has to wait before sending another message. */
    rateLimitPerUser?: number | null;
    /** The reason for creating the thread. */
    reason?: string;
}

export interface StartThreadWithoutMessageOptions extends StartThreadFromMessageOptions {
    /** [Private Thread Only] If non-moderators can add other non-moderators to the thread. */
    invitable?: boolean;
    /** The type of thread to create. */
    type: ThreadChannels;
}

export interface StartThreadInThreadOnlyChannelOptions extends StartThreadFromMessageOptions {
    /** [Forum Channel Only] The IDs of up to 5 tags from the forum to apply to the thread. */
    appliedTags?: Array<string>;
    /** The message to start the thread with. */
    message: ThreadOnlyChannelThreadStarterMessageOptions;
}

export type ThreadOnlyChannelThreadStarterMessageOptions = Pick<CreateMessageOptions, "content" | "embeds" | "allowedMentions" | "components" | "stickerIDs" | "attachments" | "flags" | "files">;

export interface GetArchivedThreadsOptions {
    /** A **timestamp** to get threads before. */
    before?: string;
    /** The maximum amount of threads to get. */
    limit?: number;
}

export interface RawArchivedThreads<T extends RawAnnouncementThreadChannel | RawPublicThreadChannel | RawPrivateThreadChannel> {
    has_more: boolean;
    members: Array<RawThreadMember>;
    threads: Array<T>;
}

export interface ArchivedThreads<T extends AnnouncementThreadChannel | PublicThreadChannel | PrivateThreadChannel> {
    hasMore: boolean;
    members: Array<ThreadMember>;
    threads: Array<T>;
}

export interface GetInviteOptions {
    /** The id of the guild scheduled event to include with the invite. */
    guildScheduledEventID?: string;
    /** If the invite should contain approximate member counts. */
    withCounts?: boolean;
    /** If the invite should contain expiration data.  */
    withExpiration?: boolean;
}

export interface GetInviteWithCountsOptions extends Omit<GetInviteOptions, "withCounts"> {
    /** If the invite should contain approximate member counts. */
    withCounts: true;
}

export interface GetInviteWithExpirationOptions extends Omit<GetInviteOptions, "withExpiration"> {
    /** If the invite should contain expiration data.  */
    withExpiration: true;
}


export interface GetInviteWithCountsAndExpirationOptions extends Omit<GetInviteOptions, "withCounts" | "withExpiration"> {
    /** If the invite should contain approximate member counts. */
    withCounts: true;
    /** If the invite should contain expiration data.  */
    withExpiration: true;
}


export interface GetInviteWithNoneOptions extends Omit<GetInviteOptions, "withCounts" | "withExpiration"> {
    /** If the invite should contain approximate member counts. */
    withCounts?: false;
    /** If the invite should contain expiration data.  */
    withExpiration?: false;
}

// for the love of god find a way to make this not so shit
export type InviteInfoTypes = "withMetadata" | "withCounts" | "withoutCounts" | "withExpiration" | "withoutExpiration";


export interface ThreadMetadata {
    archiveTimestamp: Date;
    archived: boolean;
    autoArchiveDuration: ThreadAutoArchiveDuration;
    createTimestamp: Date | null;
    locked: boolean;
}

export interface PrivateThreadMetadata extends ThreadMetadata {
    invitable: boolean;
}

export interface RawForumTag {
    emoji_id: string | null;
    emoji_name: string | null;
    id: string;
    moderated: boolean;
    name: string;
}

export interface ForumTag {
    /** The emoji for this tag. */
    emoji: ForumEmoji | null;
    /** The ID of this tag. */
    id: string;
    /** If this tag can only be used by moderators. */
    moderated: boolean;
    /** The name of this tag. */
    name: string;
}

export interface ForumEmoji {
    /** The ID of this emoji if custom, null otherwise. */
    id: string | null;
    /** The unicode codepoint of this emoji if default, null otherwise. */
    name: string | null;
}

export type PossiblyUncachedMessage = Message | UncachedEventMessage;
export type PossiblyUncachedThread = AnyThreadChannel | UncachedEventThread;
export type MinimalPossiblyUncachedThread = AnyThreadChannel | MinimalPossiblyUncachedEventThread;

export interface UncachedEventMessage extends Uncached {
    channel: AnyTextableChannel | Uncached;
    channelID: string;
    guild?: Guild;
    guildID?: string;
}

export interface UncachedEventThread extends Pick<AnyThreadChannel, "type">, Uncached {
    guild?: Guild;
    guildID?: string;
    parent?: ThreadParentChannel | Uncached;
    parentID: string;
}

export interface MinimalPossiblyUncachedEventThread extends Uncached {
    guild?: Guild;
    guildID: string;
}

export interface PurgeOptions<T extends AnyTextableGuildChannel | Uncached> {
    /** The ID of the message to purge after. */
    after?: string;
    /** The ID of the message to purge around. */
    around?: string;
    /** The ID of the message to purge before. */
    before?: string;
    /** The limit of messages to purge. */
    limit: number;
    /** The reason for purging the messages. */
    reason?: string;
    /**
     * A function used to reject certain messages. If `"break"` is returned, further iteration of messages will stop and purging will begin immediately.
     * @param message The message to filter.
     */
    filter?(message: Message<T>): boolean | "break" | PromiseLike<boolean | "break">;
}

export type ThreadParentChannel = TextChannel | AnnouncementChannel | ForumChannel;

export interface RawRoleSubscriptionData {
    is_renewal: boolean;
    role_subscription_listing_id: string;
    tier_name: string;
    total_months_subscribed: number;
}

export interface RoleSubscriptionData {
    isRenewal: boolean;
    roleSubscriptionListingID: string;
    tierName: string;
    totalMonthsSubscribed: number;
}

export interface MessagePollOptions {
    /** If multiple votes can be selected. */
    allowMultiselect: boolean;
    /** The answers for this poll. Up to 10 can be specified. */
    answers: Array<PollAnswerOption>;
    /** The duration of this poll in hours. Up to 7 days (168 hours) */
    duration: number;
    layoutType?: PollLayoutType;
    /** The question for the poll. */
    question: PollQuestion;
}

export interface GetPollAnswerUsersOptions {
    /** Get members after this member id. */
    after?: string;
    /** The maximum number of users returned, defaults to 100. */
    limit?: number;
}

export interface RawPoll {
    allow_multiselect: boolean;
    answers: Array<RawPollAnswer>;
    expiry: string;
    layout_type: PollLayoutType;
    question: PollQuestion;
    results?: RawPollResults;
}

export interface RawPollAnswer {
    answer_id: number;
    poll_media: PollMedia;
}

export interface RawPollResults {
    answer_counts: Array<RawPollAnswerCount>;
    is_finalized: boolean;
}

export interface PollMedia {
    /** The emoji to dispaly. */
    emoji?: NullablePartialEmoji;
    // @FIXME: Discord has said this is currently always nonnull, but not to depend on that in the future (https://github.com/discord/discord-api-docs/pull/6746)
    /** The text. */
    text: string;
}

export interface PollQuestion extends Pick<PollMedia, "text"> {}

export interface PollAnswer {
    /** The id of this answer in relation to `results.answerCounts.id`. */
    answerID: number;
    /** The media object for this answer. */
    pollMedia: PollMedia;
}

export interface PollAnswerOption extends Pick<PollAnswer, "pollMedia"> {}

export interface RawPollAnswerCount {
    count: number;
    id: number;
    me_voted: boolean;
}

export interface PollResults {
    /** The counts for each answer. */
    answerCounts: Array<PollAnswerCount>;
    /** If the poll has been finalized. */
    isFinalized: boolean;
}

export interface PollAnswerCount {
    /** The count for this answer. */
    count: number;
    /** The id of this answer in relation to `answers.answerID`. */
    id: number;
    /** If the current user has voted for this answer. */
    meVoted: boolean;
    /** The IDs of the users that voted. This will always be out of sync unless you either {@link Poll#getAnswerUsers | fetch the answer voters over REST}, or if the poll was created after the bot started, and stays in the cache. */
    users: Array<string>;
}

export interface EventReaction {
    burst: boolean;
    burstColors?: Array<string>;
    emoji: PartialEmoji;
    type: ReactionType;
}

export interface RawMessageSnapshotMessage extends Pick<RawMessage, "type" | "content" | "embeds" | "attachments" | "timestamp" | "edited_timestamp" | "flags" | "mentions" | "mention_roles"> {}

export interface RawMessageSnapshot {
    message: RawMessageSnapshotMessage;
}
export interface MessageSnapshotMessage {
    attachments: Array<Attachment>;
    content: string;
    editedTimestamp: Date | null;
    embeds: Array<Embed>;
    flags: number;
    mentions: Omit<MessageMentions, "everyone" | "members">;
    timestamp: Date;
    type: MessageTypes;
}

export interface MessageSnapshot {
    message: MessageSnapshotMessage;
}

export interface MessageMentions {
    /** The ids of the channels mentioned in this message. */
    channels: Array<string>;
    /** If @everyone/@here is mentioned in this message. */
    everyone: boolean;
    /** The members mentioned in this message. */
    members: Array<Member>;
    /** The ids of the roles mentioned in this message. */
    roles: Array<string>;
    /** The users mentioned in this message. */
    users: Array<User>;
}
