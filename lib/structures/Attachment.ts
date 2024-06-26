/** @module Attachment */
import Base from "./Base";
import type Client from "../Client";
import type { RawAttachment } from "../types/channels";
import type { JSONAttachment } from "../types/json";

/** Represents a file attachment. */
export default class Attachment extends Base {
    /** The mime type of this attachment. */
    contentType?: string;
    /** The description of this attachment. */
    description?: string;
    /** The duration of the attached audio file, if voice message. */
    durationSecs?: number;
    /** If this attachment is ephemeral. Ephemeral attachments will be removed after a set period of time. */
    ephemeral?: boolean;
    /** The filename of this attachment. */
    filename: string;
    /** The {@link Constants~AttachmentFlags | Attachment Flags } of this image. */
    flags: number;
    /** The height of this attachment, if an image. */
    height?: number;
    /** A proxied url of this attachment. */
    proxyURL: string;
    /** The size of this attachment. */
    size: number;
    /** The title of this attachment. */
    title?: string;
    /** The source url of this attachment. */
    url: string;
    /** Base64 encoded bytearray representing a sampled waveform for voice messages. */
    waveform?: string | null;
    /** The width of this attachment, if an image. */
    width?: number;
    constructor(data: RawAttachment, client: Client) {
        super(data.id, client);
        this.contentType = data.content_type;
        this.description = data.description;
        this.durationSecs = data.duration_secs;
        this.ephemeral = data.ephemeral;
        this.filename = data.filename;
        this.flags = data.flags ?? 0;
        this.height = data.height;
        this.proxyURL = data.proxy_url;
        this.size = data.size;
        this.url = data.url;
        this.waveform = data.waveform;
        this.width = data.width;
    }

    override toJSON(): JSONAttachment {
        return {
            ...super.toJSON(),
            contentType: this.contentType,
            description: this.description,
            ephemeral:   this.ephemeral,
            filename:    this.filename,
            flags:       this.flags,
            height:      this.height,
            proxyURL:    this.proxyURL,
            size:        this.size,
            title:       this.title,
            url:         this.url,
            width:       this.width
        };
    }
}
