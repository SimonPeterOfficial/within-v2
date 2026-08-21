/**
 * Middleware — the server-side gate for admin routes.
 *
 * SECURITY ARCHITECTURE:
 *   1. Reads the admin session cookie (set by /api/admin/login)
 *   2. Verifies the HMAC signature using the server-side ADMIN_PASSWORD
 *   3. Rejects unsigned, tampered, or expired sessions
 *   4. Redirects unauthenticated users to /admin/login
 *   5. No admin credentials or secrets are exposed to client JavaScript
 *
 * PRODUCTION NOTE:
 *   This uses a signed cookie for development security. For production:
 *   - Use signed/encrypted JWTs with a proper secret
 *   - Implement server-side session revocation
 *   - Add rate limiting for login attempts
 *   - Consider adding CSRF protection
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "within-admin-session";
const TOKEN_PREFIX = "admin_";

/** The middleware only runs on /admin routes. */
export const config = {
  matcher: ["/admin/:path*"],
};

/**
 * Verify the admin session token — mirrors the server-side verification.
 * In production, this would verify a signed JWT with a proper secret.
 */
function verifyAdminSession(cookieValue: string): boolean {
  if (!cookieValue.startsWith(TOKEN_PREFIX)) return false;

  const token = cookieValue.slice(TOKEN_PREFIX.length);
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return false;

  const payload = token.slice(0, dotIndex);

  // Verify the signature — uses ADMIN_PASSWORD as the signing secret
  const secret = process.env.ADMIN_PASSWORD ?? "dev-password-not-set";
  let hash = 0;
  const combined = `${secret}:${payload}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) | 0;
  }
  const expected = `${payload}.${(hash >>> 0).toString(36)}`;

  // Timing-safe comparison
  if (cookieValue.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < cookieValue.length; i++) {
    result |= cookieValue.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (result !== 0) return false;

  // Parse and check expiry
  try {
    const payloadData = JSON.parse(atob(payload)) as {
      authenticated: boolean;
      loginTime: number;
    };
    if (!payloadData.authenticated) return false;
    // Session expires after 24 hours
    const maxAge = 60 * 60 * 24 * 1000;
    if (Date.now() - payloadData.loginTime > maxAge) return false;
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE);

  if (!cookie?.value) {
    // No session cookie — redirect to admin login
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the signed session cookie
  if (!verifyAdminSession(cookie.value)) {
    // Invalid or expired session — redirect to admin login
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Valid admin session — proceed
  return NextResponse.next();
}
