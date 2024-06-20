/** @module CommandInteraction */
import Interaction from "./Interaction";
import Attachment from "./Attachment";
import Member from "./Member";
import Message from "./Message";
import Role from "./Role";
import User from "./User";
import type Guild from "./Guild";
import Permission from "./Permission";
import GuildChannel from "./GuildChannel";
import type PrivateChannel from "./PrivateChannel";
import InteractionResolvedChannel from "./InteractionResolvedChannel";
import type Entitlement from "./Entitlement";
import type TestEntitlement from "./TestEntitlement";
import TypedCollection from "../util/TypedCollection";
import { ApplicationCommandTypes, InteractionResponseTypes, type InteractionTypes, type InteractionContextTypes } from "../Constants";
import type {
    ApplicationCommandInteractionData,
    InteractionContent,
    ModalData,
    RawApplicationCommandInteraction,
    ApplicationCommandInteractionResolvedData,
    InitialInteractionContent,
    InteractionGuild,
    AuthorizingIntegrationOwners,
    EditInteractionContent
} from "../types/interactions";
import type Client from "../Client";
import type { RawMember } from "../types/guilds";
import type { AnyTextableGuildChannel, AnyInteractionChannel } from "../types/channels";
import type { RawUser } from "../types/users";
import type { JSONCommandInteraction } from "../types/json";
import InteractionOptionsWrapper from "../util/interactions/InteractionOptionsWrapper";
import type { Uncached } from "../types/shared";
import { UncachedError } from "../util/Errors";
import MessageInteractionResponse, { type FollowupMessageInteractionResponse, type InitialMessagedInteractionResponse } from "../util/interactions/MessageInteractionResponse";

