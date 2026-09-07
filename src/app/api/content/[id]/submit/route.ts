/**
 * POST /api/content/[id]/submit
 *
 * Moves the creator's own draft into the moderation queue (draft → submitted).
 * The creator cannot skip review — only moderators can approve.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { submitContent } from "@/lib/content-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const result = await submitContent(user.id, id);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, content: result.content });
}