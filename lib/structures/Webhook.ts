/** @module Webhook */
import Base from "./Base";
import type User from "./User";
import type Message from "./Message";
import type Guild from "./Guild";
import type ClientApplication from "./ClientApplication";
import type Client from "../Client";
import { API_URL, type ImageFormat, type WebhookTypes } from "../Constants";
import * as Routes from "../util/Routes";
import type { AnyTextableGuildChannel, RawChannel } from "../types/channels";
import type { RawGuild } from "../types/guilds";
import type {
    DeleteWebhookMessageOptions,
    EditWebhookMessageOptions,
    EditWebhookOptions,
    ExecuteWebhookOptions,
    ExecuteWebhookWaitOptions,
    RawWebhook
} from "../types/webhooks";
import type { JSONWebhook } from "../types/json";
import { UncachedError } from "../util/Errors";

/** Represents a webhook. */
export default class Webhook extends Base {
    private _cachedChannel?: AnyTextableGuildChannel | null;
    private _cachedGuild?: Guild | null;
    /** The application associated with this webhook. */
    application?: ClientApplication | null;
    /** The ID of the application associated with this webhook. */
    applicationID: string | null;
    /** The hash of this webhook's avatar. */
    avatar: string | null;
    /** The ID of the channel this webhook is for, if applicable. */
    channelID: string | null;
    /** The id of the guild this webhook is in, if applicable. */
    guildID: string | null;
    /** The username of this webhook, if any. */
    name: string | null;
    /** The source channel for this webhook (channel follower only). */
    sourceChannel?: Pick<RawChannel, "id" | "name">;
    /** The source guild for this webhook (channel follower only). */
    sourceGuild?: Pick<RawGuild, "id" | "name" | "icon">;
    /** The token for this webhook (not present for webhooks created by other applications) */
    token?: string;
    /** The [type](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types) of this webhook. */
    type: WebhookTypes;
    /** The user that created this webhook. */
    user: User | null;
    constructor(data: RawWebhook, client: Client) {
        super(data.id, client);
        this.application = (!client["_application"] || data.application_id === null) ? null : (client.application.id === data.application_id ? client.application : undefined);
        this.applicationID = data.application_id;
        this.avatar = data.avatar ?? null;
        this.channelID = data.channel_id;
        this.guildID = data.guild_id ?? null;
        this.name = data.name;
        this.sourceChannel = data.source_channel;
        this.sourceGuild = data.source_guild;
        this.token = data.token;
        this.type = data.type;
        this.user = data.user === undefined ? null : client.users.update(data.user);
    }

    /** The channel this webhook is for, if applicable. */
    get channel(): AnyTextableGuildChannel | null | undefined {
        if (this.channelID !== null && this._cachedChannel !== null) {
            return this._cachedChannel ?? (this._cachedChannel = this.client.getChannel<AnyTextableGuildChannel>(this.channelID));
        }

        return this._cachedChannel === null ? this._cachedChannel : (this._cachedChannel = null);
    }

    /** The guild this webhook is for, if applicable. This will throw an error if the guild is not cached. */
    get guild(): Guild | null {
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

        return this._cachedGuild === null ? this._cachedGuild : (this._cachedGuild = null);
    }

    get url(): string {
        return `${API_URL}${Routes.WEBHOOK(this.id, this.token)}`;
    }

    /**
     * The url of this webhook's avatar.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    avatarURL(format?: ImageFormat, size?: number): string | null {
        return this.avatar === null ? null : this.client.util.formatImage(Routes.USER_AVATAR(this.id, this.avatar), format, size);
    }

    /**
     * Delete this webhook (requires a bot user, see `deleteToken`).
     * @param reason The reason for deleting this webhook.
     */
    async delete(reason?: string): Promise<void> {
        return this.client.rest.webhooks.delete(this.id, reason);
    }

    /**
     * Delete a message from this webhook.
     * @param messageID The ID of the message.
     * @param options The options for deleting the message.
     * @param token The token for the webhook, if not already present.
     */
    async deleteMessage(messageID: string, options?: DeleteWebhookMessageOptions, token?: string): Promise<void> {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.deleteMessage(this.id, t, messageID, options);
    }

    /**
     * Delete this webhook via its token.
     * @param token The token for the webhook, if not already present.
     */
    async deleteToken(token?: string): Promise<void> {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.deleteToken(this.id, t);
    }

