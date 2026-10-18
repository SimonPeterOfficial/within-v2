/**
 * GET /api/auth/me
 *
 * Resolves the current session to a user — called on every client mount so
 * the UI restores real identity (not localStorage) after a refresh.
 *
 * Supports both authentication methods during the Clerk coexistence period:
 *   1. Clerk authentication (auth() from @clerk/nextjs) → resolves via
 *      src/lib/auth/clerk.ts to the local WITHIN user
 *   2. Legacy custom session (within-session cookie) → existing behavior
 *
 * Clerk establishes who is authenticated; WITHIN determines the local user
 * and role. Never trusts client-supplied identity.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getSessionUser } from "@/lib/auth/server";
import { resolveClerkUser } from "@/lib/auth/clerk";
import type { AuthSession } from "@/lib/auth/types";

export const dynamic = "force-dynamic";

export async function GET() {
  // ── 1. Clerk authentication (takes precedence when configured) ─────
  const { userId: clerkUserId } = await auth();
  if (clerkUserId) {
    const resolved = await resolveClerkUser();
    if (resolved) {
      const { user } = resolved;
      const session: AuthSession = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: new Date(user.createdAt).getTime(),
        },
        token: "clerk",
        createdAt: Date.now(),
      };
      return NextResponse.json({ ok: true, session });
    }
    // Clerk-authenticated but no local WITHIN mapping — account linking required.
    return NextResponse.json(
      { ok: false, error: "account_linking_required", clerkUserId },
      { status: 401 },
    );
  }

  // ── 2. Legacy custom session (existing within-session cookie) ──────
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const session: AuthSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: new Date(user.createdAt).getTime(),
    },
    token: "session",
    createdAt: Date.now(),
  };
  return NextResponse.json({ ok: true, session });
}
