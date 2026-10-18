/**
 * Content submission event lifecycle tests.
 *
 * Verifies that submitting content (draft → submitted) records a
 * content.submitted event in the outbox, and that processing the outbox
 * dispatches that event to registered handlers (creating notifications).
 *
 * Runs against the real configured database (DATABASE_URL). Every test is
 * self-contained: it creates its own fixture rows, asserts, and deletes
 * them, so nothing is left behind and no test depends on shared state.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import assert from "node:assert";
import { describe, test } from "node:test";
import { eq } from "drizzle-orm";
import { db, users, profiles, content, outboxEvents, notifications } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  createDraft,
  submitContent,
} from "@/lib/content-service";
import { processBatch } from "@/lib/events/outbox";

const TEST_PREFIX = "test-event-";

async function bootstrap() {
  const { hashPassword } = await import("@/lib/auth/password");
  return { db, users, profiles, content, outboxEvents, notifications, hashPassword,
    createDraft, submitContent };
}

async function createUserWithProfile(name: string, role: "user" | "creator" | "moderator" | "admin" | "super_admin" = "user") {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { hash, salt } = await hashPassword("test-password");
  const [user] = await db
    .insert(users)
    .values({
      email: `${TEST_PREFIX}${name}-${unique}@example.invalid`,
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
      username: `${TEST_PREFIX}${name}-${unique}`,
      displayName: `${TEST_PREFIX}${name}-${unique}`,
    })
    .returning();
  return { user, profile };
}

async function cleanup(ids: { users: string[]; profiles: string[]; contents: string[]; events: string[]; notifications: string[] }) {
  for (const id of ids.contents) {
    await db.delete(content).where(eq(content.id, id));
  }
  for (const id of ids.events) {
    await db.delete(outboxEvents).where(eq(outboxEvents.id, id));
  }
  for (const id of ids.notifications) {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
  for (const id of ids.profiles) {
    await db.delete(profiles).where(eq(profiles.id, id));
  }
  for (const id of ids.users) {
    await db.delete(users).where(eq(users.id, id));
  }
}

describe("Content submission event lifecycle", async () => {
  await test("submitContent records a content.submitted event in the outbox", async () => {
    const { user, profile } = await createUserWithProfile("alice-owner");
    try {
      const result = await submitContent(user.id, {
        title: `${TEST_PREFIX}submitted-content`,
        type: "story",
        description: "A test story for event emission.",
        category: "Stories",
      });
      assert.ok(result.ok, "expected submitContent to succeed");

      // Verify the event was recorded in the outbox
      const events = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.eventType, "content.submitted"))
        .where(eq(outboxEvents.entityId, result.content.id));
      assert.ok(events.length > 0, "expected content.submitted event to be recorded in outbox");
      assert.strictEqual(events[0].status, "pending", "expected event to be in pending status");
      assert.strictEqual(events[0].actorId, user.id, "expected event actorId to match creator");
    } finally {
      await cleanup({
        users: [user.id],
        profiles: [profile.id],
        contents: [result.content.id],
        events: [],
        notifications: [],
      });
    }
  });

  await test("processBatch dispatches content.submitted event to handlers", async () => {
    const { user, profile } = await createUserWithProfile("bob-owner");
    try {
      // First create a submission
      const result = await submitContent(user.id, {
        title: `${TEST_PREFIX}submitted-content-2`,
        type: "story",
        description: "Another test story for event emission.",
        category: "Stories",
      });
      assert.ok(result.ok, "expected submitContent to succeed");

      // Verify the event is in pending state
      const beforeEvents = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.eventType, "content.submitted"))
        .where(eq(outboxEvents.entityId, result.content.id));
      assert.ok(beforeEvents.length > 0, "expected event to be in outbox before processing");
      assert.strictEqual(beforeEvents[0].status, "pending", "expected event to be pending before processing");

      // Process the batch
      const result2 = await processBatch();
      assert.ok(result2.processed > 0, "expected processBatch to process at least one event");
      assert.ok(result2.completed > 0, "expected at least one event to complete");
      assert.strictEqual(result2.failed, 0, "expected no failed events");

      // Verify the event is now completed
      const afterEvents = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.eventType, "content.submitted"))
        .where(eq(outboxEvents.entityId, result.content.id));
      assert.ok(afterEvents.length > 0, "expected event to still be in outbox");
      assert.strictEqual(afterEvents[0].status, "completed", "expected event to be completed after processing");
    } finally {
      await cleanup({
        users: [user.id],
        profiles: [profile.id],
        contents: [result.content.id],
        events: [],
        notifications: [],
      });
    }
  });
});
