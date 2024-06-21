import Base from "./Base";
import type { EntitlementTypes } from "../Constants";
import type { RawBaseEntitlement } from "../types/applications";
import type Client from "../Client";
import type { JSONBaseEntitlement } from "../types";

/** Represents a base entitlement. See {@link TestEntitlement | TestEntitlement} and {@link Entitlement | Entitlement}. */
export default class BaseEntitlement extends Base {
    applicationID: string;
    consumed: boolean;
    deleted: boolean;
    giftCodeFlags: number;
    guildID: string | null;
    promotionID: string | null;
    skuID: string;
    type: EntitlementTypes;
    userID: string | null;
    constructor(data: RawBaseEntitlement, client: Client) {
        super(data.id, client);
        this.applicationID = data.application_id;
        this.consumed = data.consumed;
        this.deleted = data.deleted;
        this.giftCodeFlags = data.gift_code_flags;
        this.guildID = data.guild_id;
        this.promotionID = data.promotion_id;
        this.skuID = data.sku_id;
        this.type = data.type;
        this.userID = data.user_id;
    }

    /** Mark this entitlement as consumed. */
    async consume(): Promise<void> {
        return this.client.rest.applications.consumeEntitlement(this.applicationID, this.id);
    }

    override toJSON(): JSONBaseEntitlement {
        return {
            ...super.toJSON(),
            applicationID: this.applicationID,
            consumed:      this.consumed,
            deleted:       this.deleted,
            giftCodeFlags: this.giftCodeFlags,
            guildID:       this.guildID,
            promotionID:   this.promotionID,
            skuID:         this.skuID,
            type:          this.type,
            userID:        this.userID
        };
    }
}
