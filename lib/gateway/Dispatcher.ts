import type Shard from "./Shard";
import type ShardManager from "./ShardManager";
import * as DefaultDispatchEvents from "./events";
import type { AnyDispatchPacket } from "../types/gateway-raw";

export type DispatchEvent = AnyDispatchPacket["t"];
export type DispatchEventMap = {
    [K in AnyDispatchPacket as K["t"]]: K["d"];
};
export type DispatchFunction<K extends DispatchEvent = DispatchEvent> = (data: DispatchEventMap[K], shard: Shard) => void;
export default class Dispatcher {
    private manager!: ShardManager;
    events: Map<DispatchEvent, Array<DispatchFunction>> = new Map();
    constructor(manager: ShardManager) {
        Object.defineProperty(this, "manager", {
            value:        manager,
            writable:     false,
            enumerable:   false,
            configurable: false
        });

        if (this.manager.options.useDefaultDispatchHandlers) {
            for (const [event, fn] of Object.entries(DefaultDispatchEvents)) {
                this.register(event as DispatchEvent, fn as DispatchFunction);
            }
        } else {
            this.register("READY", DefaultDispatchEvents.READY);
            this.register("RESUMED", DefaultDispatchEvents.RESUMED);
        }
    }

    private handle(data: AnyDispatchPacket, shard: Shard): void {
        const event = data.t;
        if (!this.events.has(event)) return;
        const arr = this.events.get(event)!;
        for (const fn of arr) fn(data.d, shard);
    }

    register<K extends DispatchEvent>(event: K, fn: DispatchFunction<K>, replace = false): void {
        if (!this.events.has(event)) this.events.set(event, []);
        const arr = this.events.get(event)!;
        if (replace && arr.length !== 0) arr.splice(0, arr.length);
        arr.push(fn as never);
    }

    unregister<K extends DispatchEvent>(event: K, fn?: DispatchFunction<K>): void {
        if (!this.events.has(event)) return;
        const arr = this.events.get(event)!;
        if (fn) {
            const index = arr.indexOf(fn as never);
            if (index !== -1) arr.splice(index, 1);
        } else arr.splice(0, arr.length);
    }
}
