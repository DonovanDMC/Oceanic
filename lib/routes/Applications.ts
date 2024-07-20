/** @module REST/ApplicationCommands */
import * as Routes from "../util/Routes";
import type {
    AnyApplicationCommand,
    ApplicationCommandOptionConversion,
    CreateApplicationCommandOptions,
    CreateChatInputApplicationCommandOptions,
    EditApplicationCommandOptions,
    EditApplicationCommandPermissionsOptions,
    EditChatInputApplicationCommandOptions,
    RESTGuildApplicationCommandPermissions,
    RawApplicationCommand,
    RawGuildApplicationCommandPermissions,
    CreateGuildApplicationCommandOptions,
    EditGuildApplicationCommandOptions,
    GetApplicationCommandOptions,
    CreateTestEntitlementOptions,
    RawEntitlement,
    RawSKU,
    RawTestEntitlement,
    SearchEntitlementsOptions
} from "../types/applications";
import ApplicationCommand from "../structures/ApplicationCommand";
import type { RequestOptions } from "../types/request-handler";
import type RESTManager from "../rest/RESTManager";
import SKU from "../structures/SKU";
import Entitlement from "../structures/Entitlement";
import TestEntitlement from "../structures/TestEntitlement";
import ClientApplication from "../structures/ClientApplication";
import type {
    ApplicationEmoji,
    ApplicationEmojis,
    CreateApplicationEmojiOptions,
    EditApplicationEmojiOptions,
    EditApplicationOptions,
    RESTApplication,
    RawApplicationEmoji,
    RawApplicationEmojis,
    RawClientApplication
} from "../types";
import Application from "../structures/Application";

/** Various methods for interacting with application commands. Located at {@link Client#rest | Client#rest}{@link RESTManager#applications | .applications}. */
export default class Applications {
    private _manager: RESTManager;
    constructor(manager: RESTManager) {
        this._manager = manager;
    }

    /**
     * Overwrite all existing global application commands.
     * @param applicationID The ID of the application.
     * @param options The commands.
     * @caching This method **does not** cache its result.
     */
    async bulkEditGlobalCommands(applicationID: string, options: Array<CreateApplicationCommandOptions>): Promise<Array<ApplicationCommand>> {
        const opts = options as Array<CreateChatInputApplicationCommandOptions>;
        return this._manager.authRequest<Array<RawApplicationCommand>>({
            method: "PUT",
            path:   Routes.APPLICATION_COMMANDS(applicationID),
            json:   opts.map(opt => ({
                contexts:                   opt.contexts,
                description:                opt.description,
                default_member_permissions: opt.defaultMemberPermissions,
                description_localizations:  opt.descriptionLocalizations,
                dm_permission:              opt.dmPermission,
                integration_types:          opt.integrationTypes,
                name:                       opt.name,
                name_localizations:         opt.nameLocalizations,
                nsfw:                       opt.nsfw,
                options:                    opt.options?.map(o => this._manager.client.util.optionToRaw(o)),
                type:                       opt.type
            }))
        }).then(data => data.map(d => new ApplicationCommand(d, this._manager.client)));
    }

    /**
     * Overwrite all existing application commands in a guild.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @param options The commands.
     * @caching This method **does not** cache its result.
     */
    async bulkEditGuildCommands(applicationID: string, guildID: string, options: Array<CreateGuildApplicationCommandOptions>): Promise<Array<ApplicationCommand>> {
        const opts = options as Array<CreateChatInputApplicationCommandOptions>;
        return this._manager.authRequest<Array<RawApplicationCommand>>({
            method: "PUT",
            path:   Routes.GUILD_APPLICATION_COMMANDS(applicationID, guildID),
            json:   opts.map(opt => ({
                id:                         opt.id,
                default_member_permissions: opt.defaultMemberPermissions,
                description:                opt.description,
                description_localizations:  opt.descriptionLocalizations,
                dm_permission:              opt.dmPermission,
                name:                       opt.name,
                name_localizations:         opt.nameLocalizations,
                nsfw:                       opt.nsfw,
                options:                    opt.options?.map(o => this._manager.client.util.optionToRaw(o)),
                type:                       opt.type
            }))
        }).then(data => data.map(d => new ApplicationCommand(d, this._manager.client)));
    }

    /**
     * Mark an entitlement as consumed.
     * @param applicationID The ID of the application to the entitlement is for.
     * @param entitlementID The ID of the entitlement to consume.
     */
    async consumeEntitlement(applicationID: string, entitlementID: string): Promise<void> {
        await this._manager.authRequest<void>({
            method: "POST",
            path:   Routes.CONSUME_ENTITLEMENT(applicationID, entitlementID)
        });
    }

