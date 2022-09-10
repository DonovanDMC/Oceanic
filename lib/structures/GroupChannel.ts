import Channel from "./Channel";
import User from "./User";
import Message from "./Message";
import type ClientApplication from "./ClientApplication";
import Invite from "./Invite";
import type { ChannelTypes, ImageFormat } from "../Constants";
import type Client from "../Client";
import * as Routes from "../util/Routes";
import type {
    AddGroupRecipientOptions,
    CreateInviteOptions,
    CreateMessageOptions,
    EditGroupDMOptions,
    EditMessageOptions,
    GetChannelMessagesOptions,
    GetReactionsOptions,
    InviteChannel,
    InviteInfoTypes,
    RawGroupChannel,
    RawMessage
} from "../types/channels";
import type { RawUser } from "../types/users";
import TypedCollection from "../util/TypedCollection";
import type { Uncached } from "../types/shared";
import type { JSONGroupChannel } from "../types/json";

/** Represents a group direct message. */
export default class GroupChannel extends Channel {
    /** The application that made this group channel. This can be a partial object with just an `id` property. */
    application: ClientApplication | Uncached;
    /** The icon hash of this group, if any. */
    icon: string | null;
    /** The last message sent in this channel. This will only be present if a message has been sent within the current session. */
    lastMessage?: Message | null;
    /** The ID of last message sent in this channel. */
    lastMessageID: string | null;
    /** If this group channel is managed by an application. */
    managed: boolean;
    /** The cached messages in this channel. */
    messages: TypedCollection<string, RawMessage, Message>;
    /** The name of this group channel. */
    name: string | null;
    /** The nicknames used when creating this group channel. */
    nicks: Array<Record<"id" | "nick", string>>;
    /** The owner of this group channel. */
    owner?: User;
    /** The ID of the owner of this group channel. */
    ownerID: string;
    /** The other recipients in this group channel. */
    recipients: TypedCollection<string, RawUser, User>;
    declare type: ChannelTypes.GROUP_DM;
    constructor(data: RawGroupChannel, client: Client) {
        super(data, client);
        this.application = { id: data.application_id };
        this.icon = null;
        this.lastMessageID = data.last_message_id;
        this.managed = false;
        this.messages = new TypedCollection(Message, client, client.options.collectionLimits.messages);
        this.name = data.name;
        this.nicks = [];
        this.owner = this.client.users.get(data.owner_id);
        this.ownerID = data.owner_id;
        this.recipients = new TypedCollection(User, client);
        data.recipients.forEach(r => this.recipients.add(client.users.update(r)));
        this.update(data);
    }

    protected update(data: Partial<RawGroupChannel>): void {
        super.update(data);
        if (data.application_id !== undefined) {
            this.application = this.client.application?.id === data.application_id ? this.client.application : { id: data.application_id } ;
        }
        if (data.icon !== undefined) {
            this.icon = data.icon;
        }
        if (data.last_message_id !== undefined) {
            this.lastMessage = data.last_message_id === null ? null : this.messages.get(data.last_message_id);
            this.lastMessageID = data.last_message_id;
        }
        if (data.managed !== undefined) {
            this.managed = data.managed;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.nicks !== undefined) {
            this.nicks = data.nicks;
        }
        if (data.owner_id !== undefined) {
            this.owner = this.client.users.get(data.owner_id);
            this.ownerID = data.owner_id;
        }
        if (data.type !== undefined) {
            this.type = data.type;
        }
        if (data.recipients !== undefined) {
            for (const id of this.recipients.keys()) {
                if (!data.recipients.find(r => r.id === id)) {
                    this.recipients.delete(id);
                }
            }


            for (const r of data.recipients) {
                if (!this.recipients.has(r.id)) {
                    this.recipients.add(this.client.users.update(r));
                }
            }

        }
    }

    /**
     * Add a user to this channel.
     * @param options The options for adding the user.
     */
    async addRecipient(options: AddGroupRecipientOptions): Promise<void> {
        return this.client.rest.channels.addGroupRecipient(this.id, options);
    }

    /**
     * Create an invite for this channel.
     * @param options The options for creating the invite.
     */
    async createInvite(options: CreateInviteOptions): Promise<Invite<InviteInfoTypes, InviteChannel>> {
        return this.client.rest.channels.createInvite(this.id, options);
    }

