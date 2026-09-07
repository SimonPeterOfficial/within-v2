/**
 * GET /api/away — the caller's real "while you were away" summary.
 * Owner-scoped; empty (hasSummary: false) when nothing meaningful happened.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { buildAwaySummary } from "@/lib/away";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const summary = await buildAwaySummary(user.id);
  return NextResponse.json({ ok: true, summary });
}
