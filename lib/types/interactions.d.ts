/** @module Types/Interactions */
import type { ExecuteWebhookOptions } from "./webhooks";
import type {
    AnyTextableGuildChannel,
    AnyPrivateChannel,
    ModalActionRow,
    RawAttachment,
    RawInteractionResolvedChannel,
    RawMessage,
    AnyInteractionChannel
} from "./channels";
import type { InteractionMember, RawMember, RawRole } from "./guilds";
import type { RawUser } from "./users";
import type { Uncached } from "./shared";
import type { LocaleMap, RawEntitlement, RawTestEntitlement } from "./applications";
import type {
    ApplicationCommandOptionTypes,
    ApplicationCommandTypes,
    ApplicationIntegrationTypes,
    ComponentTypes,
    GuildFeature,
    InteractionContextTypes,
    InteractionResponseTypes,
    InteractionTypes,
    MessageComponentTypes,
    ModalComponentTypes,
    SelectMenuTypes
} from "../Constants";
import type Attachment from "../structures/Attachment";
import type Member from "../structures/Member";
import type Message from "../structures/Message";
import type Role from "../structures/Role";
import type User from "../structures/User";
import type PingInteraction from "../structures/PingInteraction";
import type CommandInteraction from "../structures/CommandInteraction";
import type ComponentInteraction from "../structures/ComponentInteraction";
import type AutocompleteInteraction from "../structures/AutocompleteInteraction";
import type ModalSubmitInteraction from "../structures/ModalSubmitInteraction";
import type InteractionOptionsWrapper from "../util/interactions/InteractionOptionsWrapper";
import type TypedCollection from "../util/TypedCollection";
import type InteractionResolvedChannel from "../structures/InteractionResolvedChannel";
import type SelectMenuValuesWrapper from "../util/interactions/SelectMenuValuesWrapper";
import type Interaction from "../structures/Interaction";
import type Guild from "../structures/Guild";
import type Permission from "../structures/Permission";
import type ModalSubmitInteractionComponentsWrapper from "../util/interactions/ModalSubmitInteractionComponentsWrapper";

export interface InteractionContent extends Pick<ExecuteWebhookOptions, "tts" | "content" | "embeds" | "allowedMentions" | "flags" | "components" | "attachments" | "files" | "poll"> {}
export interface InitialInteractionContent extends Omit<InteractionContent, "attachments" | "files"> {}

export type InteractionResponse = PingInteractionResponse | MessageInteractionResponse | DeferredInteractionResponse | AutocompleteInteractionResponse | ModalSubmitInteractionResponse | PremiumRequiredResponse;
export interface PingInteractionResponse {
    type: InteractionResponseTypes.PONG;
}

export interface MessageInteractionResponse {
    /** The [response data](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-messages). Convert any `snake_case` keys to `camelCase`. */
    data: InteractionContent;
    type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE | InteractionResponseTypes.UPDATE_MESSAGE;
}

export interface DeferredInteractionResponse {
    /** The response data. Only [flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) can be sent. */
    data?: { flags?: number; };
    type: InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE | InteractionResponseTypes.DEFERRED_UPDATE_MESSAGE;
}

export interface AutocompleteInteractionResponse {
    /** The [response data](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-autocomplete). */
    data: { choices: Array<AutocompleteChoice>; };
    type: InteractionResponseTypes.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT;
}

export interface ModalSubmitInteractionResponse {
    /** The [response data](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal). Convert any `snake_case` keys to `camelCase`. */
    data: ModalData;
    type: InteractionResponseTypes.MODAL;
}

export interface PremiumRequiredResponse {
    data: Record<string, never>;
    type: InteractionResponseTypes.PREMIUM_REQUIRED;
}


export interface ModalData {
    /** The components of the modal. Each component needs its own row. `snake_case` keys should be converted to `camelCase`, or passed through {@link Util.rawModalComponents | Util#rawModalComponents}. */
    components: Array<ModalActionRow>;
    /** The custom ID of the modal. */
    customID: string;
    /** The title of the modal. */
    title: string;
}

