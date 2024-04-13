/** @module Types/Webhooks */
import type { CreateMessageOptions, RawChannel } from "./channels";
import type { RawGuild } from "./guilds";
import type { RawUser } from "./users";
import type { WebhookTypes } from "../Constants";

export interface RawWebhook {
    application_id: string | null;
    avatar: string | null;
    channel_id: string | null;
    guild_id?: string | null;
    id: string;
    name: string | null;
    source_channel?: Pick<RawChannel, "id" | "name">;
    source_guild?: Pick<RawGuild, "id" | "name" | "icon">;
    token?: string;
    type: WebhookTypes;
    url?: string;
    user?: RawUser;
}
export interface BasicWebhook extends Pick<RawWebhook, "type" | "id" | "name" | "avatar" | "channel_id" | "guild_id" | "application_id"> {}
export interface OAuthWebhook extends Required<BasicWebhook & Pick<RawWebhook, "url" | "token">> {}
export interface GuildWebhook extends BasicWebhook, Pick<RawWebhook, "user" | "token"> {}
export interface ApplicationWebhook extends Pick<RawWebhook, "type" | "id" | "name" | "avatar" | "channel_id" | "guild_id" | "application_id">, Required<Pick<RawWebhook, "token">> {}
export interface ChannelFollowerWebhook extends BasicWebhook, Required<Pick<RawWebhook, "source_guild" | "source_channel">>, Pick<RawWebhook, "user"> {}

export interface CreateWebhookOptions {
    /** The avatar (buffer, or full data url). */
    avatar?: Buffer | string | null;
    /** The name of the webhook. */
    name: string;
    /** The reason for creating this webhook. */
    reason?: string;
}

export interface EditWebhookTokenOptions  {
    /** The new avatar (buffer, or full data url). `null` to reset. */
    avatar?: Buffer | string | null;
    /** The name of the webhook. */
    name?: string;
}
export interface EditWebhookOptions extends EditWebhookTokenOptions {
    /** The id of the channel to move this webhook to. */
    channelID?: string;
    /** The reason for editing this webhook. */
    reason?: string;
}

export interface ExecuteWebhookOptions extends Pick<CreateMessageOptions, "content" | "tts" | "embeds" | "allowedMentions" | "components" | "attachments" | "flags" | "files" | "poll"> {
    /** The url of an avatar to use. */
    avatarURL?: string;
    /** The id of the thread to send the message to. */
    threadID?: string;
    /** The name of the thread to create (forum channels). */
    threadName?: string;
    /** The username to use. */
    username?: string;
    /** If the created message should be returned. */
    wait?: boolean;
}
export interface ExecuteWebhookWaitOptions extends Omit<ExecuteWebhookOptions, "wait"> { wait: true; }

export interface GetWebhookMessageOptions {
    messageID: string;
    threadID?: string;
}

export interface EditWebhookMessageOptions extends Pick<ExecuteWebhookOptions, "content" | "embeds" | "allowedMentions" | "components" | "attachments" | "threadID" | "files"> {}

export interface DeleteWebhookMessageOptions {
    /** The id of the thread the message is in. */
    threadID?: string;
}
