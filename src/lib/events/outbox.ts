/**
 * WITHIN outbox — durable event recording and delivery.
 *
 * The business change and the durable record of the event are committed
 * atomically in the same database transaction. A bounded worker picks up
 * pending events and delivers them to registered handlers with retries
 * and idempotency.
 *
 * Delivery semantics: at-least-once with idempotent handlers. A consumer
 * that processes the same event twice must produce the same result as
 * processing it once (enforced by unique eventId constraints downstream
 * or by the consumer's own idempotency check).
 */

import "server-only";
import { and, count, eq, gt, isNull, lt } from "drizzle-orm";
import { db, outboxEvents, type NewOutboxEvent, type OutboxEvent } from "@/lib/db";
import {
  eventDispatcher,
} from "./dispatcher";
import {
  type DomainEvent,
  type EventSchemaVersion,
  type EventType,
} from "./types";
import { validateEventData } from "./types";

// Register event handlers so they are subscribed when the dispatcher is used.
import { registerEventHandlers } from "./handlers";
registerEventHandlers();

/** Maximum attempts before an event is dead-lettered (marked failed). */
const MAX_ATTEMPTS = 10;

/** How many events to fetch in a single processing batch. */
const BATCH_SIZE = 25;

/** How long a worker holds the lock on an event (ms). */
const LEASE_TTL_MS = 5 * 60_000;

/** Initial retry backoff (ms); grows exponentially per attempt. */
const RETRY_BACKOFF_MS = 60_000;

/**
 * Record an event durably in the same transaction as the business change.
 *
 * Callers pass an existing Drizzle transaction (`tx`) so the event record
 * and the business change commit together. If the transaction rolls back,
 * the event is never recorded — no orphaned events.
 */
export async function recordEvent(
  tx: Parameters<typeof db.transaction>[0] extends (tx: infer T) => unknown ? T : never,
  event: DomainEvent,
): Promise<void> {
  const newEvent: NewOutboxEvent = {
    eventId: event.eventId,
    eventType: event.type,
    schemaVersion: event.schemaVersion,
    payload: event.data,
    status: "pending",
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    nextAttemptAt: new Date(),
    processedAt: null,
    lockedUntil: null,
    lastError: null,
  };
  await tx.insert(outboxEvents).values(newEvent);
}

/**
 * Fetch a bounded batch of events eligible for processing.
 *
 * An event is eligible when:
 *   - status = 'pending', and
 *   - lockedUntil is null or in the past (not held by another worker), and
 *   - nextAttemptAt <= now.
 *
 * Events are ordered by creation time (oldest first) to preserve causal
 * order within a business operation.
 */
export async function fetchPendingEvents(limit = BATCH_SIZE): Promise<OutboxEvent[]> {
  const now = new Date();
  return db
    .select()
    .from(outboxEvents)
    .where(
      and(
        eq(outboxEvents.status, "pending"),
        isNull(outboxEvents.lockedUntil),
        lt(outboxEvents.nextAttemptAt, now),
      ),
    )
    .orderBy(outboxEvents.createdAt)
    .limit(limit);
}

/**
 * Claim a single event for processing by setting a lease.
 *
 * Uses a conditional update so concurrent workers cannot claim the same
 * event. Returns the event if successfully claimed, null otherwise.
 */
export async function claimEvent(
  eventId: string,
  leaseUntil: Date,
): Promise<OutboxEvent | null> {
  const result = await db
    .update(outboxEvents)
    .set({ lockedUntil: leaseUntil })
    .where(
      and(
        eq(outboxEvents.id, eventId),
        eq(outboxEvents.status, "pending"),
        isNull(outboxEvents.lockedUntil),
        lt(outboxEvents.nextAttemptAt, new Date()),
      ),
    )
    .returning();
  return result[0] ?? null;
}

/**
 * Release a lock on an event without changing its status (used when a
 * worker abandons processing before completion).
 */
export async function releaseLock(eventId: string): Promise<void> {
  await db
    .update(outboxEvents)
    .set({ lockedUntil: null })
    .where(eq(outboxEvents.id, eventId));
}

/**
 * Mark an event as successfully completed.
 */
export async function completeEvent(eventId: string): Promise<void> {
  await db
    .update(outboxEvents)
    .set({
      status: "completed",
      processedAt: new Date(),
      lockedUntil: null,
    })
    .where(eq(outboxEvents.id, eventId));
}

/**
 * Record a failed attempt and schedule a retry, or dead-letter if attempts
 * are exhausted.
 */
