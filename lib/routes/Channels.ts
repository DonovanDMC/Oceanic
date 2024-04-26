/** @module REST/Channels */
import type {
    AddGroupRecipientOptions,
    AnyChannel,
    AnyTextableChannel,
    ArchivedThreads,
    CreateInviteOptions,
    CreateMessageOptions,
    EditChannelOptions,
    EditMessageOptions,
    EditPermissionOptions,
    FollowedChannel,
    GetChannelMessagesOptions,
    GetArchivedThreadsOptions,
    GetReactionsOptions,
    AnyInviteChannel,
    RawArchivedThreads,
    RawChannel,
    RawFollowedChannel,
    RawInvite,
    RawMessage,
    RawAnnouncementThreadChannel,
    RawPrivateThreadChannel,
    RawPublicThreadChannel,
    ThreadMember,
    StartThreadFromMessageOptions,
    StartThreadInThreadOnlyChannelOptions,
    StartThreadWithoutMessageOptions,
    GetInviteOptions,
    GetInviteWithCountsAndExpirationOptions,
    GetInviteWithCountsOptions,
    GetInviteWithExpirationOptions,
    GetInviteWithNoneOptions,
    RawThreadMember,
    InviteInfoTypes,
    RawPrivateChannel,
    RawGroupChannel,
    AnyEditableChannel,
    PartialInviteChannel,
    RawThreadChannel,
    PurgeOptions,
    AnyTextableGuildChannel,
    GetThreadMembersOptions,
    AnyGuildChannel,
    GetChannelMessagesIteratorOptions,
    MessagesIterator,
    GetPollAnswerUsersOptions
} from "../types/channels";
import * as Routes from "../util/Routes";
import type Message from "../structures/Message";
import type { CreateGroupChannelOptions, RawUser } from "../types/users";
import Invite from "../structures/Invite";
import type AnnouncementThreadChannel from "../structures/AnnouncementThreadChannel";
import type PublicThreadChannel from "../structures/PublicThreadChannel";
import type PrivateThreadChannel from "../structures/PrivateThreadChannel";
import type AnnouncementChannel from "../structures/AnnouncementChannel";
import type { VoiceRegion } from "../types/voice";
import type RESTManager from "../rest/RESTManager";
import type PrivateChannel from "../structures/PrivateChannel";
import type GroupChannel from "../structures/GroupChannel";
import type User from "../structures/User";
import type { Uncached } from "../types/shared";
import type { CreateStageInstanceOptions, EditStageInstanceOptions, RawStageInstance } from "../types/guilds";
import StageInstance from "../structures/StageInstance";

/** Various methods for interacting with channels. Located at {@link Client#rest | Client#rest}{@link RESTManager#channels | .channels}. */
export default class Channels {
    private _manager: RESTManager;
    constructor(manager: RESTManager) {
        this._manager = manager;
    }

    /**
     * Add a user to a group channel.
     * @param groupID The ID of the group to add the user to.
     * @param options The options for adding the recipient.
     * @caching This method **does not** cache its result.
     */
    async addGroupRecipient(groupID: string, options: AddGroupRecipientOptions): Promise<void> {
        await this._manager.authRequest<null>({
            method: "PUT",
            path:   Routes.GROUP_RECIPIENT(groupID, options.userID),
            json:   {
                access_token: options.accessToken,
                nick:         options.nick
            }
        });
    }