    /**
     * Edit this webhook (requires a bot user, see `editToken`).
     * @param options The options for editing the webhook.
     */
    async edit(options: EditWebhookOptions): Promise<Webhook> {
        return this.client.rest.webhooks.edit(this.id, options);
    }

    /**
     * Edit a webhook message.
     * @param messageID The ID of the message to edit.
     * @param token The token of the webhook.
     * @param options The options for editing the message.
     */
    async editMessage<T extends AnyTextableGuildChannel = AnyTextableGuildChannel>(messageID: string, options: EditWebhookMessageOptions, token?: string): Promise<Message<T>> {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.editMessage<T>(this.id, t, messageID, options);
    }

    /**
     * Edit a webhook via its token.
     * @param options The options for editing the webhook.
     * @param token The token for the webhook, if not already present.
     */
    async editToken(options: EditWebhookOptions, token?: string): Promise<Webhook> {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.editToken(this.id, t, options);
    }

    /**
     * Execute the webhook.
     * @param options The options for executing the webhook.
     * @param token The token for the webhook, if not already present.
     */
    async execute<T extends AnyTextableGuildChannel>(options: ExecuteWebhookWaitOptions, token?: string): Promise<Message<T>>;
    async execute(options: ExecuteWebhookOptions, token?: string): Promise<void>;
    async execute<T extends AnyTextableGuildChannel>(options: ExecuteWebhookOptions, token?: string): Promise<Message<T> | void> {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.execute<T>(this.id, t, options as ExecuteWebhookWaitOptions);
    }

    /**
     * Execute this webhook as GitHub compatible.
     * @param options The options to send. See GitHub's documentation for more information.
     * @param token The token for the webhook, if not already present.
     */
    async executeGithub(options: Record<string, unknown> & { wait: false; }, token?: string): Promise<void>;
    async executeGithub<T extends AnyTextableGuildChannel>(options: Record<string, unknown> & { wait?: true; }, token?: string): Promise<Message<T>>;
    async executeGithub<T extends AnyTextableGuildChannel>(options: Record<string, unknown> & { wait?: boolean; }, token?: string): Promise<Message<T> | void> {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.executeGithub<T>(this.id, t, options as Record<string, unknown>);
    }

    /**
     * Execute this webhook as slack compatible.
     * @param options The options to send. See [Slack's Documentation](https://api.slack.com/incoming-webhooks) for more information.
     * @param token The token for the webhook, if not already present.
     */
    async executeSlack(options: Record<string, unknown> & { wait: false; }, token?: string): Promise<void>;
    async executeSlack<T extends AnyTextableGuildChannel>(options: Record<string, unknown> & { wait?: true; }, token?: string): Promise<Message<T>>;
    async executeSlack<T extends AnyTextableGuildChannel>(options: Record<string, unknown> & { wait?: boolean; }, token?: string): Promise<Message<T> | void> {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.executeSlack<T>(this.id, t, options as Record<string, unknown>);
    }

    /**
     * Get a webhook message.
     * @param messageID The ID of the message.
     * @param threadID The ID of the thread the message is in.
     * @param token The token for the webhook, if not already present.
     */
    async getMessage<T extends AnyTextableGuildChannel>(messageID: string, threadID?: string, token?: string): Promise<Message<T>> {
        const t = this.token ?? token;
        if (!t) {
            throw new TypeError("Token is not present on webhook, and was not provided in options.");
        }
        return this.client.rest.webhooks.getMessage<T>(this.id, t, messageID, threadID);
    }

    /**
     * The url of this webhook's `sourceGuild` icon (only present on channel follower webhooks).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    sourceGuildIconURL(format?: ImageFormat, size?: number): string | null {
        return this.sourceGuild?.icon ? this.client.util.formatImage(Routes.GUILD_ICON(this.id, this.sourceGuild?.icon), format, size) : null;
    }

    override toJSON(): JSONWebhook {
        return {
            ...super.toJSON(),
            applicationID: this.applicationID,
            avatar:        this.avatar,
            channelID:     this.channelID ?? null,
            guildID:       this.guildID,
            name:          this.name,
            sourceChannel: this.sourceChannel,
            sourceGuild:   this.sourceGuild,
            token:         this.token,
            type:          this.type,
            user:          this.user?.toJSON()
        };
    }
}
