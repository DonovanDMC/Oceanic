import Base from "./Base"
import type Client from "../Client";
import type { RawActivityInstance } from "../types/activities";

/** Represents an activity instance. */
export default class ActivityInstance extends Base {
    /** The ID of the application this activity instance is for. */
    applicationID: string;
    /** The ID of the channel this activity instance was created in. */
    channelID: string;
    /** If the activity was created within a guild, the ID of the guild. */
    guildID: string | null;
    /** The ID of the user(s) participating in this activity instance. */
    userIDs: string[];
    constructor(data: RawActivityInstance, client: Client) {
        super(data.instance_id, client);
        this.applicationID = data.application_id;
        this.channelID = data.channel_id;
        this.guildID = data.guild_id;
        this.userIDs = data.users;
    }
}
