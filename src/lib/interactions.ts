/**
 * Interactions — persistent library (saves/likes) and reports.
 *
 * Saves: one row per (user, content, shelf); the unique index makes
 * double-clicks harmless. Saved items persist across sessions and devices —
 * they live in Postgres, not React state or localStorage.
 *
 * Reports: real moderation input. Reports persist with a status lifecycle
 * (open → reviewing → resolved/dismissed) that moderators drive later.
 */

import "server-only";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db, content, profiles, reports, saves, users, type SaveShelf } from "@/lib/db";
import type { Content, NewReport } from "@/lib/db";
import { createNotification } from "@/lib/auth/server";

export type SaveResult = { ok: true; saved: boolean } | { ok: false; error: string };

/** Toggles a content item on/off a shelf. Returns the new state. */
export async function toggleSave(userId: string, contentId: string, shelf: SaveShelf): Promise<SaveResult> {
  if (shelf !== "saved" && shelf !== "liked") {
    return { ok: false, error: "Unknown shelf." };
  }

  const target = await db.select({ id: content.id }).from(content).where(eq(content.id, contentId)).limit(1);
  if (target.length === 0) return { ok: false, error: "Content not found." };

  const existing = await db
    .select({ id: saves.id })
    .from(saves)
    .where(and(eq(saves.userId, userId), eq(saves.contentId, contentId), eq(saves.shelf, shelf)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(saves).where(eq(saves.id, existing[0].id));
    return { ok: true, saved: false };
  }

  await db.insert(saves).values({ userId, contentId, shelf });
  return { ok: true, saved: true };
}

/** Whether a content item currently sits on a shelf for this user. */
export async function getSaveState(userId: string, contentId: string, shelf: SaveShelf): Promise<boolean> {
  const rows = await db
    .select({ id: saves.id })
    .from(saves)
    .where(and(eq(saves.userId, userId), eq(saves.contentId, contentId), eq(saves.shelf, shelf)))
    .limit(1);
  return rows.length > 0;
}

/** A saved item, resolved for display — matches what the cards render. */
export type LibraryEntry = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  tags: string[] | null;
  coverGradient: string | null;
  coverEmoji: string | null;
  creatorName: string | null;
  username: string;
  savedAt: Date;
};

/** The user's shelf, newest first, joined with creator attribution. */
export async function listSaves(userId: string, shelf: SaveShelf): Promise<LibraryEntry[]> {
  const rows = await db
    .select({
      id: content.id,
      title: content.title,
      description: content.description,
      type: content.type,
      category: content.category,
      tags: content.tags,
      coverGradient: content.coverGradient,
      coverEmoji: content.coverEmoji,
      creatorName: profiles.displayName,
      username: profiles.username,
      savedAt: saves.createdAt,
    })
    .from(saves)
    .innerJoin(content, eq(saves.contentId, content.id))
    .innerJoin(profiles, eq(profiles.userId, content.creatorId))
    .where(and(eq(saves.userId, userId), eq(saves.shelf, shelf)))
    .orderBy(desc(saves.createdAt));

  return rows;
}

/* ── Reports ────────────────────────────────────────────────────────── */

export type ReportResult = { ok: true } | { ok: false; error: string };

const TARGET_TYPES = ["content", "comment", "user", "profile"] as const;
type ReportTargetType = (typeof TARGET_TYPES)[number];

/** Files a report — the target must exist, the reason must be real. */
export async function fileReport(
  reporterId: string,
  input: { targetType: string; targetId: string; reason: string; details?: string },
): Promise<ReportResult> {
  const targetType = input.targetType as ReportTargetType;
  if (!TARGET_TYPES.includes(targetType)) {
    return { ok: false, error: "Unknown target type." };
  }

  const reason = input.reason.trim();
  if (reason.length < 3 || reason.length > 300) {
    return { ok: false, error: "Reason must be between 3 and 300 characters." };
  }
  if (input.details && input.details.length > 1000) {
    return { ok: false, error: "Details are too long." };
  }

  // The target must actually exist — reports about nothing are noise.
  if (targetType === "content") {
    const target = await db.select({ id: content.id }).from(content).where(eq(content.id, input.targetId)).limit(1);
    if (target.length === 0) return { ok: false, error: "Content not found." };
  } else if (targetType === "user" || targetType === "profile") {
    const target = await db.select({ id: users.id }).from(users).where(eq(users.id, input.targetId)).limit(1);
    if (target.length === 0) return { ok: false, error: "Account not found." };
  }

  const report: NewReport = {
    reporterId,
    targetType: targetType as NewReport["targetType"],
    targetId: input.targetId,
    reason,
    details: input.details?.trim() || null,
    severity: "medium",
    status: "open",
  };
  await db.insert(reports).values(report);

  return { ok: true };
}