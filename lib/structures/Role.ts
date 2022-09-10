import Base from "./Base";
import Permission from "./Permission";
import type Guild from "./Guild";
import type Client from "../Client";
import type { RawRole, RoleTags } from "../types/guilds";
import type { JSONRole } from "../types/json";

/** Represents a role in a guild. */
export default class Role extends Base {
    private _guild?: Guild;
    /** The color of this role. */
    color: number;
    /** The id of the guild this role is in. */
    guildID: string;
    /** If this role is hoisted. */
    hoist: boolean;
    /** The icon has of this role. */
    icon: string | null;
    /** If this role is managed by an integration. */
    managed: boolean;
    /** If this role can be mentioned by anybody. */
    mentionable: boolean;
    /** The name of this role. */
    name: string;
    /** The permissions of this role. */
    permissions: Permission;
    /** The position of this role. */
    position: number;
    /** The [tags](https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure) of this role. */
    tags: RoleTags;
    /** The unicode emoji of this role. */
    unicodeEmoji: string | null;
    constructor(data: RawRole, client: Client, guildID: string) {
        super(data.id, client);
        this.color = data.color;
        this._guild = client.guilds.get(guildID);
        this.guildID = guildID;
        this.hoist = !!data.hoist;
        this.icon = null;
        this.managed = !!data.managed;
        this.mentionable = !!data.mentionable;
        this.name = data.name;
        this.permissions = new Permission(data.permissions);
        this.position = data.position;
        this.tags = {};
        this.unicodeEmoji = null;
        this.update(data);
    }

    protected update(data: Partial<RawRole>): void {
        if (data.color !== undefined) {
            this.color = data.color;
        }
        if (data.hoist !== undefined) {
            this.hoist = data.hoist;
        }
        if (data.icon !== undefined) {
            this.icon = data.icon || null;
        }
        if (data.mentionable !== undefined) {
            this.mentionable = data.mentionable;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.permissions !== undefined) {
            this.permissions = new Permission(data.permissions);
        }
        if (data.position !== undefined) {
            this.position = data.position;
        }
        if (data.tags !== undefined) {
            this.tags = data.tags || {};
        }
        if (data.unicode_emoji !== undefined) {
            this.unicodeEmoji = data.unicode_emoji || null;
        }
    }

    /** The guild this role is in. This will throw an error if the guild is not cached. */
    get guild(): Guild {
        if (!this._guild) {
            throw new Error(`${this.constructor.name}#guild is not present without having the GUILDS intent or fetching the guild.`);
        } else {
            return this._guild;
        }
    }

    /** A string that will mention this role. */
    get mention(): string {
        return `<@&${this.id}>`;
    }

    /**
     * Delete this role.
     * @param reason The reason for deleting the role.
     */
    async delete(reason?: string): Promise<void> {
        return this.client.rest.guilds.deleteRole(this.guildID, this.id, reason);
    }

    override toJSON(): JSONRole {
        return {
            ...super.toJSON(),
            color:        this.color,
            guildID:      this.guildID,
            hoist:        this.hoist,
            icon:         this.icon,
            managed:      this.managed,
            mentionable:  this.mentionable,
            name:         this.name,
            permissions:  this.permissions.toJSON(),
            position:     this.position,
            tags:         this.tags,
            unicodeEmoji: this.unicodeEmoji
        };
    }
}
