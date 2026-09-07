/**
 * Mirror — the server-side reflection service.
 *
 * Personal reflections, PRIVATE BY DEFAULT. Every query is scoped to the
 * owner's user id at the database level; there is no public path into
 * these rows. The user is always the interpreter of their own entries —
 * this service never diagnoses, never summarizes feelings as facts.
 */

import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, mirrorEntries, type MirrorEntry } from "@/lib/db";

const MAX_BODY = 5000;
const MAX_PROMPT = 200;

/** One validated entry as the UI receives it. */
export type MirrorEntryView = {
  id: string;
  body: string;
  prompt: string | null;
  moodId: string | null;
  createdAt: Date;
};

/** The user's entries, newest first — ownership enforced in the WHERE. */
export async function listMirrorEntries(userId: string, limit = 50): Promise<MirrorEntryView[]> {
  const rows = await db
    .select({
      id: mirrorEntries.id,
      body: mirrorEntries.body,
      prompt: mirrorEntries.prompt,
      moodId: mirrorEntries.moodId,
      createdAt: mirrorEntries.createdAt,
    })
    .from(mirrorEntries)
    .where(eq(mirrorEntries.userId, userId))
    .orderBy(desc(mirrorEntries.createdAt))
    .limit(limit);
  return rows;
}

/** One entry — only when it belongs to the caller. */
export async function getMirrorEntry(userId: string, entryId: string): Promise<MirrorEntryView | null> {
  const rows = await db
    .select({
      id: mirrorEntries.id,
      body: mirrorEntries.body,
      prompt: mirrorEntries.prompt,
      moodId: mirrorEntries.moodId,
      createdAt: mirrorEntries.createdAt,
    })
    .from(mirrorEntries)
    .where(and(eq(mirrorEntries.id, entryId), eq(mirrorEntries.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export type MirrorResult =
  | { ok: true; entry: MirrorEntry }
  | { ok: false; error: string };

/** Creates an entry. Body is required; the prompt is metadata, not content. */
export async function createMirrorEntry(
  userId: string,
  input: { body: string; prompt?: string; moodId?: string }
): Promise<MirrorResult> {
  const body = input.body.trim();
  if (body.length < 1) return { ok: false, error: "Write something first — even a fragment." };
  if (body.length > MAX_BODY) return { ok: false, error: `Reflections hold up to ${MAX_BODY} characters.` };

  const prompt = input.prompt?.trim();
  if (prompt && prompt.length > MAX_PROMPT) return { ok: false, error: "The prompt line is too long." };

  const created = await db
    .insert(mirrorEntries)
    .values({
      userId,
      body,
      prompt: prompt || null,
      moodId: input.moodId?.trim() || null,
    })
    .returning();

  return { ok: true, entry: created[0] };
}

/** Edits the owner's own entry — nothing else is editable. */
export async function updateMirrorEntry(
  userId: string,
  entryId: string,
  patch: { body?: string; moodId?: string }
): Promise<MirrorResult> {
  const existing = await getMirrorEntry(userId, entryId);
  if (!existing) return { ok: false, error: "Entry not found." };

  const body = patch.body?.trim();
  if (body !== undefined) {
    if (body.length < 1) return { ok: false, error: "Write something first — even a fragment." };
    if (body.length > MAX_BODY) return { ok: false, error: `Reflections hold up to ${MAX_BODY} characters.` };
  }

  const updated = await db
    .update(mirrorEntries)
    .set({
      ...(body !== undefined ? { body } : {}),
      ...(patch.moodId !== undefined ? { moodId: patch.moodId?.trim() || null } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(mirrorEntries.id, entryId), eq(mirrorEntries.userId, userId)))
    .returning();

  return { ok: true, entry: updated[0] };
}

/** Deletes the owner's own entry. Reflections belong to the user. */
export async function deleteMirrorEntry(userId: string, entryId: string): Promise<{ ok: boolean; error?: string }> {
  const deleted = await db
    .delete(mirrorEntries)
    .where(and(eq(mirrorEntries.id, entryId), eq(mirrorEntries.userId, userId)))
    .returning({ id: mirrorEntries.id });
  if (deleted.length === 0) return { ok: false, error: "Entry not found." };
  return { ok: true };
}
