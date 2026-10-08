/**
 * POST /api/lyra/ask
 *
 * A deliberate, honest intelligence surface: the caller asks a factual
 * question about their own WithIn state and gets a factual answer back.
 * Only questions the deterministic answer layer actually supports are
 * answered; everything else gets an honest boundary. The authenticated
 * user is resolved server-side — never from the client.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { answerLyraQuestion } from "@/lib/lyra/answer";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = rateLimit(`lyra:ask:${user.id}`, 30, 60_000);
  if (!limited.ok) return NextResponse.json({ ok: false, error: "Too many questions — pause a moment." }, { status: 429 });

  let body: { question?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const question = (body.question ?? "").slice(0, 200);
  if (!question.trim()) {
    return NextResponse.json({ ok: false, error: "Ask a question." }, { status: 400 });
  }

  const answer = await answerLyraQuestion(question, user.id);
  return NextResponse.json({ ok: true, ...answer });
}
