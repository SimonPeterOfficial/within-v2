/**
 * POST /api/content/[id]/view
 *
 * Records a content view (counted; anonymous views are never attributed).
 * Fire-and-forget from the client — failure never blocks the page.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { recordContentView } from "@/lib/content-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await requireUser();
  await recordContentView(id, user?.id ?? null);
  return NextResponse.json({ ok: true });
}