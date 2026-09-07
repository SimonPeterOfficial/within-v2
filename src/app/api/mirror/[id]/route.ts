/**
 * /api/mirror/[id] — a single private reflection.
 *   PATCH  — edit the caller's own entry: { body?, moodId? }
 *   DELETE — remove the caller's own entry
 *
 * Ownership is enforced in the service queries; a foreign id is a 404,
 * never a leak.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { deleteMirrorEntry, updateMirrorEntry } from "@/lib/mirror";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  let body: { body?: unknown; moodId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const result = await updateMirrorEntry(user.id, id, {
    ...(typeof body.body === "string" ? { body: body.body } : {}),
    ...(typeof body.moodId === "string" ? { moodId: body.moodId } : {}),
  });

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const result = await deleteMirrorEntry(user.id, id);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  return NextResponse.json({ ok: true });
}