export interface RawInteraction {
    app_permissions: string;
    application_id: string;
    authorizing_integration_owners: AuthorizingIntegrationOwners;
    channel_id?: string;
    context?: InteractionContextTypes;
    data?: RawInteractionData;
    entitlements?: Array<RawEntitlement | RawTestEntitlement>;
    guild?: InteractionGuild;
    guild_id?: string;
    guild_locale?: string;
    id: string;
    locale?: string;
    member?: InteractionMember;
    message?: RawMessage;
    token: string;
    type: InteractionTypes;
    user?: RawUser;
    version: 1;
}

export interface AuthorizingIntegrationOwners extends Partial<Record<`${ApplicationIntegrationTypes}`, string>> {}

export type AnyRawInteraction = RawPingInteraction | AnyRawGatewayInteraction;
export type AnyRawGatewayInteraction = RawApplicationCommandInteraction | RawMessageComponentInteraction | RawAutocompleteInteraction | RawModalSubmitInteraction;
export interface RawPingInteraction extends Pick<RawInteraction, "application_id" | "id" | "token" | "type" | "version"> {}
export interface RawApplicationCommandInteraction extends Omit<RawInteraction, "data" | "message"> { data: RawApplicationCommandInteractionData; }
export interface RawMessageComponentInteraction extends Omit<RawInteraction, "data" | "message"> { data: RawMessageComponentInteractionData; message: RawMessage; }
export interface RawAutocompleteInteraction extends Omit<RawInteraction, "data" | "message"> { data: RawAutocompleteInteractionData; }
export interface RawModalSubmitInteraction extends Omit<RawInteraction, "data" | "message"> { data: RawModalSubmitInteractionData; message?: RawMessage; }

export type RawInteractionData = RawApplicationCommandInteractionData | RawMessageComponentInteractionData | RawAutocompleteInteractionData | RawModalSubmitInteractionData;
export type InteractionData = ApplicationCommandInteractionData | MessageComponentInteractionData | AutocompleteInteractionData | ModalSubmitInteractionData;
export interface RawApplicationCommandInteractionData {
    guild_id?: string;
    id: string;
    name: string;
    options?: Array<InteractionOptions>;
    resolved?: RawApplicationCommandInteractionResolvedData;
    target_id?: string;
    type: ApplicationCommandTypes;
}
export interface ApplicationCommandInteractionData<T extends AnyInteractionChannel | Uncached = AnyInteractionChannel | Uncached, C extends ApplicationCommandTypes = ApplicationCommandTypes> {
    guildID?: string;
    id: string;
    name: string;
    options: InteractionOptionsWrapper;
    resolved: ApplicationCommandInteractionResolvedData;
    target: C extends ApplicationCommandTypes.CHAT_INPUT ? null : C extends ApplicationCommandTypes.USER ? User : C extends ApplicationCommandTypes.MESSAGE ? Message<T> : User | Message<T> | null;
    targetID: C extends ApplicationCommandTypes.CHAT_INPUT ? null : C extends ApplicationCommandTypes.USER | ApplicationCommandTypes.MESSAGE ? string : string | null;
    type: C;
}
export interface RawAutocompleteInteractionData extends Omit<RawApplicationCommandInteractionData, "resolved" | "target_id"> {}
export interface AutocompleteInteractionData extends Omit<ApplicationCommandInteractionData, "resolved" | "target" | "targetID"> {}

export interface RawMessageComponentInteractionResolvedData {
    channels?: Record<string, RawInteractionResolvedChannel>;
    members?: Record<string, Omit<RawMember, "user" | "deaf" | "mute">>;
    roles?: Record<string, RawRole>;
    users?: Record<string, RawUser>;
}

