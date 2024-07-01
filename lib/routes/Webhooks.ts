/** @module REST/Webhooks */
import type {
    CreateWebhookOptions,
    DeleteWebhookMessageOptions,
    EditWebhookMessageOptions,
    EditWebhookOptions,
    EditWebhookTokenOptions,
    ExecuteWebhookOptions,
    ExecuteWebhookWaitOptions,
    RawWebhook
} from "../types/webhooks";
import type { AnyTextableChannel, RawMessage } from "../types/channels";
import * as Routes from "../util/Routes";
import Webhook from "../structures/Webhook";
import Message from "../structures/Message";
import type RESTManager from "../rest/RESTManager";
import type { Uncached } from "../types/shared";

/** Various methods for interacting with webhooks. Located at {@link Client#rest | Client#rest}{@link RESTManager#webhooks | .webhooks}. */
export default class Webhooks {
    private _manager: RESTManager;
    constructor(manager: RESTManager) {
        this._manager = manager;
    }

    /**
     * Create a channel webhook.
     * @param channelID The ID of the channel to create the webhook in.
     * @param options The options to create the webhook with.
     * @caching This method **does not** cache its result.
     */
    async create(channelID: string, options: CreateWebhookOptions): Promise<Webhook> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        if (options.avatar) {
            options.avatar = this._manager.client.util._convertImage(options.avatar, "avatar");
        }
        return this._manager.authRequest<RawWebhook>({
            method: "POST",
            path:   Routes.CHANNEL_WEBHOOKS(channelID),
            json:   {
                avatar: options.avatar,
                name:   options.name
            },
            reason
        }).then(data => new Webhook(data, this._manager.client));
    }

    /**
     * Delete a webhook.
     * @param webhookID The ID of the webhook.
     * @param reason The reason for deleting the webhook.
     * @caching This method **does not** cache its result.
     */
    async delete(webhookID: string, reason?: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.WEBHOOK(webhookID),
            reason
        });
    }

    /**
     * Delete a webhook message.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message.
     * @param options The options for deleting the message.
     * @caching This method **does not** cache its result.
     */
    async deleteMessage(webhookID: string, token: string, messageID: string, options?: DeleteWebhookMessageOptions): Promise<void> {
        const query = new URLSearchParams();
        if (options?.threadID !== undefined) {
            query.set("thread_id", options.threadID);
        }
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.WEBHOOK_MESSAGE(webhookID, token, messageID)
        });
    }

    /**
     * Delete a webhook via its token.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @caching This method **does not** cache its result.
     */
    async deleteToken(webhookID: string, token: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.WEBHOOK(webhookID, token)
        });
    }

    /**
     * Edit a webhook.
     * @param webhookID The ID of the webhook.
     * @param options The options for editing the webhook.
     * @caching This method **does not** cache its result.
     */
    async edit(webhookID: string, options: EditWebhookOptions): Promise<Webhook> {
        const reason = options.reason;
        if (options.reason) {
            delete options.reason;
        }
        if (options.avatar) {
            options.avatar = this._manager.client.util._convertImage(options.avatar, "avatar");
        }
        return this._manager.authRequest<RawWebhook>({
            method: "PATCH",
            path:   Routes.WEBHOOK(webhookID),
            json:   {
                avatar:     options.avatar,
                channel_id: options.channelID,
                name:       options.name
            },
            reason
        }).then(data => new Webhook(data, this._manager.client));
    }

    /**
     * Edit a webhook message.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message to edit.
     * @param options The options for editing the message.
     * @caching This method **does not** cache its result.
     */
    async editMessage<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, messageID: string, options: EditWebhookMessageOptions): Promise<Message<T>> {
        const files = options.files ?? undefined;
        if (options.files) {
            delete options.files;
        }
        const query = new URLSearchParams();
        if (options.threadID) {
            query.set("thread_id", options.threadID);
        }
        return this._manager.authRequest<RawMessage>({
            method: "PATCH",
            path:   Routes.WEBHOOK_MESSAGE(webhookID, token, messageID),
            json:   {
                allowed_mentions: this._manager.client.util.formatAllowedMentions(options.allowedMentions),
                attachments:      options.attachments,
                components:       options.components ? this._manager.client.util.componentsToRaw(options.components) : undefined,
                content:          options.content,
                embeds:           options.embeds ? this._manager.client.util.embedsToRaw(options.embeds) : undefined
            },
            query,
            files
        }).then(data => new Message<T>(data, this._manager.client));
    }

    /**
     * Edit a webhook via its token.
     * @param webhookID The ID of the webhook.
     * @param options The options for editing the webhook.
     * @caching This method **does not** cache its result.
     */
    async editToken(webhookID: string, token: string, options: EditWebhookTokenOptions): Promise<Webhook> {
        if (options.avatar) {
            options.avatar = this._manager.client.util._convertImage(options.avatar, "avatar");
        }
        return this._manager.authRequest<RawWebhook>({
            method: "PATCH",
            path:   Routes.WEBHOOK(webhookID, token),
            json:   {
                avatar: options.avatar,
                name:   options.name
            }
        }).then(data => new Webhook(data, this._manager.client));
    }

    /**
     * Execute a webhook.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options for executing the webhook.
     * @caching This method **does not** cache its result.
     */
    async execute<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: ExecuteWebhookWaitOptions): Promise<Message<T>>;
    async execute(webhookID: string, token: string, options: ExecuteWebhookOptions): Promise<void>;
    async execute<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: ExecuteWebhookOptions): Promise<Message<T> | void> {
        const files = options.files;
        if (options.files) {
            delete options.files;
        }
        const query = new URLSearchParams();
        if (options.wait !== undefined) {
            query.set("wait", options.wait.toString());
        }
        if (options.threadID !== undefined) {
            query.set("thread_id", options.threadID);
        }
        return this._manager.authRequest<RawMessage | null>({
            method: "POST",
            path:   Routes.WEBHOOK(webhookID, token),
            query,
            json:   {
                allowed_mentions: this._manager.client.util.formatAllowedMentions(options.allowedMentions),
                attachments:      options.attachments,
                avatar_url:       options.avatarURL,
                components:       options.components ? this._manager.client.util.componentsToRaw(options.components) : undefined,
                content:          options.content,
                embeds:           options.embeds ? this._manager.client.util.embedsToRaw(options.embeds) : undefined,
                flags:            options.flags,
                poll:             options.poll ? {
                    allow_multiselect: options.poll.allowMultiselect,
                    answers:           options.poll.answers.map(a => ({
                        poll_media: a.pollMedia
                    })),
                    duration:    options.poll.duration,
                    layout_type: options.poll.layoutType,
                    question:    options.poll.question
                } : undefined,
                thread_name: options.threadName,
                tts:         options.tts,
                username:    options.username
            },
            files
        }).then(res => res === null ? undefined : new Message(res, this._manager.client));
    }

    /**
     * Execute a GitHub compatible webhook.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options to send. See GitHub's documentation for more information.
     * @caching This method **does not** cache its result.
     */
    async executeGithub(webhookID: string, token: string, options: Record<string, unknown> & { wait: false; }): Promise<void>;
    async executeGithub<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: Record<string, unknown> & { wait?: true; }): Promise<Message<T>>;
    async executeGithub<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: Record<string, unknown> & { wait?: boolean; }): Promise<Message<T> | void> {
        const query = new URLSearchParams();
        if (options.wait !== undefined) {
            query.set("wait", options.wait.toString());
        }
        return this._manager.authRequest<RawMessage | null>({
            method: "POST",
            path:   Routes.WEBHOOK_PLATFORM(webhookID, token, "github"),
            query,
            json:   options
        }).then(res => res === null ? undefined : new Message(res, this._manager.client));
    }

    /**
     * Execute a slack compatible webhook.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options to send. See [Slack's Documentation](https://api.slack.com/incoming-webhooks) for more information.
     * @caching This method **does not** cache its result.
     */
    async executeSlack(webhookID: string, token: string, options: Record<string, unknown> & { wait: false; }): Promise<void>;
    async executeSlack<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: Record<string, unknown> & { wait?: true; }): Promise<Message<T>>;
    async executeSlack<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, options: Record<string, unknown> & { wait?: boolean; }): Promise<Message<T> | void> {
        const query = new URLSearchParams();
        if (options.wait !== undefined) {
            query.set("wait", options.wait.toString());
        }
        return this._manager.authRequest<RawMessage | null>({
            method: "POST",
            path:   Routes.WEBHOOK_PLATFORM(webhookID, token, "slack"),
            query,
            json:   options
        }).then(res => res === null ? undefined : new Message(res, this._manager.client));
    }

    /**
     * Get a webhook by ID (and optionally token).
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @caching This method **does not** cache its result.
     */
    async get(webhookID: string, token?: string): Promise<Webhook> {
        return this._manager.authRequest<RawWebhook>({
            method: "GET",
            path:   Routes.WEBHOOK(webhookID, token)
        }).then(data => new Webhook(data, this._manager.client));
    }

    /**
     * Get the webhooks in the specified channel.
     * @param channelID The ID of the channel to get the webhooks of.
     * @caching This method **does not** cache its result.
     */
    async getForChannel(channelID: string): Promise<Array<Webhook>> {
        return this._manager.authRequest<Array<RawWebhook>>({
            method: "GET",
            path:   Routes.CHANNEL_WEBHOOKS(channelID)
        }).then(data => data.map(d => new Webhook(d, this._manager.client)));
    }

    /**
     * Get the webhooks in the specified guild.
     * @param guildID The ID of the guild to get the webhooks of.
     * @caching This method **does not** cache its result.
     */
    async getForGuild(guildID: string): Promise<Array<Webhook>> {
        return this._manager.authRequest<Array<RawWebhook>>({
            method: "GET",
            path:   Routes.GUILD_WEBHOOKS(guildID)
        }).then(data => data.map(d => new Webhook(d, this._manager.client)));
    }

    /**
     * Get a webhook message.
     * @param webhookID The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message.
     * @param threadID The ID of the thread the message is in.
     * @caching This method **does not** cache its result.
     */
    async getMessage<T extends AnyTextableChannel | Uncached>(webhookID: string, token: string, messageID: string, threadID?: string): Promise<Message<T>> {
        const query = new URLSearchParams();
        if (threadID !== undefined) {
            query.set("thread_id", threadID);
        }
        return this._manager.authRequest<RawMessage>({
            method: "GET",
            path:   Routes.WEBHOOK_MESSAGE(webhookID, token, messageID)
        }).then(data => new Message<T>(data, this._manager.client));
    }
}
