/**
 * GET /api/studio — the caller's creator workspace payload.
 * Owner-scoped: every number and row is derived from the session user id,
 * never from anything the browser sends.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getStudioOverview, listCreatorContent, processDuePublications } from "@/lib/studio";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  // Scheduled publications that have come due go live here — the honest
  // server-side scheduler for the current infrastructure.
  await processDuePublications().catch(() => undefined);

  const [overview, items] = await Promise.all([
    getStudioOverview(user.id),
    listCreatorContent(user.id),
  ]);

  return NextResponse.json({ ok: true, overview, items });
}
