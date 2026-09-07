/**
 * /api/mirror — the private reflection API.
 *   GET  — the caller's entries, newest first
 *   POST — create an entry: { body, prompt?, moodId? }
 *
 * Every path requires a session; every query is owner-scoped. There is no
 * public or cross-user read anywhere in Mirror.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { createMirrorEntry, listMirrorEntries } from "@/lib/mirror";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const entries = await listMirrorEntries(user.id);
  return NextResponse.json({ ok: true, entries });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = rateLimit(`mirror:${user.id}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  }

  let body: { body?: unknown; prompt?: unknown; moodId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const result = await createMirrorEntry(user.id, {
    body: typeof body.body === "string" ? body.body : "",
    prompt: typeof body.prompt === "string" ? body.prompt : undefined,
    moodId: typeof body.moodId === "string" ? body.moodId : undefined,
  });

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({
    ok: true,
    entry: {
      id: result.entry.id,
      body: result.entry.body,
      prompt: result.entry.prompt,
      moodId: result.entry.moodId,
      createdAt: result.entry.createdAt,
    },
  });
}
