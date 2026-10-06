/**
 * POST /api/journeys/[slug]/publish — owner publishes their Journey
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { publishJourney } from "@/lib/journeys";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const { slug } = await params;
  const result = await publishJourney(user.id, slug);
  if (!result.ok) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
