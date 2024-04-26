/** @module Permission */
import { Permissions, type PermissionName as PermissionNames } from "../Constants";
import type { JSONPermission } from "../types/json";

/** Represents a permission. */
export default class Permission {
    private _json: Partial<Record<keyof typeof Permissions, boolean>> | undefined;
    /** The allowed permissions for this permission instance. */
    allow: bigint;
    /** The denied permissions for this permission instance. */
    deny: bigint;
    constructor(allow: bigint | string, deny: bigint | string = 0n) {
        this.allow = BigInt(allow);
        this.deny = BigInt(deny);
        Object.defineProperty(this, "#json", {
            value:        undefined,
            enumerable:   false,
            writable:     true,
            configurable: false
        });
    }

    /** A key-value map of permission to if it's been allowed or denied (not present if neither) */
    get json(): Partial<Record<keyof typeof Permissions, boolean>> {
        if (this._json) {
            return this._json;
        } else {
            const json: Partial<Record<keyof typeof Permissions, boolean>> = {};
            for (const perm of Object.keys(Permissions) as Array<keyof typeof Permissions>) {
                if (this.allow & Permissions[perm]) {
                    json[perm] = true;
                } else if (this.deny & Permissions[perm]) {
                    json[perm] = false;
                }
            }

            return (this._json = json);
        }
    }

    /**
     * Check if this permissions instance has the given permissions allowed
     * @param permissions The permissions to check for.
     */
    has(...permissions: Array<PermissionNames | bigint>): boolean {
        for (const perm of permissions) {
            if (typeof perm === "bigint") {
                if ((this.allow & perm) !== perm) {
                    return false;
                }
            } else if (!(this.allow & Permissions[perm])) {
                return false;
            }
        }

        return true;
    }

    toJSON(): JSONPermission {
        return {
            allow: this.allow.toString(),
            deny:  this.deny.toString()
        };
    }

    toString(): string {
        return `[${this.constructor.name} +${this.allow} -${this.deny}]`;
    }
}
