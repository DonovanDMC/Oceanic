/** @module REST/Miscellaneous */
import * as Routes from "../util/Routes";
import type RESTManager from "../rest/RESTManager";
import type { RawSticker, RawStickerPack, Sticker, StickerPack } from "../types/guilds";
import type { VoiceRegion } from "../types/voice";
import type { RawRefreshAttachmentURLsResponse, RefreshAttachmentURLsResponse } from "../types/misc";

/** Methods that don't fit anywhere else. Located at {@link Client#rest | Client#rest}{@link RESTManager#misc | .misc}. */
export default class Miscellaneous {
    private _manager: RESTManager;
    constructor(manager: RESTManager) {
        this._manager = manager;
    }

    /**
     * Get a sticker.
     * @param stickerID The ID of the sticker to get.
     * @caching This method **may** cache its result. The result will not be cached if the guild is not cached, or if the sticker is not a guild sticker.
     * @caches {@link Guild#stickers | Guild#stickers}
     */
    async getSticker(stickerID: string): Promise<Sticker> {
        return this._manager.authRequest<RawSticker>({
            method: "GET",
            path:   Routes.STICKER(stickerID)
        }).then(data => data.guild_id === undefined ? this._manager.client.util.convertSticker(data) : this._manager.client.guilds.get(data.guild_id)?.stickers.update(data) ?? this._manager.client.util.convertSticker(data));
    }

    /**
     * Get the default sticker packs.
     * @caching This method **does not** cache its result.
     */
    async getStickerPacks(): Promise<Array<StickerPack>> {
        return this._manager.authRequest<{ sticker_packs: Array<RawStickerPack>; }>({
            method: "GET",
            path:   Routes.STICKER_PACKS
        }).then(data => data.sticker_packs.map(pack => ({
            bannerAssetID:  pack.banner_asset_id,
            coverStickerID: pack.cover_sticker_id,
            description:    pack.description,
            id:             pack.id,
            name:           pack.name,
            skuID:          pack.sku_id,
            stickers:       pack.stickers.map(sticker => this._manager.client.util.convertSticker(sticker))
        })));
    }

    /**
     * Get the list of usable voice regions.
     * @caching This method **does not** cache its result.
     */
    async getVoiceRegions(): Promise<Array<VoiceRegion>> {
        return this._manager.authRequest<Array<VoiceRegion>>({
            method: "GET",
            path:   Routes.VOICE_REGIONS
        });
    }

    /**
     * Refresh expired attachment URLs.
     * @param urls The CDN urls to refresh.
     */
    async refreshAttachmentURLs(urls: Array<string>): Promise<RefreshAttachmentURLsResponse> {
        return this._manager.authRequest<RawRefreshAttachmentURLsResponse>({
            method: "POST",
            path:   Routes.REFRESH_ATTACHMENT_URLS,
            json:   {
                attachment_urls: urls
            }
        }).then(data => ({
            refreshedURLs: data.refreshed_urls
        }));
    }
}
