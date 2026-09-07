/**
 * /api/content/[id]
 *   GET   — a single content record visible to the caller
 *           (published → everyone; own drafts / moderator → owner/moderators)
 *   PATCH — edit the caller's own draft
 *   DELETE — remove the caller's own content (drafts deleted, published archived)
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getContentForViewer, updateDraft, type ContentInput } from "@/lib/content-service";
import { deleteCreatorContent } from "@/lib/studio";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await requireUser();

  const item = await getContentForViewer(id, user?.id);
  if (!item) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    content: {
      id: item.row.id,
      title: item.row.title,
      type: item.row.type,
      description: item.row.description,
      category: item.row.category,
      tags: item.row.tags,
      status: item.row.status,
      publishedAt: item.row.publishedAt,
      createdAt: item.row.createdAt,
      creator: { name: item.creatorName, username: item.username, id: item.row.creatorId },
    },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  let body: Partial<ContentInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const result = await updateDraft(user.id, id, body);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, content: result.content });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const result = await deleteCreatorContent(user.id, id);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, mode: result.mode });
}