    /**
     * Create an emoji for an application.
     * @param applicationID The ID of the application.
     * @param options The options for creating the emoji.
     * @caching This method **does not** cache its result.
     */
    async createEmoji(applicationID: string, options: CreateApplicationEmojiOptions): Promise<ApplicationEmoji> {
        if (options.image) {
            options.image = this._manager.client.util._convertImage(options.image, "image");
        }

        return this._manager.authRequest<RawApplicationEmoji>({
            method: "POST",
            path:   Routes.APPLICATION_EMOJIS(applicationID),
            json:   {
                name:  options.name,
                image: options.image
            }
        }).then(emoji => this._manager.client.util.convertApplicationEmoji(emoji));
    }

    /**
     * Create a global application command.
     * @param applicationID The ID of the application.
     * @param options The options for the command.
     * @caching This method **does not** cache its result.
     */
    async createGlobalCommand<T extends CreateApplicationCommandOptions = CreateApplicationCommandOptions>(applicationID: string, options: T): Promise<ApplicationCommandOptionConversion<T>> {
        const opt = options as CreateChatInputApplicationCommandOptions;
        return this._manager.authRequest<RawApplicationCommand>({
            method: "POST",
            path:   Routes.APPLICATION_COMMANDS(applicationID),
            json:   {
                contexts:                   opt.contexts,
                default_member_permissions: opt.defaultMemberPermissions,
                description:                opt.description,
                description_localizations:  opt.descriptionLocalizations,
                dm_permission:              opt.dmPermission,
                integration_types:          opt.integrationTypes,
                name:                       opt.name,
                name_localizations:         opt.nameLocalizations,
                nsfw:                       opt.nsfw,
                options:                    opt.options?.map(o => this._manager.client.util.optionToRaw(o)),
                type:                       opt.type
            }
        }).then(data => new ApplicationCommand(data, this._manager.client) as never);
    }

    /**
     * Create a guild application command.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @param options The options for the command.
     * @caching This method **does not** cache its result.
     */
    async createGuildCommand<T extends CreateGuildApplicationCommandOptions = CreateGuildApplicationCommandOptions>(applicationID: string, guildID: string, options: T): Promise<ApplicationCommandOptionConversion<T>> {
        const opt = options as CreateChatInputApplicationCommandOptions;
        return this._manager.authRequest<RawApplicationCommand>({
            method: "POST",
            path:   Routes.GUILD_APPLICATION_COMMANDS(applicationID, guildID),
            json:   {
                default_member_permissions: opt.defaultMemberPermissions,
                description:                opt.description,
                description_localizations:  opt.descriptionLocalizations,
                dm_permission:              opt.dmPermission,
                name:                       opt.name,
                name_localizations:         opt.nameLocalizations,
                nsfw:                       opt.nsfw,
                options:                    opt.options?.map(o => this._manager.client.util.optionToRaw(o)),
                type:                       opt.type
            }
        }).then(data => new ApplicationCommand(data, this._manager.client) as never);
    }

    /**
     * Create a test entitlement.
     * @param applicationID The ID of the application to create the entitlement for.
     * @param options The options for creating the test entitlement.
     */
    async createTestEntitlement(applicationID: string, options: CreateTestEntitlementOptions): Promise<TestEntitlement> {
        return this._manager.authRequest<RawTestEntitlement>({
            method: "POST",
            path:   Routes.ENTITLEMENTS(applicationID),
            json:   {
                owner_id:   options.ownerID,
                owner_type: options.ownerType,
                sku_id:     options.skuID
            }
        }).then(data => new TestEntitlement(data, this._manager.client));
    }

