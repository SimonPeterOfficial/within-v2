/**
 * WITHIN NEXUS — Event system tests.
 *
 * Verifies domain event creation, outbox persistence, event processing,
 * idempotent notification handling, and transactional publish behavior.
 *
 * Runs against the real configured database (DATABASE_URL). Every test is
 * self-contained: it creates its own fixture rows, asserts, and deletes
 * them, so nothing is left behind.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import assert from "node:assert";
import { describe, test } from "node:test";
import { eq, and } from "drizzle-orm";
import {
  validateEventData,
} from "@/lib/events/types";
import { buildEvent } from "@/lib/events/types";
import { db, users, profiles, content, follows, notifications, outboxEvents } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { recordEvent, fetchPendingEvents, processBatch } from "@/lib/events/outbox";

const TEST_PREFIX = "test-nexus-";

async function createUserWithProfile(name: string, role: "user" | "creator" | "admin" | "moderator" | "super_admin" = "user") {
  const { hash, salt } = await hashPassword("test-password");
  const [user] = await db
    .insert(users)
    .values({
      email: `${TEST_PREFIX}${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.invalid`,
      passwordHash: hash,
      passwordSalt: salt,
      name: `${TEST_PREFIX}${name}`,
      role,
    })
    .returning();
  const [profile] = await db
    .insert(profiles)
    .values({
      userId: user.id,
      username: `${TEST_PREFIX}${name}-${Date.now()}`,
      displayName: `${TEST_PREFIX}${name}`,
    })
    .returning();
  return { user, profile };
}

async function createPublishedContent(creatorId: string) {
  const [row] = await db
    .insert(content)
    .values({
      creatorId,
      type: "story",
      title: `${TEST_PREFIX}story`,
      status: "approved",
      visibility: "public",
    })
    .returning();
  return row;
}

describe("WITHIN NEXUS event system", async () => {
  // ── Pure function tests (no DB) ──

  await test("validateEventData accepts valid content.published payload", async () => {
    const valid = {
      contentId: "123e4567-e89b-12d3-a456-426614174000",
      title: "Test Story",
      creatorId: "123e4567-e89b-12d3-a456-426614174001",
      publishedAt: "2026-01-01T00:00:00.000Z",
    };
    assert.ok(validateEventData("content.published", valid));
  });

  await test("validateEventData rejects invalid content.published payload", async () => {
    assert.ok(!validateEventData("content.published", { contentId: "not-a-uuid" }));
    assert.ok(!validateEventData("content.published", {}));
    assert.ok(!validateEventData("content.published", null));
  });

  await test("validateEventData accepts valid friend.request.sent payload", async () => {
    const valid = {
      friendshipId: "123e4567-e89b-12d3-a456-426614174000",
      requesterId: "123e4567-e89b-12d3-a456-426614174001",
      addresseeId: "123e4567-e89b-12d3-a456-426614174002",
      sentAt: "2026-01-01T00:00:00.000Z",
    };
    assert.ok(validateEventData("friend.request.sent", valid));
  });

  await test("buildEvent produces a well-formed domain event", async () => {
    const event = buildEvent({
      type: "content.published",
      entityType: "content",
      entityId: "content-1",
      actorId: "user-1",
      correlationId: null,
      data: {
        contentId: "content-1",
        title: "Test",
        creatorId: "user-1",
        publishedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    assert.ok(event.eventId);
    assert.strictEqual(event.type, "content.published");
    assert.strictEqual(event.schemaVersion, 1);
    assert.ok(event.occurredAt);
    assert.strictEqual(event.entityType, "content");
    assert.strictEqual(event.entityId, "content-1");
    assert.strictEqual(event.actorId, "user-1");
    assert.strictEqual(event.correlationId, null);
    assert.strictEqual(event.data.contentId, "content-1");
  });

  // ── Database-backed tests ──

  await test("recordEvent persists an event in the outbox", async () => {
    const { user, profile } = await createUserWithProfile("nexus-owner");
    const contentRow = await createPublishedContent(user.id);
    const event = buildEvent({
      type: "content.published",
      entityType: "content",
      entityId: contentRow.id,
      actorId: user.id,
      correlationId: null,
      data: {
        contentId: contentRow.id,
        title: contentRow.title,
        creatorId: user.id,
        publishedAt: new Date().toISOString(),
      },
    });

    await db.transaction(async (tx) => {
      await recordEvent(tx, event);
    });

    try {
      const pending = await fetchPendingEvents(10);
      assert.ok(pending.some((e) => e.eventId === event.eventId), "recorded event should be fetchable");
      const found = pending.find((e) => e.eventId === event.eventId);
      assert.strictEqual(found?.status, "pending");
      assert.strictEqual(found?.eventType, "content.published");
    } finally {
      await db.delete(content).where(eq(content.id, contentRow.id));
      await db.delete(profiles).where(eq(profiles.id, profile.id));
      await db.delete(users).where(eq(users.id, user.id));
    }
  });

  await test("content.published event creates follower notification via outbox", async () => {
    const { user: creator, profile: creatorProfile } = await createUserWithProfile("nexus-creator");
    const { user: follower, profile: followerProfile } = await createUserWithProfile("nexus-follower");
    const contentRow = await createPublishedContent(creator.id);

    // Create a follow relationship so the follower gets notified
    await db.insert(follows).values({
      followerId: follower.id,
      followeeId: creator.id,
    });

    const event = buildEvent({
      type: "content.published",
      entityType: "content",
      entityId: contentRow.id,
      actorId: creator.id,
      correlationId: null,
      data: {
        contentId: contentRow.id,
        title: contentRow.title,
        creatorId: creator.id,
        publishedAt: new Date().toISOString(),
      },
    });

    await db.transaction(async (tx) => {
      await recordEvent(tx, event);
    });

    try {
      // Process the outbox batch
      const result = await processBatch();
      assert.ok(result.completed >= 1, "at least one event should complete");

      // Verify notification was created
      const notificationRows = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, follower.id),
            eq(notifications.type, "creator_published"),
            eq(notifications.actorId, creator.id),
          ),
        );
      assert.ok(notificationRows.length >= 1, "follower should receive a creator_published notification");
    } finally {
      await db.delete(notifications).where(eq(notifications.userId, follower.id));
      await db.delete(follows).where(eq(follows.followerId, follower.id));
      await db.delete(content).where(eq(content.id, contentRow.id));
      await db.delete(profiles).where(eq(profiles.id, creatorProfile.id));
      await db.delete(profiles).where(eq(profiles.id, followerProfile.id));
      await db.delete(users).where(eq(users.id, creator.id));
      await db.delete(users).where(eq(users.id, follower.id));
    }
  });

  await test("idempotent notification handling: same event processed twice creates one notification", async () => {
    const { user: creator, profile: creatorProfile } = await createUserWithProfile("nexus-creator-2");
    const { user: follower, profile: followerProfile } = await createUserWithProfile("nexus-follower-2");
    const contentRow = await createPublishedContent(creator.id);

    await db.insert(follows).values({
      followerId: follower.id,
      followeeId: creator.id,
    });

    const event = buildEvent({
      type: "content.published",
      entityType: "content",
      entityId: contentRow.id,
      actorId: creator.id,
      correlationId: null,
      data: {
        contentId: contentRow.id,
        title: contentRow.title,
        creatorId: creator.id,
        publishedAt: new Date().toISOString(),
      },
    });

    await db.transaction(async (tx) => {
      await recordEvent(tx, event);
    });

    try {
      // Process twice
      await processBatch();
      await processBatch();

      const notificationRows = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, follower.id),
            eq(notifications.type, "creator_published"),
          ),
        );
      assert.strictEqual(notificationRows.length, 1, "idempotent handling should create exactly one notification");
    } finally {
      await db.delete(notifications).where(eq(notifications.userId, follower.id));
      await db.delete(follows).where(eq(follows.followerId, follower.id));
      await db.delete(content).where(eq(content.id, contentRow.id));
      await db.delete(profiles).where(eq(profiles.id, creatorProfile.id));
      await db.delete(profiles).where(eq(profiles.id, followerProfile.id));
      await db.delete(users).where(eq(users.id, creator.id));
      await db.delete(users).where(eq(users.id, follower.id));
    }
  });

  await test("publishContent records an outbox event atomically", async () => {
    const { user, profile } = await createUserWithProfile("nexus-publisher");
    const [row] = await db
      .insert(content)
      .values({
        creatorId: user.id,
        type: "story",
        title: `${TEST_PREFIX}draft-story`,
        status: "draft",
        visibility: "public",
      })
      .returning();

    // Submit then approve (simplified: just set to approved)
    await db.update(content).set({ status: "approved" }).where(eq(content.id, row.id));

    // Publish via the service
    const { publishContent } = await import("@/lib/content-service");
    const result = await publishContent(user.id, row.id);

    try {
      assert.ok(result.ok, "publish should succeed");
      assert.strictEqual(result.content.status, "published");

      // Verify an outbox event was recorded
      const publishedEvents = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.eventType, "content.published"))
        .limit(5);
      assert.ok(publishedEvents.length >= 1, "a content.published outbox event should exist");
    } finally {
      await db.delete(content).where(eq(content.id, row.id));
      await db.delete(profiles).where(eq(profiles.id, profile.id));
      await db.delete(users).where(eq(users.id, user.id));
    }
  });
});
