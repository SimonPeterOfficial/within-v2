/**
 * Journeys — the path service.
 *
 * A Journey is an authored, ordered path over existing content. It never
 * duplicates underlying objects: items are (sourceType, sourceId) pairs in
 * explicit positions. Drafts are private by default; publishing is an
 * explicit, owner-gated transition. Item ordering is gap-free and enforced
 * by the unique (journeyId, position) index.
 */

import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  journeys,
  journeyItems,
  type Journey,
  type JourneyItemSource,
} from "@/lib/db";

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 2000;
const ITEM_SOURCES: JourneyItemSource[] = ["content", "world", "mirror", "creation", "other"];

export type JourneyItemView = {
  id: string;
  position: number;
  sourceType: JourneyItemSource;
  sourceId: string;
  note: string | null;
  createdAt: Date;
};

export type JourneyView = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverEmoji: string | null;
  coverGradient: string | null;
  status: Journey["status"];
  visibility: Journey["visibility"];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  ownerId: string;
  items: JourneyItemView[];
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function itemsFor(journeyId: string): Promise<JourneyItemView[]> {
  const rows = await db
    .select()
    .from(journeyItems)
    .where(eq(journeyItems.journeyId, journeyId))
    .orderBy(asc(journeyItems.position));
  return rows.map((r) => ({
    id: r.id,
    position: r.position,
    sourceType: r.sourceType,
    sourceId: r.sourceId,
    note: r.note,
    createdAt: r.createdAt,
  }));
}

function toView(row: Journey, items: JourneyItemView[]): JourneyView {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    coverEmoji: row.coverEmoji,
    coverGradient: row.coverGradient,
    status: row.status,
    visibility: row.visibility,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    ownerId: row.ownerId,
    items,
  };
}

