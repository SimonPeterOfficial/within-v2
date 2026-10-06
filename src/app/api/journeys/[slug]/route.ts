/**
 * GET   /api/journeys/[slug] — viewer-aware read
 * PATCH /api/journeys/[slug] — owner-only edit
 * DELETE /api/journeys/[slug] — owner-only delete
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { deleteJourney, getJourneyForViewer, updateJourney } from "@/lib/journeys";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const user = await requireUser().catch(() => null);
  const { slug } = await params;
  const journey = await getJourneyForViewer(slug, user?.id ?? null);
  if (!journey) return NextResponse.json({ ok: false, error: "Journey not found." }, { status: 404 });
  return NextResponse.json({ ok: true, journey });
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

  const result = await updateJourney(user.id, slug, {
    title: typeof body.title === "string" ? body.title : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    visibility: typeof body.visibility === "string" ? (body.visibility as never) : undefined,
  });
  if (!result.ok) return NextResponse.json(result, { status: result.error === "Journey not found." ? 404 : 422 });
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const { slug } = await params;
  const result = await deleteJourney(user.id, slug);
  if (!result.ok) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
