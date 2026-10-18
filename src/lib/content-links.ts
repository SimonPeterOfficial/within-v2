/**
 * Content links — idea relationships between works.
 *
 * A user can link one content item to another as "responds to",
 * "inspired by", "contradicts", or "references". Links are directional:
 * source → target. They enable knowledge maps, idea connection
 * discovery, and collaborative understanding without duplicating
 * underlying content objects.
 *
 * Authorization:
 *   - Creating a link requires the caller to be able to view BOTH the
 *     source and target content (public, owned, or moderator-accessible).
 *   - Reading links requires the caller to be able to view both ends.
 *   - Deleting a link is restricted to its creator.
 *   - Links between private content are never exposed to callers who
 *     cannot see both ends.
 */

import "server-only";
import { and, desc, eq, or } from "drizzle-orm";
import { db, contentLinks, type ContentLinkType } from "@/lib/db";
import { getContentForViewer } from "@/lib/content-service";

const MAX_CONTEXT_LENGTH = 1000;

export type { ContentLinkType };
export type ContentLinkView = {
  id: string;
  sourceContentId: string;
  targetContentId: string;
  userId: string;
  linkType: ContentLinkType;
  context: string | null;
  createdAt: Date;
};

/** Creates a link between two content items the caller may view. */
export async function createContentLink(
  userId: string,
  input: {
    sourceContentId: string;
    targetContentId: string;
    linkType: ContentLinkType;
    context?: string;
  },
): Promise<
  | { ok: true; link: ContentLinkView }
  | { ok: false; error: string }
> {
  if (input.sourceContentId === input.targetContentId) {
    return { ok: false, error: "Cannot link a content item to itself." };
  }

  const context = input.context?.trim();
  if (context && context.length > MAX_CONTEXT_LENGTH) {
    return { ok: false, error: `Link context holds up to ${MAX_CONTEXT_LENGTH} characters.` };
  }

  // Both ends must be viewable by the caller.
  const [sourceView, targetView] = await Promise.all([
    getContentForViewer(input.sourceContentId, userId),
    getContentForViewer(input.targetContentId, userId),
  ]);
  if (!sourceView) {
    return { ok: false, error: "Source content not found or not viewable." };
  }
  if (!targetView) {
    return { ok: false, error: "Target content not found or not viewable." };
  }

  const created = await db
    .insert(contentLinks)
    .values({
      sourceContentId: input.sourceContentId,
      targetContentId: input.targetContentId,
      userId,
      linkType: input.linkType,
      context: context || null,
    })
    .returning();

  return {
    ok: true,
    link: toView(created[0]),
  };
}

/** Links involving a content item (as source or target) that the caller
 *  may view. Both ends of every returned link are viewable by the caller. */
export async function getContentLinksForContent(
  contentId: string,
  viewerId?: string | null,
): Promise<ContentLinkView[]> {
  const rows = await db
    .select()
    .from(contentLinks)
    .where(
      or(
        eq(contentLinks.sourceContentId, contentId),
        eq(contentLinks.targetContentId, contentId),
      ),
    )
    .orderBy(desc(contentLinks.createdAt));

  const links: ContentLinkView[] = [];
  for (const row of rows) {
    const sourceView = await getContentForViewer(row.sourceContentId, viewerId);
    const targetView = await getContentForViewer(row.targetContentId, viewerId);
    if (!sourceView || !targetView) continue;
    links.push(toView(row));
  }
  return links;
}

/** Deletes a link created by the caller. */
export async function deleteContentLink(
  userId: string,
  linkId: string,
): Promise<{ ok: boolean; error?: string }> {
  const deleted = await db
    .delete(contentLinks)
    .where(and(eq(contentLinks.id, linkId), eq(contentLinks.userId, userId)))
    .returning({ id: contentLinks.id });
  if (deleted.length === 0) {
    return { ok: false, error: "Link not found or not owned by you." };
  }
  return { ok: true };
}

/** Links created by a user. */
export async function getContentLinksByUser(
  userId: string,
  viewerId?: string | null,
): Promise<ContentLinkView[]> {
  const rows = await db
    .select()
    .from(contentLinks)
    .where(eq(contentLinks.userId, userId))
    .orderBy(desc(contentLinks.createdAt));

  const links: ContentLinkView[] = [];
  for (const row of rows) {
    const sourceView = await getContentForViewer(row.sourceContentId, viewerId);
    const targetView = await getContentForViewer(row.targetContentId, viewerId);
    if (!sourceView || !targetView) continue;
    links.push(toView(row));
  }
  return links;
}

function toView(row: typeof contentLinks.$inferSelect): ContentLinkView {
  return {
    id: row.id,
    sourceContentId: row.sourceContentId,
    targetContentId: row.targetContentId,
    userId: row.userId,
    linkType: row.linkType as ContentLinkType,
    context: row.context,
    createdAt: row.createdAt,
  };
}
