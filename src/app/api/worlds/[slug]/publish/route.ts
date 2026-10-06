/**
 * POST   /api/worlds/[slug]/publish — owner publishes their draft
 * DELETE /api/worlds/[slug]/publish — owner unpublishes back to draft
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { publishWorld, unpublishWorld } from "@/lib/worlds";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const { slug } = await params;
  const result = await publishWorld(user.id, slug);
  if (!result.ok) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const { slug } = await params;
  const result = await unpublishWorld(user.id, slug);
  if (!result.ok) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