export interface MessageComponentInteractionResolvedData {
    channels: TypedCollection<RawInteractionResolvedChannel, InteractionResolvedChannel>;
    members: TypedCollection<RawMember, Member, [guildID: string]>;
    roles: TypedCollection<RawRole, Role, [guildID: string]>;
    users: TypedCollection<RawUser, User>;
}

export interface RawMessageComponentInteractionData {
    component_type: MessageComponentTypes;
    custom_id: string;
    resolved?: RawMessageComponentInteractionResolvedData;
    values?: Array<string>;
}

export type MessageComponentInteractionData = MessageComponentButtonInteractionData | MessageComponentSelectMenuInteractionData;
export interface MessageComponentButtonInteractionData {
    componentType: ComponentTypes.BUTTON;
    customID: string;
}

export interface MessageComponentSelectMenuInteractionData {
    componentType: SelectMenuTypes;
    customID: string;
    resolved: MessageComponentInteractionResolvedData;
    values: SelectMenuValuesWrapper;
}

export interface RawModalSubmitInteractionData {
    components: Array<RawModalSubmitComponentsActionRow>;
    custom_id: string;
}

export interface ModalSubmitInteractionData {
    components: ModalSubmitInteractionComponentsWrapper;
    customID: string;
}

export interface RawApplicationCommandInteractionResolvedData {
    attachments?: Record<string, RawAttachment>;
    channels?: Record<string, RawInteractionResolvedChannel>;
    members?: Record<string, Omit<RawMember, "user" | "deaf" | "mute">>;
    messages?: Record<string, RawMessage>;
    roles?: Record<string, RawRole>;
    users?: Record<string, RawUser>;
}

export interface ApplicationCommandInteractionResolvedData {
    attachments: TypedCollection<RawAttachment, Attachment>;
    channels: TypedCollection<RawInteractionResolvedChannel, InteractionResolvedChannel>;
    members: TypedCollection<RawMember, Member, [guildID: string]>;
    messages: TypedCollection<RawMessage, Message>;
    roles: TypedCollection<RawRole, Role, [guildID: string]>;
    users: TypedCollection<RawUser, User>;
}

export type InteractionOptions = InteractionOptionsWithOptions | InteractionOptionsWithValue;
export type InteractionOptionsWithOptions = InteractionOptionsSubCommand | InteractionOptionsSubCommandGroup;
export type InteractionOptionsWithValue = InteractionOptionsString | InteractionOptionsInteger | InteractionOptionsBoolean | InteractionOptionsUser | InteractionOptionsChannel | InteractionOptionsRole | InteractionOptionsMentionable | InteractionOptionsNumber | InteractionOptionsAttachment;
export interface InteractionOptionsBase {
    focused?: boolean;
    name: string;
    type: ApplicationCommandOptionTypes;
}

export interface InteractionOptionsSubCommand extends InteractionOptionsBase {
    options?: Array<InteractionOptionsWithValue>;
    type: ApplicationCommandOptionTypes.SUB_COMMAND;
}

export interface InteractionOptionsSubCommandGroup extends InteractionOptionsBase {
    options?: Array<InteractionOptionsSubCommand | InteractionOptionsWithValue>;
    type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP;
}

export interface InteractionOptionsStringValue<T extends InteractionOptionsStringTypes = InteractionOptionsStringTypes> extends InteractionOptionsBase {
    type: T;
    value: string;
}

export interface InteractionOptionsNumberValue<T extends InteractionOptionsNumberTypes = InteractionOptionsNumberTypes> extends InteractionOptionsBase {
    type: T;
    value: number;
}

export interface InteractionOptionsBooleanValue<T extends InteractionOptionsBooleanTypes = InteractionOptionsBooleanTypes> extends InteractionOptionsBase {
    type: T;
    value: boolean;
}

