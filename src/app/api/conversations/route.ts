/**
 * /api/conversations — the messaging list API.
 *   GET  — the caller's conversations with unread counts
 *   POST { userId } — open (or find) the DM with a person
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import { listConversations, openConversationWith } from "@/lib/messaging";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const conversations = await listConversations(user.id);
  return NextResponse.json({ ok: true, conversations });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = rateLimit(`conversations:${user.id}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  }

  let body: { userId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const otherId = typeof body.userId === "string" ? body.userId : null;
  if (!otherId) return NextResponse.json({ ok: false, error: "Missing person." }, { status: 400 });

  const result = await openConversationWith(user.id, otherId);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
