/* eslint-disable @typescript-eslint/no-explicit-any */
/** @module Types/Miscellaneous */

import type { RawUser } from "./users";
import type Client from "../Client";

export type StringMap<T extends Record<string, any>> = { [K in keyof T]: `${T[K]}` };
export type ReverseMap<T extends Record<keyof T, keyof any>> = {
    [P in T[keyof T]]: {
        [K in keyof T]: T[K] extends P ? K : never
    }[keyof T]
};
export type AnyClass<T, I, E extends Array<unknown>> = new(data: T, client: Client, ...extra: E) => I;
export type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

export interface RawRefreshAttachmentURLsResponse {
    refreshed_urls: Array<RefreshedAttachment>;
}
export interface RefreshAttachmentURLsResponse {
    refreshedURLs: Array<RefreshedAttachment>;
}

export interface RefreshedAttachment {
    original: string;
    refreshed: string;
}

export interface Emoji {
    animated?: boolean;
    available?: boolean;
    id: string | null;
    managed?: boolean;
    name: string;
    require_colons?: boolean;
    roles?: Array<string>;
    user?: RawUser;
}
