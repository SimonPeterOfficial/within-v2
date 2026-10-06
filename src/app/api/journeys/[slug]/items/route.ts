/**
 * POST   /api/journeys/[slug]/items — append a real item to the path
 * DELETE /api/journeys/[slug]/items?itemId=… — remove one, compacts order
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { appendJourneyItem, removeJourneyItem } from "@/lib/journeys";
import type { JourneyItemSource } from "@/lib/db";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const result = await appendJourneyItem(user.id, slug, {
    sourceType: body.sourceType as JourneyItemSource,
    sourceId: typeof body.sourceId === "string" ? body.sourceId : "",
    note: typeof body.note === "string" ? body.note : undefined,
  });
  if (!result.ok) return NextResponse.json(result, { status: result.error === "Journey not found." ? 404 : 422 });
  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const { slug } = await params;
  const itemId = new URL(request.url).searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ ok: false, error: "itemId is required." }, { status: 400 });

  const result = await removeJourneyItem(user.id, slug, itemId);
  if (!result.ok) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
