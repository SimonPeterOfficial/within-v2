/**
 * Rate limit result type — shared by all rate limiter implementations.
 */

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };
