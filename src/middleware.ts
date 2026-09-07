/**
 * Middleware — the server-side gate for protected routes.
 *
 * Two independent gates, one shared signing primitive (HMAC-SHA256 via Web
 * Crypto, so this edge-runtime file and the Node route handlers verify
 * identically):
 *
 *   /admin/:path*   → requires a valid, unexpired admin session cookie
 *                     (`within-admin-session`, set by /api/admin/login)
 *   /profile, /settings → requires a valid, unexpired user session cookie
 *                     (`within-session`, set by /api/auth/{signin,signup})
 *
 * API routes are NOT gated here — they authenticate themselves server-side
 * (see /api/auth/server.ts) so every mutation re-checks the user against
 * the database. Nothing here ever trusts client-declared roles.
 *
 * PRODUCTION NOTE:
 *   Tokens are HMAC-SHA256 signed with SESSION_SECRET (hard-required in
 *   production). For multi-instance deployments with revocation, move to a
 *   server-side session store — the verification boundary stays the same.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
  verifySignedToken,
} from "@/lib/auth/session-token";

const ADMIN_SESSION_COOKIE = "within-admin-session";
const TOKEN_PREFIX = "admin_";
const ADMIN_MAX_AGE_MS = 60 * 60 * 24 * 1000; // 24 hours

export const config = {
  matcher: ["/admin/:path*", "/profile", "/settings"],
};

async function verifyAdminSession(cookieValue: string): Promise<boolean> {
  if (!cookieValue.startsWith(TOKEN_PREFIX)) return false;
  const token = cookieValue.slice(TOKEN_PREFIX.length);
  const payload = await verifySignedToken<{ authenticated: boolean; loginTime: number }>(token);
  if (!payload?.authenticated) return false;
  return Date.now() - payload.loginTime <= ADMIN_MAX_AGE_MS;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Admin gate ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Login page and admin API routes authenticate themselves.
    if (pathname === "/admin/login" || pathname.startsWith("/api/admin")) {
      return NextResponse.next();
    }
    const cookie = request.cookies.get(ADMIN_SESSION_COOKIE);
    if (!cookie?.value || !(await verifyAdminSession(cookie.value))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── User gate — /profile and /settings require a real session ─────
  const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url);
  const userCookie = request.cookies.get(SESSION_COOKIE);
  if (!userCookie?.value) {
    return NextResponse.redirect(loginUrl);
  }
  const payload = await verifySessionToken(userCookie.value);
  if (!payload) {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}