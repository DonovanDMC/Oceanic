/** @module Member */
import Base from "./Base";
import type User from "./User";
import type Guild from "./Guild";
import type Permission from "./Permission";
import type VoiceState from "./VoiceState";
import { GuildMemberFlags, type ImageFormat } from "../Constants";
import * as Routes from "../util/Routes";
import type Client from "../Client";
import type {
    CreateBanOptions,
    EditMemberOptions,
    EditUserVoiceStateOptions,
    RawMember,
    RESTMember,
    Presence
} from "../types/guilds";
import type { JSONMember } from "../types/json";
import { UncachedError } from "../util/Errors";
import type { AvatarDecorationData } from "../types";

/** Represents a member of a guild. */
export default class Member extends Base {
    private _cachedGuild?: Guild;
    /** The member's avatar hash, if they have set a guild avatar. */
    avatar: string | null;
    /** The data for this user's avatar decoration. */
    avatarDecorationData: AvatarDecorationData | null;
    /** The member's banner hash, if they have set a guild banner. */
    banner: string | null;
    /** When the member's [timeout](https://support.discord.com/hc/en-us/articles/4413305239191-Time-Out-FAQ) will expire, if active. */
    communicationDisabledUntil: Date | null;
    /** If this member is server deafened. */
    deaf: boolean;
    /** The member's [flags](https://discord.com/developers/docs/resources/guild#guild-member-object-flags). */
    flags: number;
    /** The id of the guild this member is for. */
    guildID: string;
    /** Undocumented. */
    isPending?: boolean;
    /** The date at which this member joined the guild. */
    joinedAt: Date | null;
    /** If this member is server muted. */
    mute: boolean;
    /** This member's nickname, if any. */
    nick: string | null;
    /** If this member has not passed the guild's [membership screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) requirements. */
    pending: boolean;
    /** The date at which this member started boosting the guild, if applicable. */
    premiumSince: Date | null;
    /** The presence of this member. */
    presence?: Presence;
    /** The roles this member has. */
    roles: Array<string>;
    /** The user associated with this member. */
    user: User;
    constructor(data: (RawMember | RESTMember) & { id?: string; }, client: Client, guildID: string) {
        let user: User | undefined;
        let id: string | undefined;
        if (!data.user && data.id) {
            user = client.users.get(id = data.id);
        } else if (data.user) {
            id = (user = client.users.update(data.user)).id;
        }
        if (!user) {
            throw new TypeError(`Member received without a user${id === undefined ? " or id." : `: ${id}`}`);
        }
        super(user.id, client);
        this.avatar = null;
        this.avatarDecorationData = null;
        this.banner = null;
        this.communicationDisabledUntil = null;
        this.deaf = !!data.deaf;
        this.flags = 0;
        this.guildID = guildID;
        this.joinedAt = null;
        this.mute = !!data.mute;
        this.nick = null;
        this.pending = false;
        this.premiumSince = null;
        this.roles = [];
        this.user = user;
        this.update(data);
    }

    private toggleFlag(flag: GuildMemberFlags, enable: boolean, reason?: string): Promise<Member> {
        return this.edit({ flags: enable ? this.flags | flag : this.flags & ~flag, reason });
    }

    protected override update(data: Partial<RawMember | RESTMember>): void {
        if (data.avatar !== undefined) {
            this.avatar = data.avatar;
        }
        if (data.avatar_decoration_data !== undefined) {
            this.avatarDecorationData = data.avatar_decoration_data ? {
                asset: data.avatar_decoration_data.asset,
                skuID: data.avatar_decoration_data.sku_id
            } : null;
        }
        if (data.banner !== undefined) {
            this.banner = data.banner;
        }
        if (data.communication_disabled_until !== undefined) {
            this.communicationDisabledUntil = data.communication_disabled_until === null ? null : new Date(data.communication_disabled_until);
        }
        if (data.deaf !== undefined) {
            this.deaf = data.deaf;
        }
        if (data.flags !== undefined) {
            this.flags = data.flags;
        }
        if (data.is_pending !== undefined) {
            this.isPending = data.is_pending;
        }
        if (data.joined_at !== undefined) {
            this.joinedAt = data.joined_at === null ? null : new Date(data.joined_at);
        }
        if (data.mute !== undefined) {
            this.mute = data.mute;
        }
        if (data.nick !== undefined) {
            this.nick = data.nick;
        }
        if (data.pending !== undefined) {
            this.pending = data.pending;
        }
        if (data.premium_since !== undefined) {
            this.premiumSince = data.premium_since === null ? null : new Date(data.premium_since);
        }
        if (data.roles !== undefined) {
            this.roles = data.roles;
        }
        if (data.user !== undefined) {
            this.user = this.client.users.update(data.user);
        }
    }

    /** If the user associated with this member is a bot. */
    get bot(): boolean {
        return this.user.bot;
    }

    /** The Discord-tag of the user associated with this member. */
    get discriminator(): string {
        return this.user.discriminator;
    }

    /** The nick of this member if set, the display name of this member's user if set, or their username. */
    get displayName(): string {
        return this.nick ?? this.user.globalName ?? this.username;
    }

    /** The guild this member is for. This will throw an error if the guild is not cached. */
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

    /** A string that will mention this member. */
    get mention(): string {
        return this.user.mention;
    }

    /** The permissions of this member. */
    get permissions(): Permission {
        return this.guild.permissionsOf(this);
    }

