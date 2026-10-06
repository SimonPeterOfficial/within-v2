/**
 * The Trace — a quiet, derived view of what a user has actually left in
 * WithIn: things made, places built, things kept, conversations held, and
 * reflections written. It is computed from existing truth (content, worlds,
 * saves, conversations, mirror entries) rather than tracking anything new.
 *
 * Owner-only. Bounded. No body text from reflections is exposed through
 * this surface — only that a reflection exists and when. Privacy is the
 * architecture, not a setting on it.
 */

import "server-only";
import { listPublishedByCreator } from "@/lib/content-service";
import { listOwnerWorlds } from "@/lib/worlds";
import { listSaves } from "@/lib/interactions";
import { listConversations } from "@/lib/messaging";
import { listMirrorEntries } from "@/lib/mirror";

export type TraceKind = "creation" | "world" | "save" | "conversation" | "reflection";

export type TraceMoment = {
  kind: TraceKind;
  label: string;
  at: Date;
  /** Where this item lives inside WithIn, when there is a destination. */
  href: string | null;
};

/** Per-source cap keeps the Trace honest and bounded; each source is cheap. */
const PER_SOURCE = 8;
const TRACE_LIMIT = 24;

export async function getTrace(userId: string): Promise<TraceMoment[]> {
  const [creations, worlds, saves, conversations, reflections] = await Promise.all([
    listPublishedByCreator(userId).catch(() => []),
    listOwnerWorlds(userId, PER_SOURCE).catch(() => []),
    listSaves(userId, "saved").catch(() => []),
    listConversations(userId, PER_SOURCE).catch(() => []),
    listMirrorEntries(userId, PER_SOURCE).catch(() => []),
  ]);

  const moments: TraceMoment[] = [];

  for (const item of creations.slice(0, PER_SOURCE)) {
    moments.push({
      kind: "creation",
      label: item.title,
      at: item.publishedAt ?? item.createdAt,
      href: `/content/${item.id}`,
    });
  }

  for (const world of worlds.slice(0, PER_SOURCE)) {
    moments.push({
      kind: "world",
      label: world.title,
      at: world.updatedAt,
      href: `/api/worlds/${world.slug}`,
    });
  }

  for (const save of saves.slice(0, PER_SOURCE)) {
    moments.push({
      kind: "save",
      label: save.title,
      at: new Date(save.savedAt),
      href: "/library",
    });
  }

  // Conversations are identified by their partner's display name only —
  // never by message content.
  for (const conversation of conversations.slice(0, PER_SOURCE)) {
    const at = conversation.lastMessage?.createdAt ?? new Date(0);
    if (at.getTime() === 0) continue;
    moments.push({
      kind: "conversation",
      label: conversation.partner.displayName
        ? `Conversation with ${conversation.partner.displayName}`
        : `Conversation with @${conversation.partner.username}`,
      at: new Date(at),
      href: "/conversations",
    });
  }

  // Reflections contribute presence and time — never text.
  for (const entry of reflections.slice(0, PER_SOURCE)) {
    moments.push({
      kind: "reflection",
      label: entry.prompt ?? "A reflection",
      at: entry.createdAt,
      href: "/mirror",
    });
  }

  return moments
    .filter((moment) => !Number.isNaN(moment.at.getTime()))
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, TRACE_LIMIT);
}
