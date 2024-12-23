/** @module Soundboard */
import Base from "./Base";
import User from "./User";
import type Client from "../Client";
import type { EditSoundboardSoundOptions, JSONSoundboard, RawSoundboard } from "../types";

/** Represents a soundboard. */
export default class Soundboard extends Base {
    /** If the soundboard sound can be used. */
    available: boolean;
    /** The emoji id of the soundboard sound. */
    emojiID: string | null;
    /** The emoji name of the soundboard sound. */
    emojiName: string | null;
    /** The guild this soundboard sound is in. */
    guildID?: string;
    /** The name of the soundboard sound. */
    name: string;
    /** The id of the soundboard sound. */
    soundID: string;
    /** The user who created the soundboard sound. */
    user?: User;
    /** The volume of the soundboard sound. */
    volume: number;
    constructor(data: RawSoundboard, client: Client) {
        super(data.sound_id, client);
        this.available = data.available;
        this.emojiID = data.emoji_id;
        this.emojiName = data.emoji_name;
        this.guildID = data.guild_id;
        this.name = data.name;
        this.soundID = data.sound_id;
        this.user = data.user ? new User(data.user, client) : undefined;
        this.volume = data.volume;
    }

    /**
     * Delete this soundboard sound.
     * @param reason The reason for deleting the soundboard sound.
     */
    async delete(reason?: string): Promise<void> {
        return this.client.rest.guilds.deleteSoundboardSound(this.guildID!, this.id, reason);
    }

    /**
     * Edit this soundboard sound.
     * @param options The options for editing the soundboard sound.
     */
    async edit(options: EditSoundboardSoundOptions): Promise<Soundboard> {
        return this.client.rest.guilds.editSoundboardSound(this.guildID!, this.id, options);
    }

    /**
     * Send this soundboard sound to a voice channel.
     * @param channelID The ID of the voice channel to send the soundboard sound to.
     * @param sourceGuildID The ID of the guild the soundboard sound is from.
     */
    async sendSoundboardSound(channelID: string, sourceGuildID?: string): Promise<void> {
        return this.client.rest.channels.sendSoundboardSound(channelID, { soundID: this.soundID, sourceGuildID });
    }

    override toJSON(): JSONSoundboard {
        return {
            ...super.toJSON(),
            available: this.available,
            emojiID:   this.emojiID,
            emojiName: this.emojiName,
            guildID:   this.guildID,
            name:      this.name,
            soundID:   this.soundID,
            user:      this.user?.toJSON(),
            volume:    this.volume
        };
    }
}
