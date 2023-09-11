/** @module StageInstance */
import Base from "./Base.js";
import type StageChannel from "./StageChannel.js";
import type Guild from "./Guild.js";
import type GuildScheduledEvent from "./GuildScheduledEvent.js";
import type Client from "../Client.js";
import type { StageInstancePrivacyLevels } from "../Constants.js";
import type { JSONStageInstance } from "../types/json.js";
import type { RawStageInstance } from "../types/guilds.js";
import { UncachedError } from "../util/Errors.js";

/** Represents a stage instance. */
export default class StageInstance extends Base {
    private _cachedChannel?: StageChannel;
    private _cachedGuild?: Guild;
    private _cachedScheduledEvent?: GuildScheduledEvent | null;
    /** The ID of the associated stage channel. */
    channelID: string;
    /** @deprecated If the stage channel is discoverable */
    discoverableDisabled: boolean;
    /** The id of the guild associated with this stage instance's stage channel. */
    guildID: string;
    /** The [privacy level](https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level) of this stage instance. */
    privacyLevel: StageInstancePrivacyLevels;
    /** The id of the scheduled event for this stage instance, if applicable. */
    scheduledEventID: string | null;
    /** The topic of this stage instance. */
    topic: string;
    constructor(data: RawStageInstance, client: Client) {
        super(data.id, client);
        this.channelID = data.channel_id;
        this.discoverableDisabled = !!data.discoverable_disabled;
        this.guildID = data.guild_id;
        this.privacyLevel = data.privacy_level;
        this.scheduledEventID = data.guild_scheduled_event_id;
        this.topic = data.topic;
        this.update(data);
    }

    protected override update(data: Partial<RawStageInstance>): void {
        if (data.channel_id !== undefined) {
            this.channelID = data.channel_id;
        }
        if (data.discoverable_disabled !== undefined) {
            this.discoverableDisabled = data.discoverable_disabled;
        }
        if (data.guild_scheduled_event_id !== undefined) {
            this.scheduledEventID = data.guild_scheduled_event_id;
        }
        if (data.privacy_level !== undefined) {
            this.privacyLevel = data.privacy_level;
        }
        if (data.topic !== undefined) {
            this.topic = data.topic;
        }
    }

    /** The associated stage channel. */
    get channel(): StageChannel | undefined {
        return this._cachedChannel ??= this.client.getChannel<StageChannel>(this.channelID);
    }

    /** The guild of the associated stage channel. This will throw an error if the guild is not cached. */
    get guild(): Guild {
        this._cachedGuild ??= this.client.guilds.get(this.guildID);
        if (!this._cachedGuild) {
            if (this.client.options.restMode) {
                throw new UncachedError(`${this.constructor.name}#guild is not present when rest mode is enabled.`);
            }

            if (!this.client.shards.connected) {
                throw new UncachedError(`${this.constructor.name}#guild is not present without a gateway connection.`);
            }

            throw new UncachedError(`${this.constructor.name}#guild is not present.`);
        }

        return this._cachedGuild;
    }

    /** The scheduled event for this stage instance, if applicable. */
    get scheduledEvent(): GuildScheduledEvent | null | undefined {
        if (this.scheduledEventID !== null && this._cachedScheduledEvent !== null) {
            try {
                return this._cachedScheduledEvent ?? (this._cachedScheduledEvent = this.guild.scheduledEvents.get(this.scheduledEventID));
            } catch {
                return (this._cachedScheduledEvent = undefined);
            }
        }

        return this._cachedScheduledEvent === null ? this._cachedScheduledEvent : (this._cachedScheduledEvent = null);
    }

    override toJSON(): JSONStageInstance {
        return {
            ...super.toJSON(),
            channelID:            this.channelID,
            discoverableDisabled: this.discoverableDisabled,
            guildID:              this.guildID,
            privacyLevel:         this.privacyLevel,
            scheduledEventID:     this.scheduledEventID,
            topic:                this.topic
        };
    }
}
