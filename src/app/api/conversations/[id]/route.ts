/**
 * /api/conversations/[id] — one conversation.
 *   GET ?since=ISO — messages (optionally deltas after a cursor for polling)
 *   POST { body }  — send a message
 *   PATCH          — mark read
 *
 * Membership is enforced in the service; a foreign conversation id is 404.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import {
  getConversationPartner,
  listMessages,
  listMessagesSince,
  markConversationRead,
  sendMessage,
} from "@/lib/messaging";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const sinceParam = new URL(request.url).searchParams.get("since");

  if (sinceParam) {
    const since = new Date(sinceParam);
    if (Number.isNaN(since.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid cursor." }, { status: 400 });
    }
    const messages = await listMessagesSince(id, user.id, since);
    if (messages === null) return NextResponse.json({ ok: false, error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ ok: true, messages });
  }

  const [messages, partner] = await Promise.all([
    listMessages(id, user.id),
    getConversationPartner(id, user.id),
  ]);
  if (messages === null) return NextResponse.json({ ok: false, error: "Conversation not found." }, { status: 404 });
  return NextResponse.json({ ok: true, messages, partner });
}

export async function POST(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  // Messages are the most abuse-sensitive surface: 30 per minute.
  const limited = rateLimit(`messages:${user.id}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  }

  const { id } = await params;
  let body: { body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const result = await sendMessage(id, user.id, typeof body.body === "string" ? body.body : "");
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  await markConversationRead(id, user.id);
  return NextResponse.json({ ok: true });
}
