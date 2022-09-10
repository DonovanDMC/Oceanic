import Base from "./Base";
import type ClientApplication from "./ClientApplication";
import type Client from "../Client";
import type {
    AnyInteraction,
    AnyRawInteraction,
    RawApplicationCommandInteraction,
    RawAutocompleteInteraction,
    RawInteraction,
    RawMessageComponentInteraction,
    RawModalSubmitInteraction
} from "../types/interactions";
import { InteractionTypes } from "../Constants";
import type { Uncached } from "../types/shared";
import type { JSONInteraction } from "../types/json";

export default class Interaction extends Base {
    /** If this interaction has been acknowledged. */
    acknowledged: boolean;
    /** The application this interaction is for. This can be a partial object with only an `id` property. */
    application: ClientApplication | Uncached;
    /** The token of this interaction. */
    token: string;
    /** The [type](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type) of this interaction. */
    type: InteractionTypes;
    /** Read-only property, always `1` */
    version: 1;
    constructor(data: AnyRawInteraction, client: Client) {
        super(data.id, client);
        this.acknowledged = false;
        this.application = client.application?.id === data.application_id ? client.application : { id: data.application_id };
        this.token = data.token;
        this.type = data.type;
        this.version = data.version;
    }


    static from<T extends AnyInteraction = AnyInteraction>(data: RawInteraction, client: Client): T {
        switch (data.type) {
            case InteractionTypes.PING: return new PingInteraction(data, client) as T;
            case InteractionTypes.APPLICATION_COMMAND: return new CommandInteraction(data as RawApplicationCommandInteraction, client) as T;
            case InteractionTypes.MESSAGE_COMPONENT: return new ComponentInteraction(data as RawMessageComponentInteraction, client) as T;
            case InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE: return new AutocompleteInteraction(data as RawAutocompleteInteraction, client) as T;
            case InteractionTypes.MODAL_SUBMIT: return new ModalSubmitInteraction(data as RawModalSubmitInteraction, client) as T;
            default: return new Interaction(data, client) as never;
        }
    }

    override toJSON(): JSONInteraction {
        return {
            ...super.toJSON(),
            applicationID: this.application.id,
            token:         this.token,
            type:          this.type,
            version:       this.version
        };
    }
}


// Yes this sucks, but it works. That's the important part. Circular imports are hell.
/* eslint-disable */
const AutocompleteInteraction = (require("./AutocompleteInteraction") as typeof import("./AutocompleteInteraction")).default;
const CommandInteraction = (require("./CommandInteraction") as typeof import("./CommandInteraction")).default;
const ComponentInteraction = (require("./ComponentInteraction") as typeof import("./ComponentInteraction")).default;
const ModalSubmitInteraction = (require("./ModalSubmitInteraction") as typeof import("./ModalSubmitInteraction")).default;
const PingInteraction = (require("./PingInteraction") as typeof import("./PingInteraction")).default;
/* eslint-enable */
