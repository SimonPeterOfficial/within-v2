/**
 * Follows — the persistent relationship layer.
 *
 * One row per (follower → followee) pair; the unique index makes duplicate
 * follows impossible at the database level, so a double-click can never
 * create a hundred identical rows. Following a user fires a real
 * `new_follower` notification row.
 */

import "server-only";
import { and, count, eq } from "drizzle-orm";
import { db, follows, users } from "@/lib/db";
import { createNotification } from "@/lib/auth/server";

export type FollowResult = { ok: true; following: boolean } | { ok: false; error: string };

/** Live follower/following counts for a user. */
export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const [followers, following] = await Promise.all([
    db.select({ n: count() }).from(follows).where(eq(follows.followeeId, userId)),
    db.select({ n: count() }).from(follows).where(eq(follows.followerId, userId)),
  ]);
  return {
    followers: followers[0]?.n ?? 0,
    following: following[0]?.n ?? 0,
  };
}

/** Whether `followerId` currently follows `followeeId`. */
export async function isFollowing(followerId: string, followeeId: string): Promise<boolean> {
  const rows = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)))
    .limit(1);
  return rows.length > 0;
}

/**
 * Toggles a follow relationship. Refuses self-follows and unknown accounts.
 * The unique index makes this idempotent-safe: a race can't duplicate rows.
 */
export async function toggleFollow(followerId: string, followeeId: string): Promise<FollowResult> {
  if (followerId === followeeId) {
    return { ok: false, error: "You can't follow yourself." };
  }

  const target = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, followeeId)).limit(1);
  if (target.length === 0 || target[0].id !== followeeId) {
    return { ok: false, error: "This account doesn't exist." };
  }

  const existing = await db
    .select({ id: follows.id })
    .from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(follows).where(eq(follows.id, existing[0].id));
    return { ok: true, following: false };
  }

  await db.insert(follows).values({ followerId, followeeId });
  // A real event: the followee gets a notification row.
  const follower = await db.select({ name: users.name }).from(users).where(eq(users.id, followerId)).limit(1);
  const followerName = follower[0]?.name ?? "Someone";
  await createNotification({
    userId: followeeId,
    type: "new_follower",
    actorId: followerId,
    message: `${followerName} followed you.`,
  });

  return { ok: true, following: true };
}