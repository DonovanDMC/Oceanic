/** @module Message */
import Base from "./Base";
import Attachment from "./Attachment";
import User from "./User";
import type Guild from "./Guild";
import type Member from "./Member";
import PartialApplication from "./PartialApplication";
import type ClientApplication from "./ClientApplication";
import type AnnouncementChannel from "./AnnouncementChannel";
import type AnnouncementThreadChannel from "./AnnouncementThreadChannel";
import type PublicThreadChannel from "./PublicThreadChannel";
import type TextChannel from "./TextChannel";
import GuildChannel from "./GuildChannel";
import type PrivateChannel from "./PrivateChannel";
import Poll from "./Poll";
import type Client from "../Client";
import TypedCollection from "../util/TypedCollection";
import { BASE_URL, type MessageTypes } from "../Constants";
import type { Uncached } from "../types/shared";
import type {
    AnyTextableGuildChannel,
    AnyTextableChannel,
    ChannelMention,
    EditMessageOptions,
    Embed,
    GetReactionsOptions,
    MessageActivity,
    MessageInteraction,
    MessageReference,
    RawAttachment,
    RawMessage,
    StartThreadFromMessageOptions,
    StickerItem,
    MessageReaction,
    MessageActionRow,
    AnyThreadChannel,
    RoleSubscriptionData,
    MessageInteractionMetadata,
    GetPollAnswerUsersOptions,
    Call,
    MessageSnapshot,
    MessageMentions
} from "../types/channels";
import type { RawMember } from "../types/guilds";
import type { DeleteWebhookMessageOptions, EditWebhookMessageOptions } from "../types/webhooks";
import type { JSONMessage } from "../types/json";
import * as Routes from "../util/Routes";
import { UncachedError } from "../util/Errors";