type InteractionOptionsStringTypes = ApplicationCommandOptionTypes.STRING | ApplicationCommandOptionTypes.USER | ApplicationCommandOptionTypes.CHANNEL | ApplicationCommandOptionTypes.ROLE | ApplicationCommandOptionTypes.MENTIONABLE | ApplicationCommandOptionTypes.ATTACHMENT;
type InteractionOptionsNumberTypes = ApplicationCommandOptionTypes.NUMBER | ApplicationCommandOptionTypes.INTEGER;
type InteractionOptionsBooleanTypes = ApplicationCommandOptionTypes.BOOLEAN;

export type InteractionOptionsString = InteractionOptionsStringValue<ApplicationCommandOptionTypes.STRING>;
export type InteractionOptionsInteger = InteractionOptionsNumberValue<ApplicationCommandOptionTypes.INTEGER>;
export type InteractionOptionsBoolean = InteractionOptionsBooleanValue<ApplicationCommandOptionTypes.BOOLEAN>;
export type InteractionOptionsUser = InteractionOptionsStringValue<ApplicationCommandOptionTypes.USER>;
export type InteractionOptionsChannel = InteractionOptionsStringValue<ApplicationCommandOptionTypes.CHANNEL>;
export type InteractionOptionsRole = InteractionOptionsStringValue<ApplicationCommandOptionTypes.ROLE>;
export type InteractionOptionsMentionable = InteractionOptionsStringValue<ApplicationCommandOptionTypes.MENTIONABLE>;
export type InteractionOptionsNumber = InteractionOptionsNumberValue<ApplicationCommandOptionTypes.NUMBER>;
export type InteractionOptionsAttachment = InteractionOptionsStringValue<ApplicationCommandOptionTypes.ATTACHMENT>;

export type AnyInteraction = PingInteraction | AnyInteractionGateway;
export type AnyInteractionGateway = AutocompleteInteraction | CommandInteraction | ComponentInteraction | ModalSubmitInteraction;


export interface AutocompleteChoice {
    /** The name of the choice. */
    name: string;
    /** A dictionary of [locales](https://discord.com/developers/docs/reference#locales) to localized names. */
    nameLocalizations?: LocaleMap;
    /** The value of the choice. */
    value: string;
}

type Guildify<T extends Interaction> = Omit<T, "guild" | "guildID" | "guildLocale" | "guildPartial" | "member" | "memberPermissions"> & {
    guild: Guild;
    guildID: string;
    guildLocale: string;
    guildPartial: InteractionGuild;
    member: Member;
    memberPermissions: Permission;
};
type Privatify<T extends Interaction> = Omit<T, "guild" | "guildID" | "guildLocale" | "guildPartial" | "member" | "memberPermissions"> & {
    guild: undefined;
    guildID: undefined;
    guildLocale: undefined;
    guildPartial: undefined;
    member: undefined;
    memberPermissions: undefined;
};

export interface GuildAutocompleteInteraction extends Guildify<AutocompleteInteraction<AnyTextableGuildChannel>> {}
export interface PrivateAutocompleteInteraction extends Privatify<AutocompleteInteraction<AnyPrivateChannel | Uncached>> {}
export type AnyAutocompleteInteraction = GuildAutocompleteInteraction | PrivateAutocompleteInteraction;

export interface GuildCommandInteraction extends Guildify<CommandInteraction<AnyTextableGuildChannel>> {}
export interface PrivateCommandInteraction extends Privatify<CommandInteraction<AnyPrivateChannel | Uncached>> {}
export type AnyCommandInteraction = GuildCommandInteraction | PrivateCommandInteraction;

export interface GuildComponentButtonInteraction extends Guildify<ComponentInteraction<ComponentTypes.BUTTON, AnyTextableGuildChannel>> {}
export interface GuildComponentSelectMenuInteraction extends Guildify<ComponentInteraction<SelectMenuTypes, AnyTextableGuildChannel>> {}
export type GuildComponentInteraction = GuildComponentButtonInteraction | GuildComponentSelectMenuInteraction;

