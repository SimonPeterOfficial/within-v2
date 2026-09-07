/**
 * POST /api/studio/schedule — schedule the caller's approved content.
 * Writes scheduledAt; server-side processing publishes when due.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { schedulePublication } from "@/lib/studio";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const contentId = typeof body.contentId === "string" ? body.contentId : "";
  const scheduledAtRaw = typeof body.scheduledAt === "string" ? body.scheduledAt : "";
  if (!contentId || !scheduledAtRaw) {
    return NextResponse.json({ ok: false, error: "Content and time are required." }, { status: 400 });
  }

  const result = await schedulePublication(user.id, contentId, new Date(scheduledAtRaw));
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true });
}