/** Represents a command interaction. */
export default class CommandInteraction<T extends AnyInteractionChannel | Uncached = AnyInteractionChannel | Uncached, C extends ApplicationCommandTypes = ApplicationCommandTypes> extends Interaction {
    private _cachedChannel!: T extends AnyInteractionChannel ? T : undefined;
    private _cachedGuild?: T extends AnyTextableGuildChannel ? Guild : Guild | null;
    /** The permissions the bot has in the channel this interaction was sent from. If in a dm/group dm, this will contain `ATTACH_FILES`, `EMBED_LINKS`, and `MENTION_EVERYONE`. In addition, `USE_EXTERNAL_EMOJIS` will be included for DMs with the app's bot user. */
    appPermissions: Permission;
    /** Details about the authorizing user or server for the installation(s) relevant to the interaction. See [Discord's docs](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object) for more information. */
    authorizingIntegrationOwners: AuthorizingIntegrationOwners;
    /** The ID of the channel this interaction was sent from. */
    channelID: string;
    /** The context this interaction was sent from. */
    context?: InteractionContextTypes;
    /** The data associated with the interaction. */
    data: ApplicationCommandInteractionData<T, C>;
    /** The entitlements for the user that created this interaction, and the guild it was created in. */
    entitlements: Array<Entitlement | TestEntitlement>;
    /** The id of the guild this interaction was sent from, if applicable. */
    guildID: T extends AnyTextableGuildChannel ? string : string | null;
    /** The preferred [locale](https://discord.com/developers/docs/reference#locales) of the guild this interaction was sent from, if applicable. */
    guildLocale: T extends AnyTextableGuildChannel ? string : string | undefined;
    /** The partial guild this interaction was sent from, if applicable. */
    guildPartial?: T extends AnyTextableGuildChannel ? InteractionGuild : InteractionGuild | undefined;
    /** The [locale](https://discord.com/developers/docs/reference#locales) of the invoking user. */
    locale: string;
    /** The member associated with the invoking user, if this interaction is sent from a guild. */
    member: T extends AnyTextableGuildChannel ? Member : Member | null;
    /** The permissions of the member associated with the invoking user, if this interaction is sent from a guild. */
    memberPermissions: T extends AnyTextableGuildChannel ? Permission : Permission | null;
    declare type: InteractionTypes.APPLICATION_COMMAND;
    /** The user that invoked this interaction. */
    user: User;
    constructor(data: RawApplicationCommandInteraction, client: Client) {
        super(data, client);
        this.appPermissions = new Permission(data.app_permissions ?? "0");
        this.authorizingIntegrationOwners = data.authorizing_integration_owners;
        this.channelID = data.channel_id!;
        this.context = data.context;
        const resolved: ApplicationCommandInteractionResolvedData = {
            attachments: new TypedCollection(Attachment, client),
            channels:    new TypedCollection(InteractionResolvedChannel, client),
            members:     new TypedCollection(Member, client),
            messages:    new TypedCollection(Message, client),
            roles:       new TypedCollection(Role, client),
            users:       new TypedCollection(User, client)
        };
        this.entitlements = data.entitlements?.map(entitlement => client.util.updateEntitlement(entitlement)) ?? [];
        this.guildID = (data.guild_id ?? null) as T extends AnyTextableGuildChannel ? string : string | null;
        this.guildLocale = data.guild_locale as T extends AnyTextableGuildChannel ? string : string | undefined;
        this.guildPartial = data.guild;
        this.locale = data.locale!;
        this.member = (data.member === undefined ? null : this.client.util.updateMember(data.guild_id!, data.member.user.id, data.member)) as T extends AnyTextableGuildChannel ? Member : Member | null;
        this.memberPermissions = (data.member === undefined ? null : new Permission(data.member.permissions)) as T extends AnyTextableGuildChannel ? Permission : Permission | null;
        this.user = client.users.update((data.user ?? data.member!.user)!);

        if (data.data.resolved) {
            if (data.data.resolved.attachments) {
                for (const attachment of Object.values(data.data.resolved.attachments)) resolved.attachments.update(attachment);
            }

            if (data.data.resolved.channels) {
                for (const channel of Object.values(data.data.resolved.channels)) resolved.channels.update(channel);
            }

            if (data.data.resolved.members) {
                for (const [id, member] of Object.entries(data.data.resolved.members)) {
                    const m = member as unknown as RawMember & { user: RawUser; };
                    m.user = data.data.resolved.users![id];
                    resolved.members.add(client.util.updateMember(data.guild_id!, id, m));
                }
            }

            if (data.data.resolved.messages) {
                for (const message of Object.values(data.data.resolved.messages)) {
                    const channel = client.getChannel(message.channel_id);
                    if (channel && "messages" in channel) {
                        resolved.messages.add(channel.messages.update(message));
                    } else {
                        resolved.messages.update(message);
                    }
                }
            }

            if (data.data.resolved.roles) {
                for (const role of Object.values(data.data.resolved.roles)) {
                    try {
                        resolved.roles.add(this.guild?.roles.update(role, this.guildID!) ?? new Role(role, client, this.guildID!));
                    } catch {
                        resolved.roles.add(new Role(role, client, this.guildID!));
                    }
                }
            }

            if (data.data.resolved.users) {
                for (const user of Object.values(data.data.resolved.users)) resolved.users.add(client.users.update(user));
            }
        }

        this.data = {
            guildID:  data.data.guild_id,
            id:       data.data.id,
            name:     data.data.name,
            options:  new InteractionOptionsWrapper(data.data.options ?? [], resolved ?? null),
            resolved,
            target:   null as never,
            targetID: data.data.target_id as never,
            type:     data.data.type as C
        };

        if (this.data.targetID) {
            if (this.data.type === ApplicationCommandTypes.USER) {
                this.data.target = resolved.users.get(this.data.targetID) as never;
            } else if (this.data.type === ApplicationCommandTypes.MESSAGE) {
                this.data.target = resolved.messages.get(this.data.targetID) as never;
            }
        }
    }

    /** The channel this interaction was sent from. */
    get channel(): T extends AnyInteractionChannel ? T : undefined {
        return this._cachedChannel ??= this.client.getChannel(this.channelID) as T extends AnyInteractionChannel ? T : undefined;
    }

    /** The guild this interaction was sent from, if applicable. This will throw an error if the guild is not cached. */
    get guild(): T extends AnyTextableGuildChannel ? Guild : Guild | null {
        if (this.guildID !== null && this._cachedGuild !== null) {
            this._cachedGuild ??= this.client.guilds.get(this.guildID);
            if (!this._cachedGuild) {
                throw new UncachedError(this, "guild", "GUILDS", this.client);
            }

            return this._cachedGuild;
        }

        return this._cachedGuild === null ? this._cachedGuild : (this._cachedGuild = null as T extends AnyTextableGuildChannel ? Guild : Guild | null);
    }