export async function getJourneyForViewer(slug: string, viewerId?: string | null): Promise<JourneyView | null> {
  const rows = await db.select().from(journeys).where(eq(journeys.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.visibility === "private" && row.ownerId !== viewerId) return null;
  if (row.status !== "published" && row.ownerId !== viewerId) return null;
  return toView(row, await itemsFor(row.id));
}

export async function listPublicJourneys(limit = 24): Promise<JourneyView[]> {
  const rows = await db
    .select()
    .from(journeys)
    .where(and(eq(journeys.status, "published"), eq(journeys.visibility, "public")))
    .orderBy(desc(journeys.publishedAt))
    .limit(Math.min(Math.max(limit, 1), 48));
  return Promise.all(rows.map(async (row) => toView(row, await itemsFor(row.id))));
}

export async function listOwnerJourneys(ownerId: string): Promise<JourneyView[]> {
  const rows = await db
    .select()
    .from(journeys)
    .where(eq(journeys.ownerId, ownerId))
    .orderBy(desc(journeys.updatedAt))
    .limit(50);
  return Promise.all(rows.map(async (row) => toView(row, await itemsFor(row.id))));
}

export type JourneyResult = { ok: true; journey: JourneyView } | { ok: false; error: string };

export async function createJourney(
  ownerId: string,
  input: { title?: string; description?: string },
): Promise<JourneyResult> {
  const title = (input.title ?? "").trim() || "Untitled Journey";
  if (title.length > MAX_TITLE) return { ok: false, error: `Titles hold up to ${MAX_TITLE} characters.` };
  const description = input.description?.trim() || null;
  if (description && description.length > MAX_DESCRIPTION) {
    return { ok: false, error: `Descriptions hold up to ${MAX_DESCRIPTION} characters.` };
  }
  const slug = `${slugify(title) || "journey"}-${Math.random().toString(36).slice(2, 6)}`;
  const created = await db
    .insert(journeys)
    .values({ ownerId, title, slug, description, status: "draft", visibility: "private" })
    .returning();
  return { ok: true, journey: toView(created[0], []) };
}

export async function updateJourney(
  ownerId: string,
  slug: string,
  patch: { title?: string; description?: string; visibility?: Journey["visibility"] },
): Promise<JourneyResult> {
  const rows = await db.select().from(journeys).where(and(eq(journeys.slug, slug), eq(journeys.ownerId, ownerId))).limit(1);
  if (!rows[0]) return { ok: false, error: "Journey not found." };
  const title = patch.title?.trim();
  if (title !== undefined && (title.length < 1 || title.length > MAX_TITLE)) {
    return { ok: false, error: `Titles need 1–${MAX_TITLE} characters.` };
  }
  const updated = await db
    .update(journeys)
    .set({
      ...(title !== undefined ? { title } : {}),
      ...(patch.description !== undefined ? { description: patch.description.trim() || null } : {}),
      ...(patch.visibility !== undefined ? { visibility: patch.visibility } : {}),
      updatedAt: new Date(),
    })
    .where(eq(journeys.id, rows[0].id))
    .returning();
  return { ok: true, journey: toView(updated[0], await itemsFor(rows[0].id)) };
}

/** Appends an item at the end of the path. Gap-free by construction. */
export async function appendJourneyItem(
  ownerId: string,
  slug: string,
  input: { sourceType: JourneyItemSource; sourceId: string; note?: string },
): Promise<{ ok: true; item: JourneyItemView } | { ok: false; error: string }> {
  if (!ITEM_SOURCES.includes(input.sourceType)) return { ok: false, error: "Unknown source type." };
  const uuid = /^[0-9a-f-]{36}$/i;
  if (!uuid.test(input.sourceId)) return { ok: false, error: "Invalid source id." };

  const rows = await db.select().from(journeys).where(and(eq(journeys.slug, slug), eq(journeys.ownerId, ownerId))).limit(1);
  if (!rows[0]) return { ok: false, error: "Journey not found." };

  const [max] = await db
    .select({ max: sql<number | null>`max(${journeyItems.position})` })
    .from(journeyItems)
    .where(eq(journeyItems.journeyId, rows[0].id));
  const position = (max?.max ?? -1) + 1;

  const inserted = await db
    .insert(journeyItems)
    .values({
      journeyId: rows[0].id,
      position,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      note: input.note?.trim() || null,
    })
    .returning();

  await db.update(journeys).set({ updatedAt: new Date() }).where(eq(journeys.id, rows[0].id));
  const item = inserted[0];
  return {
    ok: true,
    item: { id: item.id, position: item.position, sourceType: item.sourceType, sourceId: item.sourceId, note: item.note, createdAt: item.createdAt },
  };
}

/** Removes an item and compacts the remaining positions into a gap-free order. */
export async function removeJourneyItem(
  ownerId: string,
  slug: string,
  itemId: string,
): Promise<{ ok: boolean; error?: string }> {
  const rows = await db.select().from(journeys).where(and(eq(journeys.slug, slug), eq(journeys.ownerId, ownerId))).limit(1);
  if (!rows[0]) return { ok: false, error: "Journey not found." };

  const deleted = await db
    .delete(journeyItems)
    .where(and(eq(journeyItems.id, itemId), eq(journeyItems.journeyId, rows[0].id)))
    .returning({ id: journeyItems.id });
  if (deleted.length === 0) return { ok: false, error: "Item not found." };

  // Re-number remaining items densely from zero.
  const remaining = await db
    .select()
    .from(journeyItems)
    .where(eq(journeyItems.journeyId, rows[0].id))
    .orderBy(asc(journeyItems.position));
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].position !== i) {
      await db.update(journeyItems).set({ position: i }).where(eq(journeyItems.id, remaining[i].id));
    }
  }
  await db.update(journeys).set({ updatedAt: new Date() }).where(eq(journeys.id, rows[0].id));
  return { ok: true };
}

export async function publishJourney(ownerId: string, slug: string): Promise<JourneyResult> {
  const rows = await db.select().from(journeys).where(and(eq(journeys.slug, slug), eq(journeys.ownerId, ownerId))).limit(1);
  if (!rows[0]) return { ok: false, error: "Journey not found." };
  if (rows[0].status === "published") return { ok: true, journey: toView(rows[0], await itemsFor(rows[0].id)) };
  const updated = await db
    .update(journeys)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(journeys.id, rows[0].id))
    .returning();
  return { ok: true, journey: toView(updated[0], await itemsFor(rows[0].id)) };
}

export async function deleteJourney(ownerId: string, slug: string): Promise<{ ok: boolean; error?: string }> {
  const deleted = await db.delete(journeys).where(and(eq(journeys.slug, slug), eq(journeys.ownerId, ownerId))).returning({ id: journeys.id });
  if (deleted.length === 0) return { ok: false, error: "Journey not found." };
  return { ok: true };
}
