/**
 * Rate limiting — in-memory sliding window for mutation endpoints.
 *
 * Honest about its limits: this is per-instance memory, so it throttles
 * abuse on a single server but is not a distributed rate limiter. For
 * production at scale, swap this for a shared store (Upstash Redis etc.)
 * behind the same `rateLimit` signature — callers never change.
 *
 * Keys are derived from the client IP; when the IP is unavailable (e.g.
 * behind a proxy without X-Forwarded-For), a shared bucket still applies a
 * global ceiling so a burst can't hammer the endpoint from anywhere.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000; // bound memory under long-running dev servers

function sweep() {
  if (buckets.size > MAX_BUCKETS) {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.timestamps.length === 0) buckets.delete(key);
    }
    void now;
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Allows `limit` calls per `windowMs`, sliding. Returns ok=false with a
 * retry-after hint when the window is exhausted.
 */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const bucket = buckets.get(key) ?? { timestamps: [] };
  const cutoff = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { ok: false, retryAfterSeconds };
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  sweep();
  return { ok: true };
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