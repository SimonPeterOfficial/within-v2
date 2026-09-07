/**
 * While You Were Away — the server-side return summary.
 *
 * Built ONLY from real rows: unread notifications, drafts waiting, content
 * in review, and new work from creators the user follows since their last
 * meaningful activity. Nothing is invented; when nothing happened, the
 * summary is empty and the UI simply doesn't appear.
 *
 * Privacy: every query is scoped to the caller's own user id. Aggregates
 * only — no private messages, no other users' identities beyond public
 * attribution, no inferred emotional states.
 */

import "server-only";
import { and, desc, eq, gt, inArray } from "drizzle-orm";
import {
  db,
  content,
  contentViews,
  follows,
  notifications,
  profiles,
  users,
} from "@/lib/db";

export type AwaySummary = {
  /** Only true when the account has meaningful continuity to summarize. */
  hasSummary: boolean;
  /** Unread notification count (aggregated, never listed raw here). */
  unreadNotifications: number;
  /** The caller's drafts that still wait. */
  draftsWaiting: { id: string; title: string }[];
  /** Content that moved through moderation while away. */
  moderationUpdates: { id: string; title: string; status: string }[];
  /** Published work from followed creators, since last activity. */
  newFromFollowing: { id: string; title: string; creatorName: string | null }[];
  /** Real views on the caller's published work since last activity. */
  newViews: number;
  /** Human lines for the UI — every claim backed by the numbers above. */
  lines: string[];
};

/** The reference point: last activity, or account creation on first return. */
export async function getReturnReference(userId: string): Promise<Date> {
  const rows = await db
    .select({ lastActiveAt: users.lastActiveAt, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const row = rows[0];
  return row?.lastActiveAt ?? row?.createdAt ?? new Date(Date.now() - 30 * 24 * 3600 * 1000);
}

export async function buildAwaySummary(userId: string): Promise<AwaySummary> {
  const since = await getReturnReference(userId);

  const unreadRows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  const unreadNotifications = unreadRows.length;

  const drafts = await db
    .select({ id: content.id, title: content.title })
    .from(content)
    .where(and(eq(content.creatorId, userId), eq(content.status, "draft")))
    .orderBy(desc(content.updatedAt))
    .limit(3);

  const moderationRows = await db
    .select({ id: content.id, title: content.title, status: content.status })
    .from(content)
    .where(
      and(
        eq(content.creatorId, userId),
        inArray(content.status, ["submitted", "reviewing", "approved", "hidden"]),
        gt(content.updatedAt, since),
      ),
    )
    .limit(5);

  const followedIds = (
    await db.select({ id: follows.followeeId }).from(follows).where(eq(follows.followerId, userId)).limit(100)
  ).map((r) => r.id);

  let newFromFollowing: AwaySummary["newFromFollowing"] = [];
  if (followedIds.length > 0) {
    newFromFollowing = (
      await db
        .select({
          id: content.id,
          title: content.title,
          creatorName: profiles.displayName,
        })
        .from(content)
        .innerJoin(profiles, eq(profiles.userId, content.creatorId))
        .where(
          and(
            inArray(content.creatorId, followedIds),
            eq(content.status, "published"),
            gt(content.publishedAt, since),
          ),
        )
        .orderBy(desc(content.publishedAt))
        .limit(3)
    ).map((r) => ({ ...r, creatorName: r.creatorName ?? null }));
  }

  // Real views on my published work since last activity.
  const myPublishedIds = (
    await db
      .select({ id: content.id })
      .from(content)
      .where(and(eq(content.creatorId, userId), eq(content.status, "published")))
  ).map((r) => r.id);
  let newViews = 0;
  if (myPublishedIds.length > 0) {
    const viewRows = await db
      .select({ id: contentViews.id })
      .from(contentViews)
      .where(and(inArray(contentViews.contentId, myPublishedIds), gt(contentViews.viewedAt, since)));
    newViews = viewRows.length;
  }

  // The summary only exists when something meaningful actually happened.
  const lines: string[] = [];
  if (moderationRows.length > 0) lines.push("Your work moved through review.");
  if (drafts.length > 0) lines.push("A draft is still waiting for you.");
  if (newFromFollowing.length > 0) lines.push("Creators you follow released something new.");
  if (newViews > 0) lines.push(`Your work was seen ${newViews} ${newViews === 1 ? "time" : "times"}.`);
  if (unreadNotifications > 3) lines.push(`${unreadNotifications} things are waiting in your notifications.`);

  return {
    hasSummary: lines.length > 0,
    unreadNotifications,
    draftsWaiting: drafts,
    moderationUpdates: moderationRows,
    newFromFollowing,
    newViews,
    lines,
  };
}