    /**
     * Create a followup message. Note that the returned class is not a message. The message is located in the property {@link MessageInteractionResponse#message | message}.
     * @param options The options for creating the followup message.
     */
    async createFollowup(options: InteractionContent): Promise<FollowupMessageInteractionResponse<this>> {
        const message = await this.client.rest.interactions.createFollowupMessage<T>(this.applicationID, this.token, options);
        return new MessageInteractionResponse<CommandInteraction<T>>(this, message, "followup") as FollowupMessageInteractionResponse<this>;
    }

    /**
     * Create a message through this interaction. This is an initial response, and more than one initial response cannot be used. Use {@link CommandInteraction#createFollowup | createFollowup}.
     * Note that the returned class is not a message. This initial response does not return a message. You will need to call {@link MessageInteractionResponse#getMessage | MessageInteractionResponse#getMessage} on the returned class,
     * or {@link CommandInteraction#getOriginal | getOriginal}.
     * @note You cannot attach files in an initial response. Defer the interaction, then use {@link CommandInteraction#createFollowup | createFollowup}.
     * @param options The options for the message.
     */
    async createMessage(options: InitialInteractionContent): Promise<InitialMessagedInteractionResponse<this>> {
        if (this.acknowledged) {
            throw new TypeError("Interactions cannot have more than one initial response.");
        }
        if ("files" in options && (options.files as []).length !== 0) {
            this.client.emit("warn", "You cannot attach files in an initial response. Defer the interaction, then use createFollowup.");
        }
        this.acknowledged = true;
        await this.client.rest.interactions.createInteractionResponse(this.id, this.token, { type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE, data: options });
        return new MessageInteractionResponse<this>(this, null, "initial") as InitialMessagedInteractionResponse<this>;
    }

    /**
     * Respond to this interaction with a modal. This is an initial response, and more than one initial response cannot be used.
     * @param options The options for the modal.
     */
    async createModal(options: ModalData): Promise<void> {
        if (this.acknowledged) {
            throw new TypeError("Interactions cannot have more than one initial response.");
        }
        this.acknowledged = true;
        return this.client.rest.interactions.createInteractionResponse(this.id, this.token, { type: InteractionResponseTypes.MODAL, data: options });
    }

    /**
     * Defer this interaction. This is an initial response, and more than one initial response cannot be used.
     * @param flags The [flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) to respond with.
     */
    async defer(flags?: number): Promise<void> {
        if (this.acknowledged) {
            throw new TypeError("Interactions cannot have more than one initial response.");
        }
        this.acknowledged = true;
        return this.client.rest.interactions.createInteractionResponse(this.id, this.token, { type: InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, data: { flags } });
    }

    /**
     * Delete a follow-up message.
     * @param messageID The ID of the message.
     */
    async deleteFollowup(messageID: string): Promise<void> {
        return this.client.rest.interactions.deleteFollowupMessage(this.applicationID, this.token, messageID);
    }

    /**
     * Delete the original interaction response.
     */
    async deleteOriginal(): Promise<void> {
        return this.client.rest.interactions.deleteOriginalMessage(this.applicationID, this.token);
    }

    /**
     * Edit a followup message.
     * @param messageID The ID of the message.
     * @param options The options for editing the followup message.
     */
    async editFollowup(messageID: string, options: EditInteractionContent): Promise<Message<T>> {
        return this.client.rest.interactions.editFollowupMessage<T>(this.applicationID, this.token, messageID, options);
    }

    /**
     * Edit the original interaction response.
     * @param options The options for editing the original message.
     */
    async editOriginal(options: EditInteractionContent): Promise<Message<T>> {
        return this.client.rest.interactions.editOriginalMessage<T>(this.applicationID, this.token, options);
    }

    /**
     * Get a followup message.
     * @param messageID The ID of the message.
     */
    async getFollowup(messageID: string): Promise<Message<T>> {
        return this.client.rest.interactions.getFollowupMessage<T>(this.applicationID, this.token, messageID);
    }

