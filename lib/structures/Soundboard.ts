/** @module Soundboard */
import Client from "../Client";
import { RawSoundboard } from "../types";
import Base from "./Base";
import User from "./User";

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
}