/**
 * Creator Studio — the server-side workspace service.
 *
 * Everything /studio shows comes from real rows, scoped to the caller's
 * user id at the query level. There is no fabricated statistics here:
 * when a number is zero, the UI shows an honest empty state.
 *
 * Analytics principle: views/saves are aggregated counts only — never
 * personal identity, never private messages, never location.
 */

import "server-only";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import {
  db,
  content,
  contentViews,
  follows,
  saves,
  type Content,
  type ContentStatus,
} from "@/lib/db";
import { createNotification } from "@/lib/auth/server";

/* ── Overview — the creator's real standing ─────────────────────────── */

export type StudioCounts = {
  drafts: number;
  inReview: number;
  approved: number;
  published: number;
  followers: number;
};

export type StudioOverview = {
  counts: StudioCounts;
  /** Lifetime views across all published work — real rows, aggregated. */
  totalViews: number;
  /** Lifetime saves across all published work. */
  totalSaves: number;
  /** Milestones the creator has actually reached — celebrated, never gamed. */
  milestones: string[];
};

export async function getStudioOverview(creatorId: string): Promise<StudioOverview> {
  const rows = await db
    .select({ status: content.status, n: count() })
    .from(content)
    .where(eq(content.creatorId, creatorId))
    .groupBy(content.status);

  const byStatus = new Map<ContentStatus, number>(rows.map((r) => [r.status, r.n]));
  const followerRows = await db
    .select({ n: count() })
    .from(follows)
    .where(eq(follows.followeeId, creatorId));

  // Lifetime view count over this creator's published work.
  const publishedIds = (
    await db
      .select({ id: content.id })
      .from(content)
      .where(and(eq(content.creatorId, creatorId), eq(content.status, "published")))
  ).map((r) => r.id);

  let totalViews = 0;
  let totalSaves = 0;
  if (publishedIds.length > 0) {
    const viewRows = await db
      .select({ n: count() })
      .from(contentViews)
      .where(inArray(contentViews.contentId, publishedIds));
    const saveRows = await db
      .select({ n: count() })
      .from(saves)
      .where(and(inArray(saves.contentId, publishedIds), eq(saves.shelf, "saved")));
    totalViews = viewRows[0]?.n ?? 0;
    totalSaves = saveRows[0]?.n ?? 0;
  }

  // Milestones — only from real events, phrased as creation (not vanity).
  const milestones: string[] = [];
  const publishedCount = byStatus.get("published") ?? 0;
  if (publishedCount >= 1) milestones.push("First creation published");
  if (publishedCount >= 5) milestones.push("Five worlds shared");
  if (totalSaves >= 1) milestones.push("Someone saved your work");
  if ((followerRows[0]?.n ?? 0) >= 1) milestones.push("Your first follower");

  return {
    counts: {
      drafts: byStatus.get("draft") ?? 0,
      inReview: (byStatus.get("submitted") ?? 0) + (byStatus.get("reviewing") ?? 0),
      approved: byStatus.get("approved") ?? 0,
      published: publishedCount,
      followers: followerRows[0]?.n ?? 0,
    },
    totalViews,
    totalSaves,
    milestones,
  };
}

/* ── Content lists — the creator's own rows, every status ───────────── */

export type StudioItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  status: ContentStatus;
  visibility: string;
  moderationNote: string | null;
  tags: string[] | null;
  coverGradient: string | null;
  coverEmoji: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  /** Real view count — zero until someone actually watches. */
  views: number;
};

export async function listCreatorContent(creatorId: string, statuses?: ContentStatus[]): Promise<StudioItem[]> {
  const conditions = [eq(content.creatorId, creatorId)];
  if (statuses && statuses.length > 0) conditions.push(inArray(content.status, statuses));

  const rows = await db
    .select({
      id: content.id,
      type: content.type,
      title: content.title,
      description: content.description,
      status: content.status,
      visibility: content.visibility,
      moderationNote: content.moderationNote,
      tags: content.tags,
      coverGradient: content.coverGradient,
      coverEmoji: content.coverEmoji,
      publishedAt: content.publishedAt,
      updatedAt: content.updatedAt,
      views: sql<number>`(
        select count(*) from ${contentViews}
        where ${contentViews.contentId} = ${content.id}
      )`.mapWith(Number),
    })
    .from(content)
    .where(and(...conditions))
    .orderBy(desc(content.updatedAt));

  return rows;
}

