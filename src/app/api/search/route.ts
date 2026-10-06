/**
 * GET /api/search?q=&type=&category=&limit=&offset=
 *
 * Read-only search over REAL published, public content. Bounded by a hard
 * limit; never exposes drafts or private rows (listPublishedContent only
 * returns status = 'published'). Private content cannot leak through here.
 */

import { NextResponse } from "next/server";
import { listPublishedContent } from "@/lib/content-service";
import type { ContentType } from "@/lib/db";

const CONTENT_TYPES: ContentType[] = ["film", "video", "book", "story", "post", "audio", "image", "other"];
const MAX_LIMIT = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 120).trim();
  const typeParam = searchParams.get("type");
  const category = searchParams.get("category")?.slice(0, 80) ?? undefined;
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), MAX_LIMIT);
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

  const type = typeParam && (CONTENT_TYPES as string[]).includes(typeParam) ? (typeParam as ContentType) : undefined;

  try {
    const results = await listPublishedContent({ query: q || undefined, type, category, limit, offset });
    // count = returned window; we deliberately don't claim a filtered total.
    return NextResponse.json({ ok: true, query: q, count: results.length, limit, offset, results });
  } catch {
    return NextResponse.json({ ok: false, error: "Search is unavailable right now." }, { status: 503 });
  }
}