    /**
     * Add a member to a thread.
     * @param channelID The ID of the thread to add them to.
     * @param userID The ID of the user to add to the thread.
     * @caching This method **does not** cache its result.
     */
    async addThreadMember(channelID: string, userID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "PUT",
            path:   Routes.CHANNEL_THREAD_MEMBER(channelID, userID)
        });
    }
    /**
     * Create a direct message. This will not create a new channel if you have already started a dm with the user.
     * @param recipient The ID of the recipient of the direct message.
     * @caching This method **does** cache its result.
     * @caches {@link Client#privateChannels | Client#privateChannels}
     */
    async createDM(recipient: string): Promise<PrivateChannel> {
        let cache: PrivateChannel | undefined;
        if ((cache = this._manager.client.privateChannels.find(ch => ch.recipient.id === recipient))) {
            return cache;
        }
        return this._manager.authRequest<RawPrivateChannel>({
            method: "POST",
            path:   Routes.OAUTH_CHANNELS,
            json:   { recipient_id: recipient }
        }
        ).then(data => this._manager.client.privateChannels.update(data));
    }

    /**
     * Create a group dm.
     * @param options The options for creating the group dm.
     * @caching This method **does** cache its result.
     * @caches {@link Client#groupChannels | Client#groupChannels}
     */
    async createGroupDM(options: CreateGroupChannelOptions): Promise<GroupChannel> {
        return this._manager.authRequest<RawGroupChannel>({
            method: "POST",
            path:   Routes.OAUTH_CHANNELS,
            json:   {
                access_tokens: options.accessTokens,
                nicks:         options.nicks
            }
        }).then(data => this._manager.client.groupChannels.update(data));
    }

    /**
     * Create an invite for a channel. If the guild is not a `COMMUNITY` server, invites can only be made to last 30 days.
     * @param channelID The ID of the channel to create an invite for.
     * @param options The options for creating the invite.
     * @caching This method **does not** cache its result.
     */
    async createInvite<T extends InviteInfoTypes, CH extends AnyInviteChannel | PartialInviteChannel | Uncached = AnyInviteChannel | PartialInviteChannel | Uncached>(channelID: string, options: CreateInviteOptions): Promise<Invite<T, CH>> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        return this._manager.authRequest<RawInvite>({
            method: "POST",
            path:   Routes.CHANNEL_INVITES(channelID),
            json:   {
                max_age:               options.maxAge,
                max_uses:              options.maxUses,
                target_application_id: options.targetApplicationID,
                target_type:           options.targetType,
                target_user_id:        options.targetUserID,
                temporary:             options.temporary,
                unique:                options.unique
            },
            reason
        }).then(data => new Invite<T, CH>(data, this._manager.client));
    }

    /**
     * Create a message in a channel.
     * @param channelID The ID of the channel to create the message in.
     * @param options The options for creating the message.
     * @caching This method **may** cache its result. The result will not be cached if the channel is not cached.
     * @caches {@link TextableChannel#messages | TextableChannel#messages}<br>{@link ThreadChannel#messages | ThreadChannel#messages}<br>{@link PrivateChannel#messages | PrivateChannel#messages}
     */
    async createMessage<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached>(channelID: string, options: CreateMessageOptions): Promise<Message<T>> {
        const files = options.files;
        if (options.files) {
            delete options.files;
        }
        return this._manager.authRequest<RawMessage>({
            method: "POST",
            path:   Routes.CHANNEL_MESSAGES(channelID),
            json:   {
                allowed_mentions:  this._manager.client.util.formatAllowedMentions(options.allowedMentions),
                attachments:       options.attachments,
                components:        options.components ? this._manager.client.util.componentsToRaw(options.components) : undefined,
                content:           options.content,
                embeds:            options.embeds ? this._manager.client.util.embedsToRaw(options.embeds) : undefined,
                enforce_nonce:     options.enforceNonce,
                flags:             options.flags,
                sticker_ids:       options.stickerIDs,
                message_reference: options.messageReference ? {
                    channel_id:         options.messageReference.channelID,
                    fail_if_not_exists: options.messageReference.failIfNotExists,
                    guild_id:           options.messageReference.guildID,
                    message_id:         options.messageReference.messageID
                } : undefined,
                nonce: options.nonce,
                poll:  options.poll ? {
                    allow_multiselect: options.poll.allowMultiselect,
                    answers:           options.poll.answers.map(a => ({
                        poll_media: a.pollMedia
                    })),
                    duration:    options.poll.duration,
                    layout_type: options.poll.layoutType,
                    question:    options.poll.question
                } : undefined,
                tts: options.tts
            },
            files
        }).then(data => this._manager.client.util.updateMessage<T>(data));
    }

    /**
     * Add a reaction to a message.
     * @param channelID The ID of the channel the message is in.
     * @param messageID The ID of the message to add a reaction to.
     * @param emoji The reaction to add to the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @caching This method **does not** cache its result.
     */
    async createReaction(channelID: string, messageID: string, emoji: string): Promise<void> {
        if (emoji === decodeURIComponent(emoji)) {
            emoji = encodeURIComponent(emoji);
        }
        await this._manager.authRequest<null>({
            method: "PUT",
            path:   Routes.CHANNEL_REACTION_USER(channelID, messageID, emoji, "@me")
        });
    }

    /**
     * Create a stage instance.
     * @param channelID The ID of the channel to create the stage instance on.
     * @param options The options for creating the stage instance.
     * @caching This method **does not** cache its result.
     */
    async createStageInstance(channelID: string, options: CreateStageInstanceOptions): Promise<StageInstance> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        return this._manager.authRequest<RawStageInstance>({
            method: "POST",
            path:   Routes.STAGE_INSTANCES,
            json:   {
                channel_id:              channelID,
                topic:                   options.topic,
                privacy_level:           options.privacyLevel,
                send_start_notification: options.sendStartNotification
            },
            reason
        }).then(data => new StageInstance(data, this._manager.client));
    }

    /**
     * Crosspost a message in an announcement channel.
     * @param channelID The ID of the channel to crosspost the message in.
     * @param messageID The ID of the message to crosspost.
     * @caching This method **may** cache its result. The result will not be cached if the channel is not cached.
     * @caches {@link TextableChannel#messages | TextableChannel#messages}<br>{@link ThreadChannel#messages | ThreadChannel#messages}<br>{@link PrivateChannel#messages | PrivateChannel#messages}
     */
    async crosspostMessage<T extends AnnouncementChannel | Uncached = AnnouncementChannel | Uncached>(channelID: string, messageID: string): Promise<Message<T>> {
        return this._manager.authRequest<RawMessage>({
            method: "POST",
            path:   Routes.CHANNEL_MESSAGES_CROSSPOST(channelID, messageID)
        }).then(data => this._manager.client.util.updateMessage<T>(data));
    }

    /**
     * Delete or close a channel.
     * @param channelID The ID of the channel to delete or close.
     * @param reason The reason to be displayed in the audit log.
     * @caching This method **does not** cache its result.
     */
    async delete(channelID: string, reason?: string): Promise<void> {
        await this._manager.authRequest<RawChannel>({
            method: "DELETE",
            path:   Routes.CHANNEL(channelID),
            reason
        });
    }

    /**
     * Delete an invite.
     * @param code The code of the invite to delete.
     * @param reason The reason for deleting the invite.
     * @caching This method **does not** cache its result.
     */
    async deleteInvite<T extends AnyInviteChannel | PartialInviteChannel | Uncached = AnyInviteChannel | PartialInviteChannel | Uncached>(code: string, reason?: string): Promise<Invite<"withMetadata", T>> {
        return this._manager.authRequest<RawInvite>({
            method: "DELETE",
            path:   Routes.INVITE(code),
            reason
        }).then(data => new Invite<"withMetadata", T>(data, this._manager.client));
    }

    /**
     * Delete a message.
     * @param channelID The ID of the channel to delete the message in.
     * @param messageID The ID of the message to delete.
     * @param reason The reason for deleting the message.
     * @caching This method **does not** cache its result.
     */
    async deleteMessage(channelID: string, messageID: string, reason?: string): Promise<void> {
        await this._manager.authRequest<RawMessage>({
            method: "DELETE",
            path:   Routes.CHANNEL_MESSAGE(channelID, messageID),
            reason
        });
    }

    /**
     * Bulk delete messages.
     * @param channelID The ID of the channel to delete the messages in.
     * @param messageIDs The IDs of the messages to delete. Any duplicates or messages older than two weeks will cause an error.
     * @param reason The reason for deleting the messages.
     * @caching This method **does not** cache its result.
     */
    async deleteMessages(channelID: string, messageIDs: Array<string>, reason?: string): Promise<number> {
        const chunks: Array<Array<string>> = [];
        messageIDs = Array.from(messageIDs);
        const amountOfMessages = messageIDs.length;
        while (messageIDs.length !== 0) {
            chunks.push(messageIDs.splice(0, 100));
        }

        let done = 0;
        for (const chunk of chunks.values()) {
            if (chunks.length > 1) {
                const left = amountOfMessages - done;
                this._manager.client.emit("debug", `Deleting ${left} messages in ${channelID}`);
            }

            if (chunk.length === 1) {
                this._manager.client.emit("debug", "deleteMessages created a chunk with only 1 element, using deleteMessage instead.");
                await this.deleteMessage(channelID, chunk[0], reason);
                continue;
            }

            await this._manager.authRequest<null>({
                method: "POST",
                path:   Routes.CHANNEL_BULK_DELETE_MESSAGES(channelID),
                json:   { messages: chunk },
                reason
            });
            done += chunk.length;
        }

        return amountOfMessages;
    }

    /**
     * Delete a permission overwrite.
     * @param channelID The ID of the channel to delete the permission overwrite in.
     * @param overwriteID The ID of the permission overwrite to delete.
     * @param reason The reason for deleting the permission overwrite.
     * @caching This method **does not** cache its result.
     */
    async deletePermission(channelID: string, overwriteID: string, reason?: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.CHANNEL_PERMISSION(channelID, overwriteID),
            reason
        });
    }

    /**
     * Remove a reaction from a message.
     * @param channelID The ID of the channel the message is in.
     * @param messageID The ID of the message to remove a reaction from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @param user The user to remove the reaction from, `@me` for the current user (default).
     * @caching This method **does not** cache its result.
     */
    async deleteReaction(channelID: string, messageID: string, emoji: string, user = "@me"): Promise<void> {
        if (emoji === decodeURIComponent(emoji)) {
            emoji = encodeURIComponent(emoji);
        }
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.CHANNEL_REACTION_USER(channelID, messageID, emoji, user)
        });
    }

    /**
     * Remove all, or a specific emoji's reactions from a message.
     * @param channelID The ID of the channel the message is in.
     * @param messageID The ID of the message to remove reactions from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis. Omit to remove all reactions.
     * @caching This method **does not** cache its result.
     */
    async deleteReactions(channelID: string, messageID: string, emoji?: string): Promise<void> {
        if (emoji && emoji === decodeURIComponent(emoji)) {
            emoji = encodeURIComponent(emoji);
        }
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   emoji ? Routes.CHANNEL_REACTION(channelID, messageID, emoji) : Routes.CHANNEL_REACTIONS(channelID, messageID)
        });
    }

    /**
     * Delete a stage instance.
     * @param channelID The ID of the channel to delete the stage instance on.
     * @param reason The reason for deleting the stage instance.
     * @caching This method **does not** cache its result.
     */
    async deleteStageInstance(channelID: string, reason?: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.STAGE_INSTANCE(channelID),
            reason
        });
    }

    /**
     * Edit a channel.
     * @param channelID The ID of the channel to edit.
     * @param options The options for editing the channel.
     * @caching This method **may** cache its result. If a guild channel, the result will not be cached if the guild is not cached.
     * @caches {@link Guild#channels | Guild#channels}<br>{@link Guild#threads | Guild#threads}<br>{@link Client#groupChannels | Client#groupChannels}
     */
    async edit<T extends AnyEditableChannel = AnyEditableChannel>(channelID: string, options: EditChannelOptions): Promise<T> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        if (options.icon) {
            try {
                options.icon = this._manager.client.util.convertImage(options.icon);
            } catch (err) {
                throw new TypeError("Invalid icon provided. Ensure you are providing a valid, fully-qualified base64 url.", { cause: err as Error });
            }
        }


        return this._manager.authRequest<RawChannel>({
            method: "PATCH",
            path:   Routes.CHANNEL(channelID),
            json:   {
                applied_tags:          options.appliedTags,
                archived:              options.archived,
                auto_archive_duration: options.autoArchiveDuration,
                available_tags:        options.availableTags?.map(tag => ({
                    emoji_id:   tag.emoji?.id,
                    emoji_name: tag.emoji?.name,
                    moderated:  tag.moderated,
                    name:       tag.name,
                    id:         tag.id
                })),
                bitrate:                            options.bitrate,
                default_auto_archive_duration:      options.defaultAutoArchiveDuration,
                default_forum_layout:               options.defaultForumLayout,
                default_reaction_emoji:             options.defaultReactionEmoji ? { emoji_id: options.defaultReactionEmoji.id, emoji_name: options.defaultReactionEmoji.name } : options.defaultReactionEmoji,
                default_sort_order:                 options.defaultSortOrder,
                default_thread_rate_limit_per_user: options.defaultThreadRateLimitPerUser,
                flags:                              options.flags,
                icon:                               options.icon,
                invitable:                          options.invitable,
                locked:                             options.locked,
                name:                               options.name,
                nsfw:                               options.nsfw,
                parent_id:                          options.parentID,
                permission_overwrites:              options.permissionOverwrites,
                position:                           options.position,
                rate_limit_per_user:                options.rateLimitPerUser,
                rtc_region:                         options.rtcRegion,
                topic:                              options.topic,
                type:                               options.type,
                user_limit:                         options.userLimit,
                video_quality_mode:                 options.videoQualityMode
            },
            reason
        }).then(data => this._manager.client.util.updateChannel<T>(data));
    }

    /**
     * Edit a message.
     * @param channelID The ID of the channel the message is in.
     * @param messageID The ID of the message to edit.
     * @param options The options for editing the message.
     * @caching This method **may** cache its result. The result will not be cached if the channel is not cached.
     * @caches {@link TextableChannel#messages | TextableChannel#messages}<br>{@link ThreadChannel#messages | ThreadChannel#messages}<br>{@link PrivateChannel#messages | PrivateChannel#messages}
     */
    async editMessage<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached>(channelID: string, messageID: string, options: EditMessageOptions): Promise<Message<T>> {
        const files = options.files ?? undefined;
        if (options.files) {
            delete options.files;
        }
        return this._manager.authRequest<RawMessage>({
            method: "PATCH",
            path:   Routes.CHANNEL_MESSAGE(channelID, messageID),
            json:   {
                allowed_mentions: this._manager.client.util.formatAllowedMentions(options.allowedMentions),
                attachments:      options.attachments,
                components:       options.components ? this._manager.client.util.componentsToRaw(options.components) : undefined,
                content:          options.content,
                embeds:           options.embeds ? this._manager.client.util.embedsToRaw(options.embeds) : undefined,
                flags:            options.flags
            },
            files
        }).then(data => this._manager.client.util.updateMessage<T>(data));
    }

    /**
     * Edit a permission overwrite.
     * @param channelID The ID of the channel to edit the permission overwrite for.
     * @param overwriteID The ID of the permission overwrite to edit.
     * @param options The options for editing the permission overwrite.
     * @caching This method **does not** cache its result.
     */
    async editPermission(channelID: string, overwriteID: string, options: EditPermissionOptions): Promise<void> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        await this._manager.authRequest<null>({
            method: "PUT",
            path:   Routes.CHANNEL_PERMISSION(channelID, overwriteID),
            json:   {
                allow: options.allow,
                deny:  options.deny,
                type:  options.type
            },
            reason
        });
    }

    /**
     * Edit a stage instance.
     * @param channelID The ID of the channel to edit the stage instance on.
     * @param options The options for editing the stage instance.
     * @caching This method **does not** cache its result.
     */
    async editStageInstance(channelID: string, options: EditStageInstanceOptions): Promise<StageInstance> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        return this._manager.authRequest<RawStageInstance>({
            method: "PATCH",
            path:   Routes.STAGE_INSTANCE(channelID),
            json:   {
                channel_id:    channelID,
                topic:         options.topic,
                privacy_level: options.privacyLevel
            },
            reason
        }).then(data => new StageInstance(data, this._manager.client));
    }

    /**
     * End a poll now.
     * @param channelID The ID of the channel the poll is in.
     * @param messageID The ID of the message the poll is on.
     * @caching This method **does not** cache its result.
     */
    async expirePoll(channelID: string, messageID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "POST",
            path:   Routes.POLL_EXPIRE(channelID, messageID)
        });
    }

    /**
     * Follow an announcement channel.
     * @param channelID The ID of the channel to follow announcements from.
     * @param webhookChannelID The ID of the channel crossposted messages should be sent to. The client must have the `MANAGE_WEBHOOKS` permission in this channel.
     * @caching This method **does not** cache its result.
     */
    async followAnnouncement(channelID: string, webhookChannelID: string): Promise<FollowedChannel> {
        return this._manager.authRequest<RawFollowedChannel>({
            method: "POST",
            path:   Routes.CHANNEL_FOLLOWERS(channelID),
            json:   { webhook_channel_id: webhookChannelID }
        }).then(data => ({
            channelID: data.channel_id,
            webhookID: data.webhook_id
        }));
    }

    /**
     * Get a channel.
     * @param channelID The ID of the channel to get.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached.
     * @caches {@link Guild#channels | Guild#channels}<br>{@link Guild#threads | Guild#threads}<br>{@link Client#privateChannels | Client#privateChannels}<br>{@link Client#groupChannels | Client#groupChannels}
     */
    async get<T extends AnyChannel = AnyChannel>(channelID: string): Promise<T> {
        return this._manager.authRequest<RawChannel>({
            method: "GET",
            path:   Routes.CHANNEL(channelID)
        }).then(data => this._manager.client.util.updateChannel<T>(data));
    }

    /**
     * Get an invite.
     * @param code The code of the invite to get.
     * @param options The options for getting the invite.
     * @caching This method **does not** cache its result.
     */
    async getInvite<T extends AnyInviteChannel | PartialInviteChannel | Uncached = AnyInviteChannel | PartialInviteChannel | Uncached>(code: string, options: GetInviteWithNoneOptions): Promise<Invite<"withMetadata", T>>;
    async getInvite<T extends AnyInviteChannel | PartialInviteChannel | Uncached = AnyInviteChannel | PartialInviteChannel | Uncached>(code: string, options: GetInviteWithCountsAndExpirationOptions): Promise<Invite<"withMetadata" | "withCounts" | "withExpiration", T>>;
    async getInvite<T extends AnyInviteChannel | PartialInviteChannel | Uncached = AnyInviteChannel | PartialInviteChannel | Uncached>(code: string, options: GetInviteWithCountsOptions): Promise<Invite<"withMetadata" | "withCounts", T>>;
    async getInvite<T extends AnyInviteChannel | PartialInviteChannel | Uncached = AnyInviteChannel | PartialInviteChannel | Uncached>(code: string, options: GetInviteWithExpirationOptions): Promise<Invite<"withMetadata" | "withExpiration", T>>;
    async getInvite<T extends AnyInviteChannel | PartialInviteChannel | Uncached = AnyInviteChannel | PartialInviteChannel | Uncached>(code: string, options?: GetInviteOptions): Promise<Invite<never, T>> {
        const query = new URLSearchParams();
        if (options?.guildScheduledEventID !== undefined) {
            query.set("guild_scheduled_event_id", options.guildScheduledEventID);
        }
        if (options?.withCounts !== undefined) {
            query.set("with_counts", options.withCounts.toString());
        }
        if (options?.withExpiration !== undefined) {
            query.set("with_expiration", options.withExpiration.toString());
        }
        return this._manager.authRequest<RawInvite>({
            method: "GET",
            path:   Routes.INVITE(code),
            query
        }).then(data => new Invite<never, T>(data, this._manager.client));
    }

    /**
     * Get the invites of a channel.
     * @param channelID The ID of the channel to get the invites of.
     * @caching This method **does not** cache its result.
     */
    async getInvites<T extends AnyInviteChannel | PartialInviteChannel | Uncached = AnyInviteChannel | PartialInviteChannel | Uncached>(channelID: string): Promise<Array<Invite<"withMetadata", T>>> {
        return this._manager.authRequest<Array<RawInvite>>({
            method: "GET",
            path:   Routes.CHANNEL_INVITES(channelID)
        }).then(data => data.map(invite => new Invite<"withMetadata", T>(invite, this._manager.client)));
    }

    /**
     * Get the private archived threads the current user has joined in a channel.
     * @param channelID The ID of the channel to get the archived threads from.
     * @param options The options for getting the archived threads.
     * @caching This method **does not** cache its result.
     */
    async getJoinedPrivateArchivedThreads(channelID: string, options?: GetArchivedThreadsOptions): Promise<ArchivedThreads<PrivateThreadChannel>> {
        return this._manager.authRequest<RawArchivedThreads<RawPrivateThreadChannel>>({
            method: "GET",
            path:   Routes.CHANNEL_PRIVATE_ARCHIVED_THREADS(channelID),
            json:   {
                before: options?.before,
                limit:  options?.limit
            }
        }).then(data => ({
            hasMore: data.has_more,
            members: data.members.map(m => ({
                flags:         m.flags,
                id:            m.id,
                joinTimestamp: new Date(m.join_timestamp),
                userID:        m.user_id
            }) as ThreadMember),
            threads: data.threads.map(d => this._manager.client.util.updateThread(d))
        }));
    }

    /**
     * Get a message in a channel.
     * @param channelID The ID of the channel the message is in
     * @param messageID The ID of the message to get.
     * @caching This method **may** cache its result. The result will not be cached if the channel is not cached.
     * @caches {@link TextableChannel#messages | TextableChannel#messages}<br>{@link ThreadChannel#messages | ThreadChannel#messages}<br>{@link PrivateChannel#messages | PrivateChannel#messages}
     */
    async getMessage<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached>(channelID: string, messageID: string): Promise<Message<T>> {
        return this._manager.authRequest<RawMessage>({
            method: "GET",
            path:   Routes.CHANNEL_MESSAGE(channelID, messageID)
        }).then(data => this._manager.client.util.updateMessage<T>(data));
    }

    /**
     * Get messages in a channel.
     * @param channelID The ID of the channel to get messages from.
     * @param options The options for getting messages. `before`, `after`, and `around `All are mutually exclusive.
     * @caching This method **may** cache its result. The result will not be cached if the channel is not cached.
     * @caches {@link TextableChannel#messages | TextableChannel#messages}<br>{@link ThreadChannel#messages | ThreadChannel#messages}<br>{@link PrivateChannel#messages | PrivateChannel#messages}
     */
    async getMessages<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached>(channelID: string, options?: GetChannelMessagesOptions<T>): Promise<Array<Message<T>>> {
        const query = new URLSearchParams();
        let chosenOption: "after" | "around" | "before";
        if (options?.around !== undefined) {
            query.set("around", options.around);
            chosenOption = "around";
        // eslint-disable-next-line unicorn/no-negated-condition
        } else if (options?.after !== undefined) {
            query.set("after", options.after);
            chosenOption = "after";
        } else {
            if (options?.before !== undefined) {
                query.set("before", options.before);
            }
            chosenOption = "before";
        }

        if (chosenOption === "around" || (options?.limit && options.limit <= 100)) {
            const filter = options?.filter?.bind(this) ?? ((): true => true);
            if (options?.limit !== undefined) {
                query.set("limit", Math.min(options.limit, 100).toString());
            }

            const messages = await this._manager.authRequest<Array<RawMessage>>({
                method: "GET",
                path:   Routes.CHANNEL_MESSAGES(channelID),
                query
            }).then(data => data.map(d => this._manager.client.util.updateMessage<T>(d)));

            for (const message of Array.from(messages)) {
                const f = filter(message);

                if (f === false) {
                    messages.splice(messages.indexOf(message), 1);
                }

                if (f === "break") {
                    messages.splice(messages.indexOf(message));
                    break;
                }
            }

            return messages;
        }

        const results: Array<Message<T>> = [];
        const it = this.getMessagesIterator<T>(channelID, options);

        for await (const messages of it) {
            const limit = messages.length < 100 ? messages.length : it.limit + 100;
            this._manager.client.emit("debug", `Getting ${limit} more message${limit === 1 ? "" : "s"} for ${channelID}: ${it.lastMessage ?? ""}`);
            results.push(...messages);
        }

        return results;
    }

    /**
     * Get an async iterator for getting messages in a channel.
     * @param channelID The ID of the channel to get messages from.
     * @param options The options for getting messages. `before`, `after`, and `around `All are mutually exclusive.
     * @caching This method **may** cache its result. The result will not be cached if the channel is not cached.
     * @caches {@link TextableChannel#messages | TextableChannel#messages}<br>{@link ThreadChannel#messages | ThreadChannel#messages}<br>{@link PrivateChannel#messages | PrivateChannel#messages}
     */
    getMessagesIterator<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached>(channelID: string, options?: GetChannelMessagesIteratorOptions<T>): MessagesIterator<T> {
        const filter = options?.filter?.bind(this) ?? ((): true => true);
        const chosenOption = options?.after === undefined ? "before" : "after";

        // arrow functions cannot be generator functions
        // eslint-disable-next-line unicorn/no-this-assignment
        const self = this;
        const it = {
            lastMessage: chosenOption === "after" ? options?.after : options?.before,
            limit:       options?.limit ?? 100,
            async *[Symbol.asyncIterator](): AsyncGenerator<Array<Message<T>>> {
                loop: while (it.limit > 0) {
                    const messages = await self.getMessages<T>(channelID, {
                        limit:          it.limit >= 100 ? 100 : it.limit,
                        [chosenOption]: it.lastMessage
                    });

                    if (messages.length < 100 || it.limit <= 100) {
                        yield messages;
                        break loop;
                    }

                    it.limit -= messages.length;

                    for (const message of Array.from(messages)) {
                        const f = filter(message);
                        if (f === false) {
                            messages.splice(messages.indexOf(message), 1);
                        }

                        if (f === "break") {
                            messages.splice(messages.indexOf(message));
                            yield messages;
                            break loop;
                        }
                    }

                    it.lastMessage = messages.at(-1)?.id;
                    yield messages;
                }
            }
        };

        return it;
    }

    /**
     * Get the pinned messages in a channel.
     * @param channelID The ID of the channel to get the pinned messages from.
     * @caching This method **may** cache its result. The result will not be cached if the channel is not cached.
     * @caches {@link TextableChannel#messages | TextableChannel#messages}<br>{@link ThreadChannel#messages | ThreadChannel#messages}<br>{@link PrivateChannel#messages | PrivateChannel#messages}
     */
    async getPinnedMessages<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached>(channelID: string): Promise<Array<Message<T>>> {
        return this._manager.authRequest<Array<RawMessage>>({
            method: "GET",
            path:   Routes.CHANNEL_PINS(channelID)
        }).then(data => data.map(d => this._manager.client.util.updateMessage<T>(d)));
    }

    /**
     * Get the users that voted on a poll answer.
     * @param channelID The ID of the channel the poll is in.
     * @param messageID The ID of the message the poll is on.
     * @param answerID The ID of the poll answer to get voters for.
     * @param options The options for getting the voters.
     * @caching This method **does** cache its result.
     * @caches {@link Client#users | Client#users}
     */
    async getPollAnswerUsers(channelID: string, messageID: string, answerID: number, options?: GetPollAnswerUsersOptions): Promise<Array<User>> {
        const qs = new URLSearchParams();
        if (options?.after !== undefined) {
            qs.set("before", options.after);
        }
        if (options?.limit !== undefined) {
            qs.set("limit", options.limit.toString());
        }
        return this._manager.authRequest<{ users: Array<RawUser>; }>({
            method: "GET",
            path:   Routes.POLL_ANSWER_USERS(channelID, messageID, answerID),
            query:  qs
        }).then(data => {
            const users = data.users.map(user => this._manager.client.users.update(user));
            const message = this._manager.client.getChannel<AnyTextableChannel>(channelID)?.messages.get(messageID);
            if (message?.poll) {
                this._manager.client.util.replacePollAnswer(message.poll, answerID, users.length, users.map(u => u.id));
            }
            return users;
        });
    }

    /**
     * Get the private archived threads in a channel.
     * @param channelID The ID of the channel to get the archived threads from.
     * @param options The options for getting the archived threads.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached.
     * @caches {@link Guild#threads | Guild#threads}
     */
    async getPrivateArchivedThreads(channelID: string, options?: GetArchivedThreadsOptions): Promise<ArchivedThreads<PrivateThreadChannel>> {
        const qs = new URLSearchParams();
        if (options?.before !== undefined) {
            qs.set("before", options.before);
        }
        if (options?.limit !== undefined) {
            qs.set("limit", options.limit.toString());
        }
        return this._manager.authRequest<RawArchivedThreads<RawPrivateThreadChannel>>({
            method: "GET",
            path:   Routes.CHANNEL_PRIVATE_ARCHIVED_THREADS(channelID),
            query:  qs
        }).then(data => ({
            hasMore: data.has_more,
            members: data.members.map(m => ({
                flags:         m.flags,
                id:            m.id,
                joinTimestamp: new Date(m.join_timestamp),
                userID:        m.user_id
            }) as ThreadMember),
            threads: data.threads.map(d => this._manager.client.util.updateThread(d))
        }));
    }

    /**
     * Get the private joined archived threads in a channel.
     * @param channelID The ID of the channel to get the archived threads from.
     * @param options The options for getting the archived threads.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached.
     * @caches {@link Guild#threads | Guild#threads}
     */
    async getPrivateJoinedArchivedThreads(channelID: string, options?: GetArchivedThreadsOptions): Promise<ArchivedThreads<PrivateThreadChannel>> {
        const qs = new URLSearchParams();
        if (options?.before !== undefined) {
            qs.set("before", options.before);
        }
        if (options?.limit !== undefined) {
            qs.set("limit", options.limit.toString());
        }
        return this._manager.authRequest<RawArchivedThreads<RawPrivateThreadChannel>>({
            method: "GET",
            path:   Routes.CHANNEL_JOINED_PRIVATE_ARCHIVED_THREADS(channelID),
            query:  qs
        }).then(data => ({
            hasMore: data.has_more,
            members: data.members.map(m => ({
                flags:         m.flags,
                id:            m.id,
                joinTimestamp: new Date(m.join_timestamp),
                userID:        m.user_id
            }) as ThreadMember),
            threads: data.threads.map(d => this._manager.client.util.updateThread(d))
        }));
    }

    /**
     * Get the public archived threads in a channel.
     * @param channelID The ID of the channel to get the archived threads from.
     * @param options The options for getting the archived threads.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached.
     * @caches {@link Guild#threads | Guild#threads}
     */
    async getPublicArchivedThreads<T extends AnnouncementThreadChannel | PublicThreadChannel = AnnouncementThreadChannel | PublicThreadChannel>(channelID: string, options?: GetArchivedThreadsOptions): Promise<ArchivedThreads<T>> {
        const qs = new URLSearchParams();
        if (options?.before !== undefined) {
            qs.set("before", options.before);
        }
        if (options?.limit !== undefined) {
            qs.set("limit", options.limit.toString());
        }
        return this._manager.authRequest<RawArchivedThreads<RawAnnouncementThreadChannel | RawPublicThreadChannel>>({
            method: "GET",
            path:   Routes.CHANNEL_PUBLIC_ARCHIVED_THREADS(channelID),
            query:  qs
        }).then(data => ({
            hasMore: data.has_more,
            members: data.members.map(m => ({
                flags:         m.flags,
                id:            m.id,
                joinTimestamp: new Date(m.join_timestamp),
                userID:        m.user_id
            }) as ThreadMember),
            threads: data.threads.map(d => this._manager.client.util.updateThread(d))
        }));
    }

    /**
     * Get the users who reacted with a specific emoji on a message.
     * @param channelID The ID of the channel the message is in.
     * @param messageID The ID of the message to get reactions from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @param options The options for getting the reactions.
     * @caching This method **does not** cache its result.
     */
    async getReactions(channelID: string, messageID: string, emoji: string, options?: GetReactionsOptions): Promise<Array<User>> {
        if (emoji === decodeURIComponent(emoji)) {
            emoji = encodeURIComponent(emoji);
        }

        const _getReactions = async (_options?: GetReactionsOptions): Promise<Array<User>> => {
            const query = new URLSearchParams();
            if (_options?.after !== undefined) {
                query.set("after", _options.after);
            }
            if (_options?.limit !== undefined) {
                query.set("limit", _options.limit.toString());
            }
            if (options?.type !== undefined) {
                query.set("type", String(options.type));
            }
            return this._manager.authRequest<Array<RawUser>>({
                method: "GET",
                path:   Routes.CHANNEL_REACTION(channelID, messageID, emoji),
                query
            }).then(data => data.map(d => this._manager.client.users.update(d)));
        };

        const limit = options?.limit ?? 100;
        let after = options?.after;

        let reactions: Array<User> = [];
        while (reactions.length < limit) {
            const limitLeft = limit - reactions.length;
            const limitToFetch = limitLeft <= 100 ? limitLeft : 100;
            this._manager.client.emit("debug", `Getting ${limitLeft} more ${emoji} reactions for message ${messageID} on ${channelID}: ${after ?? ""}`);
            const reactionsChunk = await _getReactions({
                after,
                limit: limitToFetch
            });

            if (reactionsChunk.length === 0) {
                break;
            }

            reactions = reactions.concat(reactionsChunk);
            after = reactionsChunk.at(-1)!.id;

            if (reactionsChunk.length < 100) {
                break;
            }
        }

        return reactions;
    }

    /**
     * Get the stage instance associated with a channel.
     * @param channelID The ID of the channel to get the stage instance on.
     * @caching This method **does not** cache its result.
     */
    async getStageInstance(channelID: string): Promise<StageInstance> {
        return this._manager.authRequest<RawStageInstance>({
            method: "GET",
            path:   Routes.STAGE_INSTANCE(channelID)
        }).then(data => new StageInstance(data, this._manager.client));
    }

    /**
     * Get a thread member.
     * @param channelID The ID of the thread.
     * @param userID The ID of the user to get the thread member of.
     * @caching This method **does not** cache its result.
     */
    async getThreadMember(channelID: string, userID: string): Promise<ThreadMember> {
        return this._manager.authRequest<RawThreadMember>({
            method: "GET",
            path:   Routes.CHANNEL_THREAD_MEMBER(channelID, userID)
        }).then(data => ({
            flags:         data.flags,
            id:            data.id,
            joinTimestamp: new Date(data.join_timestamp),
            userID:        data.user_id
        }));
    }

    /**
     * Get the members of a thread.
     * @param channelID The ID of the thread.
     * @param options The options for getting the thread members.
     * @caching This method **does not** cache its result.
     */
    async getThreadMembers(channelID: string, options?: GetThreadMembersOptions): Promise<Array<ThreadMember>> {
        const query = new URLSearchParams();
        if (options?.after !== undefined) {
            query.set("after", options.after);
        }
        if (options?.limit !== undefined) {
            query.set("limit", options.limit.toString());
        }
        if (options?.withMember !== undefined) {
            query.set("with_member", options.withMember.toString());
        }
        return this._manager.authRequest<Array<RawThreadMember>>({
            method: "GET",
            path:   Routes.CHANNEL_THREAD_MEMBERS(channelID),
            query
        }).then(data => data.map(d => {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            const guild = this._manager.client.getChannel<AnyGuildChannel>(channelID)?.["_cachedGuild"];
            const member = guild && options?.withMember ? guild.members.update(d.member!, guild.id) : undefined;
            return {
                flags:         d.flags,
                id:            d.id,
                joinTimestamp: new Date(d.join_timestamp),
                member,
                userID:        d.user_id
            };
        }));
    }

    /** @deprecated Get the list of usable voice regions. Moved to `misc`. */
    async getVoiceRegions(): Promise<Array<VoiceRegion>> {
        return this._manager.authRequest<Array<VoiceRegion>>({
            method: "GET",
            path:   Routes.VOICE_REGIONS
        });
    }

    /**
     * Join a thread.
     * @param channelID The ID of the thread to join.
     * @caching This method **does not** cache its result.
     */
    async joinThread(channelID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "PUT",
            path:   Routes.CHANNEL_THREAD_MEMBER(channelID, "@me")
        });
    }

    /**
     * Leave a thread.
     * @param channelID The ID of the thread to leave.
     * @caching This method **does not** cache its result.
     */
    async leaveThread(channelID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.CHANNEL_THREAD_MEMBER(channelID, "@me")
        });
    }

    /**
     * Pin a message in a channel.
     * @param channelID The ID of the channel to pin the message in.
     * @param messageID The ID of the message to pin.
     * @param reason The reason for pinning the message.
     * @caching This method **does not** cache its result.
     */
    async pinMessage(channelID: string, messageID: string, reason?: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "PUT",
            path:   Routes.CHANNEL_PINNED_MESSAGE(channelID, messageID),
            reason
        });
    }

    /**
     * Purge an amount of messages from a channel.
     * @param channelID The ID of the channel to purge.
     * @param options The options to purge. `before`, `after`, and `around `All are mutually exclusive.
     * @caching This method **does not** cache its result.
     */
    async purgeMessages<T extends AnyTextableGuildChannel | Uncached = AnyTextableGuildChannel | Uncached>(channelID: string, options: PurgeOptions<T>): Promise<number> {
        const filter = (message: Message<T>): boolean | "break" | PromiseLike<boolean | "break"> => {
            if (message.timestamp.getTime() < Date.now() - 1209600000) {
                return "break";
            }

            return options?.filter?.(message) ?? true;
        };
        let chosenOption: "after" | "around" | "before";
        if (options.after) {
            chosenOption = "after";
        } else if (options.around) {
            chosenOption = "around";
        } else {
            chosenOption = "before";
        }

        if (chosenOption === "around" || options.limit <= 100) {
            const messages = await this.getMessages<T>(channelID, {
                limit:          options.limit,
                [chosenOption]: options[chosenOption]
            });
            for (const message of messages) {
                const f = filter(message);
                if (f === false) {
                    messages.splice(messages.indexOf(message), 1);
                }

                if (f === "break") {
                    messages.splice(messages.indexOf(message));
                    break;
                }
            }
            return this.deleteMessages(channelID, messages.map(message => message.id), options.reason);
        }

        const it = this.getMessagesIterator<T>(channelID, {
            after:  options.after,
            before: options.before,
            limit:  options.limit,
            filter
        });

        let deleted = 0;
        for await (const messages of it) {
            deleted += await this.deleteMessages(channelID, messages.map(message => message.id), options.reason);
        }
        return deleted;
    }

    /**
     * Remove a user from the group channel.
     * @param groupID The ID of the group to remove the user from.
     * @param userID The ID of the user to remove.
     * @caching This method **does not** cache its result.
     */
    async removeGroupRecipient(groupID: string, userID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.GROUP_RECIPIENT(groupID, userID)
        });
    }

    /**
     * Remove a member from a thread.
     * @param channelID The ID of the thread to remove them from.
     * @param userID The ID of the user to remove from the thread.
     * @caching This method **does not** cache its result.
     */
    async removeThreadMember(channelID: string, userID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.CHANNEL_THREAD_MEMBER(channelID, userID)
        });
    }

    /**
     * Show a typing indicator in a channel. How long users see this varies from client to client.
     * @param channelID The ID of the channel to show the typing indicator in.
     * @caching This method **does not** cache its result.
     */
    async sendTyping(channelID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "POST",
            path:   Routes.CHANNEL_TYPING(channelID)
        });
    }

    /**
     * Set a voice status in a channel.
     * @param channelID The ID of the channel to set the voice status in.
     * @param status The voice status to set.
     */
    async setVoiceStatus(channelID: string, status: string | null): Promise<void> {
        await this._manager.authRequest<null>({
            method: "PUT",
            path:   Routes.VOICE_STATUS(channelID),
            json:   { status }
        });
    }

    /**
     * Create a thread from an existing message.
     * @param channelID The ID of the channel to create the thread in.
     * @param messageID The ID of the message to create the thread from.
     * @param options The options for starting the thread.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached.
     * @caches {@link Guild#threads | Guild#threads}
     */
    async startThreadFromMessage<T extends AnnouncementThreadChannel | PublicThreadChannel = AnnouncementThreadChannel | PublicThreadChannel>(channelID: string, messageID: string, options: StartThreadFromMessageOptions): Promise<T> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        return this._manager.authRequest<RawThreadChannel>({
            method: "POST",
            path:   Routes.CHANNEL_MESSAGE_THREADS(channelID, messageID),
            json:   {
                auto_archive_duration: options.autoArchiveDuration,
                name:                  options.name,
                rate_limit_per_user:   options.rateLimitPerUser
            },
            reason
        }).then(data => this._manager.client.util.updateThread<T>(data));
    }

    /**
     * Create a thread in a thread only channel (forum & media).
     * @param channelID The ID of the channel to start the thread in.
     * @param options The options for starting the thread.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached.
     * @caches {@link Guild#threads | Guild#threads}
     */
    async startThreadInThreadOnlyChannel(channelID: string, options: StartThreadInThreadOnlyChannelOptions): Promise<PublicThreadChannel> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        const files = options.message.files;
        if (options.message.files) {
            delete options.message.files;
        }
        return this._manager.authRequest<RawThreadChannel>({
            method: "POST",
            path:   Routes.CHANNEL_THREADS(channelID),
            json:   {
                auto_archive_duration: options.autoArchiveDuration,
                message:               {
                    allowed_mentions: this._manager.client.util.formatAllowedMentions(options.message.allowedMentions),
                    attachments:      options.message.attachments,
                    components:       options.message.components ? this._manager.client.util.componentsToRaw(options.message.components) : undefined,
                    content:          options.message.content,
                    embeds:           options.message.embeds ? this._manager.client.util.embedsToRaw(options.message.embeds) : undefined,
                    flags:            options.message.flags,
                    sticker_ids:      options.message.stickerIDs
                },
                name:                options.name,
                rate_limit_per_user: options.rateLimitPerUser,
                applied_tags:        options.appliedTags
            },
            reason,
            files
        }).then(data => this._manager.client.util.updateThread<PublicThreadChannel>(data));
    }

    /**
     * Create a thread without an existing message.
     * @param channelID The ID of the channel to start the thread in.
     * @param options The options for starting the thread.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached.
     * @caches {@link Guild#threads | Guild#threads}
     */
    async startThreadWithoutMessage<T extends AnnouncementThreadChannel | PublicThreadChannel | PrivateThreadChannel = AnnouncementThreadChannel | PublicThreadChannel | PrivateThreadChannel>(channelID: string, options: StartThreadWithoutMessageOptions): Promise<T> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        return this._manager.authRequest<RawThreadChannel>({
            method: "POST",
            path:   Routes.CHANNEL_THREADS(channelID),
            json:   {
                auto_archive_duration: options.autoArchiveDuration,
                invitable:             options.invitable,
                name:                  options.name,
                rate_limit_per_user:   options.rateLimitPerUser,
                type:                  options.type
            },
            reason
        }).then(data => this._manager.client.util.updateThread<T>(data));
    }

    /**
     * Unpin a message in a channel.
     * @param channelID The ID of the channel to unpin the message in.
     * @param messageID The ID of the message to unpin.
     * @param reason The reason for unpinning the message.
     * @caching This method **does not** cache its result.
     */
    async unpinMessage(channelID: string, messageID: string, reason?: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.CHANNEL_PINNED_MESSAGE(channelID, messageID),
            reason
        });
    }
}
