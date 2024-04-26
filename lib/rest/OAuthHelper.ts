/** @module OAuthHelper */
import type RESTManager from "./RESTManager";
import OAuthApplication from "../structures/OAuthApplication";
import type {
    AuthorizationInformation,
    Connection,
    OAuthURLOptions,
    RawAuthorizationInformation,
    RawConnection,
    RevokeTokenOptions
} from "../types/oauth";
import type { RawOAuthGuild, RESTMember } from "../types/guilds";
import * as Routes from "../util/Routes";
import PartialApplication from "../structures/PartialApplication";
import Integration from "../structures/Integration";
import Member from "../structures/Member";
import OAuthGuild from "../structures/OAuthGuild";
import ExtendedUser from "../structures/ExtendedUser";
import type {
    AddMemberOptions,
    RESTOAuthApplication,
    RawOAuthUser,
    RawRoleConnection,
    RoleConnection,
    UpdateUserApplicationRoleConnectionOptions
} from "../types";
import { BASE_URL } from "../Constants";

/** A helper to make using authenticated oauth requests without needing a new client instance. */
export default class OAuthHelper {
    private _manager: RESTManager;
    private _token: string;
    constructor(manager: RESTManager, token: string) {
        this._token = token;
        this._manager = manager;
    }

    /**
     * Construct an oauth authorization url.
     * @param options The options to construct the url with.
     */
    static constructURL(options: OAuthURLOptions): string {
        const params: Array<string> = [
            `client_id=${options.clientID}`,
            `response_type=${options.responseType ?? "code"}`,
            `scope=${options.scopes.join("%20")}`
        ];
        if (options.redirectURI) {
            params.push(`redirect_uri=${options.redirectURI}`);
        }
        if (options.disableGuildSelect !== undefined) {
            params.push(`disable_guild_select=${String(options.disableGuildSelect)}`);
        }
        if (options.prompt) {
            params.push(`prompt=${options.prompt}`);
        }
        if (options.permissions) {
            params.push(`permissions=${options.permissions}`);
        }
        if (options.guildID) {
            params.push(`guild_id=${options.guildID}`);
        }
        if (options.state) {
            params.push(`state=${options.state}`);
        }
        return `${BASE_URL}${Routes.OAUTH_AUTHORIZE}?${params.join("&")}`;
    }

    async addGuildMember(guildID: string, userID: string, options?: Omit<AddMemberOptions, "accessToken">): Promise<Member | undefined> {
        return this._manager.guilds.addMember(guildID, userID, { accessToken: this._token.split(" ").slice(1).join(" "), ...options });
    }

    /**
     * Get the current OAuth2 application's information.
     */
    async getApplication(): Promise<OAuthApplication> {
        return this._manager.request<RESTOAuthApplication>({
            method: "GET",
            path:   Routes.OAUTH_APPLICATION,
            auth:   this._token
        }).then(data => new OAuthApplication(data, this._manager.client));
    }

    /**
     * Get information about the current authorization.
     */
    async getCurrentAuthorizationInformation(): Promise<AuthorizationInformation> {
        return this._manager.request<RawAuthorizationInformation>({
            method: "GET",
            path:   Routes.OAUTH_INFO,
            auth:   this._token
        }).then(data => ({
            application: new PartialApplication(data.application, this._manager.client),
            expires:     new Date(data.expires),
            scopes:      data.scopes,
            user:        this._manager.client.users.update(data.user)
        }));
    }

    /**
     * Get the connections of the currently authenticated user.
     *
     * Note: Requires the `connections` scope.
     */
    async getCurrentConnections(): Promise<Array<Connection>> {
        return this._manager.request<Array<RawConnection>>({
            method: "GET",
            path:   Routes.OAUTH_CONNECTIONS,
            auth:   this._token
        }).then(data => data.map(connection => ({
            friendSync:   connection.friend_sync,
            id: 	         connection.id,
            integrations: connection.integrations?.map(integration => new Integration(integration, this._manager.client)),
            name:         connection.name,
            revoked:      connection.revoked,
            showActivity: connection.show_activity,
            twoWayLink:   connection.two_way_link,
            type:         connection.type,
            verified:     connection.verified,
            visibility:   connection.visibility
        })));
    }

    /**
     * Get the guild member information about the currently authenticated user.
     *
     * Note: Requires the `guilds.members.read` scope.
     * @param guild the ID of the guild
     */
    async getCurrentGuildMember(guild: string): Promise<Member> {
        return this._manager.request<RESTMember>({
            method: "GET",
            path:   Routes.OAUTH_GUILD_MEMBER(guild),
            auth:   this._token
        }).then(data => new Member(data, this._manager.client, guild));
    }

    /**
     * Get the currently authenticated user's guilds. Note these are missing several properties gateway guilds have.
     */
    async getCurrentGuilds(): Promise<Array<OAuthGuild>> {
        return this._manager.request<Array<RawOAuthGuild>>({
            method: "GET",
            path:   Routes.OAUTH_GUILDS,
            auth:   this._token
        }).then(data => data.map(d => new OAuthGuild(d, this._manager.client)));
    }

    /**
     * Get the currently authenticated user's information.
     *
     * Note: This does not touch the client's cache in any way.
     */
    async getCurrentUser(): Promise<ExtendedUser> {
        return this._manager.request<RawOAuthUser>({
            method: "GET",
            path:   Routes.OAUTH_CURRENT_USER,
            auth:   this._token
        }).then(data => new ExtendedUser(data, this._manager.client));
    }


    /**
     * Revoke the used access token.
     * @param options The options for revoking the token.
     */
    async revokeToken(options: Omit<RevokeTokenOptions, "token">): Promise<void> {
        const form = new FormData();
        form.append("client_id", options.clientID);
        form.append("client_secret", options.clientSecret);
        form.append("token", this._token);
        await this._manager.authRequest<null>({
            method: "POST",
            path:   Routes.OAUTH_TOKEN_REVOKE,
            form
        });
    }

    /**
     * Update the authenticated user's role connection object for an application. This requires the `role_connections.write` scope.
     * @param applicationID The ID of the application.
     * @param data The metadata to update.
     */
    async updateRoleConnection(applicationID: string, data: UpdateUserApplicationRoleConnectionOptions): Promise<RoleConnection> {
        return this._manager.request<RawRoleConnection>({
            method: "PUT",
            path:   Routes.OAUTH_ROLE_CONNECTION(applicationID),
            json:   {
                metadata:          data.metadata,
                platform_name:     data.platformName,
                platform_username: data.platformUsername
            },
            auth: this._token
        }).then(d => ({
            metadata: Object.entries(d.metadata).map(([key, value]) => ({
                [key]: {
                    description:              value.description,
                    descriptionLocalizations: value.description_localizations,
                    key:                      value.key,
                    name:                     value.name,
                    nameLocalizations:        value.name_localizations,
                    type:                     value.type
                }
            })).reduce((a, b) => ({ ...a, ...b })),
            platformName:     d.platform_name,
            platformUsername: d.platform_username
        }));
    }
}
