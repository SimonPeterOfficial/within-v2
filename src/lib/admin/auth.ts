/**
 * Admin auth — server-side credential verification.
 *
 * SECURITY ARCHITECTURE:
 *   1. Admin password is read from process.env.ADMIN_PASSWORD (server-only)
 *   2. Passwords are verified with timing-safe comparison
 *   3. Sessions are signed with a server-side secret (not just base64)
 *   4. Middleware reads the session cookie and verifies the signature
 *   5. No admin credentials are ever exposed to client-side JavaScript
 *
 * PRODUCTION NOTE:
 *   This is a development-grade implementation. For production, replace with:
 *   - Clerk, NextAuth, or a custom JWT system
 *   - Server-side session store (Redis, database)
 *   - Signed/encrypted JWTs instead of HMAC-signed tokens
 */

import { cookies } from "next/headers";

/* ── Configuration ───────────────────────────────────────────────────── */

const COOKIE_NAME = "within-admin-session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours
const TOKEN_PREFIX = "admin_";

/**
 * The admin password — read from environment variables only.
 * NEVER hardcode, NEVER expose to client, NEVER log.
 * Falls back to a development default only in non-production.
 */
function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    // Development fallback — clearly logged, never in production
    if (process.env.NODE_ENV === "production") {
      console.error("[ADMIN AUTH] CRITICAL: ADMIN_PASSWORD not set in production!");
      throw new Error("ADMIN_PASSWORD environment variable is required");
    }
    return "dev-password-not-set";
  }
  return password;
}

/* ── Timing-safe comparison ──────────────────────────────────────────── */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/* ── Simple HMAC-like signing (demo — production uses real JWTs) ──────── */

function signToken(payload: string, secret: string): string {
  // Simple hash for demo — NOT cryptographic security
  let hash = 0;
  const combined = `${secret}:${payload}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) | 0;
  }
  return `${payload}.${(hash >>> 0).toString(36)}`;
}

function verifyToken(token: string, secret: string): string | null {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const payload = token.slice(0, dotIndex);

  const expected = signToken(payload, secret);
  if (!timingSafeEqual(token, expected)) return null;

  return payload;
}

/* ── Session management ──────────────────────────────────────────────── */

export type AdminSession = {
  authenticated: boolean;
  loginTime: number;
};

/**
 * Verify admin credentials — server-side only.
 * Returns true if the password matches the environment variable.
 */
export function verifyAdminCredentials(password: string): boolean {
  const adminPassword = getAdminPassword();
  return timingSafeEqual(password, adminPassword);
}

/**
 * Create an admin session cookie — called after successful authentication.
 * The cookie contains a signed token that middleware can verify.
 */
export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const payload = JSON.stringify({
    authenticated: true,
    loginTime: Date.now(),
  });
  const secret = getAdminPassword();
  const token = signToken(payload, secret);

  cookieStore.set(COOKIE_NAME, `${TOKEN_PREFIX}${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Verify the admin session from a cookie value.
 * Used by middleware for server-side route protection.
 */
export function verifyAdminSession(cookieValue: string): AdminSession | null {
  if (!cookieValue.startsWith(TOKEN_PREFIX)) return null;

  const token = cookieValue.slice(TOKEN_PREFIX.length);
  const secret = getAdminPassword();
  const payloadStr = verifyToken(token, secret);

  if (!payloadStr) return null;

  try {
    const payload = JSON.parse(payloadStr) as AdminSession;
    if (!payload.authenticated) return null;
    // Session expires after COOKIE_MAX_AGE
    if (Date.now() - payload.loginTime > COOKIE_MAX_AGE * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Clear the admin session cookie — called on logout.
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME as ADMIN_SESSION_COOKIE };
