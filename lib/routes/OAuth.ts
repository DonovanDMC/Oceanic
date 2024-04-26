/** @module REST/OAuth */
import type {
    AuthorizationInformation,
    ClientCredentialsTokenOptions,
    ClientCredentialsTokenResponse,
    Connection,
    ExchangeCodeOptions,
    ExchangeCodeResponse,
    RawAuthorizationInformation,
    RawClientCredentialsTokenResponse,
    RawConnection,
    RawExchangeCodeResponse,
    RawRefreshTokenResponse,
    RefreshTokenOptions,
    RefreshTokenResponse,
    RevokeTokenOptions,
    GetCurrentGuildsOptions,
    RawRoleConnectionMetadata,
    RoleConnectionMetadata,
    RoleConnection,
    RawRoleConnection
} from "../types/oauth";
import type { RawOAuthGuild, RESTMember } from "../types/guilds";
import * as Routes from "../util/Routes";
import OAuthApplication from "../structures/OAuthApplication";
import PartialApplication from "../structures/PartialApplication";
import Member from "../structures/Member";
import Webhook from "../structures/Webhook";
import Integration from "../structures/Integration";
import type RESTManager from "../rest/RESTManager";
import OAuthHelper from "../rest/OAuthHelper";
import OAuthGuild from "../structures/OAuthGuild";
import ExtendedUser from "../structures/ExtendedUser";
import type { RESTOAuthApplication, RawOAuthUser, UpdateUserApplicationRoleConnectionOptions } from "../types";

/** Various methods for interacting with oauth. Located at {@link Client#rest | Client#rest}{@link RESTManager#oauth | .oauth}. */
export default class OAuth {
    private _manager: RESTManager;
    constructor(manager: RESTManager) {
        this._manager = manager;
    }

    /**
     * Get an access token for the application owner. If the application is owned by a team, this is restricted to `identify` & `applications.commands.update`.
     * @param options The options to for the client credentials grant.
     * @caching This method **does not** cache its result.
     */
    async clientCredentialsGrant(options: ClientCredentialsTokenOptions): Promise<ClientCredentialsTokenResponse> {
        const form = new FormData();
        form.append("grant_type", "client_credentials");
        form.append("scope", options.scopes.join(" "));
        return this._manager.request<RawClientCredentialsTokenResponse>({
            method: "POST",
            path:   Routes.OAUTH_TOKEN,
            form,
            auth:   (options.clientID ?? this._manager.client["_application"]) && options.clientSecret ? `Basic ${Buffer.from(`${options.clientID ?? this._manager.client["_application"]!.id}:${options.clientSecret}`).toString("base64")}` : true
        }).then(data => ({
            accessToken: data.access_token,
            expiresIn:   data.expires_in,
            scopes:      data.scope.split(" "),
            tokenType:   data.token_type,
            webhook:     data.webhook ? new Webhook(data.webhook, this._manager.client) : null
        }));
    }

    /**
     * Exchange a code for an access token.
     * @param options The options for exchanging the code.
     * @caching This method **does not** cache its result.
     */
    async exchangeCode(options: ExchangeCodeOptions): Promise<ExchangeCodeResponse> {
        const form = new FormData();
        form.append("client_id", options.clientID);
        form.append("client_secret", options.clientSecret);
        form.append("code", options.code);
        form.append("grant_type", "authorization_code");
        form.append("redirect_uri", options.redirectURI);
        return this._manager.authRequest<RawExchangeCodeResponse>({
            method: "POST",
            path:   Routes.OAUTH_TOKEN,
            form
        }).then(data => ({
            accessToken:  data.access_token,
            expiresIn:    data.expires_in,
            refreshToken: data.refresh_token,
            scopes:       data.scope.split(" "),
            tokenType:    data.token_type,
            webhook:      data.webhook ? new Webhook(data.webhook, this._manager.client) : null
        }));
    }

    /**
     * Get the current OAuth2 application's information.
     * @caching This method **does not** cache its result.
     */
    async getApplication(): Promise<OAuthApplication> {
        return this._manager.authRequest<RESTOAuthApplication>({
            method: "GET",
            path:   Routes.OAUTH_APPLICATION
        }).then(data => new OAuthApplication(data, this._manager.client));
    }

