/**
 * POST /api/follows
 *   body: { followeeId }
 *
 * Toggles a follow relationship (follow → unfollow). Requires auth; the
 * database unique index prevents duplicate follow rows. Fires a real
 * `new_follower` notification on follow.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { toggleFollow } from "@/lib/follows";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = rateLimit(`follow:${user.id}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  }

  let body: { followeeId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const followeeId = typeof body.followeeId === "string" ? body.followeeId : "";
  if (!followeeId) {
    return NextResponse.json({ ok: false, error: "A target account is required." }, { status: 400 });
  }

  const result = await toggleFollow(user.id, followeeId);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, following: result.following });
}