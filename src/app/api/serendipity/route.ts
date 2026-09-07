/**
 * GET /api/serendipity — at most two honest discoveries for the caller.
 * Empty array when nothing qualifies — no fabricated relevance.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { findSerendipity } from "@/lib/serendipity";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const items = await findSerendipity(user.id);
  return NextResponse.json({ ok: true, items });
}
