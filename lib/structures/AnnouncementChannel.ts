import TextableChannel from "./TextableChannel";
import type TextChannel from "./TextChannel";
import type CategoryChannel from "./CategoryChannel";
import AnnouncementThreadChannel from "./AnnouncementThreadChannel";
import Message from "./Message";
import type { ChannelTypes } from "../Constants";
import type Client from "../Client";
import type { EditGuildChannelOptions, RawAnnouncementChannel, RawAnnouncementThreadChannel } from "../types/channels";
import type { JSONAnnouncementChannel } from "../types/json";
import TypedCollection from "../util/TypedCollection";

/** Represents a guild news channel. */
export default class AnnouncementChannel extends TextableChannel<AnnouncementChannel> {
    declare parent?: CategoryChannel | null;
    /** The amount of seconds between non-moderators sending messages. Always zero in news channels. */
    declare rateLimitPerUser: 0;
    /** The threads in this channel. */
    threads: TypedCollection<string, RawAnnouncementThreadChannel, AnnouncementThreadChannel>;
    declare type: ChannelTypes.GUILD_ANNOUNCEMENT;
    constructor(data: RawAnnouncementChannel, client: Client) {
        super(data, client);
        this.threads = new TypedCollection(AnnouncementThreadChannel, client);
    }

    /**
     * Convert this news channel to a text channel.
     */
    async convert(): Promise<TextChannel> {
        return super.convert() as never;
    }

    /**
     * Crosspost a message in this channel.
     * @param messageID The ID of the message to crosspost.
     */
    async crosspostMessage(messageID: string): Promise<Message<AnnouncementChannel>> {
        return this.client.rest.channels.crosspostMessage(this.id, messageID);
    }

    /**
     * Edit this channel.
     * @param options The options for editing the channel.
     */
    override async edit(options: EditGuildChannelOptions): Promise<this> {
        return this.client.rest.channels.edit<this>(this.id, options);
    }

    override toJSON(): JSONAnnouncementChannel {
        return {
            ...super.toJSON(),
            rateLimitPerUser: 0,
            threads:          this.threads.map(thread => thread.id),
            type:             this.type
        };
    }
}
