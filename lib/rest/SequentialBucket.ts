/** @module SequentialBucket */
/**
 * Latency & ratelimit related things lovingly borrowed from eris
 * https://github.com/abalabahaha/eris/blob/dev/lib/util/SequentialBucket.js (eb403730855714eafa36c541dbe2cb84c9979158)
 */

import type { LatencyRef } from "../types/request-handler";

/** A ratelimit bucket. */
export default class SequentialBucket {
    private _queue: Array<(cb: () => void) => void> = [];
    last: number;
    latencyRef: LatencyRef;
    limit: number;
    processing: NodeJS.Timeout | boolean = false;
    remaining: number;
    reset: number;
    constructor(limit: number, latencyRef: LatencyRef) {
        this.limit = this.remaining = limit;
        this.latencyRef = latencyRef;
        this.last = this.reset = 0;
    }

    private check(force = false): void {
        if (this._queue.length === 0) {
            if (this.processing) {
                if (typeof this.processing !== "boolean") {
                    clearTimeout(this.processing);
                }
                this.processing = false;
            }
            return;
        }
        if (this.processing && !force) {
            return;
        }
        const now = Date.now();
        const offset = this.latencyRef.latency;
        if (!this.reset || this.reset < now - offset) {
            this.reset = now - offset;
            this.remaining = this.limit;
        }
        this.last = now;
        if (this.remaining <= 0) {
            this.processing = setTimeout(() => {
                this.processing = false;
                this.check(true);
            }, Math.max(0, (this.reset ?? 0) - now + offset) + 1);
            return;
        }
        --this.remaining;
        this.processing = true;
        this._queue.shift()!(() => {
            if (this._queue.length === 0) {
                this.processing = false;
            } else {
                this.check(true);
            }
        });
    }

    /**
     * Add an item to the queue.
     * @param func The function to queue.
     * @param priority- If true, the item will be added to the front of the queue/
     */
    queue(func: (cb: () => void) => void, priority = false): void {
        if (priority) {
            this._queue.unshift(func);
        } else {
            this._queue.push(func);
        }
        this.check();
    }
}
