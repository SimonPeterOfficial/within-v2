/**
 * GET /api/trace — the caller's own Trace.
 * Owner-only: the authenticated user's meaningful moments, bounded and
 * derived from real persisted state (creations, worlds, saves,
 * conversations, reflections). Never across users, never leaked.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getTrace } from "@/lib/trace";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const moments = await getTrace(user.id);
  return NextResponse.json({ ok: true, moments });
}