export async function failEvent(
  eventId: string,
  error: string,
): Promise<{ retried: boolean; attempts: number }> {
  const existing = await db
    .select({
      attempts: outboxEvents.attempts,
      maxAttempts: outboxEvents.maxAttempts,
    })
    .from(outboxEvents)
    .where(eq(outboxEvents.id, eventId))
    .limit(1);

  const row = existing[0];
  if (!row) {
    return { retried: false, attempts: 0 };
  }

  const attempts = Number(row.attempts) + 1;
  const maxAttempts = Number(row.maxAttempts);

  if (attempts >= maxAttempts) {
    // Dead-letter: mark failed, keep nextAttemptAt null so it is not retried.
    await db
      .update(outboxEvents)
      .set({
        status: "failed",
        processedAt: new Date(),
        lockedUntil: null,
        attempts,
        lastError: error.slice(0, 500), // bounded; no stack traces
      })
      .where(eq(outboxEvents.id, eventId));
    return { retried: false, attempts };
  }

  // Schedule retry with exponential backoff.
  const backoff = RETRY_BACKOFF_MS * Math.pow(2, attempts - 1);
  const nextAttemptAt = new Date(Date.now() + backoff);
  await db
    .update(outboxEvents)
    .set({
      status: "pending",
      lockedUntil: null,
      attempts,
      nextAttemptAt,
      lastError: error.slice(0, 500),
    })
    .where(eq(outboxEvents.id, eventId));
  return { retried: true, attempts };
}

/**
 * Count pending and failed events for operational diagnostics.
 */
export async function getOutboxStats(): Promise<{
  pending: number;
  completed: number;
  failed: number;
}> {
  const [pending, completed, failed] = await Promise.all([
    db
      .select({ count: count() })
      .from(outboxEvents)
      .where(eq(outboxEvents.status, "pending")),
    db
      .select({ count: count() })
      .from(outboxEvents)
      .where(eq(outboxEvents.status, "completed")),
    db
      .select({ count: count() })
      .from(outboxEvents)
      .where(eq(outboxEvents.status, "failed")),
  ]);
  return {
    pending: Number(pending[0]?.count ?? 0),
    completed: Number(completed[0]?.count ?? 0),
    failed: Number(failed[0]?.count ?? 0),
  };
}

/**
 * Process one batch of pending events through the shared dispatcher.
 *
 * Each event is claimed, dispatched to its registered handlers, then
 * marked completed or failed. Handler failures do not abort the batch.
 */
export async function processBatch(): Promise<{
  processed: number;
  completed: number;
  failed: number;
  errors: Array<{ eventId: string; type: string; error: string }>;
}> {
  const events = await fetchPendingEvents(BATCH_SIZE);
  let processed = 0;
  let completed = 0;
  let failed = 0;
  const errors: Array<{ eventId: string; type: string; error: string }> = [];

  for (const event of events) {
    processed += 1;

    const claimed = await claimEvent(
      event.id,
      new Date(Date.now() + LEASE_TTL_MS),
    );
    if (!claimed) {
      // Another worker claimed it; skip.
      continue;
    }

    try {
      const domainEvent: DomainEvent = {
        eventId: event.eventId,
        type: event.eventType as EventType,
        schemaVersion: event.schemaVersion as EventSchemaVersion,
        occurredAt: event.createdAt.toISOString(),
        entityType: "",
        entityId: "",
        actorId: null,
        correlationId: null,
        data: event.payload as Record<string, unknown>,
      };

      if (!validateEventData(domainEvent.type, domainEvent.data)) {
        throw new Error(`Invalid event payload for type ${domainEvent.type}`);
      }

      const result = await eventDispatcher.dispatch(domainEvent);
      if (result.failed === 0) {
        await completeEvent(event.id);
        completed += 1;
      } else {
        const failResult = await failEvent(
          event.id,
          `Handler failures: ${result.errors
            .map((e) => `${e.handler}: ${e.error}`)
            .join("; ")}`,
        );
        if (!failResult.retried) {
          failed += 1;
        } else {
          completed += 1; // will be retried
        }
        errors.push({
          eventId: event.id,
          type: event.eventType,
          error: result.errors
            .map((e) => `${e.handler}: ${e.error}`)
            .join("; "),
        });
      }
    } catch (error) {
      const failResult = await failEvent(
        event.id,
        error instanceof Error ? error.message : "Unknown dispatch error",
      );
      if (!failResult.retried) {
        failed += 1;
      } else {
        completed += 1;
      }
      errors.push({
        eventId: event.id,
        type: event.eventType,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { processed, completed, failed, errors };
}
