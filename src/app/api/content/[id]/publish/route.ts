/**
 * POST /api/content/[id]/publish
 *
 * Publishes the creator's own APPROVED content (approved → published).
 * Publishing without prior approval is impossible — the moderation step
 * is enforced server-side.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { publishContent } from "@/lib/content-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const result = await publishContent(user.id, id);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, content: result.content });
}