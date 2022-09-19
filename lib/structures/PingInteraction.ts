/** @module PingInteraction */
import Interaction from "./Interaction";
import type { InteractionTypes } from "../Constants";
import { InteractionResponseTypes } from "../Constants";
import type { JSONPingInteraction, RawPingInteraction } from "../types";
import type Client from "../Client";

/** Represents a PING interaction. This will not be received over a gateway connection. */
export default class PingInteraction extends Interaction {
    declare type: InteractionTypes.PING;
    constructor(data: RawPingInteraction, client: Client) {
        super(data, client);
    }

    /**
     * Responds to the interaction with a `PONG`.
     */
    async pong(): Promise<void> {
        return this.client.rest.interactions.createInteractionResponse(this.id, this.token, { type: InteractionResponseTypes.PONG });
    }

    toJSON(): JSONPingInteraction {
        return {
            ...super.toJSON(),
            type: this.type
        };
    }
}