    /**
     * Create a message in this channel.
     * @param options The options for creating the message.
     */
    async createMessage(options: CreateMessageOptions): Promise<Message<this>> {
        return this.client.rest.channels.createMessage<this>(this.id, options);
    }

    /**
     * Add a reaction to a message in this channel.
     * @param messageID The ID of the message to add a reaction to.
     * @param emoji The reaction to add to the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     */
    async createReaction(messageID: string, emoji: string): Promise<void> {
        return this.client.rest.channels.createReaction(this.id, messageID, emoji);
    }

    /**
     * Delete a message in this channel.
     * @param messageID The ID of the message to delete.
     * @param reason The reason for deleting the message.
     */
    async deleteMessage(messageID: string, reason?: string): Promise<void> {
        return this.client.rest.channels.deleteMessage(this.id, messageID, reason);
    }

    /**
     * Remove a reaction from a message in this channel.
     * @param messageID The ID of the message to remove a reaction from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     */
    async deleteReaction(messageID: string, emoji: string): Promise<void> {
        return this.client.rest.channels.deleteReaction(this.id, messageID, emoji);
    }

    /**
     * Edit this channel.
     * @param options The options for editing the channel.
     */
    async edit(options: EditGroupDMOptions): Promise<GroupChannel> {
        return this.client.rest.channels.edit<GroupChannel>(this.id, options);
    }

    /**
     * Edit a message in this channel.
     * @param messageID The ID of the message to edit.
     * @param options The options for editing the message.
     */
    async editMessage(messageID: string, options: EditMessageOptions): Promise<Message<this>> {
        return this.client.rest.channels.editMessage<this>(this.id, messageID, options);
    }

    /**
     * Get a message in this channel.
     * @param messageID The ID of the message to get.
     */
    async getMessage(messageID: string): Promise<Message<this>> {
        return this.client.rest.channels.getMessage<this>(this.id, messageID);
    }

    /**
     * Get messages in this channel.
     * @param options The options for getting the messages. All options are mutually exclusive.
     */
    async getMessages(options?: GetChannelMessagesOptions): Promise<Array<Message<this>>> {
        return this.client.rest.channels.getMessages<this>(this.id, options);
    }

    /**
     * Get the pinned messages in this channel.
     */
    async getPinnedMessages(): Promise<Array<Message<this>>> {
        return this.client.rest.channels.getPinnedMessages<this>(this.id);
    }

    /**
     * Get the users who reacted with a specific emoji on a message.
     * @param messageID The ID of the message to get reactions from.
     * @param emoji The reaction to remove from the message. `name:id` for custom emojis, and the unicode codepoint for default emojis.
     * @param options The options for getting the reactions.
     */
    async getReactions(messageID: string, emoji: string, options?: GetReactionsOptions): Promise<Array<User>> {
        return this.client.rest.channels.getReactions(this.id, messageID, emoji, options);
    }

    /**
     * The url of this application's icon.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    iconURL(format?: ImageFormat, size?: number): string | null {
        return this.icon === null ? null : this.client.util.formatImage(Routes.APPLICATION_ICON(this.application.id, this.icon), format, size);
    }

    /**
     * Pin a message in this channel.
     * @param messageID The ID of the message to pin.
     * @param reason The reason for pinning the message.
     */
    async pinMessage(messageID: string, reason?: string): Promise<void> {
        return this.client.rest.channels.pinMessage(this.id, messageID, reason);
    }

    /**
     * Remove a user from this channel.
     * @param userID The ID of the user to remove.
     */
    async removeRecipient(userID: string): Promise<void> {
        return this.client.rest.channels.removeGroupRecipient(this.id, userID);
    }

    /**
     * Show a typing indicator in this channel.
     */
    async sendTyping(): Promise<void> {
        return this.client.rest.channels.sendTyping(this.id);
    }

    override toJSON(): JSONGroupChannel {
        return {
            ...super.toJSON(),
            applicationID: this.application.id,
            icon:          this.icon,
            managed:       this.managed,
            name:          this.name,
            nicks:         this.nicks,
            ownerID:       this.ownerID,
            recipients:    this.recipients.map(user => user.toJSON()),
            type:          this.type
        };
    }

    /**
     * Unpin a message in this channel.
     * @param messageID The ID of the message to unpin.
     * @param reason The reason for unpinning the message.
     */
    async unpinMessage(messageID: string, reason?: string): Promise<void> {
        return this.client.rest.channels.unpinMessage(this.id, messageID, reason);
    }
}
