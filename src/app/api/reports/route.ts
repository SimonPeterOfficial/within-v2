/**
 * POST /api/reports
 *   body: { targetType, targetId, reason, details? }
 *
 * Files a real, persistent moderation report. The target must exist, the
 * reason is validated, and repeat abuse is throttled per user.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { fileReport } from "@/lib/interactions";
import { rateLimit, clientKeyFrom } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = rateLimit(`report:${user.id}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Too many reports — slow down." }, { status: 429 });
  }

  let body: { targetType?: unknown; targetId?: unknown; reason?: unknown; details?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const targetType = typeof body.targetType === "string" ? body.targetType : "";
  const targetId = typeof body.targetId === "string" ? body.targetId : "";
  const reason = typeof body.reason === "string" ? body.reason : "";
  const details = typeof body.details === "string" ? body.details : undefined;

  const result = await fileReport(user.id, { targetType, targetId, reason, details });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true }, { status: 201 });
}