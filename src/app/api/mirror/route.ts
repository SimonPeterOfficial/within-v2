/**
 * /api/mirror — the private reflection API.
 *   GET  — the caller's entries, newest first
 *   POST — create an entry: { body, prompt?, moodId? }
 *
 * Every path requires a session; every query is owner-scoped. There is no
 * public or cross-user read anywhere in Mirror. Responses are marked no-store
 * so private text is never eligible for a shared cache.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { createMirrorEntry, listMirrorEntries } from "@/lib/mirror";
import { rateLimit } from "@/lib/auth/rate-limit";

/** Explicitly keep personalized reflection data out of any shared cache. */
function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const user = await requireUser();
  if (!user) return privateJson({ ok: false, error: "Sign in required." }, 401);

  const entries = await listMirrorEntries(user.id);
  return privateJson({ ok: true, entries });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return privateJson({ ok: false, error: "Sign in required." }, 401);

  const limited = await rateLimit(`mirror:${user.id}`, 30, 60_000);
  if (!limited.ok) {
    return privateJson({ ok: false, error: "Slow down a little." }, 429);
  }

  let body: { body?: unknown; prompt?: unknown; moodId?: unknown };
  try {
    body = await request.json();
  } catch {
    return privateJson({ ok: false, error: "Invalid request." }, 400);
  }

  const result = await createMirrorEntry(user.id, {
    body: typeof body.body === "string" ? body.body : "",
    prompt: typeof body.prompt === "string" || body.prompt === null ? body.prompt : undefined,
    moodId: typeof body.moodId === "string" || body.moodId === null ? body.moodId : undefined,
  });

  if (!result.ok) return privateJson({ ok: false, error: result.error }, result.status);

  return privateJson({
    ok: true,
    entry: {
      id: result.entry.id,
      body: result.entry.body,
      prompt: result.entry.prompt,
      moodId: result.entry.moodId,
      createdAt: result.entry.createdAt,
      updatedAt: result.entry.updatedAt,
    },
  });
}
