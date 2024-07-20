/** @module Util */
import { CDN_URL } from "./Routes";
import type TypedCollection from "./TypedCollection";
import type Client from "../Client";
import {
    ButtonStyles,
    ComponentTypes,
    ImageFormats,
    MEDIA_PROXY_SIZES,
    type ImageFormat,
    ThreadChannelTypes,
    ChannelTypes,
    Intents,
    PrivilegedIntentMapping,
    type ApplicationFlags,
    type PrivilegedIntentNames
} from "../Constants";
import type {
    AllowedMentions,
    AnyChannel,
    AnyThreadChannel,
    Component,
    Embed,
    EmbedOptions,
    MessageActionRow,
    ModalActionRow,
    RawAllowedMentions,
    RawChannel,
    RawComponent,
    RawEmbed,
    RawEmbedOptions,
    RawGuildChannel,
    RawMessageActionRow,
    RawModalActionRow,
    RawThreadChannel,
    ToComponentFromRaw,
    ToRawFromComponent
} from "../types/channels";
import type { RawMember, RawSticker, RESTMember, Sticker } from "../types/guilds";
import type { ApplicationCommandOptions, CombinedApplicationCommandOption, RawApplicationCommandOption } from "../types/applications";
import Member from "../structures/Member";
import Channel from "../structures/Channel";
import type {
    AnyTextableChannel,
    CollectionLimitsOptions,
    GuildEmoji,
    ModalSubmitComponentsActionRow,
    RawAnnouncementThreadChannel,
    RawGroupChannel,
    RawGuildEmoji,
    RawMessage,
    RawModalSubmitComponents,
    RawModalSubmitComponentsActionRow,
    RawPrivateChannel,
    RawPrivateThreadChannel,
    RawPublicThreadChannel,
    RawSelectMenuComponent,
    RawStringSelectMenu,
    SelectMenuComponent,
    StringSelectMenu,
    ToModalSubmitComponentFromRaw,
    Uncached,
    RawBaseEntitlement,
    RawEntitlement,
    RawTestEntitlement,
    ApplicationEmoji,
    RawApplicationEmoji
} from "../types";
import Message from "../structures/Message";
import Entitlement from "../structures/Entitlement";
import TestEntitlement from "../structures/TestEntitlement";
import type Poll from "../structures/Poll";

/** A general set of utilities. These are intentionally poorly documented, as they serve almost no usefulness to outside developers. */
export default class Util {
    private _client: Client;

    constructor(client: Client) {
        this._client = client;
    }

    static rawEmbeds(embeds: RawEmbed): Embed;
    static rawEmbeds(embeds: Array<RawEmbed>): Array<Embed>;
    static rawEmbeds(embeds: RawEmbed | Array<RawEmbed>): Embed | Array<Embed> {
        const data = Util.prototype.embedsToParsed(Array.isArray(embeds) ? embeds : [embeds]);
        return Array.isArray(embeds) ? data : data[0];
    }

    static rawMessageComponents(components: RawMessageActionRow): MessageActionRow;
    static rawMessageComponents(components: Array<RawMessageActionRow>): Array<MessageActionRow>;
    static rawMessageComponents(components: RawMessageActionRow | Array<RawMessageActionRow>): MessageActionRow | Array<MessageActionRow> {
        const data = Util.prototype.componentsToParsed(Array.isArray(components) ? components : [components]);
        return Array.isArray(components) ? data : data[0];
    }

    static rawModalComponents(components: RawModalActionRow): ModalActionRow;
    static rawModalComponents(components: Array<RawModalActionRow>): Array<ModalActionRow>;
    static rawModalComponents(components: RawModalActionRow | Array<RawModalActionRow>): ModalActionRow | Array<ModalActionRow> {
        const data = Util.prototype.componentsToParsed(Array.isArray(components) ? components : [components]);
        return Array.isArray(components) ? data : data[0];
    }

    /** @hidden intentionally not documented - this is an internal function */
    _convertImage(image: Buffer | string, name: string): string {
        try {
            return this.convertImage(image);
        } catch (err) {
            throw new TypeError(`Invalid ${name} provided. Ensure you are providing a valid, fully-qualified base64 url.`, { cause: err as Error });
        }
    }

    /** @hidden intended for internal use only */
    _getLimit(name: Exclude<keyof CollectionLimitsOptions, "users">, id?: string): number {
        const opt = this._client.options.collectionLimits[name];
        if (typeof opt === "number") {
            return opt;
        }
        return (id === undefined ? undefined : opt[id]) ?? opt.default ?? Infinity;
    }

