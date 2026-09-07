/**
 * Content engine — the server-side lifecycle and discovery layer.
 *
 * Lifecycle: draft → submitted → reviewing → approved → published,
 * with hidden/archived as moderation outcomes. A creator can never publish
 * without passing through review (unless an admin-configured rule later
 * grants verified creators auto-approval — that decision stays in the
 * moderation boundary, not in the UI).
 *
 * Every privileged transition (approve/reject/hide) writes an audit log row
 * and notifies the creator. Publishing notifies the creator's followers.
 */

import "server-only";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import {
  db,
  content,
  contentViews,
  follows,
  profiles,
  users,
  type Content,
  type ContentStatus,
  type ContentType,
  type NewContent,
} from "@/lib/db";
import { can, hasRole } from "@/lib/auth/authorization";
import { createNotification, logAdminAction } from "@/lib/auth/server";
import { validateDescription, validateTags, validateTitle } from "@/lib/auth/validation";
import type { UniverseEntry } from "@/lib/search";

/* ── Input shape — one validated contract for create/update ─────────── */

export type ContentInput = {
  title: string;
  type: ContentType;
  description?: string;
  category?: string;
  tags?: string[];
  attribution?: string;
  coverGradient?: string;
  coverEmoji?: string;
  mediaRef?: string;
};

export type ContentResult = { ok: true; content: Content } | { ok: false; error: string };

function validateInput(input: ContentInput): string | null {
  const titleError = validateTitle(input.title);
  if (titleError) return titleError;
  if (!input.type) return "Content type is required.";
  if (input.description !== undefined) {
    const descriptionError = validateDescription(input.description);
    if (descriptionError) return descriptionError;
  }
  return null;
}

/** Any authenticated user may start a draft — publishing is the gated step. */
export async function createDraft(userId: string, input: ContentInput): Promise<ContentResult> {
  const error = validateInput(input);
  if (error) return { ok: false, error };

  const tags = validateTags(input.tags);
  if (tags === null) return { ok: false, error: "Too many tags (max 12)." };

  const created = await db
    .insert(content)
    .values({
      creatorId: userId,
      type: input.type,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category?.trim() || null,
      tags: tags.length > 0 ? tags : null,
      attribution: input.attribution?.trim() || null,
      coverGradient: input.coverGradient?.trim() || null,
      coverEmoji: input.coverEmoji?.trim() || null,
      mediaRef: input.mediaRef?.trim() || null,
      status: "draft",
    })
    .returning();

  return { ok: true, content: created[0] };
}

