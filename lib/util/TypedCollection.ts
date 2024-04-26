/** @module TypedCollection */
import Collection from "./Collection";
import type Client from "../Client";
import Base from "../structures/Base";
import type { AnyClass } from "../types/misc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ExtraOptions<M extends Record<string, any>, C extends Base, E extends Array<unknown> = []> {
    construct?(this: void, data: M, ...extra: E): C;
    delete?(this: void, key: string): void;
}

/** This is an internal class, you should not use it in your projects. If you want a collection type for your own projects, look at {@link Collection}. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class TypedCollection<M extends Record<string, any>, C extends Base, E extends Array<unknown> = []> extends Collection<string, C> {
    private _baseObject: AnyClass<M, C, E>;
    extraOptions: Required<ExtraOptions<M, C, E>>;
    limit: number;
    constructor(baseObject: AnyClass<M, C, E>, client: Client, limit = Infinity, extraOptions?: ExtraOptions<M, C, E>) {
        super();
        if (!(baseObject.prototype instanceof Base)) {
            throw new TypeError("baseObject must be a class that extends Base.");
        }
        this._baseObject = baseObject;
        this.limit = limit;
        this.extraOptions = {
            construct: extraOptions?.construct ?? ((data, ...extra): C => new baseObject(data, client, ...extra)),
            delete:    extraOptions?.delete ?? ((): void => {})
        };
    }

    /** @hidden */
    add<T extends C>(value: T): T {
        if ("id" in value) {
            if (this.limit === 0) {
                return value;
            }
            this.set(value.id, value);

            if (this.limit && this.size > this.limit) {
                const iter = this.keys();
                while (this.size > this.limit) {
                    this.delete(iter.next().value as string);
                }

            }

            return value;
        } else {
            const err = new Error(`${this.constructor.name}#add: value must have an id property`);
            Object.defineProperty(err, "_object", { value });
            throw err;
        }
    }

    override clear(): void {
        for (const key of this.keys()) {
            this.extraOptions.delete(key);
        }
        super.clear();
    }

    override delete(key: string): boolean {
        this.extraOptions.delete(key);
        return super.delete(key);
    }

    /** @hidden */
    update(value: C | Partial<M> & { id?: string; }, ...extra: E): C {
        if (value instanceof this._baseObject) {
            if ("update" in value) {
                value["update"].call(value, value);
            }
            return value;
        }
        // if the object does not have a direct id, we're forced to construct a whole new object
        let item = "id" in value && value.id ? this.get(value.id) : undefined;
        if (!item) {
            item = this.add(this.extraOptions.construct(value as M, ...extra));
        } else if ("update" in item) {
            item["update"].call(item, value);
        }
        return item;
    }
}
