/**
 * Middleware — the server-side gate for protected routes.
 *
 * Two independent authentication gates, one shared signing primitive:
 *
 *   /admin/:path*   → requires Clerk authentication OR a valid, unexpired
 *                     admin session cookie (`within-admin-session`)
 *   /profile, /settings → requires Clerk authentication OR a valid,
 *                     unexpired user session cookie (`within-session`)
 *
 * Clerk establishes who is authenticated; WITHIN determines what that person
 * may do. Role and authorization checks are enforced server-side in route
 * handlers and server components — never in middleware.
 *
 * API routes are NOT gated here — they authenticate themselves server-side
 * (see /api/auth/server.ts and src/lib/auth/clerk.ts) so every mutation
 * re-checks the user against the database.
 *
 * Clerk + legacy coexistence: existing `within-session` cookies continue to
 * work unchanged. Clerk-authenticated users are resolved to local WITHIN
 * users via src/lib/auth/clerk.ts.
 *
 * PRODUCTION NOTE:
 *   Tokens are HMAC-SHA256 signed with SESSION_SECRET (hard-required in
 *   production). Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
 *   CLERK_SECRET_KEY) are configured separately via .env.local.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
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

/**
 * Checks Clerk authentication status. Returns the Clerk userId when a valid
 * Clerk session exists, null otherwise. Never throws — if Clerk isn't
 * configured yet, falls back to null so legacy auth keeps working.
 */
async function getClerkUserId(request: NextRequest): Promise<string | null> {
  try {
    const { userId } = await auth(request);
    return userId ?? null;
  } catch {
    // Clerk not configured or unavailable — legacy auth is the fallback.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Clerk authentication (coexists with legacy session) ──
  const clerkUserId = await getClerkUserId(request);

  // ── Admin gate ──
  if (pathname.startsWith("/admin")) {
    // Login page and admin API routes authenticate themselves.
    if (pathname === "/admin/login" || pathname.startsWith("/api/admin")) {
      return NextResponse.next();
    }
    // Allow if Clerk-authenticated OR legacy admin session.
    // Actual admin role authorization is enforced server-side.
    const isClerkAuthenticated = clerkUserId !== null;
    const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
    const isLegacyAdmin =
      adminCookie?.value && (await verifyAdminSession(adminCookie.value));
    if (!isClerkAuthenticated && !isLegacyAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── User gate — /profile and /settings require authentication ──
  const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url);

  // Allow if Clerk-authenticated. Local user resolution and status checks
  // happen server-side in route handlers / server components.
  if (clerkUserId) {
    return NextResponse.next();
  }

  // Otherwise fall back to the legacy session cookie.
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