/** Represents a message. */
export default class Message<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached> extends Base {
    private _cachedChannel!: T extends AnyTextableChannel ? T : undefined;
    private _cachedGuild?: T extends AnyTextableGuildChannel ? Guild : Guild | null;
    /** The [activity](https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure) associated with this message. */
    activity?: MessageActivity;
    /**
     * The application associated with this message. This can be present in two scenarios:
     * * If the message was from an interaction or application owned webhook ({@link ClientApplication} if any shard has reached READY, {@link PartialApplication} otherwise).
     * * If the message has a rich presence embed ({@link PartialApplication})
     */
    application?: PartialApplication | ClientApplication;
    /**
     * The ID of the application associated with this message. This can be present in two scenarios:
     * * If the message was from an interaction or application owned webhook ({@link ClientApplication} if any shard has reached READY, {@link PartialApplication} otherwise).
     * * If the message has a rich presence embed ({@link PartialApplication})
     */
    applicationID: string | null;
    /** The attachments on this message. */
    attachments: TypedCollection<RawAttachment, Attachment>;
    /** The author of this message. */
    author: User;
    /** The call associated with this message. */
    call?: Call;
    /** The ID of the channel this message was created in. */
    channelID: string;
    /** The components on this message. */
    components: Array<MessageActionRow>;
    /** The content of this message. */
    content: string;
    /** The timestamp at which this message was last edited. */
    editedTimestamp: Date | null;
    /** The embeds on this message. */
    embeds: Array<Embed>;
    /** The [flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) on this message. */
    flags: number;
    /** The ID of the guild this message is in. */
    guildID: T extends AnyTextableGuildChannel ? string : string | null;
    /**
     * The interaction info, if this message was the result of an interaction.
     * @deprecated Use {@link Message#interactionMetadata | Message#interactionMetadata } instead.
     */
    interaction?: MessageInteraction;
    /** The interaction info, if this message was the result of an interaction. */
    interactionMetadata?: MessageInteractionMetadata;
    /** The member that created this message, if this message is in a guild. */
    member: T extends AnyTextableGuildChannel ? Member : Member | undefined;
    /** Channels mentioned in a `CROSSPOSTED` channel follower message. See [Discord's docs](https://discord.com/developers/docs/resources/channel#channel-mention-object) for more information. */
    mentionChannels?: Array<ChannelMention>;
    /** The mentions in this message. */
    mentions: MessageMentions;
    /** If this message is a `REPLY` or `THREAD_STARTER_MESSAGE`, some info about the referenced message. */
    messageReference?: MessageReference;
    /** If this message is a forwarded message, the partial contents of that message. */
    messageSnapshots?: Array<MessageSnapshot>;
    /** A nonce for ensuring a message was sent. */
    nonce?: number | string;
    /** If this message is pinned. */
    pinned: boolean;
    /** The poll on this message, if any. */
    poll?: Poll;
    /** This message's relative position, if in a thread. */
    position?: number;
    /** The reactions on this message. */
    reactions: Array<MessageReaction>;
    /** If this message is a `REPLY` or `THREAD_STARTER_MESSAGE`, this will be the message that's referenced. */
    referencedMessage?: Message | null;
    /** The data of the role subscription purchase or renewal that prompted this message. */
    roleSubscriptionData?: RoleSubscriptionData;
    // stickers exists, but is deprecated
    /** The sticker items on this message. */
    stickerItems?: Array<StickerItem>;
    /** The thread associated with this message, if any. */
    thread?: AnyThreadChannel;
    /** The timestamp at which this message was sent. */
    timestamp: Date;
    /** If this message was read aloud. */
    tts: boolean;
    /** The [type](https://discord.com/developers/docs/resources/channel#message-object-message-types) of this message. */
    type: MessageTypes;
    /** The webhook associated with this message, if sent via a webhook. This only has an `id` property. */
    webhookID?: string;
    constructor(data: RawMessage, client: Client) {
        super(data.id, client);
        this.attachments = new TypedCollection(Attachment, client);
        this.channelID = data.channel_id;
        this.components = [];
        this.content = data.content ?? "";
        this.editedTimestamp = null;
        this.embeds = [];
        this.flags = 0;
        this.guildID = (data.guild_id === undefined ? null : data.guild_id) as T extends AnyTextableGuildChannel ? string : string | null;
        this.member = (data.member === undefined ? undefined : this.client.util.updateMember(data.guild_id!, data.author.id, { ...data.member, user: data.author })) as T extends AnyTextableGuildChannel ? Member : Member | undefined;
        this.mentions = {
            channels: [],
            everyone: false,
            members:  [],
            roles:    [],
            users:    []
        };
        this.pinned = !!data.pinned;
        this.poll = data.poll ? new Poll(data.poll, client, this) : undefined;
        this.reactions = [];
        // message updates can be missing a timestamp
        this.timestamp = data.timestamp === undefined ? Base.getCreatedAt(this.id) : new Date(data.timestamp);
        this.tts = !!data.tts;
        this.type = data.type;
        this.webhookID = data.webhook_id;
        this.update(data);
        // don't add webhook users to the cache
        this.author = data.webhook_id === undefined ? client.users.update(data.author) : new User(data.author, client);
        if (data.application_id === undefined) {
            this.applicationID = null;
        } else {
            if (client["_application"] && client.application.id === data.application_id) {
                if (data.application) {
                    client.application["update"](data.application);
                }
                this.application = client.application;
            } else {
                this.application = data.application ? new PartialApplication(data.application, client) : undefined;
            }
            this.applicationID = data.application_id;
        }
    }

