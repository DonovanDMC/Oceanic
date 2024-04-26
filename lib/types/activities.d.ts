/** @module Types/Activities */

export interface RawActivityInstance {
    application_id: string;
    channel_id: string;
    users: string[];
    instance_id: string;
    guild_id: string | null;
}
