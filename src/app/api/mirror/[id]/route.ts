/**
 * /api/mirror/[id] — a single private reflection.
 *   PATCH  — edit the caller's own entry: { body?, prompt?, moodId? }
 *   DELETE — remove the caller's own entry
 *
 * Ownership is enforced in the service queries; a foreign id is a 404,
 * never a leak. Responses are marked no-store for the same reason.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { deleteMirrorEntry, updateMirrorEntry } from "@/lib/mirror";

type Params = { params: Promise<{ id: string }> };

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return privateJson({ ok: false, error: "Sign in required." }, 401);

  const { id } = await params;
  let body: { body?: unknown; prompt?: unknown; moodId?: unknown };
  try {
    body = await request.json();
  } catch {
    return privateJson({ ok: false, error: "Invalid request." }, 400);
  }

  const result = await updateMirrorEntry(user.id, id, {
    ...(typeof body.body === "string" ? { body: body.body } : {}),
    ...(typeof body.prompt === "string" || body.prompt === null ? { prompt: body.prompt } : {}),
    ...(typeof body.moodId === "string" || body.moodId === null ? { moodId: body.moodId } : {}),
  });

  if (!result.ok) return privateJson({ ok: false, error: result.error }, result.status);

  return privateJson({
    ok: true,
    entry: {
      id: result.entry.id,
      body: result.entry.body,
      prompt: result.entry.prompt,
      moodId: result.entry.moodId,
      createdAt: result.entry.createdAt,
      updatedAt: result.entry.updatedAt,
    },
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return privateJson({ ok: false, error: "Sign in required." }, 401);

  const { id } = await params;
  const result = await deleteMirrorEntry(user.id, id);
  if (!result.ok) return privateJson({ ok: false, error: result.error }, 404);
  return privateJson({ ok: true });
}