    /**
     * Get information about the current authorization.
     *
     * Note: OAuth only. Bots cannot use this.
     * @caching This method **does** cache part of its result.
     * @caches {@link Client#users | Client#users}
     */
    async getCurrentAuthorizationInformation(): Promise<AuthorizationInformation> {
        return this._manager.authRequest<RawAuthorizationInformation>({
            method: "GET",
            path:   Routes.OAUTH_INFO
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
     * Note: Requires the `connections` scope when using oauth.
     * @caching This method **does not** cache its result.
     */
    async getCurrentConnections(): Promise<Array<Connection>> {
        return this._manager.authRequest<Array<RawConnection>>({
            method: "GET",
            path:   Routes.OAUTH_CONNECTIONS
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
     * Note: OAuth only. Requires the `guilds.members.read` scope. Bots cannot use this.
     * @param guild the ID of the guild
     * @caching This method **does not** cache its result.
     */
    async getCurrentGuildMember(guild: string): Promise<Member> {
        return this._manager.authRequest<RESTMember>({
            method: "GET",
            path:   Routes.OAUTH_GUILD_MEMBER(guild)
        }).then(data => new Member(data, this._manager.client, guild));
    }

    /**
     * Get the currently authenticated user's guilds. Note these are missing several properties gateway guilds have.
     * @param options The options for getting the current user's guilds.
     * @caching This method **does not** cache its result.
     */
    async getCurrentGuilds(options?: GetCurrentGuildsOptions): Promise<Array<OAuthGuild>> {
        const query = new URLSearchParams();
        if (options?.after !== undefined) {
            query.set("after", options.after);
        }
        if (options?.before !== undefined) {
            query.set("before", options.before);
        }
        if (options?.limit !== undefined) {
            query.set("limit", options.limit.toString());
        }
        if (options?.withCounts !== undefined) {
            query.set("with_counts", options?.withCounts.toString());
        }
        return this._manager.authRequest<Array<RawOAuthGuild>>({
            method: "GET",
            path:   Routes.OAUTH_GUILDS,
            query
        }).then(data => data.map(d => new OAuthGuild(d, this._manager.client)));
    }

    /**
     * Get the currently authenticated user's information.
     * @caching This method **does not** cache its result.
     */
    async getCurrentUser(): Promise<ExtendedUser> {
        return this._manager.authRequest<RawOAuthUser>({
            method: "GET",
            path:   Routes.OAUTH_CURRENT_USER
        }).then(data => new ExtendedUser(data, this._manager.client));
    }

    /**
     * Get a helper instance that can be used with a specific access token.
     * @param accessToken The access token. Must be prefixed with `Bearer `.
     */
    getHelper(accessToken: string): OAuthHelper {
        return new OAuthHelper(this._manager, accessToken);
    }

    /**
     * Get an application's role connection metadata records.
     * @param applicationID The ID of the application.
     * @caching This method **does not** cache its result.
     */
    async getRoleConnectionsMetadata(applicationID: string): Promise<Array<RoleConnectionMetadata>> {
        return this._manager.authRequest<Array<RawRoleConnectionMetadata>>({
            method: "GET",
            path:   Routes.ROLE_CONNECTIONS_METADATA(applicationID)
        }).then(data => data.map(d => ({
            description:              d.description,
            descriptionLocalizations: d.description_localizations,
            key:                      d.key,
            name:                     d.name,
            nameLocalizations:        d.name_localizations,
            type:                     d.type
        })));
    }

    /**
     * Get the authenticated user's role connection object for an application. This requires the `role_connections.write` scope.
     * @param applicationID The ID of the application.
     * @caching This method **does not** cache its result.
     */
    async getUserRoleConnection(applicationID: string): Promise<RoleConnection> {
        return this._manager.authRequest<RawRoleConnection>({
            method: "GET",
            path:   Routes.OAUTH_ROLE_CONNECTION(applicationID)
        }).then(data => ({
            metadata: Object.entries(data.metadata).map(([key, value]) => ({
                [key]: {
                    description:              value.description,
                    descriptionLocalizations: value.description_localizations,
                    key:                      value.key,
                    name:                     value.name,
                    nameLocalizations:        value.name_localizations,
                    type:                     value.type
                }
            })).reduce((a, b) => ({ ...a, ...b })),
            platformName:     data.platform_name,
            platformUsername: data.platform_username
        }));
    }
    /**
     * Refresh an existing access token.
     * @param options The options for refreshing the token.
     * @caching This method **does not** cache its result.
     */
    async refreshToken(options: RefreshTokenOptions): Promise<RefreshTokenResponse> {
        const form = new FormData();
        form.append("client_id", options.clientID);
        form.append("client_secret", options.clientSecret);
        form.append("grant_type", "refresh_token");
        form.append("refresh_token", options.refreshToken);
        return this._manager.authRequest<RawRefreshTokenResponse>({
            method: "POST",
            path:   Routes.OAUTH_TOKEN,
            form
        }).then(data => ({
            accessToken:  data.access_token,
            expiresIn:    data.expires_in,
            refreshToken: data.refresh_token,
            scopes:       data.scope.split(" "),
            tokenType:    data.token_type
        }));
    }


    /**
     * Revoke an access token.
     * @param options The options for revoking the token.
     * @caching This method **does not** cache its result.
     */
    async revokeToken(options: RevokeTokenOptions): Promise<void> {
        const form = new FormData();
        form.append("client_id", options.clientID);
        form.append("client_secret", options.clientSecret);
        form.append("token", options.token);
        await this._manager.authRequest<null>({
            method: "POST",
            path:   Routes.OAUTH_TOKEN_REVOKE,
            form
        });
    }

    /**
     * Update an application's role connections metadata.
     * @param applicationID The ID of the application.
     * @param metadata The metadata records.
     * @caching This method **does not** cache its result.
     */
    async updateRoleConnectionsMetadata(applicationID: string, metadata: Array<RoleConnectionMetadata>): Promise<Array<RoleConnectionMetadata>> {
        return this._manager.authRequest<Array<RawRoleConnectionMetadata>>({
            method: "PUT",
            path:   Routes.ROLE_CONNECTIONS_METADATA(applicationID),
            json:   metadata.map(d => ({
                description:               d.description,
                description_localizations: d.descriptionLocalizations,
                key:                       d.key,
                name:                      d.name,
                name_localizations:        d.nameLocalizations,
                type:                      d.type
            }))
        }).then(data => data.map(d => ({
            description:              d.description,
            descriptionLocalizations: d.description_localizations,
            key:                      d.key,
            name:                     d.name,
            nameLocalizations:        d.name_localizations,
            type:                     d.type
        })));
    }

    /**
     * Update the authenticated user's role connection object for an application. This requires the `role_connections.write` scope.
     * @param applicationID The ID of the application.
     * @param data The metadata to update.
     * @caching This method **does not** cache its result.
     */
    async updateUserRoleConnection(applicationID: string, data: UpdateUserApplicationRoleConnectionOptions): Promise<RoleConnection> {
        return this._manager.authRequest<RawRoleConnection>({
            method: "PUT",
            path:   Routes.OAUTH_ROLE_CONNECTION(applicationID),
            json:   {
                metadata:          data.metadata,
                platform_name:     data.platformName,
                platform_username: data.platformUsername
            }
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
