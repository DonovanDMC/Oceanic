/** @module REST/Users */
import type Channels from "./Channels";
import type { EditSelfUserOptions, RawOAuthUser, RawUser } from "../types/users";
import * as Routes from "../util/Routes";
import ExtendedUser from "../structures/ExtendedUser";
import type RESTManager from "../rest/RESTManager";
import type User from "../structures/User";

/** Various methods for interacting with users. Located at {@link Client#rest | Client#rest}{@link RESTManager#users | .users}. */
export default class Users {
    private _manager: RESTManager;
    constructor(manager: RESTManager) {
        this._manager = manager;
    }

    /** Alias for {@link REST/Channels#createDM | Channels#createDM}. */
    get createDM(): typeof Channels.prototype.createDM {
        return this._manager.channels.createDM.bind(this._manager.channels);
    }

    /**
     * Edit the currently authenticated user.
     * @param options The options to edit with.
     * @caching This method **does not** cache its result.
     */
    async editSelf(options: EditSelfUserOptions): Promise<ExtendedUser> {
        if (options.avatar) {
            options.avatar = this._manager.client.util._convertImage(options.avatar, "avatar");
        }

        if (options.banner) {
            options.banner = this._manager.client.util._convertImage(options.banner, "banner");
        }

        return this._manager.authRequest<RawOAuthUser>({
            method: "PATCH",
            path:   Routes.USER("@me"),
            json:   options
        }).then(data => new ExtendedUser(data, this._manager.client));
    }

    /**
     * Get a user.
     * @param userID the ID of the user
     * @caching This method **does** cache its result.
     * @caches {@link Client#users | Client#users}
     */
    async get(userID: string): Promise<User> {
        return this._manager.authRequest<RawUser>({
            method: "GET",
            path:   Routes.USER(userID)
        }).then(data => this._manager.client.users.update(data));
    }

    /**
     * Leave a guild.
     * @param guildID The ID of the guild to leave.
     * @caching This method **does not** cache its result.
     */
    async leaveGuild(guildID: string): Promise<void> {
        await this._manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.OAUTH_GUILD(guildID)
        });
    }
}
