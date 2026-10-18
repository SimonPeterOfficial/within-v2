/**
 * WITHIN domain event contract.
 *
 * A domain event represents a meaningful business fact that has occurred.
 * Events are immutable, timestamped, and carry only the data consumers
 * genuinely need. They are NOT commands, notifications, or audit records:
 * they describe what happened, not what should be done next.
 *
 * Consumers must still respect authorization, privacy, visibility, and
 * deletion rules when acting on an event. An event does not grant access
 * to its referenced resource.
 */

import { z } from "zod";

/* ── Event types ─────────────────────────────────────────────────────── */

export type EventType =
  | "content.published"
  | "content.submitted"
  | "content.archived"
  | "friend.request.sent"
  | "friend.request.accepted";

export type EventStatus = "pending" | "completed" | "failed";

export type EventSchemaVersion = 1;

/* ── Base event shape (persisted in the outbox) ────────────────────── */

export type DomainEvent<EventData = Record<string, unknown>> = {
  /** Globally unique event identifier. */
  eventId: string;
  /** What happened. */
  type: EventType;
  /** Schema version of `data` for forward-compatible evolution. */
  schemaVersion: EventSchemaVersion;
  /** When the event occurred. */
  occurredAt: string;
  /** Type of the referenced entity. */
  entityType: string;
  /** Identifier of the referenced entity. */
  entityId: string;
  /** Actor who caused the event, when applicable. */
  actorId: string | null;
  /** Causation identifier linking related events, when available. */
  correlationId: string | null;
  /** Minimal, validated event data — no secrets, no private bodies. */
  data: EventData;
};

/* ── Zod validators (runtime validation at dispatch/processing) ─────── */

export const ContentPublishedData = z.object({
  contentId: z.string().uuid(),
  title: z.string().min(1).max(120),
  creatorId: z.string().uuid(),
  publishedAt: z.string().datetime(),
});

export const ContentArchivedData = z.object({
  contentId: z.string().uuid(),
  title: z.string().min(1).max(120),
  creatorId: z.string().uuid(),
  archivedAt: z.string().datetime(),
});

export const ContentSubmittedData = z.object({
  contentId: z.string().uuid(),
  title: z.string().min(1).max(120),
  creatorId: z.string().uuid(),
  submittedAt: z.string().datetime(),
});

export const FriendRequestSentData = z.object({
  friendshipId: z.string().uuid(),
  requesterId: z.string().uuid(),
  addresseeId: z.string().uuid(),
  sentAt: z.string().datetime(),
});

export const FriendRequestAcceptedData = z.object({
  friendshipId: z.string().uuid(),
  requesterId: z.string().uuid(),
  addresseeId: z.string().uuid(),
  acceptedAt: z.string().datetime(),
});

/* ── Factory helpers ───────────────────────────────────────────────── */

export function createEventId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function buildEvent<EventData extends Record<string, unknown>>({
  type,
  entityType,
  entityId,
  actorId,
  correlationId,
  data,
}: {
  type: EventType;
  entityType: string;
  entityId: string;
  actorId: string | null;
  correlationId: string | null;
  data: EventData;
}): DomainEvent<EventData> {
  return {
    eventId: createEventId(),
    type,
    schemaVersion: 1,
    occurredAt: nowIso(),
    entityType,
    entityId,
    actorId,
    correlationId,
    data,
  };
}

/* ── Validation ────────────────────────────────────────────────────── */

export function validateEventData(type: EventType, data: unknown): boolean {
  switch (type) {
    case "content.published":
      return ContentPublishedData.safeParse(data).success;
    case "content.archived":
      return ContentArchivedData.safeParse(data).success;
    case "content.submitted":
      return ContentSubmittedData.safeParse(data).success;
    case "friend.request.sent":
      return FriendRequestSentData.safeParse(data).success;
    case "friend.request.accepted":
      return FriendRequestAcceptedData.safeParse(data).success;
    default:
      return false;
  }
}

export type EventHandler = {
  /** Event type this handler consumes. */
  type: EventType;
  /** Handle a single event. Return void on success; throw on failure. */
  handle: (event: DomainEvent<Record<string, unknown>>) => Promise<void>;
};
