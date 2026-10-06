/**
 * GET   /api/worlds/[slug] — viewer-aware read (private only to owner)
 * PATCH /api/worlds/[slug] — owner-only edit (title/description/visibility/cover)
 * DELETE /api/worlds/[slug] — owner-only delete
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { deleteWorld, getWorldForViewer, updateWorld } from "@/lib/worlds";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const user = await requireUser().catch(() => null);
  const { slug } = await params;
  const world = await getWorldForViewer(slug, user?.id ?? null);
  if (!world) return NextResponse.json({ ok: false, error: "World not found." }, { status: 404 });
  return NextResponse.json({ ok: true, world });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const result = await updateWorld(user.id, slug, {
    title: typeof body.title === "string" ? body.title : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    coverEmoji: typeof body.coverEmoji === "string" ? body.coverEmoji : undefined,
    coverGradient: typeof body.coverGradient === "string" ? body.coverGradient : undefined,
    visibility: typeof body.visibility === "string" ? (body.visibility as never) : undefined,
  });
  if (!result.ok) return NextResponse.json(result, { status: result.error === "World not found." ? 404 : 422 });
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const { slug } = await params;
  const result = await deleteWorld(user.id, slug);
  if (!result.ok) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