    protected override update(data: Partial<RawMessage>): void {
        if (data.mention_everyone !== undefined) {
            this.mentions.everyone = data.mention_everyone;
        }
        if (data.mention_roles !== undefined) {
            this.mentions.roles = data.mention_roles;
        }
        if (data.mentions !== undefined) {
            const members: Array<Member> = [];
            this.mentions.users = data.mentions.map(user => {
                if (this.channel && "guildID" in (this.channel as T) && user.member) {
                    members.push(this.client.util.updateMember((this.channel as AnyTextableGuildChannel).guildID, user.id, { ...user.member, user }));
                }
                return this.client.users.update(user);
            });
            this.mentions.members = members;
        }
        if (data.activity !== undefined) {
            this.activity = data.activity;
        }
        if (data.attachments !== undefined) {
            if (this.attachments.size !== 0) {
                for (const id of this.attachments.keys()) {
                    if (!data.attachments.some(attachment => attachment.id === id)) {
                        this.attachments.delete(id);
                    }
                }
            }

            for (const attachment of data.attachments) {
                this.attachments.update(attachment);
            }
        }
        if (data.call !== undefined) {
            this.call = {
                endedTimestamp: data.call.ended_timestamp ? new Date(data.call.ended_timestamp) : null,
                participants:   data.call.participants
            };
        }
        if (data.components !== undefined) {
            this.components = this.client.util.componentsToParsed(data.components);
        }
        if (data.content !== undefined) {
            this.content = data.content;
            this.mentions.channels = (data.content.match(/<#\d{17,21}>/g) ?? []).map(mention => mention.slice(2, -1));
        }
        if (data.edited_timestamp !== undefined) {
            this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp) : null;
        }
        if (data.embeds !== undefined) {
            this.embeds = this.client.util.embedsToParsed(data.embeds);
        }
        if (data.flags !== undefined) {
            this.flags = data.flags;
        }
        if (data.interaction !== undefined) {
            let member: RawMember | undefined;
            if (data.interaction.member) {
                member = {
                    ...data.interaction.member,
                    user: data.interaction.user
                };
            }
            this.interaction = {
                id:     data.interaction.id,
                member: member ? this.client.util.updateMember(data.guild_id!, member.user!.id, member) : undefined,
                name:   data.interaction.name,
                type:   data.interaction.type,
                user:   this.client.users.update(data.interaction.user)
            };
        }
        if (data.interaction_metadata !== undefined) {
            this.interactionMetadata = {
                authorizingIntegrationOwners:  data.interaction_metadata.authorizing_integration_owners,
                id:                            data.interaction_metadata.id,
                interactedMessageID:           data.interaction_metadata.interacted_message_id,
                name:                          data.interaction_metadata.name,
                originalResponseMessageID:     data.interaction_metadata.original_response_message_id,
                type:                          data.interaction_metadata.type,
                user:                          this.client.users.update(data.interaction_metadata.user),
                triggeringInteractionMetadata: data.interaction_metadata.triggering_interaction_metadata === undefined ? undefined : {
                    authorizingIntegrationOwners: data.interaction_metadata.triggering_interaction_metadata.authorizing_integration_owners,
                    id:                           data.interaction_metadata.triggering_interaction_metadata.id,
                    interactedMessageID:          data.interaction_metadata.triggering_interaction_metadata.interacted_message_id,
                    originalResponseMessageID:    data.interaction_metadata.triggering_interaction_metadata.original_response_message_id,
                    type:                         data.interaction_metadata.triggering_interaction_metadata.type,
                    user:                         this.client.users.update(data.interaction_metadata.triggering_interaction_metadata.user)
                }
            };
        }
        if (data.message_reference) {
            this.messageReference = {
                channelID:       data.message_reference.channel_id,
                failIfNotExists: data.message_reference.fail_if_not_exists,
                guildID:         data.message_reference.guild_id,
                messageID:       data.message_reference.message_id
            };
        }

        if (data.message_snapshots) {
            this.messageSnapshots = data.message_snapshots.map(s => ({
                message: {
                    attachments:     s.message.attachments.map(a => new Attachment(a, this.client)),
                    content:         s.message.content,
                    editedTimestamp: s.message.edited_timestamp ? new Date(s.message.edited_timestamp) : null,
                    embeds:          this.client.util.embedsToParsed(s.message.embeds),
                    flags:           s.message.flags ?? 0,
                    mentions:        {
                        channels: (s.message.content.match(/<#\d{17,21}>/g) ?? []).map(mention => mention.slice(2, -1)),
                        roles:    s.message.mention_roles,
                        users:    s.message.mentions.map(u => this.client.users.update(u))
                    },
                    timestamp: new Date(s.message.timestamp),
                    type:      s.message.type
                }
            }));
        }

        if (data.nonce !== undefined) {
            this.nonce = data.nonce;
        }
        if (data.pinned !== undefined) {
            this.pinned = data.pinned;
        }
        if (data.position !== undefined) {
            this.position = data.position;
        }
        if (data.reactions) {
            this.reactions = data.reactions.map(r => ({
                burstColors:  r.burst_colors,
                count:        r.count,
                countDetails: r.count_details,
                emoji:        r.emoji,
                me:           r.me,
                meBurst:      r.me_burst
            }));
        }

        if (data.referenced_message !== undefined) {
            if (data.referenced_message === null) {
                this.referencedMessage = null;
            } else {
                this.referencedMessage = this.channel ? this.channel.messages?.update(data.referenced_message) : new Message(data.referenced_message, this.client);
            }
        }

        if (data.role_subscription_data !== undefined) {
            this.roleSubscriptionData = {
                isRenewal:                 data.role_subscription_data.is_renewal,
                roleSubscriptionListingID: data.role_subscription_data.role_subscription_listing_id,
                tierName:                  data.role_subscription_data.tier_name,
                totalMonthsSubscribed:     data.role_subscription_data.total_months_subscribed
            };
        }


        if (data.sticker_items !== undefined) {
            this.stickerItems = data.sticker_items;
        }
        if (data.thread !== undefined) {
            this.thread = this.client.util.updateThread(data.thread);

        }
    }

    /** The channel this message was created in. */
    get channel(): T extends AnyTextableChannel ? T : undefined {
        return this._cachedChannel ??= this.client.getChannel(this.channelID) as T extends AnyTextableChannel ? T : undefined;
    }

    /** The guild this message is in. This will throw an error if the guild is not cached. */
    get guild(): T extends AnyTextableGuildChannel ? Guild : Guild | null {
        if (this.guildID !== null && this._cachedGuild !== null) {
            this._cachedGuild ??= this.client.guilds.get(this.guildID);
            if (!this._cachedGuild) {
                if (this.client.options.restMode) {
                    throw new UncachedError(`${this.constructor.name}#guild is not present when rest mode is enabled.`);
                }

                if (!this.client.shards.connected) {
                    throw new UncachedError(`${this.constructor.name}#guild is not present without a gateway connection.`);
                }

                throw new UncachedError(`${this.constructor.name}#guild is not present.`);
            }

            return this._cachedGuild;
        }

        return this._cachedGuild === null ? this._cachedGuild : (this._cachedGuild = null as T extends AnyTextableGuildChannel ? Guild : Guild | null);
    }

    /** A link to this message. */
    get jumpLink(): string {
        return `${BASE_URL}${Routes.MESSAGE_LINK(this.guildID ?? "@me", this.channelID, this.id)}`;
    }

    /**
     * Add a reaction to this message.
     * @param emoji The reaction to add to the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     */
    async createReaction(emoji: string): Promise<void> {
        return this.client.rest.channels.createReaction(this.channelID, this.id, emoji);
    }

    /**
     * Crosspost this message in an announcement channel.
     */
    async crosspost(): Promise<Message<T>> {
        return this.client.rest.channels.crosspostMessage<T>(this.channelID, this.id);
    }

    /**
     * Delete this message.
     * @param reason The reason for deleting the message.
     */
    async delete(reason?: string): Promise<void> {
        return this.client.rest.channels.deleteMessage(this.channelID, this.id, reason);
    }

    /**
     * Remove a reaction from this message.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @param user The user to remove the reaction from, `@me` for the current user (default).
     */
    async deleteReaction(emoji: string, user = "@me"): Promise<void> {
        return this.client.rest.channels.deleteReaction(this.channelID, this.id, emoji, user);
    }

    /**
     * Remove all, or a specific emoji's reactions from this message.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis. Omit to remove all reactions.
     */
    async deleteReactions(emoji?: string): Promise<void> {
        return this.client.rest.channels.deleteReactions(this.channelID, this.id, emoji);
    }

    /**
     * Delete this message as a webhook.
     * @param token The token of the webhook.
     * @param options Options for deleting the message.
     */
    async deleteWebhook(token: string, options: DeleteWebhookMessageOptions): Promise<void> {
        if (!this.webhookID) {
            throw new TypeError("This message is not a webhook message.");
        }
        return this.client.rest.webhooks.deleteMessage(this.webhookID, token, this.id, options);
    }

    /**
     * Edit this message.
     * @param options The options for editing the message.
     */
    async edit(options: EditMessageOptions):  Promise<Message<T>> {
        return this.client.rest.channels.editMessage<T>(this.channelID, this.id, options);
    }

    /**
     * Edit this message as a webhook.
     * @param token The token of the webhook.
     * @param options The options for editing the message.
     */
    async editWebhook(token: string, options: EditWebhookMessageOptions): Promise<Message<T>> {
        if (!this.webhookID) {
            throw new TypeError("This message is not a webhook message.");
        }
        return this.client.rest.webhooks.editMessage<never>(this.webhookID, token, this.id, options);
    }

    /** End this The poll on this message now. */
    async expire(): Promise<void> {
        if (this.poll === undefined) {
            throw new TypeError("Message does not have a poll.");
        }

        await this.poll.expire();
    }

    /**
     * Get the users that voted on a poll answer.
     * @param answerID The ID of the poll answer to get voters for.
     * @param options The options for getting the voters.
     */
    async getPollAnswerUsers(answerID: number, options?: GetPollAnswerUsersOptions): Promise<Array<User>> {
        if (this.poll === undefined) {
            throw new TypeError("Message does not have a poll.");
        }

        return this.poll.getAnswerUsers(answerID, options);
    }

    /**
     * Get the users who reacted with a specific emoji on this message.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @param options The options for getting the reactions.
     */
    async getReactions(emoji: string, options?: GetReactionsOptions): Promise<Array<User>> {
        return this.client.rest.channels.getReactions(this.channelID, this.id, emoji, options);
    }

    /** Whether this message belongs to a cached guild channel. The only difference on using this method over a simple if statement is to easily update all the message properties typing definitions based on the channel it belongs to. */
    inCachedGuildChannel(): this is Message<AnyTextableGuildChannel> {
        return this.channel instanceof GuildChannel;
    }

    /** Whether this message belongs to a direct message channel (PrivateChannel or uncached). The only difference on using this method over a simple if statement is to easily update all the message properties typing definitions based on the channel it belongs to. */
    inDirectMessageChannel(): this is Message<PrivateChannel | Uncached> {
        return this.guildID === null;
    }

    /**
     * Pin this message.
     * @param reason The reason for pinning the message.
     */
    async pin(reason?: string): Promise<void> {
        return this.client.rest.channels.pinMessage(this.channelID, this.id, reason);
    }


    /**
     * Create a thread from this message.
     * @param options The options for creating the thread.
     */
    async startThread(options: StartThreadFromMessageOptions): Promise<T extends AnnouncementChannel ? AnnouncementThreadChannel : T extends TextChannel ? PublicThreadChannel : never> {
        return this.client.rest.channels.startThreadFromMessage<T extends AnnouncementChannel ? AnnouncementThreadChannel : T extends TextChannel ? PublicThreadChannel : never>(this.channelID, this.id, options);
    }
    override toJSON(): JSONMessage {
        return {
            ...super.toJSON(),
            activity:        this.activity,
            applicationID:   this.applicationID ?? undefined,
            attachments:     this.attachments.map(attachment => attachment.toJSON()),
            author:          this.author.toJSON(),
            channelID:       this.channelID,
            components:      this.components,
            content:         this.content,
            editedTimestamp: this.editedTimestamp?.getTime() ?? null,
            embeds:          this.embeds,
            flags:           this.flags,
            guildID:         this.guildID ?? undefined,
            interaction:     this.interaction === undefined ? undefined : {
                id:     this.interaction.id,
                member: this.interaction.member?.toJSON(),
                name:   this.interaction.name,
                type:   this.interaction.type,
                user:   this.interaction.user.toJSON()
            },
            interactionMetadata: this.interactionMetadata === undefined ? undefined : {
                id:                            this.interactionMetadata.id,
                interactedMessageID:           this.interactionMetadata.interactedMessageID,
                name:                          this.interactionMetadata.name,
                originalResponseMessageID:     this.interactionMetadata.originalResponseMessageID,
                type:                          this.interactionMetadata.type,
                user:                          this.interactionMetadata.user instanceof User ? this.interactionMetadata.user.toJSON() : this.interactionMetadata.user,
                authorizingIntegrationOwners:  this.interactionMetadata.authorizingIntegrationOwners,
                triggeringInteractionMetadata: this.interactionMetadata.triggeringInteractionMetadata === undefined ? undefined : {
                    id:                           this.interactionMetadata.triggeringInteractionMetadata.id,
                    interactedMessageID:          this.interactionMetadata.triggeringInteractionMetadata.interactedMessageID,
                    originalResponseMessageID:    this.interactionMetadata.triggeringInteractionMetadata.originalResponseMessageID,
                    type:                         this.interactionMetadata.triggeringInteractionMetadata.type,
                    user:                         this.interactionMetadata.triggeringInteractionMetadata.user instanceof User ? this.interactionMetadata.triggeringInteractionMetadata.user.toJSON() : this.interactionMetadata.triggeringInteractionMetadata.user,
                    authorizingIntegrationOwners: this.interactionMetadata.triggeringInteractionMetadata.authorizingIntegrationOwners
                }
            },
            mentionChannels: this.mentionChannels,
            mentions:        {
                channels: this.mentions.channels,
                everyone: this.mentions.everyone,
                members:  this.mentions.members.map(member => member.toJSON()),
                roles:    this.mentions.roles,
                users:    this.mentions.users.map(user => user.toJSON())
            },
            messageReference: this.messageReference,
            messageSnapshots: this.messageSnapshots?.map(s => ({
                message: {
                    attachments:     s.message.attachments.map(a => a.toJSON()),
                    content:         s.message.content,
                    editedTimestamp: s.message.editedTimestamp?.getTime() ?? null,
                    embeds:          s.message.embeds,
                    flags:           s.message.flags,
                    mentions:        {
                        channels: s.message.mentions.channels,
                        roles:    s.message.mentions.roles,
                        users:    s.message.mentions.users.map(u => u.toJSON())
                    },
                    timestamp: s.message.timestamp.getTime(),
                    type:      s.message.type
                }
            })),
            nonce:             this.nonce,
            pinned:            this.pinned,
            position:          this.position,
            reactions:         this.reactions,
            referencedMessage: this.referencedMessage?.toJSON(),
            stickerItems:      this.stickerItems,
            thread:            this.thread?.toJSON(),
            timestamp:         this.timestamp.getTime(),
            tts:               this.tts,
            type:              this.type,
            webhook:           this.webhookID
        };
    }

    /**
     * Unpin this message.
     * @param reason The reason for unpinning the message.
     */
    async unpin(reason?: string): Promise<void> {
        return this.client.rest.channels.unpinMessage(this.channelID, this.id, reason);
    }
}