    /**
     * Delete an emoji for an application.
     * @param applicationID The ID of the application.
     * @param emojiID The ID of the emoji to be deleted.
     * @caching This method **does not** cache its result.
     */
    async deleteEmoji(applicationID: string, emojiID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.APPLICATION_EMOJI(applicationID, emojiID)
        });
    }

    /**
     * Delete a global application command.
     * @param applicationID The ID of the application.
     * @param commandID The ID the command to delete.
     * @caching This method **does not** cache its result.
     */
    async deleteGlobalCommand(applicationID: string, commandID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.APPLICATION_COMMAND(applicationID, commandID)
        });
    }

    /**
     * Delete a guild application command.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @param commandID The ID of the command to delete.
     * @caching This method **does not** cache its result.
     */
    async deleteGuildCommand(applicationID: string, guildID: string, commandID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.GUILD_APPLICATION_COMMAND(applicationID, guildID, commandID)
        });
    }

    /**
     * Delete an entitlement.
     * @param applicationID The ID of the application to delete the entitlement from.
     * @param entitlementID The ID of the entitlement to delete.
     */
    async deleteTestEntitlement(applicationID: string, entitlementID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.ENTITLEMENT(applicationID, entitlementID)
        });
    }

    /**
     * Edit the currently authenticated bot's application info.
     * @param options The options for editing the application.
     * @caching This method **does not** cache its result.
     */
    async editCurrent(options: EditApplicationOptions): Promise<Application> {
        if (options.coverImage) {
            options.coverImage = this._manager.client.util._convertImage(options.coverImage, "cover image");
        }

        if (options.icon) {
            options.icon = this._manager.client.util._convertImage(options.icon, "cover image");
        }

        return this._manager.authRequest<RESTApplication>({
            method: "PATCH",
            path:   Routes.APPLICATION,
            json:   {
                cover_image:                       options.coverImage,
                custom_install_url:                options.customInstallURL,
                description:                       options.description,
                flags:                             options.flags,
                icon:                              options.icon,
                install_params:                    options.installParams,
                integration_types_config:          options.integrationTypesConfig,
                interactions_endpoint_url:         options.interactionsEndpointURL,
                role_connections_verification_url: options.roleConnectionsVerificationURL,
                tags:                              options.tags
            }
        }).then(data => new Application(data, this._manager.client));
    }

    /**
     * Edit an existing emoji for an application.
     * @param applicationID The ID of the application.
     * @param emojiID The ID of the emoji to be edited.
     * @param options The options for editing the emoji.
     * @caching This method **does not** cache its result.
     */
    async editEmoji(applicationID: string, emojiID: string, options: EditApplicationEmojiOptions): Promise<ApplicationEmoji> {
        return this._manager.authRequest<RawApplicationEmoji>({
            method: "PATCH",
            path:   Routes.APPLICATION_EMOJI(applicationID, emojiID),
            json:   { name: options.name }
        }).then(emoji => this._manager.client.util.convertApplicationEmoji(emoji));
    }

    /**
     * Edit a global application command.
     * @param applicationID The ID of the application.
     * @param commandID The ID of the command to edit.
     * @param options The options for editing the command.
     * @caching This method **does not** cache its result.
     */
    async editGlobalCommand<T extends EditApplicationCommandOptions = EditApplicationCommandOptions>(applicationID: string, commandID: string, options: T): Promise<ApplicationCommandOptionConversion<T>> {
        const opt = options as EditChatInputApplicationCommandOptions;
        return this._manager.authRequest<RawApplicationCommand>({
            method: "PATCH",
            path:   Routes.APPLICATION_COMMAND(applicationID, commandID),
            json:   {
                contexts:                   opt.contexts,
                default_member_permissions: opt.defaultMemberPermissions,
                description:                opt.description,
                description_localizations:  opt.descriptionLocalizations,
                dm_permission:              opt.dmPermission,
                integration_types:          opt.integrationTypes,
                name:                       opt.name,
                name_localizations:         opt.nameLocalizations,
                nsfw:                       opt.nsfw,
                options:                    opt.options?.map(o => this._manager.client.util.optionToRaw(o))
            }
        }).then(data => new ApplicationCommand(data, this._manager.client) as never);
    }

    /**
     * Edit a guild application command.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @param commandID The ID of the command to edit.
     * @param options The options for editing the command.
     * @caching This method **does not** cache its result.
     */
    async editGuildCommand<T extends EditGuildApplicationCommandOptions = EditGuildApplicationCommandOptions>(applicationID: string, guildID: string, commandID: string, options: T): Promise<ApplicationCommandOptionConversion<T>> {
        const opt = options as EditChatInputApplicationCommandOptions;
        return this._manager.authRequest<RawApplicationCommand>({
            method: "PATCH",
            path:   Routes.GUILD_APPLICATION_COMMAND(applicationID, guildID, commandID),
            json:   {
                default_member_permissions: opt.defaultMemberPermissions,
                description:                opt.description,
                description_localizations:  opt.descriptionLocalizations,
                dm_permission:              opt.dmPermission,
                name:                       opt.name,
                name_localizations:         opt.nameLocalizations,
                nsfw:                       opt.nsfw,
                options:                    opt.options?.map(o => this._manager.client.util.optionToRaw(o))
            }
        }).then(data => new ApplicationCommand(data, this._manager.client) as never);
    }

    /**
     * Edit a guild application command's permissions. This requires a bearer token with the `applications.commands.permissions.update` scope.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @param commandID The ID of the command.
     * @param options The options for editing the permissions.
     * @caching This method **does not** cache its result.
     */
    async editGuildCommandPermissions(applicationID: string, guildID: string, commandID: string, options: EditApplicationCommandPermissionsOptions): Promise<RESTGuildApplicationCommandPermissions> {
        return (options.accessToken ? this._manager.request.bind(this._manager) : this._manager.authRequest.bind(this._manager))({
            method: "PATCH",
            path:   Routes.GUILD_APPLICATION_COMMAND_PERMISSION(applicationID, guildID, commandID),
            json:   { permissions: options.permissions },
            auth:   options.accessToken
        } as Omit<RequestOptions, "auth">).then(data => {
            const d = data as RawGuildApplicationCommandPermissions;
            return {
                applicationID: d.application_id,
                guildID:       d.guild_id,
                id:            d.id,
                permissions:   d.permissions
            };
        });
    }

    /**
     * Get the currently authenticated bot's application info as a bare {@link ClientApplication | ClientApplication}.
     * @caching This method **does not** cache its result.
     */
    async getClient(): Promise<ClientApplication> {
        return this._manager.authRequest<RawClientApplication>({
            method: "GET",
            path:   Routes.APPLICATION
        }).then(data => new ClientApplication(data, this._manager.client));
    }

    /**
     * Get the currently authenticated bot's application info.
     * @caching This method **does not** cache its result.
     */
    async getCurrent(): Promise<Application> {
        return this._manager.authRequest<RESTApplication>({
            method: "GET",
            path:   Routes.APPLICATION
        }).then(data => new Application(data, this._manager.client));
    }

    /**
     * Get an emoji for an application.
     * @param applicationID The ID of the application to get the emojis of.
     * @param emojiID The ID of the emoji to get.
     * @caching This method **does not** cache its result.
     */
    async getEmoji(applicationID: string, emojiID: string): Promise<ApplicationEmoji> {
        return this._manager.authRequest<RawApplicationEmoji>({
            method: "GET",
            path:   Routes.APPLICATION_EMOJI(applicationID, emojiID)
        }).then(emoji => this._manager.client.util.convertApplicationEmoji(emoji));
    }

    /**
     * Get the emojis for an application.
     * @param applicationID The ID of the application to get the emojis of.
     * @caching This method **does not** cache its result.
     */
    async getEmojis(applicationID: string): Promise<ApplicationEmojis> {
        return this._manager.authRequest<RawApplicationEmojis>({
            method: "GET",
            path:   Routes.APPLICATION_EMOJIS(applicationID)
        }).then(({ items }) => ({
            items: items.map(item => this._manager.client.util.convertApplicationEmoji(item))
        }));
    }

    /**
     * Get the entitlements for an application.
     * @param applicationID The ID of the application to get the entitlements of.
     * @param options The options for getting the entitlements.
     */
    async getEntitlements(applicationID: string, options: SearchEntitlementsOptions = {}): Promise<Array<Entitlement | TestEntitlement>> {
        const query = new URLSearchParams();
        if (options.after !== undefined) query.set("after", options.after);
        if (options.before !== undefined) query.set("before", options.before);
        if (options.excludeEnded !== undefined) query.set("exclude_ended", String(options.excludeEnded));
        if (options.guildID !== undefined) query.set("guild_id", options.guildID);
        if (options.limit !== undefined) query.set("limit", String(options.limit));
        if (options.skuIDs !== undefined) query.set("sku_ids", options.skuIDs.join(","));
        if (options.userID !== undefined) query.set("subscription_id", options.userID);
        return this._manager.authRequest<Array<RawEntitlement | RawTestEntitlement>>({
            method: "GET",
            path:   Routes.ENTITLEMENTS(applicationID),
            query
        }).then(data => data.map(d => "subscription_id" in d && d.subscription_id ? new Entitlement(d, this._manager.client) : new TestEntitlement(d, this._manager.client)));
    }

    /**
     * Get a global application command.
     * @param applicationID The ID of the application.
     * @param commandID The ID of the command.
     * @param options The options for getting the command.
     * @caching This method **does not** cache its result.
     */
    async getGlobalCommand<T extends AnyApplicationCommand = AnyApplicationCommand>(applicationID: string, commandID: string, options?: GetApplicationCommandOptions): Promise<T> {
        const query = new URLSearchParams();
        if (options?.withLocalizations !== undefined) {
            query.set("with_localizations", options.withLocalizations.toString());
        }
        return this._manager.authRequest<RawApplicationCommand>({
            method:  "GET",
            path:    Routes.APPLICATION_COMMAND(applicationID, commandID),
            query,
            headers: options?.locale === undefined ? undefined : { "X-Discord-Locale": options.locale }
        }).then(data => new ApplicationCommand(data, this._manager.client) as never);
    }

    /**
     * Get an application's global commands.
     * @param applicationID The ID of the application.
     * @param options The options for getting the command.
     * @caching This method **does not** cache its result.
     */
    async getGlobalCommands(applicationID: string, options?: GetApplicationCommandOptions): Promise<Array<AnyApplicationCommand>> {
        const query = new URLSearchParams();
        if (options?.withLocalizations !== undefined) {
            query.set("with_localizations", options.withLocalizations.toString());
        }
        return this._manager.authRequest<Array<RawApplicationCommand>>({
            method:  "GET",
            path:    Routes.APPLICATION_COMMANDS(applicationID),
            query,
            headers: options?.locale === undefined ? undefined : { "X-Discord-Locale": options.locale }
        }).then(data => data.map(d => new ApplicationCommand(d, this._manager.client)) as never);
    }

    /**
     * Get a global application command.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @param commandID The ID of the command.
     * @param options The options for getting the command.
     * @caching This method **does not** cache its result.
     */
    async getGuildCommand<T extends AnyApplicationCommand = AnyApplicationCommand>(applicationID: string, guildID: string, commandID: string, options?: GetApplicationCommandOptions): Promise<T> {
        const query = new URLSearchParams();
        if (options?.withLocalizations !== undefined) {
            query.set("with_localizations", options.withLocalizations.toString());
        }
        return this._manager.authRequest<RawApplicationCommand>({
            method:  "GET",
            path:    Routes.GUILD_APPLICATION_COMMAND(applicationID, commandID, guildID),
            query,
            headers: options?.locale === undefined ? undefined : { "X-Discord-Locale": options.locale }
        }).then(data => new ApplicationCommand(data, this._manager.client) as never);
    }

    /**
     * Get an application's application commands in a specific guild.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @param options The options for getting the command.
     * @caching This method **does not** cache its result.
     */
    async getGuildCommands(applicationID: string, guildID: string, options?: GetApplicationCommandOptions): Promise<Array<AnyApplicationCommand>> {
        const query = new URLSearchParams();
        if (options?.withLocalizations !== undefined) {
            query.set("with_localizations", options.withLocalizations.toString());
        }
        return this._manager.authRequest<Array<RawApplicationCommand>>({
            method:  "GET",
            path:    Routes.GUILD_APPLICATION_COMMANDS(applicationID, guildID),
            query,
            headers: options?.locale === undefined ? undefined : { "X-Discord-Locale": options.locale }
        }).then(data => data.map(d => new ApplicationCommand(d, this._manager.client)) as never);
    }

    /**
     * Get an application command's permissions in a guild.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @param commandID The ID of the command.
     * @caching This method **does not** cache its result.
     */
    async getGuildPermission(applicationID: string, guildID: string, commandID: string): Promise<RESTGuildApplicationCommandPermissions> {
        return this._manager.authRequest<RawGuildApplicationCommandPermissions>({
            method: "GET",
            path:   Routes.GUILD_APPLICATION_COMMAND_PERMISSION(applicationID, guildID, commandID)
        }).then(data => ({
            applicationID: data.application_id,
            guildID:       data.guild_id,
            id:            data.id,
            permissions:   data.permissions
        }));
    }

    /**
     * Get the permissions for all application commands in a guild.
     * @param applicationID The ID of the application.
     * @param guildID The ID of the guild.
     * @caching This method **does not** cache its result.
     */
    async getGuildPermissions(applicationID: string, guildID: string): Promise<Array<RESTGuildApplicationCommandPermissions>> {
        return this._manager.authRequest<Array<RawGuildApplicationCommandPermissions>>({
            method: "GET",
            path:   Routes.GUILD_APPLICATION_COMMAND_PERMISSIONS(applicationID, guildID)
        }).then(data => data.map(d => ({
            applicationID: d.application_id,
            guildID:       d.guild_id,
            id:            d.id,
            permissions:   d.permissions
        })));
    }

    /**
     * Get the SKUs for an application.
     * @param applicationID The ID of the application to get the SKUs of.
     */
    async getSKUs(applicationID: string): Promise<Array<SKU>> {
        return this._manager.authRequest<Array<RawSKU>>({
            method: "GET",
            path:   Routes.SKUS(applicationID)
        }).then(data => data.map(d => new SKU(d, this._manager.client)));
    }
}