    _setLimit(values?: Record<string, number> | number, defaultValue = Infinity): Record<string, number> | number {
        if (values === undefined) {
            return defaultValue;
        }

        if (typeof values === "object") {
            return { default: defaultValue, ...values };
        }

        return values;
    }

    componentToParsed<T extends RawComponent>(component: T): ToComponentFromRaw<T> {
        switch (component.type) {
            case ComponentTypes.BUTTON: {
                if (component.style === ButtonStyles.LINK) return component as never;

                if (component.style === ButtonStyles.PREMIUM) {
                    return {
                        disabled: component.disabled,
                        skuID:    component.sku_id,
                        style:    component.style,
                        type:     component.type
                    } as never;
                }

                return {
                    customID: component.custom_id,
                    disabled: component.disabled,
                    emoji:    component.emoji,
                    label:    component.label,
                    style:    component.style,
                    type:     component.type
                } as never;
            }
            case ComponentTypes.TEXT_INPUT: {
                return {
                    customID:    component.custom_id,
                    label:       component.label,
                    maxLength:   component.max_length,
                    minLength:   component.min_length,
                    placeholder: component.placeholder,
                    required:    component.required,
                    style:       component.style,
                    type:        component.type,
                    value:       component.value
                } as never;
            }
            case ComponentTypes.STRING_SELECT:
            case ComponentTypes.USER_SELECT:
            case ComponentTypes.ROLE_SELECT:
            case ComponentTypes.MENTIONABLE_SELECT:
            case ComponentTypes.CHANNEL_SELECT: {
                const parsedComponent  = {
                    customID:    component.custom_id,
                    disabled:    component.disabled,
                    maxValues:   component.max_values,
                    minValues:   component.min_values,
                    placeholder: component.placeholder,
                    type:        component.type
                };

                if (component.type !== ComponentTypes.STRING_SELECT && component.default_values !== undefined) {
                    (parsedComponent as Exclude<SelectMenuComponent, StringSelectMenu>).defaultValues = component.default_values;
                }

                if (component.type === ComponentTypes.STRING_SELECT) {
                    return { ...parsedComponent, options: component.options } as never;
                } else if (component.type === ComponentTypes.CHANNEL_SELECT) {
                    return { ...parsedComponent, channelTypes: component.channel_types } as never;
                } else {
                    return parsedComponent as never;
                }
            }
            default: {
                return component as never;
            }
        }
    }

    componentToRaw<T extends Component>(component: T): ToRawFromComponent<T> {
        switch (component.type) {
            case ComponentTypes.BUTTON: {
                if (component.style === ButtonStyles.LINK) return component as never;

                if (component.style === ButtonStyles.PREMIUM) {
                    return {
                        disabled: component.disabled,
                        sku_id:   component.skuID,
                        style:    component.style,
                        type:     component.type
                    } as never;
                }

                return {
                    custom_id: component.customID,
                    disabled:  component.disabled,
                    emoji:     component.emoji,
                    label:     component.label,
                    style:     component.style,
                    type:      component.type
                } as never;
            }
            case ComponentTypes.TEXT_INPUT: {
                return {
                    custom_id:   component.customID,
                    label:       component.label,
                    max_length:  component.maxLength,
                    min_length:  component.minLength,
                    placeholder: component.placeholder,
                    required:    component.required,
                    style:       component.style,
                    type:        component.type,
                    value:       component.value
                } as never;
            }
            case ComponentTypes.STRING_SELECT:
            case ComponentTypes.USER_SELECT:
            case ComponentTypes.ROLE_SELECT:
            case ComponentTypes.MENTIONABLE_SELECT:
            case ComponentTypes.CHANNEL_SELECT: {
                const rawComponent = {
                    custom_id:   component.customID,
                    disabled:    component.disabled,
                    max_values:  component.maxValues,
                    min_values:  component.minValues,
                    placeholder: component.placeholder,
                    type:        component.type
                };

                if (component.type !== ComponentTypes.STRING_SELECT && component.defaultValues !== undefined) {
                    (rawComponent as Exclude<RawSelectMenuComponent, RawStringSelectMenu>).default_values = component.defaultValues;
                }

                if (component.type === ComponentTypes.STRING_SELECT) {
                    return { ...rawComponent, options: component.options } as never;
                } else if (component.type === ComponentTypes.CHANNEL_SELECT) {
                    return { ...rawComponent, channel_types: component.channelTypes } as never;
                } else {
                    return rawComponent as never;
                }
            }
            default: {
                return component as never;
            }
        }
    }

