/** @module RESTManager */
import RequestHandler from "./RequestHandler";
import type Client from "../Client";
import Channels from "../routes/Channels";
import Guilds from "../routes/Guilds";
import Users from "../routes/Users";
import OAuth from "../routes/OAuth";
import Webhooks from "../routes/Webhooks";
import type { RESTOptions } from "../types/client";
import type { RequestOptions } from "../types/request-handler";
import Applications from "../routes/Applications";
import Interactions from "../routes/Interactions";
import * as Routes from "../util/Routes";
import type { GetBotGatewayResponse, GetGatewayResponse, RawGetBotGatewayResponse } from "../types/gateway";
import Miscellaneous from "../routes/Miscellaneous";

/** A manager for all rest actions. */
export default class RESTManager {
    private _client: Client;
    applications: Applications;
    channels: Channels;
    guilds: Guilds;
    handler: RequestHandler;
    interactions: Interactions;
    misc: Miscellaneous;
    oauth: OAuth;
    users: Users;
    webhooks: Webhooks;
    constructor(client: Client, options?: RESTOptions) {
        this.applications = new Applications(this);
        this.channels = new Channels(this);
        this._client = client;
        this.guilds = new Guilds(this);
        this.handler = new RequestHandler(this, options);
        this.interactions = new Interactions(this);
        this.misc = new Miscellaneous(this);
        this.oauth = new OAuth(this);
        this.users = new Users(this);
        this.webhooks = new Webhooks(this);
    }

    get client(): Client {
        return this._client;
    }
    get options(): RESTOptions {
        return this.handler.options;
    }

    /** Alias for {@link RequestHandler#authRequest | RequestHandler#authRequest} */
    async authRequest<T = unknown>(options: Omit<RequestOptions, "auth">): Promise<T> {
        return this.handler.authRequest<T>(options);
    }

    /**
     * Get the gateway information related to your bot client.
     */
    async getBotGateway(): Promise<GetBotGatewayResponse> {
        return this.authRequest<RawGetBotGatewayResponse>({
            method: "GET",
            path:   Routes.GATEWAY_BOT
        }).then(data => ({
            url:               data.url,
            shards:            data.shards,
            sessionStartLimit: {
                total:          data.session_start_limit.total,
                remaining:      data.session_start_limit.remaining,
                resetAfter:     data.session_start_limit.reset_after,
                maxConcurrency: data.session_start_limit.max_concurrency
            }
        }));
    }

    /**
     * Get the gateway information.
     */
    async getGateway(): Promise<GetGatewayResponse> {
        return this.request<GetGatewayResponse>({
            method: "GET",
            path:   Routes.GATEWAY
        });
    }

    /** Alias for {@link RequestHandler#request | RequestHandler#request} */
    async request<T = unknown>(options: RequestOptions): Promise<T> {
        return this.handler.request<T>(options);
    }
}
