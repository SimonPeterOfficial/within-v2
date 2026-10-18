/**
 * /api/content-links
 *   POST — create a link between two viewable content items
 *     body: { sourceContentId, targetContentId, linkType, context? }
 *   GET  — list links involving a content item or created by a user
 *     ?contentId= or ?userId=
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import {
  createContentLink,
  getContentLinksByUser,
  getContentLinksForContent,
  type ContentLinkType,
} from "@/lib/content-links";
import { rateLimit } from "@/lib/auth/rate-limit";

const LINK_TYPES: ContentLinkType[] = ["responds-to", "inspired-by", "contradicts", "references"];

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const limited = await rateLimit(`content-links:${user.id}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  }

  let body: {
    sourceContentId?: unknown;
    targetContentId?: unknown;
    linkType?: unknown;
    context?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const sourceContentId =
    typeof body.sourceContentId === "string" ? body.sourceContentId : "";
  const targetContentId =
    typeof body.targetContentId === "string" ? body.targetContentId : "";
  const linkTypeRaw =
    typeof body.linkType === "string" ? body.linkType : undefined;
  const linkType =
    linkTypeRaw && LINK_TYPES.includes(linkTypeRaw as ContentLinkType)
      ? (linkTypeRaw as ContentLinkType)
      : undefined;
  const context =
    typeof body.context === "string" ? body.context : undefined;

  if (!sourceContentId || !targetContentId) {
    return NextResponse.json(
      { ok: false, error: "Both source and target content ids are required." },
      { status: 400 },
    );
  }
  if (!linkType) {
    return NextResponse.json(
      { ok: false, error: 'linkType must be one of: responds-to, inspired-by, contradicts, references.' },
      { status: 400 },
    );
  }

  const result = await createContentLink(user.id, {
    sourceContentId,
    targetContentId,
    linkType,
    context,
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, link: result.link }, { status: 201 });
}

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const url = new URL(request.url);
  const contentId = url.searchParams.get("contentId") ?? undefined;
  const userId = url.searchParams.get("userId") ?? undefined;

  if (contentId) {
    const links = await getContentLinksForContent(contentId, user.id);
    return NextResponse.json({ ok: true, links });
  }

  if (userId) {
    // A user may list their own links only.
    if (userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: "You may only list your own links." },
        { status: 403 },
      );
    }
    const links = await getContentLinksByUser(userId, user.id);
    return NextResponse.json({ ok: true, links });
  }

  return NextResponse.json(
    { ok: false, error: "Provide ?contentId= or ?userId=." },
    { status: 400 },
  );
}