    componentsToParsed<T extends RawModalActionRow | RawMessageActionRow>(components: Array<T>): T extends RawModalActionRow ? Array<ModalActionRow> : T extends RawMessageActionRow ? Array<MessageActionRow> : never {
        return components.map(row => ({
            type:       row.type,
            components: row.components.map(component => this.componentToParsed(component))
        })) as never;
    }

    componentsToRaw<T extends ModalActionRow | MessageActionRow>(components: Array<T>): T extends ModalActionRow ? Array<RawModalActionRow> : T extends MessageActionRow ? Array<RawMessageActionRow> : never {
        return components.map(row => ({
            type:       row.type,
            components: row.components.map(component => this.componentToRaw(component))
        })) as never;
    }

    convertApplicationEmoji(raw: RawApplicationEmoji): ApplicationEmoji {
        return this.convertGuildEmoji(raw);
    }

    convertGuildEmoji(raw: RawGuildEmoji): GuildEmoji {
        return {
            animated:      raw.animated,
            available:     raw.available,
            id:            raw.id,
            managed:       raw.managed,
            name:          raw.name,
            requireColons: raw.require_colons,
            roles:         raw.roles,
            user:          raw.user ? this._client.users.update(raw.user) : undefined
        };
    }

    convertImage(img: Buffer | string): string {
        if (Buffer.isBuffer(img)) {
            const b64 = img.toString("base64");
            let mime: string | undefined;
            const magicMap: Array<[mime: string, magic: RegExp]> = [
                // 47 49 46 38
                ["image/gif", /^47494638/],
                // 89 50 4E 47
                ["image/png", /^89504E47/],
                // FF D8 FF
                ["image/jpeg", /^FFD8FF/],
                // 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
                ["image/webp", /^52494646\d{8}57454250/],
                // 02 27 62 20 22 0 - lottie JSON (assuming all files will start with {"v":")
                ["application/json", /^02276220220/]
            ];
            for (const format of magicMap) {
                if (format[1].test(this.getMagic(img, 16))) {
                    mime = format[0];
                    break;
                }
            }
            if (!mime) {
                throw new TypeError(`Failed to determine image format. (magic: ${this.getMagic(img, 16)})`);
            }
            img = `data:${mime};base64,${b64}`;
        }
        return img;
    }

    convertSticker(raw: RawSticker): Sticker {
        return {
            asset:       raw.asset,
            available:   raw.available,
            description: raw.description,
            formatType:  raw.format_type,
            guildID:     raw.guild_id,
            id:          raw.id,
            name:        raw.name,
            packID:      raw.pack_id,
            sortValue:   raw.sort_value,
            tags:        raw.tags,
            type:        raw.type,
            user:        raw.user ? this._client.users.update(raw.user) : undefined
        };
    }

    async detectMissingPrivilegedIntents(intents?: number): Promise<Array<PrivilegedIntentNames>> {
        const application = this._client["_application"] || await this._client.rest.applications.getClient();
        intents ??= this._client.shards.options.intents;
        this._client["_application"] ??= application;

        const missing: Array<PrivilegedIntentNames> = [];
        const check = (intent: Intents, allowed: Array<ApplicationFlags>): void => {
            if ((intents! & intent) === intent && !allowed.some(flag => (application.flags & flag) === flag)) {
                missing.push(Intents[intent] as PrivilegedIntentNames);
            }
        };
        for (const [intent, allowed] of PrivilegedIntentMapping) {
            check(intent, allowed);
        }

        return missing;
    }

    embedsToParsed(embeds: Array<RawEmbed>): Array<Embed> {
        return embeds.map(embed => ({
            author: embed.author === undefined ? undefined : {
                name:         embed.author.name,
                iconURL:      embed.author.icon_url,
                proxyIconURL: embed.author.proxy_icon_url
            },
            color:       embed.color,
            description: embed.description,
            fields:      embed.fields?.map(field => ({
                inline: field.inline,
                name:   field.name,
                value:  field.value
            })),
            footer: embed.footer === undefined ? undefined : {
                text:         embed.footer.text,
                iconURL:      embed.footer.icon_url,
                proxyIconURL: embed.footer.proxy_icon_url
            },
            timestamp: embed.timestamp,
            title:     embed.title,
            image:     embed.image === undefined ? undefined : {
                url:      embed.image.url,
                height:   embed.image.height,
                proxyURL: embed.image.proxy_url,
                width:    embed.image.width
            },
            provider: embed.provider === undefined ? undefined : {
                name: embed.provider.name,
                url:  embed.provider.url
            },
            thumbnail: embed.thumbnail === undefined ? undefined : {
                url:      embed.thumbnail.url,
                height:   embed.thumbnail.height,
                proxyURL: embed.thumbnail.proxy_url,
                width:    embed.thumbnail.width
            },
            url:   embed.url,
            type:  embed.type,
            video: embed.video === undefined ? undefined : {
                height:   embed.video.height,
                proxyURL: embed.video.proxy_url,
                url:      embed.video.url,
                width:    embed.video.width
            }
        }));
    }

