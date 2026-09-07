/**
 * /api/profile
 *   GET   — the caller's own profile (for the settings/profile forms)
 *   PATCH — update own profile (display name, bio, avatar, gradient)
 *
 * Auth required. Only validated fields are accepted; private data is never
 * returned by any public endpoint.
 */

import { NextResponse } from "next/server";
import { requireUser, touchUserActivity } from "@/lib/auth/server";
import { getProfileByUserId, updateOwnProfile } from "@/lib/profiles";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const profile = await getProfileByUserId(user.id);
  if (!profile) return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    profile: {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatar: profile.avatar,
      gradient: profile.gradient,
      privacy: profile.privacy,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  let body: { displayName?: unknown; bio?: unknown; avatar?: unknown; gradient?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const result = await updateOwnProfile(user.id, {
    displayName: typeof body.displayName === "string" ? body.displayName : undefined,
    bio: typeof body.bio === "string" ? body.bio : undefined,
    avatar: typeof body.avatar === "string" ? body.avatar : undefined,
    gradient: typeof body.gradient === "string" ? body.gradient : undefined,
  });

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  await touchUserActivity(user.id);
  return NextResponse.json({ ok: true, profile: result.profile });
}