    /**
     * Get the original interaction response.
     */
    async getOriginal(): Promise<Message<T>> {
        return this.client.rest.interactions.getOriginalMessage<T>(this.applicationID, this.token);
    }

    /** Whether this interaction belongs to a cached guild channel. The only difference on using this method over a simple if statement is to easily update all the interaction properties typing definitions based on the channel it belongs to. */
    inCachedGuildChannel(): this is CommandInteraction<AnyTextableGuildChannel> {
        return this.channel instanceof GuildChannel;
    }

    /** Whether this interaction belongs to a private channel (PrivateChannel or uncached). The only difference on using this method over a simple if statement is to easily update all the interaction properties typing definitions based on the channel it belongs to. */
    inPrivateChannel(): this is CommandInteraction<PrivateChannel | Uncached> {
        return this.guildID === null;
    }

    /** A type guard, checking if this command interaction is a {@link Constants~ApplicationCommandTypes.CHAT_INPUT | Chat Input} command. */
    isChatInputCommand(): this is CommandInteraction<T, ApplicationCommandTypes.CHAT_INPUT> {
        return this.data.type === ApplicationCommandTypes.CHAT_INPUT;
    }

    /** A type guard, checking if this command interaction is a {@link Constants~ApplicationCommandTypes.MESSAGE | Message} command. */
    isMessageCommand(): this is CommandInteraction<T, ApplicationCommandTypes.MESSAGE> {
        return this.data.type === ApplicationCommandTypes.MESSAGE;
    }

    /** A type guard, checking if this command interaction is a {@link Constants~ApplicationCommandTypes.USER | User} command. */
    isUserCommand(): this is CommandInteraction<T, ApplicationCommandTypes.USER> {
        return this.data.type === ApplicationCommandTypes.USER;
    }

    /**
     * Show a "premium required" response to the user. This is an initial response, and more than one initial response cannot be used.
     * @deprecated The {@link Constants~InteractionTypes.PREMIUM_REQUIRED | PREMIUM_REQUIRED} interaction response type is now deprecated in favor of using {@link Types/Channels~PremiumButton | custom premium buttons}.
     */
    async premiumRequired(): Promise<void> {
        if (this.acknowledged) {
            throw new TypeError("Interactions cannot have more than one initial response.");
        }

        this.acknowledged = true;
        return this.client.rest.interactions.createInteractionResponse(this.id, this.token, { type: InteractionResponseTypes.PREMIUM_REQUIRED, data: {} });
    }

    /**
     * Reply to this interaction. If the interaction hasn't been acknowledged, {@link CommandInteraction#createMessage | createMessage} is used. Else, {@link CommandInteraction#createFollowup | createFollowup} is used.
     * Note the returned class is not a message. Depending on which method was used, the returned class may or may not have the sent message. {@link MessageInteractionResponse#hasMessage | hasMessage} can be used for type narrowing
     * to check if {@link MessageInteractionResponse#message | message} is present. If it is not, the {@link MessageInteractionResponse#getMessage | getMessage} can be used.
     * @note Due to atachments not being able to be sent in initial responses, attachments will cause a deferred response, if the interaction has not been acknowledged.
     * @param options The options for the message.
     */
    async reply(options: InteractionContent): Promise<MessageInteractionResponse<this>> {
        let useFollowup = this.acknowledged;
        if (!useFollowup && options.files && options.files.length !== 0) {
            await this.defer(options.flags);
            useFollowup = true;
        }
        return useFollowup ? this.createFollowup(options) : this.createMessage(options);
    }

    override toJSON(): JSONCommandInteraction {
        return {
            ...super.toJSON(),
            appPermissions:               this.appPermissions.toJSON(),
            authorizingIntegrationOwners: this.authorizingIntegrationOwners,
            channelID:                    this.channelID,
            context:                      this.context,
            data:                         this.data,
            guildID:                      this.guildID ?? undefined,
            guildLocale:                  this.guildLocale,
            locale:                       this.locale,
            member:                       this.member?.toJSON(),
            type:                         this.type,
            user:                         this.user.toJSON()
        };
    }
}