    embedsToRaw(embeds: Array<EmbedOptions>): Array<RawEmbedOptions> {
        return embeds.map(embed => ({
            author: embed.author === undefined ? undefined :  {
                name:     embed.author.name,
                icon_url: embed.author.iconURL,
                url:      embed.author.url
            },
            color:       embed.color,
            description: embed.description,
            fields:      embed.fields?.map(field => ({
                inline: field.inline,
                name:   field.name,
                value:  field.value
            })),
            footer: embed.footer === undefined ? undefined : {
                text:     embed.footer.text,
                icon_url: embed.footer.iconURL
            },
            timestamp: embed.timestamp,
            title:     embed.title,
            image:     embed.image === undefined ? undefined : { url: embed.image.url },
            thumbnail: embed.thumbnail === undefined ? undefined : { url: embed.thumbnail.url },
            url:       embed.url
        }));
    }

    formatAllowedMentions(allowed?: AllowedMentions | null): RawAllowedMentions {
        const result: RawAllowedMentions = { parse: [] };

        if (!allowed) {
            return this.formatAllowedMentions(this._client.options.allowedMentions);
        }

        if (allowed.everyone === true) {
            result.parse.push("everyone");
        }

        if (allowed.roles === true) {
            result.parse.push("roles");
        } else if (Array.isArray(allowed.roles)) {
            result.roles = allowed.roles;
        }

        if (allowed.users === true) {
            result.parse.push("users");
        } else if (Array.isArray(allowed.users)) {
            result.users = allowed.users;
        }

        if (allowed.repliedUser === true) {
            result.replied_user = true;
        }

        return result;
    }

    formatImage(url: string, format?: ImageFormat, size?: number): string {
        if (!format || !ImageFormats.includes(format.toLowerCase() as ImageFormat)) {
            format = url.includes("/a_") ? "gif" : this._client.options.defaultImageFormat;
        }
        if (!size || !MEDIA_PROXY_SIZES.includes(size)) {
            size = this._client.options.defaultImageSize;
        }
        return `${CDN_URL}${url}.${format}?size=${size}`;
    }

    getMagic(file: Buffer, len = 4): string {
        return [...new Uint8Array(file.subarray(0, len))].map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    }

    modalSubmitComponentToParsed<T extends RawModalSubmitComponents>(component: T): ToModalSubmitComponentFromRaw<T> {
        switch (component.type) {
            case ComponentTypes.TEXT_INPUT: {
                return {
                    customID: component.custom_id,
                    type:     component.type,
                    value:    component.value
                } as never;
            }
            default: {
                return component as never;
            }
        }
    }

    modalSubmitComponentsToParsed<T extends RawModalSubmitComponentsActionRow>(components: Array<T>): Array<ModalSubmitComponentsActionRow> {
        return components.map(row => ({
            type:       row.type,
            components: row.components.map(component => this.modalSubmitComponentToParsed(component))
        })) as never;
    }

    optionToParsed(option: RawApplicationCommandOption): ApplicationCommandOptions {
        return {
            autocomplete:             option.autocomplete,
            channelTypes:             option.channel_types,
            choices:                  option.choices,
            description:              option.description,
            descriptionLocalizations: option.description_localizations,
            descriptionLocalized:     option.description_localized,
            max_length:               option.max_length,
            max_value:                option.max_value,
            min_length:               option.min_length,
            min_value:                option.min_value,
            name:                     option.name,
            nameLocalizations:        option.name_localizations,
            nameLocalized:            option.name_localized,
            options:                  option.options?.map(o => this.optionToParsed(o)),
            required:                 option.required,
            type:                     option.type
        } as ApplicationCommandOptions;
    }

    optionToRaw(option: ApplicationCommandOptions): RawApplicationCommandOption {
        const opt = option as CombinedApplicationCommandOption;
        return {
            autocomplete:  opt.autocomplete,
            channel_types: opt.channelTypes,
            choices:       opt.choices?.map(choice => ({
                name:               choice.name,
                name_localizations: choice.nameLocalizations,
                value:              choice.value
            })),
            description:               opt.description,
            description_localizations: opt.descriptionLocalizations,
            max_length:                opt.maxLength,
            max_value:                 opt.maxValue,
            min_length:                opt.minLength,
            min_value:                 opt.minValue,
            name:                      opt.name,
            name_localizations:        opt.nameLocalizations,
            options:                   opt.options?.map(o => this.optionToRaw(o as ApplicationCommandOptions)),
            required:                  opt.required,
            type:                      opt.type
        } satisfies RawApplicationCommandOption as RawApplicationCommandOption;
    }

