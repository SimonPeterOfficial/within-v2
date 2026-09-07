/**
 * POST /api/moderation/content/[id]
 *   body: { action: "approve" | "reject" | "hide", note?: string }
 *
 * Moderator+ only (checked server-side). Every action is audited and the
 * creator is notified. An ordinary user calling this endpoint gets 403.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { moderateContent } from "@/lib/content-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;

  let body: { action?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const action = body.action;
  if (action !== "approve" && action !== "reject" && action !== "hide") {
    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  }

  const result = await moderateContent(
    user.id,
    id,
    action,
    typeof body.note === "string" ? body.note : undefined,
  );

  if (!result.ok) {
    const status = result.error === "Moderator access required." ? 403 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, content: result.content });
}