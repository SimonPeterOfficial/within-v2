/**
 * /api/library
 *   POST — toggle an item on a shelf: { contentId, shelf: "saved" | "liked" }
 *   GET  — the caller's shelf: ?shelf=saved
 *
 * Persisted in Postgres — saved items survive sessions and devices.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { listSaves, toggleSave } from "@/lib/interactions";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = rateLimit(`library:${user.id}`, 120, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  }

  let body: { contentId?: unknown; shelf?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const contentId = typeof body.contentId === "string" ? body.contentId : "";
  const shelf = body.shelf === "liked" ? "liked" : "saved";
  if (!contentId) {
    return NextResponse.json({ ok: false, error: "A content id is required." }, { status: 400 });
  }

  const result = await toggleSave(user.id, contentId, shelf);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, saved: result.saved, shelf });
}

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const shelf = new URL(request.url).searchParams.get("shelf") === "liked" ? "liked" : "saved";
  const entries = await listSaves(user.id, shelf);

  return NextResponse.json({ ok: true, entries });
}