/**
 * /api/communities/[slug]/membership — join/leave a community.
 *   POST — join (public communities; private need the owner)
 *   DELETE — leave
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, communities } from "@/lib/db";
import { requireUser } from "@/lib/auth/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import { joinCommunity, leaveCommunity } from "@/lib/communities";

type Params = { params: Promise<{ slug: string }> };

async function communityIdFromSlug(slug: string): Promise<string | null> {
  const rows = await db.select({ id: communities.id }).from(communities).where(eq(communities.slug, slug)).limit(1);
  return rows[0]?.id ?? null;
}

export async function POST(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = rateLimit(`community-join:${user.id}`, 15, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  }

  const { slug } = await params;
  const communityId = await communityIdFromSlug(slug);
  if (!communityId) return NextResponse.json({ ok: false, error: "Community not found." }, { status: 404 });

  const result = await joinCommunity(user.id, communityId);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { slug } = await params;
  const communityId = await communityIdFromSlug(slug);
  if (!communityId) return NextResponse.json({ ok: false, error: "Community not found." }, { status: 404 });

  const result = await leaveCommunity(user.id, communityId);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ ok: true });
}
