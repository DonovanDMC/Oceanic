/** @module REST/Interactions */
import type { EditInteractionContent, InteractionContent, InteractionResponse } from "../types/interactions";
import type { ExecuteWebhookWaitOptions } from "../types/webhooks";
import * as Routes from "../util/Routes";
import { InteractionResponseTypes } from "../Constants";
import type RESTManager from "../rest/RESTManager";
import type Message from "../structures/Message";
import type { AnyTextableChannel } from "../types/channels";
import type { Uncached } from "../types/shared";

/** Various methods for interacting with interactions. Located at {@link Client#rest | Client#rest}{@link RESTManager#interactions | .interactions}. */
export default class Interactions {
    private _manager: RESTManager;
    constructor(manager: RESTManager) {
        this._manager = manager;
    }

    /**
     * Create a followup message.
     * @param applicationID The ID of the application.
     * @param interactionToken The token of the interaction.
     * @param options The options for creating the followup message.
     * @caching This method **does not** cache its result.
     */
    async createFollowupMessage<T extends AnyTextableChannel | Uncached>(applicationID: string, interactionToken: string, options: InteractionContent): Promise<Message<T>> {
        return this._manager.webhooks.execute<T>(applicationID, interactionToken, options as ExecuteWebhookWaitOptions);
    }

    /**
     * Create an initial interaction response.
     * @param interactionID The ID of the interaction.
     * @param interactionToken The token of the interaction.
     * @param options The options for creating the interaction response.
     * @caching This method **does not** cache its result.
     */
    async createInteractionResponse(interactionID: string, interactionToken: string, options: InteractionResponse): Promise<void> {
        let data: unknown;
        switch (options.type) {
            case InteractionResponseTypes.PONG: {
                break;
            }
            case InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE:
            case InteractionResponseTypes.UPDATE_MESSAGE: {
                data = {
                    allowed_mentions: this._manager.client.util.formatAllowedMentions(options.data.allowedMentions),
                    attachments:      options.data.attachments,
                    content:          options.data.content,
                    components:       options.data.components ? this._manager.client.util.componentsToRaw(options.data.components) : undefined,
                    embeds:           options.data.embeds ? this._manager.client.util.embedsToRaw(options.data.embeds) : undefined,
                    flags:            options.data.flags,
                    poll:             options.data.poll ? {
                        allow_multiselect: options.data.poll.allowMultiselect,
                        answers:           options.data.poll.answers.map(a => ({
                            poll_media: a.pollMedia
                        })),
                        duration:    options.data.poll.duration,
                        layout_type: options.data.poll.layoutType,
                        question:    options.data.poll.question
                    } : undefined
                };
                break;
            }

            case InteractionResponseTypes.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: {
                data = {
                    choices: options.data.choices.map(d => ({
                        name:               d.name,
                        name_localizations: d.nameLocalizations,
                        value:              d.value
                    }))
                };
                break;
            }

            case InteractionResponseTypes.MODAL: {
                data = {
                    custom_id:  options.data.customID,
                    components: this._manager.client.util.componentsToRaw(options.data.components),
                    title:      options.data.title
                };
                break;
            }

            default: {
                data = options.data;
                break;
            }
        }
        await this._manager.authRequest<null>({
            method: "POST",
            path:   Routes.INTERACTION_CALLBACK(interactionID, interactionToken),
            route:  "/interactions/:id/:token/callback",
            json:   {
                data,
                type: options.type
            }
        });
    }

    /**
     * Delete a follow-up message.
     * @param applicationID The ID of the application.
     * @param interactionToken The token of the interaction.
     * @param messageID The ID of the message.
     * @caching This method **does not** cache its result.
     */
    async deleteFollowupMessage(applicationID: string, interactionToken: string, messageID: string): Promise<void> {
        await this._manager.webhooks.deleteMessage(applicationID, interactionToken, messageID);
    }

    /**
     * Delete the original interaction response.
     * @param applicationID The ID of the application.
     * @param interactionToken The token of the interaction.
     * @caching This method **does not** cache its result.
     */
    async deleteOriginalMessage(applicationID: string, interactionToken: string): Promise<void> {
        await this.deleteFollowupMessage(applicationID, interactionToken, "@original");
    }

    /**
     * Edit a followup message.
     * @param applicationID The ID of the application.
     * @param interactionToken The token of the interaction.
     * @param messageID The ID of the message.
     * @param options The options for editing the followup message.
     * @caching This method **does not** cache its result.
     */
    async editFollowupMessage<T extends AnyTextableChannel | Uncached>(applicationID: string, interactionToken: string, messageID: string, options: EditInteractionContent): Promise<Message<T>> {
        return this._manager.webhooks.editMessage<T>(applicationID, interactionToken, messageID, options);
    }

    /**
     * Edit an original interaction response.
     * @param applicationID The ID of the application.
     * @param interactionToken The token of the interaction.
     * @param options The options for editing the original message.
     * @caching This method **does not** cache its result.
     */
    async editOriginalMessage<T extends AnyTextableChannel | Uncached>(applicationID: string, interactionToken: string, options: EditInteractionContent): Promise<Message<T>> {
        return this.editFollowupMessage<T>(applicationID, interactionToken, "@original", options);
    }

    /**
     * Get a followup message.
     * @param applicationID The ID of the application.
     * @param interactionToken The token of the interaction.
     * @param messageID The ID of the message.
     * @caching This method **does not** cache its result.
     */
    async getFollowupMessage<T extends AnyTextableChannel | Uncached>(applicationID: string, interactionToken: string, messageID: string): Promise<Message<T>> {
        return this._manager.webhooks.getMessage<T>(applicationID, interactionToken, messageID);
    }

    /**
     * Get an original interaction response.
     * @param applicationID The ID of the application.
     * @param interactionToken The token of the interaction.
     * @caching This method **does not** cache its result.
     */
    async getOriginalMessage<T extends AnyTextableChannel | Uncached>(applicationID: string, interactionToken: string): Promise<Message<T>> {
        return this.getFollowupMessage(applicationID, interactionToken, "@original");
    }
}