    /** The user associated with this member's public [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags). */
    get publicFlags(): number {
        return this.user.publicFlags;
    }

    /** If this user associated with this member is an official discord system user. */
    get system(): boolean {
        return this.user.system;
    }

    /** The 4 digits after this user's username, if they have not been migrated. If migrated, this will be a single "0". */
    get tag(): string {
        return this.user.tag;
    }

    /** The username associated with this member's user. */
    get username(): string {
        return this.user.username;
    }

    /** The voice state of this member. */
    get voiceState(): VoiceState | null {
        return this.guild.voiceStates.get(this.id) ?? null;
    }

    /**
     * Add a role to this member.
     * @param roleID The ID of the role to add.
     */
    async addRole(roleID: string, reason?: string): Promise<void> {
        await this.client.rest.guilds.addMemberRole(this.guildID, this.id, roleID, reason);
    }

    /**
     * The url of this member's avatar decoration (or their user avatar decoration). This will always be a png.
     * Discord does not combine the decoration and their current avatar for you. This is ONLY the decoration.
     * @param size The dimensions of the image.
     */
    avatarDecorationURL(size?: number): string | null {
        return this.avatarDecorationData ? this.client.util.formatImage(Routes.AVATAR_DECORATION(this.avatarDecorationData.asset), "png", size) : this.user.avatarDecorationURL(size);
    }

    /**
     * The url of this user's guild avatar (or their user avatar if no guild avatar is set, or their default avatar if none apply).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    avatarURL(format?: ImageFormat, size?: number): string {
        return this.avatar === null ? this.user.avatarURL(format, size) : this.client.util.formatImage(Routes.GUILD_AVATAR(this.guildID, this.id, this.avatar), format, size);
    }

    /**
     * Create a ban for this member.
     * @param options The options for the ban.
     */
    async ban(options?: CreateBanOptions): Promise<void> {
        await this.client.rest.guilds.createBan(this.guildID, this.id, options);
    }

    /**
     * The url of this user's guild banner (or their user banner if no guild banner is set).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    bannerURL(format?: ImageFormat, size?: number): string | null {
        return this.banner === null ? this.user.bannerURL(format, size) : this.client.util.formatImage(Routes.MEMBER_BANNER(this.guildID, this.id, this.banner), format, size);
    }

    /**
     * Disable the `BYPASSES_VERIFICATION` flag for this member. Requires any of the following permission sets:
     * * MANAGE_GUILD
     * * MANAGE_ROLES
     * * MODERATE_MEMBERS and KICK_MEMBERS and BAN_MEMBERS
     * @param reason The reason for disabling the flag.
     */
    async disableVerificationBypass(reason?: string): Promise<void> {
        await this.toggleFlag(GuildMemberFlags.BYPASSES_VERIFICATION, false, reason);
    }

    /**
     * Edit this member. Use {@link Guild#editCurrentMember | Guild#editCurrentMember} if you wish to update the nick of this client using the `CHANGE_NICKNAME` permission.
     * @param options The options for editing the member.
     */
    async edit(options: EditMemberOptions): Promise<Member> {
        return this.client.rest.guilds.editMember(this.guildID, this.id, options);
    }

    /**
     * Edit this guild member's voice state. `channelID` is required, and the user must already be in that channel. See [Discord's docs](https://discord.com/developers/docs/resources/guild#modify-user-voice-state) for more information.
     * @param options The options for editing the voice state.
     */
    async editVoiceState(options: EditUserVoiceStateOptions): Promise<void> {
        return this.client.rest.guilds.editUserVoiceState(this.guildID, this.id, options);
    }

    /**
     * Enable the `BYPASSES_VERIFICATION` flag for this member. Requires the **Manage Guild** permission.
     * @param reason The reason for enabling the flag.
     */
    async enableVerificationBypass(reason?: string): Promise<void> {
        await this.toggleFlag(GuildMemberFlags.BYPASSES_VERIFICATION, true, reason);
    }

    /**
     * Remove a member from the guild.
     * @param reason The reason for the kick.
     */
    async kick(reason?: string): Promise<void> {
        await this.client.rest.guilds.removeMember(this.guildID, this.id, reason);
    }

    /**
     * Remove a role from this member.
     * @param roleID The ID of the role to remove.
     * @param reason The reason for removing the role.
     */
    async removeRole(roleID: string, reason?: string): Promise<void> {
        await this.client.rest.guilds.removeMemberRole(this.guildID, this.id, roleID, reason);
    }

    override toJSON(): JSONMember {
        return {
            ...super.toJSON(),
            avatar:                     this.avatar,
            avatarDecorationData:       this.avatarDecorationData,
            banner:                     this.banner,
            communicationDisabledUntil: this.communicationDisabledUntil?.getTime() ?? null,
            deaf:                       this.deaf,
            flags:                      this.flags,
            guildID:                    this.guildID,
            isPending:                  this.isPending,
            joinedAt:                   this.joinedAt?.getTime() ?? null,
            mute:                       this.mute,
            nick:                       this.nick,
            pending:                    this.pending,
            premiumSince:               this.premiumSince?.getTime() ?? null,
            presence:                   this.presence,
            roles:                      this.roles,
            user:                       this.user.toJSON()
        };
    }

    /**
     * Remove a ban for this member.
     * @param reason The reason for removing the ban.
     */
    async unban(reason?: string): Promise<void> {
        await this.client.rest.guilds.removeBan(this.guildID, this.id, reason);
    }
}
