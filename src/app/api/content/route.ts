/**
 * /api/content
 *   POST — create a draft (authenticated; publishing stays gated)
 *   GET  — list published content for discovery (public, paginated)
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { createDraft, listPublishedContent, type ContentInput } from "@/lib/content-service";

const CONTENT_TYPES = ["film", "video", "book", "story", "post", "audio", "image", "other"];

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const input: ContentInput = {
    title: typeof body.title === "string" ? body.title : "",
    type: (typeof body.type === "string" && CONTENT_TYPES.includes(body.type) ? body.type : "other") as ContentInput["type"],
    description: typeof body.description === "string" ? body.description : undefined,
    category: typeof body.category === "string" ? body.category : undefined,
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    attribution: typeof body.attribution === "string" ? body.attribution : undefined,
    coverGradient: typeof body.coverGradient === "string" ? body.coverGradient : undefined,
    coverEmoji: typeof body.coverEmoji === "string" ? body.coverEmoji : undefined,
    mediaRef: typeof body.mediaRef === "string" ? body.mediaRef : undefined,
  };

  const result = await createDraft(user.id, input);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, content: result.content }, { status: 201 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  const query = url.searchParams.get("q");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 48), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

  const entries = await listPublishedContent({
    type: type && CONTENT_TYPES.includes(type) ? (type as ContentInput["type"]) : undefined,
    category: category ?? undefined,
    query: query ?? undefined,
    limit: Number.isFinite(limit) ? limit : 48,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  return NextResponse.json({ ok: true, entries });
}