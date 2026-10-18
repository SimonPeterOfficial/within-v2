/**
 * WITHIN event handlers.
 *
 * Handlers consume domain events dispatched from the outbox and produce
 * side effects (notifications, discovery updates, etc.). Each handler is
 * idempotent: processing the same event twice produces the same result as
 * processing it once.
 *
 * Handlers are registered with the shared event dispatcher so that
 * publishing services never call notification logic directly — they only
 * record events, and the outbox worker delivers them.
 */

import "server-only";
import { eq, and } from "drizzle-orm";
import {
  db,
  follows,
  notifications,
  type NotificationType,
  users,
} from "@/lib/db";
import { eventDispatcher } from "@/lib/events/dispatcher";
import { type DomainEvent } from "@/lib/events/types";

/* ── Helpers ───────────────────────────────────────────────────────── */

async function notificationAlreadyExists({
  userId,
  type,
  actorId,
  contentId,
}: {
  userId: string;
  type: string;
  actorId: string;
  contentId: string;
}): Promise<boolean> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, type as NotificationType),
        eq(notifications.actorId, actorId),
        eq(notifications.contentId, contentId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

/* ── Handlers ──────────────────────────────────────────────────────── */

interface ContentPublishedEventData {
  contentId: string;
  title: string;
  creatorId: string;
  publishedAt: string;
}

/**
 * content.published → notify the creator's followers.
 *
 * Idempotent: skips when an identical notification already exists, so
 * reprocessing the same event does not duplicate notifications.
 */
const contentPublishedHandler = {
  type: "content.published" as const,
  async handle(event: DomainEvent<Record<string, unknown>>): Promise<void> {
    const { contentId, title, creatorId } = event.data as unknown as ContentPublishedEventData;

    const followers = await db
      .select({ id: follows.followerId })
      .from(follows)
      .where(eq(follows.followeeId, creatorId))
      .limit(200);

    for (const follower of followers) {
      const exists = await notificationAlreadyExists({
        userId: follower.id,
        type: "creator_published",
        actorId: creatorId,
        contentId,
      });
      if (exists) continue;

      await db.insert(notifications).values({
        userId: follower.id,
        type: "creator_published",
        actorId: creatorId,
        contentId,
        message: `${title} is live.`,
        read: false,
      });
    }
  },
};

interface FriendRequestSentEventData {
  friendshipId: string;
  requesterId: string;
  addresseeId: string;
  sentAt: string;
}

/**
 * content.submitted → notify moderators that new content awaits review.
 *
 * Idempotent: skips when an identical notification already exists.
 */
interface ContentSubmittedEventData {
  contentId: string;
  title: string;
  creatorId: string;
  submittedAt: string;
}

/**
 * friend.request.sent → notify the addressee.
 *
 * Idempotent: skips when an identical notification already exists.
 */
const friendRequestSentHandler = {
  type: "friend.request.sent" as const,
  async handle(event: DomainEvent<Record<string, unknown>>): Promise<void> {
    const { friendshipId, requesterId, addresseeId } = event.data as unknown as FriendRequestSentEventData;

    const exists = await notificationAlreadyExists({
      userId: addresseeId,
      type: "friend_request",
      actorId: requesterId,
      contentId: friendshipId,
    });
    if (exists) return;

    const requester = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, requesterId))
      .limit(1);

    await db.insert(notifications).values({
      userId: addresseeId,
      type: "friend_request",
      actorId: requesterId,
      contentId: friendshipId,
      message: `${requester[0]?.name ?? "Someone"} sent you a friend request.`,
      read: false,
    });
  },
};

/* ── Registration ──────────────────────────────────────────────────── */

/**
 * Register all event handlers with the shared dispatcher. Called once at
 * application startup (see src/lib/events/register.ts).
 */
export function registerEventHandlers(): void {
  eventDispatcher.register(contentPublishedHandler);
  eventDispatcher.register(friendRequestSentHandler);
  eventDispatcher.register(contentSubmittedHandler);
}

interface ContentSubmittedEventData {
  contentId: string;
  title: string;
  creatorId: string;
  submittedAt: string;
}

/**
 * content.submitted → notify moderators that new content awaits review.
 *
 * Idempotent: skips when an identical notification already exists.
 */
const contentSubmittedHandler = {
  type: "content.submitted" as const,
  async handle(event: DomainEvent<Record<string, unknown>>): Promise<void> {
    const { contentId, title, creatorId } = event.data as unknown as ContentSubmittedEventData;

    // Find all moderators to notify
    const moderators = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "moderator"));

    for (const moderator of moderators) {
      const moderatorId = moderator.id as string;
      const exists = await notificationAlreadyExists({
        userId: moderatorId,
        type: "content_submitted",
        actorId: creatorId,
        contentId,
      });
      if (exists) continue;

      await db.insert(notifications).values({
        userId: moderatorId,
        type: "content_submitted",
        actorId: creatorId,
        contentId,
        message: `${creatorId ? "A creator" : "A creator"} submitted "${title}" for review.`,
        read: false,
      });
    }
  },
};
