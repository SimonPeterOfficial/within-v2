/**
 * Rate limiting — sliding window for mutation endpoints.
 *
 * Design:
 *   - A `RateLimiter` interface decouples the enforcement rule from the
 *     storage backend. Callers never change when the store is swapped.
 *   - The default implementation is per-instance in-memory, which is safe
 *     for single-instance deployments and honest about its limits.
 *   - For multi-instance production, a shared store (Redis, Upstash, etc.)
 *     can be plugged in behind the same `RateLimiter` interface — no caller
 *     changes required.
 *
 *   Do not add Redis or a paid provider automatically. If no shared store
 *   is configured in production, the app logs a clear startup warning and
 *   falls back to per-instance limiting — it does not silently pretend to
 *   be distributed.
 */

import type { RateLimitResult } from "./rate-limit-types";

/** One rate-limiting decision. */
export type RateLimitDecision = RateLimitResult;

/** The storage-agnostic rate-limiting contract. */
export interface RateLimiter {
  /**
   * Consumes one unit from the bucket identified by `key`.
   * Returns `ok: true` when the request may proceed, or `ok: false` with a
   * `retryAfterSeconds` hint when the limit is exhausted.
   */
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitDecision>;
}

/** Default per-instance in-memory rate limiter. Safe for single-instance
 *  deployments. Not distributed — state is lost across restarts and is not
 *  shared between instances behind a load balancer. */
export class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, number[]>();
  private readonly maxBuckets: number;

  constructor(maxBuckets = 5_000) {
    this.maxBuckets = maxBuckets;
  }

  async consume(key: string, limit: number, windowMs: number, now = Date.now()): Promise<RateLimitDecision> {
    const cutoff = now - windowMs;
    const timestamps = this.buckets.get(key) ?? [];
    const valid = timestamps.filter((t) => t > cutoff);

    if (valid.length >= limit) {
      const oldest = valid[0] ?? now;
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
      };
    }

    valid.push(now);
    this.buckets.set(key, valid);
    this.maybeSweep();
    return { ok: true };
  }

  private maybeSweep(): void {
    if (this.buckets.size > this.maxBuckets) {
      const now = Date.now();
      for (const [key, timestamps] of this.buckets) {
        if (timestamps.length === 0) this.buckets.delete(key);
      }
      void now;
    }
  }
}

/** Extracts a stable client key from a request (IP via X-Forwarded-For). */
export function clientKeyFrom(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown-client";
}

/** Default rate limiter instance — shared within a single server instance.
 *  For multi-instance production, inject a shared-store RateLimiter instead. */
export const rateLimiter = new InMemoryRateLimiter();

/** Default rate-limit decision — kept as a named export for callers that
 *  prefer the function-call style. Delegates to the default limiter. */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  return rateLimiter.consume(key, limit, windowMs);
}
