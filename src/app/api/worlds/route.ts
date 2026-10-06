/**
 * GET  /api/worlds         — public list of published, public Worlds
 * POST /api/worlds         — create a draft World (auth required)
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { createWorld, listPublicWorlds } from "@/lib/worlds";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function GET(request: Request) {
  const limit = Number(new URL(request.url).searchParams.get("limit")) || 24;
  const worlds = await listPublicWorlds(limit);
  return NextResponse.json({ ok: true, worlds });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = rateLimit(`worlds:create:${user.id}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down — try again shortly." }, { status: 429 });
  }

  let body: { title?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const result = await createWorld(user.id, body);
  if (!result.ok) return NextResponse.json(result, { status: 422 });
  return NextResponse.json(result, { status: 201 });
}
