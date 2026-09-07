/**
 * Notifications — the read side of the notification bus.
 *
 * Real rows already exist (new_follower, creator_published,
 * moderation_result are written by real events). This service is the safe
 * way to read them: owner-scoped at the query level, newest first, with an
 * unread count and a mark-all-seen. There is no cross-user read.
 */

import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, notifications, profiles, type NotificationType } from "@/lib/db";

/** One notification, resolved for display. */
export type NotificationView = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  /** Where this notification leads — derived from its type + payload. */
  href: string | null;
  /** Who triggered it, when there is an actor. */
  actorName: string | null;
  actorUsername: string | null;
};

/** The destination for a notification — every type has a real route. */
function hrefFor(type: NotificationType, contentId: string | null): string | null {
  switch (type) {
    case "new_follower":
      return "/profile";
    case "friend_request":
      return "/connections";
    case "request_accepted":
      return "/connections";
    case "message":
      return "/conversations";
    case "creator_published":
    case "comment":
    case "reaction":
      return contentId ? `/content/${contentId}` : "/discover";
    case "moderation_result":
      return contentId ? `/content/${contentId}` : "/profile";
    case "subscription":
      return "/settings";
    case "system":
      return "/home";
    default:
      return null;
  }
}

/** The caller's notifications, newest first. */
export async function listNotifications(userId: string, limit = 30): Promise<NotificationView[]> {
  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      message: notifications.message,
      read: notifications.read,
      createdAt: notifications.createdAt,
      contentId: notifications.contentId,
      actorName: profiles.displayName,
      actorUsername: profiles.username,
    })
    .from(notifications)
    .leftJoin(profiles, eq(profiles.userId, notifications.actorId))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    message: row.message,
    read: row.read,
    createdAt: row.createdAt,
    href: hrefFor(row.type, row.contentId),
    actorName: row.actorName ?? null,
    actorUsername: row.actorUsername ?? null,
  }));
}

/** How many are unread — the quiet badge in the navigation. */
export async function countUnread(userId: string): Promise<number> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return rows.length;
}

/** Marks every unread notification seen — the user owns their queue. */
export async function markAllNotificationsSeen(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}