    /** @internal */
    replacePollAnswer(poll: Poll, answerID: number, count: number, users?: Array<string>): void {
        let answerCount = poll.results.answerCounts.find(a => a.id === answerID);
        if (!answerCount) {
            answerCount = {
                count,
                id:      answerID,
                users:   [],
                meVoted: false
            };
        }

        answerCount.count = count;
        if (users) {
            answerCount.users = users;
            answerCount.meVoted = (this._client["_user"] && users.includes(this._client["_user"]?.id)) ?? false;
        }
    }

    updateChannel<T extends AnyChannel>(channelData: RawChannel): T {
        guild: if (channelData.guild_id) {
            const guild = this._client.guilds.get(channelData.guild_id);
            if (guild) {
                if (ThreadChannelTypes.includes(channelData.type as typeof ThreadChannelTypes[number])) {
                    if (!channelData.parent_id) {
                        break guild;
                    }
                    return (guild.threads.has(channelData.id) ? guild.threads.update(channelData as never) : (guild.threads as TypedCollection<RawAnnouncementThreadChannel | RawPublicThreadChannel | RawPrivateThreadChannel, AnyThreadChannel, []>).add(Channel.from<AnyThreadChannel>(channelData, this._client))) as T;
                } else {
                    return guild.channels.update(channelData as RawGuildChannel) as T;
                }
            }
        }

        switch (channelData.type) {
            case ChannelTypes.DM: return this._client.privateChannels.update(channelData as RawPrivateChannel) as T;
            case ChannelTypes.GROUP_DM: return this._client.groupChannels.update(channelData as RawGroupChannel) as T;
            default: return Channel.from<T>(channelData, this._client);
        }
    }

    /** @internal */
    updateEntitlement<T extends Entitlement | TestEntitlement = Entitlement | TestEntitlement>(data: RawBaseEntitlement): T {
        if (this._client["_application"] === undefined) {
            return "subscription_id" in data && data.subscription_id ?
                new Entitlement(data as RawEntitlement, this._client) as T :
                new TestEntitlement(data as RawTestEntitlement, this._client) as T;
        } else {
            return this._client.application.entitlements.update(data) as T;
        }
    }

    /** @internal */
    updateMember(guildID: string, memberID: string, member: RawMember | RESTMember): Member {
        const guild = this._client.guilds.get(guildID);
        if (guild && this._client["_user"] && this._client.user.id === memberID) {
            if (guild["_clientMember"]) {
                guild["_clientMember"]["update"](member);
            } else {
                guild["_clientMember"] = guild.members.update({ ...member, id: memberID }, guildID);
            }
            return guild["_clientMember"];
        }
        return guild ? guild.members.update({ ...member, id: memberID }, guildID) : new Member({ ...member, id: memberID }, this._client, guildID);
    }

    /** @internal */
    updateMessage<T extends AnyTextableChannel | Uncached>(data: RawMessage): Message<T> {
        const channel = this._client.getChannel(data.channel_id) as T | undefined;
        if (channel && "messages" in channel) {
            return channel.messages.update(data) as Message<T>;
        }

        return new Message<T>(data, this._client);
    }

    /** @internal */
    updatePollAnswer(poll: Poll, answerID: number, count: number, user?: string): void {
        let answerCount = poll.results.answerCounts.find(a => a.id === answerID);
        if (!answerCount) {
            if (count === -1) {
                return;
            }

            answerCount = {
                count,
                id:      answerID,
                users:   user ? [user] : [],
                meVoted: user === this._client["_user"]?.id
            };
            poll.results.answerCounts.push(answerCount);
            return;
        }

        answerCount.count += count;
        if (user) {
            if (count === 1 && !answerCount.users.includes(user)) {
                answerCount.users.push(user);
                answerCount.meVoted = user === this._client["_user"]?.id;
            } else if (count === -1 && answerCount.users.includes(user)) {
                answerCount.users.splice(answerCount.users.indexOf(user), 1);
                if (user === this._client["_user"]?.id) {
                    answerCount.meVoted = false;
                }
            }
        }
    }

    /** @internal */
    updateThread<T extends AnyThreadChannel>(threadData: RawThreadChannel): T {
        const guild = this._client.guilds.get(threadData.guild_id);
        if (guild) {
            return guild.threads.update(threadData) as T;
        }
        return Channel.from<T>(threadData, this._client);
    }
}
