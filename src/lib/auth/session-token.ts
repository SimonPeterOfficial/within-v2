/**
 * Session tokens — HMAC-SHA256 signed, edge-safe.
 *
 * Uses Web Crypto (crypto.subtle), so the exact same code runs in Next
 * middleware (edge runtime) and in Node route handlers — one signer, one
 * verifier, no drift between the gate and the gatekeeper.
 *
 * Token format: `base64url(payload).base64url(hmac)`
 *   payload = JSON { sub, role, iat, exp }
 *
 * ── SECRET ────────────────────────────────────────────────────────────
 * SESSION_SECRET is required in production (hard error, never silent).
 * In development a documented fallback is used so the app runs out of the
 * box — the same pattern the admin auth layer already follows.
 */

export type SessionPayload = {
  /** User id */
  sub: string;
  /** Role at issue time — middleware gates on it; APIs re-check the DB. */
  role: string;
  /** Issued at (ms epoch) */
  iat: number;
  /** Expiry (ms epoch) */
  exp: number;
};

export const SESSION_COOKIE = "within-session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

const DEV_FALLBACK_SECRET = "within-dev-session-secret-not-for-production";

/** The signing secret — env in production, documented fallback in dev. */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable is required in production.");
  }
  return DEV_FALLBACK_SECRET;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

/**
 * Signs any JSON payload as `base64url(payload).base64url(hmac)`.
 * Shared by user sessions and admin sessions so there is exactly one signer.
 */
export async function createSignedToken(payload: Record<string, unknown>): Promise<string> {
  const encoded = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encoded, getSessionSecret());
  return `${encoded}.${signature}`;
}

/**
 * Verifies a signed token's signature and returns the parsed payload, or
 * null when unsigned or tampered. Byte-wise signature comparison.
 */
export async function verifySignedToken<T>(token: string): Promise<T | null> {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const encoded = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!encoded || !signature) return null;

  const expected = await sign(encoded, getSessionSecret());
  if (signature.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    return JSON.parse(decoder.decode(base64UrlDecode(encoded))) as T;
  } catch {
    return null;
  }
}

/** Builds a signed user-session token with the given lifetime. */
export async function createSessionToken(userId: string, role: string, now = Date.now()): Promise<string> {
  const payload: SessionPayload = {
    sub: userId,
    role,
    iat: now,
    exp: now + SESSION_MAX_AGE_MS,
  };
  return createSignedToken(payload);
}

/**
 * Verifies a user-session token: signature, shape, and expiry.
 * Returns the payload, or null when unsigned, tampered, or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const payload = await verifySignedToken<SessionPayload>(token);
  if (!payload) return null;
  if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
  if (Date.now() > payload.exp) return null;
  return payload;
}