/** Edits the creator's own draft (nothing else is editable). */
export async function updateDraft(userId: string, contentId: string, patch: Partial<ContentInput>): Promise<ContentResult> {
  const existing = await db.select().from(content).where(eq(content.id, contentId)).limit(1);
  const row = existing[0];
  if (!row) return { ok: false, error: "Content not found." };
  if (row.creatorId !== userId) return { ok: false, error: "You can only edit your own content." };
  if (row.status !== "draft") return { ok: false, error: "Only drafts can be edited." };

  const input = { ...row, ...patch } as ContentInput;
  const error = validateInput(input);
  if (error) return { ok: false, error };

  const tags = patch.tags !== undefined ? validateTags(patch.tags) : undefined;
  if (tags === null) return { ok: false, error: "Too many tags (max 12)." };

  const updated = await db
    .update(content)
    .set({
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.type !== undefined ? { type: patch.type } : {}),
      ...(patch.description !== undefined ? { description: patch.description?.trim() || null } : {}),
      ...(patch.category !== undefined ? { category: patch.category?.trim() || null } : {}),
      ...(tags !== undefined ? { tags: tags.length > 0 ? tags : null } : {}),
      ...(patch.attribution !== undefined ? { attribution: patch.attribution?.trim() || null } : {}),
      ...(patch.coverGradient !== undefined ? { coverGradient: patch.coverGradient?.trim() || null } : {}),
      ...(patch.coverEmoji !== undefined ? { coverEmoji: patch.coverEmoji?.trim() || null } : {}),
      ...(patch.mediaRef !== undefined ? { mediaRef: patch.mediaRef?.trim() || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(content.id, contentId))
    .returning();

  return { ok: true, content: updated[0] };
}

/** Submits a draft for moderation review. */
export async function submitContent(userId: string, contentId: string): Promise<ContentResult> {
  const existing = await db.select().from(content).where(eq(content.id, contentId)).limit(1);
  const row = existing[0];
  if (!row) return { ok: false, error: "Content not found." };
  if (row.creatorId !== userId) return { ok: false, error: "You can only submit your own content." };
  if (row.status !== "draft") return { ok: false, error: "Only drafts can be submitted." };

  const updated = await db
    .update(content)
    .set({ status: "submitted", updatedAt: new Date() })
    .where(eq(content.id, contentId))
    .returning();

  return { ok: true, content: updated[0] };
}

/** Fetches one content row by id (for ownership checks). */
export async function getContentRow(contentId: string): Promise<Content | null> {
  const rows = await db.select().from(content).where(eq(content.id, contentId)).limit(1);
  return rows[0] ?? null;
}

/* ── Moderation — moderator+ only, audited, creator notified ─────────── */

type ModerationAction = "approve" | "reject" | "hide";

export async function moderateContent(
  moderatorId: string,
  contentId: string,
  action: ModerationAction,
  note?: string,
): Promise<{ ok: true; content: Content } | { ok: false; error: string }> {
  const moderator = await db.select().from(users).where(eq(users.id, moderatorId)).limit(1);
  const moderatorRow = moderator[0];
  if (!moderatorRow || !hasRole(moderatorRow, "moderator")) {
    return { ok: false, error: "Moderator access required." };
  }

  const row = await getContentRow(contentId);
  if (!row) return { ok: false, error: "Content not found." };

  const nextStatus: Record<ModerationAction, ContentStatus> = {
    approve: "approved",
    reject: "draft", // sent back — the creator can revise and resubmit
    hide: "hidden",
  };
  const allowedFrom: Record<ModerationAction, ContentStatus[]> = {
    approve: ["submitted", "reviewing", "approved"],
    reject: ["submitted", "reviewing"],
    hide: ["submitted", "reviewing", "approved", "published"],
  };
  if (!allowedFrom[action].includes(row.status)) {
    return { ok: false, error: `Cannot ${action} content in ${row.status} state.` };
  }

  const updated = await db
    .update(content)
    .set({
      status: nextStatus[action],
      moderationNote: note?.trim() || null,
      moderatedById: moderatorId,
      moderatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(content.id, contentId))
    .returning();

  const result = updated[0];

  // Audit trail — who did what, when, to what.
  const auditAction =
    action === "approve" ? "CONTENT_APPROVED" : action === "reject" ? "CONTENT_REJECTED" : "CONTENT_HIDDEN";
  await logAdminAction({
    actorId: moderatorId,
    action: auditAction,
    targetType: "content",
    targetId: result.id,
    details: { title: result.title, note: note?.trim() || undefined },
  });

  // The creator is told — a real moderation_result notification.
  const outcome =
    action === "approve" ? "approved" : action === "reject" ? "sent back for changes" : "hidden";
  await createNotification({
    userId: row.creatorId,
    type: "moderation_result",
    actorId: moderatorId,
    contentId: result.id,
    message: `Your content "${result.title}" was ${outcome}.`,
  });

  return { ok: true, content: result };
}

/* ── Publishing — creator publishes their approved work ─────────────── */

export async function publishContent(creatorId: string, contentId: string): Promise<{ ok: true; content: Content } | { ok: false; error: string }> {
  const row = await getContentRow(contentId);
  if (!row) return { ok: false, error: "Content not found." };
  if (row.creatorId !== creatorId) return { ok: false, error: "You can only publish your own content." };
  if (row.status !== "approved") return { ok: false, error: "Only approved content can be published." };

  const updated = await db
    .update(content)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(content.id, contentId))
    .returning();

  const result = updated[0];

  // Followers hear about it — capped so one creator can't flood the queue.
  const followers = await db
    .select({ id: follows.followerId })
    .from(follows)
    .where(eq(follows.followeeId, creatorId))
    .limit(200);

  for (const follower of followers) {
    await createNotification({
      userId: follower.id,
      type: "creator_published",
      actorId: creatorId,
      contentId: result.id,
      message: `${result.title} is live.`,
    });
  }

  return { ok: true, content: result };
}

/* ── Discovery — published, public content only ─────────────────────── */

export type DiscoveryFilters = {
  type?: ContentType;
  category?: string;
  query?: string;
  limit?: number;
  offset?: number;
};

const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  film: "Film",
  video: "Video",
  book: "Book",
  story: "Story",
  post: "Post",
  audio: "Audio",
  image: "Image",
  other: "Other",
};

/** Maps a published content row + creator profile to the shared card shape. */
export function toUniverseEntry(row: Content, creatorName: string, username: string): UniverseEntry {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? "Uncategorized",
    by: creatorName,
    description: row.description ?? "",
    gradient: row.coverGradient ?? "from-purple-600 via-indigo-600 to-blue-600",
    emoji: row.coverEmoji ?? "✦",
    meta: `${CONTENT_TYPE_LABEL[row.type]}${row.publishedAt ? ` · ${new Date(row.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}`,
    href: `/content/${row.id}`,
    tags: row.tags ?? [],
    statusLabel: "New",
    moods: [],
  };
}

/**
 * Published content, newest first, with creator attribution.
 * `toUniverseEntry` keeps the exact shape the discover UI already renders.
 */
export async function listPublishedContent(filters: DiscoveryFilters = {}): Promise<UniverseEntry[]> {
  const { type, category, query, limit = 48, offset = 0 } = filters;

  const conditions = [eq(content.status, "published")];
  if (type) conditions.push(eq(content.type, type));
  if (category) conditions.push(eq(content.category, category));
  if (query) {
    const needle = `%${query.toLowerCase()}%`;
    const descriptionMatch = content.description ? ilike(content.description, needle) : undefined;
    const categoryMatch = content.category ? ilike(content.category, needle) : undefined;
    const queryCondition = or(
      ilike(content.title, needle),
      ...(descriptionMatch ? [descriptionMatch] : []),
      ...(categoryMatch ? [categoryMatch] : []),
    );
    if (queryCondition) conditions.push(queryCondition);
  }

  const rows = await db
    .select({
      row: content,
      creatorName: profiles.displayName,
      username: profiles.username,
    })
    .from(content)
    .innerJoin(profiles, eq(profiles.userId, content.creatorId))
    .where(and(...conditions))
    .orderBy(desc(content.publishedAt))
    .limit(limit)
    .offset(offset);

  return rows.map(({ row, creatorName, username }) =>
    toUniverseEntry(row, creatorName ?? row.attribution ?? "A WithIn creator", username),
  );
}

/** Count of published content — for honest empty-state decisions. */
export async function countPublishedContent(): Promise<number> {
  const rows = await db.select({ n: count() }).from(content).where(eq(content.status, "published"));
  return rows[0]?.n ?? 0;
}

/** Content visible to a viewer: published to all; drafts/etc. to owner + moderators. */
export async function getContentForViewer(contentId: string, viewerId?: string | null) {
  const rows = await db
    .select({
      row: content,
      creatorName: profiles.displayName,
      username: profiles.username,
      creatorRole: users.role,
    })
    .from(content)
    .innerJoin(profiles, eq(profiles.userId, content.creatorId))
    .innerJoin(users, eq(users.id, content.creatorId))
    .where(eq(content.id, contentId))
    .limit(1);

  const item = rows[0];
  if (!item) return null;

  const isOwner = viewerId != null && item.row.creatorId === viewerId;
  const isModerator = item.creatorRole === "moderator" || item.creatorRole === "admin" || item.creatorRole === "super_admin";

  if (item.row.status !== "published" && !isOwner && !isModerator) return null;

  return item;
}

/** Records a view — anonymous views are counted but never attributed. */
export async function recordContentView(contentId: string, userId?: string | null): Promise<void> {
  await db
    .insert(contentViews)
    .values({ contentId, userId: userId ?? null })
    .catch(() => undefined);
}

/** Live view count for a piece of content. */
export async function getContentViewCount(contentId: string): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(contentViews)
    .where(eq(contentViews.contentId, contentId));
  return rows[0]?.n ?? 0;
}

/** Published content by a creator — for their public profile. */
export async function listPublishedByCreator(userId: string): Promise<Content[]> {
  return db
    .select()
    .from(content)
    .where(and(eq(content.creatorId, userId), eq(content.status, "published")))
    .orderBy(desc(content.publishedAt));
}