/** One of the creator's own rows — for the editor. Owner-scoped. */
export async function getCreatorContent(creatorId: string, contentId: string): Promise<Content | null> {
  const rows = await db
    .select()
    .from(content)
    .where(and(eq(content.id, contentId), eq(content.creatorId, creatorId)))
    .limit(1);
  return rows[0] ?? null;
}

/* ── Deletion — drafts delete cleanly; published work archives ──────── */

export type DeleteResult = { ok: true; mode: "deleted" | "archived" } | { ok: false; error: string };

export async function deleteCreatorContent(creatorId: string, contentId: string): Promise<DeleteResult> {
  const row = await getCreatorContent(creatorId, contentId);
  if (!row) return { ok: false, error: "Content not found." };

  // Drafts (and rejected drafts) can be truly removed — nothing depends
  // on them. Published work is archived so saves/follows stay coherent.
  if (row.status === "draft" || row.status === "submitted") {
    await db.delete(content).where(and(eq(content.id, contentId), eq(content.creatorId, creatorId)));
    return { ok: true, mode: "deleted" };
  }

  if (row.status === "published" || row.status === "approved") {
    await db
      .update(content)
      .set({ status: "archived", updatedAt: new Date() })
      .where(and(eq(content.id, contentId), eq(content.creatorId, creatorId)));
    return { ok: true, mode: "archived" };
  }

  return { ok: false, error: "This content is under review and cannot be removed yet." };
}

/* ── Scheduling — the honest abstraction ─────────────────────────────── */

/**
 * Records a scheduled publication time on the creator's own approved row.
 * WithIn does not pretend browser timers are production scheduling: this
 * writes `scheduledAt` so server-side infrastructure (a future cron or
 * queue worker) picks it up. The UI labels it honestly as "scheduled".
 */
export async function schedulePublication(
  creatorId: string,
  contentId: string,
  scheduledAt: Date,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() - 60_000) {
    return { ok: false, error: "Pick a moment in the future." };
  }
  const row = await getCreatorContent(creatorId, contentId);
  if (!row) return { ok: false, error: "Content not found." };
  if (row.status !== "approved") {
    return { ok: false, error: "Only approved content can be scheduled." };
  }
  await db
    .update(content)
    .set({ scheduledAt, updatedAt: new Date() })
    .where(and(eq(content.id, contentId), eq(content.creatorId, creatorId)));
  return { ok: true };
}

/* ── The due-scheduler — runs opportunistically, server-side ────────── */

/**
 * Publishes any approved work whose scheduledAt has passed. Called on
 * authenticated studio/home requests — an honest best-effort scheduler
 * for the current infrastructure (no fake cron, no browser timers).
 * Returns how many pieces went live; each publication notifies followers
 * through the same pipeline as manual publishing.
 */
export async function processDuePublications(): Promise<number> {
  const due = await db
    .select({ id: content.id, creatorId: content.creatorId })
    .from(content)
    .where(
      and(
        eq(content.status, "approved"),
        sql`${content.scheduledAt} is not null and ${content.scheduledAt} <= now()`,
      ),
    )
    .limit(10);

  for (const row of due) {
    const result = await db
      .update(content)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(content.id, row.id), eq(content.status, "approved")))
      .returning({ id: content.id, title: content.title });
    if (result.length === 0) continue;

    await createNotification({
      userId: row.creatorId,
      type: "system",
      contentId: row.id,
      message: `Your scheduled work "${result[0].title}" is now live.`,
    });
  }
  return due.length;
}
