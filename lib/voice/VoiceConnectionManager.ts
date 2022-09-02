import type VoiceConnection from "./VoiceConnection";
import type Client from "../Client";
import { Collection } from "@augu/collections";

export default class VoiceConnectionManager extends Collection<string, VoiceConnection> {
    #client: Client;
    constructor(client: Client) {
        super();
        this.#client = client;
    }
}
