/**
 * /api/communities — the communities API.
 *   GET  ?q=      — public communities (searchable) + the caller's memberships
 *   POST { name, description?, emoji?, visibility? } — create a community
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import { createCommunity, listCommunities, listMyCommunities } from "@/lib/communities";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? undefined;
  const communities = await listCommunities(query);

  const user = await requireUser();
  const mine = user ? await listMyCommunities(user.id) : [];

  return NextResponse.json({ ok: true, communities, mine });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  // Community creation is abuse-sensitive: 3 per hour.
  const limited = rateLimit(`community-create:${user.id}`, 3, 3_600_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Take a breath — try again later." }, { status: 429 });
  }

  let body: { name?: unknown; description?: unknown; emoji?: unknown; visibility?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const visibility = body.visibility === "private" ? "private" : "public";
  const result = await createCommunity(user.id, {
    name: typeof body.name === "string" ? body.name : "",
    description: typeof body.description === "string" ? body.description : undefined,
    emoji: typeof body.emoji === "string" ? body.emoji : undefined,
    visibility,
  });

  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
