import Interaction from "./Interaction";
import Member from "./Member";
import type User from "./User";
import Guild from "./Guild";
import Permission from "./Permission";
import type { InteractionTypes } from "../Constants";
import { InteractionResponseTypes } from "../Constants";
import type { AutocompleteChoice, AutocompleteInteractionData, RawAutocompleteInteraction } from "../types/interactions";
import type Client from "../Client";
import type { AnyTextChannel } from "../types/channels";
import type { JSONAutocompleteInteraction } from "../types/json";
import InteractionOptionsWrapper from "../util/InteractionOptionsWrapper";

export default class AutocompleteInteraction extends Interaction {
    /** The permissions the bot has in the channel this interaction was sent from. */
    appPermissions?: Permission;
    /** The channel this interaction was sent from. */
    channel?: AnyTextChannel;
    /** The ID of the channel this interaction was sent from. */
    channelID: string;
    /** The data associated with the interaction. */
    data: AutocompleteInteractionData;
    /** The guild this interaction was sent from, if applicable. */
    guild?: Guild | null;
    /** The id of the guild this interaction was sent from, if applicable. */
    guildID: string | null;
    /** The preferred [locale](https://discord.com/developers/docs/reference#locales) of the guild this interaction was sent from, if applicable. */
    guildLocale?: string;
    /** The [locale](https://discord.com/developers/docs/reference#locales) of the invoking user. */
    locale: string;
    /** The member associated with the invoking user. */
    member?: Member;
    /** The permissions of the member associated with the invoking user */
    memberPermissions?: Permission;
    declare type: InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE;
    /** The user that invoked this interaction. */
    user: User;
    constructor(data: RawAutocompleteInteraction, client: Client) {
        super(data, client);
        this.appPermissions = !data.app_permissions ? undefined : new Permission(data.app_permissions);
        this.channel = client.getChannel<AnyTextChannel>(data.channel_id!);
        this.channelID = data.channel_id!;
        this.data = {
            guildID: data.data.guild_id,
            id:      data.data.id,
            name:    data.data.name,
            options: new InteractionOptionsWrapper(data.data.options || [], null),
            type:    data.data.type
        };
        this.guild = data.guild_id === undefined ? null : client.guilds.get(data.guild_id);
        this.guildID = data.guild_id || null;
        this.guildLocale = data.guild_locale;
        this.locale = data.locale!;
        this.member = data.member ? this.client.util.updateMember(data.guild_id!, data.member.user.id, data.member) : undefined;
        this.memberPermissions = data.member ? new Permission(data.member.permissions) : undefined;
        this.user = client.users.update(data.user || data.member!.user);
    }

    /**
     * Acknowledge this interaction with a set of choices. This is an initial response, and more than one initial response cannot be used.
     * @param choices The choices to send.
     */
    async result(choices: Array<AutocompleteChoice>): Promise<void> {
        if (this.acknowledged) {
            throw new Error("Interactions cannot have more than one initial response.");
        }
        this.acknowledged = true;
        return this.client.rest.interactions.createInteractionResponse(this.id, this.token, { type: InteractionResponseTypes.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT, data: { choices } });
    }

    override toJSON(): JSONAutocompleteInteraction {
        return {
            ...super.toJSON(),
            appPermissions: this.appPermissions?.toJSON(),
            channel:        this.channelID,
            data:           this.data,
            guildID:        this.guildID || undefined,
            guildLocale:    this.guildLocale,
            locale:         this.locale,
            member:         this.member?.toJSON(),
            type:           this.type,
            user:           this.user.toJSON()
        };
    }
}