export interface PrivateComponentButtonInteraction extends Privatify<ComponentInteraction<ComponentTypes.BUTTON, AnyPrivateChannel | Uncached>> {}
export interface PrivateComponentSelectMenuInteraction extends Privatify<ComponentInteraction<SelectMenuTypes, AnyPrivateChannel | Uncached>> {}
export type PrivateComponentInteraction = PrivateComponentButtonInteraction | PrivateComponentSelectMenuInteraction;
export type AnyComponentButtonInteraction = GuildComponentButtonInteraction | PrivateComponentButtonInteraction;
export type AnyComponentSelectMenuInteraction = GuildComponentSelectMenuInteraction | PrivateComponentSelectMenuInteraction;
export type AnyComponentInteraction = AnyComponentButtonInteraction | AnyComponentSelectMenuInteraction;

export interface GuildModalSubmitInteraction extends Guildify<ModalSubmitInteraction<AnyTextableGuildChannel>> {}
export interface PrivateModalSubmitInteraction extends Privatify<ModalSubmitInteraction<AnyPrivateChannel | Uncached>> {}
export type AnyModalSubmitInteraction = GuildModalSubmitInteraction | PrivateModalSubmitInteraction;

export type SubCommandArray = [subcommand: string] | [subcommandGroup: string, subcommand: string];
export type AutoCompleteFocusedOption = InteractionOptionsString | InteractionOptionsNumber | InteractionOptionsInteger;

export interface InteractionGuild {
    features: Array<GuildFeature>;
    id: string;
    locale: string;
}

export type AnyGuildInteraction = GuildAutocompleteInteraction | GuildCommandInteraction | GuildComponentInteraction | GuildModalSubmitInteraction;
export type AnyPrivateInteraction = PrivateAutocompleteInteraction | PrivateCommandInteraction | PrivateComponentInteraction | PrivateModalSubmitInteraction;


export type SelectMenuDefaultValueTypes = "user" | "role" | "channel";
export interface SelectMenuDefaultValue {
    id: string;
    type: SelectMenuDefaultValueTypes;
}

interface RawModalSubmitComponentsBase {
    custom_id: string;
}

export interface RawModalSubmitComponentsStringValue<T extends ModalComponentTypes = ModalComponentTypes> extends RawModalSubmitComponentsBase {
    type: T;
    value: string;
}

interface RawModalComponentsActionRow<T extends RawModalSubmitComponents> {
    components: Array<T>;
    type: ComponentTypes.ACTION_ROW;
}

interface ModalComponentsActionRow<T extends ModalSubmitComponents> {
    components: Array<T>;
    type: ComponentTypes.ACTION_ROW;
}

export type ToModalSubmitComponentFromRaw<T extends RawModalSubmitComponents> =
T extends RawModalSubmitTextInputComponent ? ModalSubmitTextInputComponent :
    never;

export type RawModalSubmitComponentsActionRow = RawModalComponentsActionRow<RawModalSubmitComponents>;
export type RawModalSubmitComponents = RawModalSubmitTextInputComponent;
export interface RawModalSubmitTextInputComponent extends RawModalSubmitComponentsStringValue<ComponentTypes.TEXT_INPUT> {}

interface ModalSubmitComponentsBase {
    customID: string;
}

export interface ModalSubmitComponentsStringValue<T extends ModalComponentTypes = ModalComponentTypes> extends ModalSubmitComponentsBase {
    type: T;
    value: string;
}

export type ToRawFromoModalSubmitComponent<T extends ModalSubmitComponents> =
T extends ModalSubmitTextInputComponent ? RawModalSubmitTextInputComponent :
    never;

export type ModalSubmitComponentsActionRow = ModalComponentsActionRow<ModalSubmitComponents>;
export type ModalSubmitComponents = ModalSubmitTextInputComponent;
export interface ModalSubmitTextInputComponent extends ModalSubmitComponentsStringValue<ComponentTypes.TEXT_INPUT> {}

export type ApplicationCommandTypesWithTarget = ApplicationCommandTypes.USER | ApplicationCommandTypes.MESSAGE;
