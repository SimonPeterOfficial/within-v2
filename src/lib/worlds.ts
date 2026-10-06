/**
 * Worlds — the place-making service.
 *
 * A World is owned, permission-bound, and lifecycle-driven. Every read
 * respects visibility server-side:
 *   public    → listed and retrievable by anyone
 *   unlisted  → retrievable by slug, never listed
 *   private   → only the owner can ever see it
 *
 * Drafts never appear in public listings. All mutations verify ownership
 * against the authenticated session user — never a client-supplied id.
 */

import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, worlds, type World, type WorldVisibility } from "@/lib/db";

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 2000;

export type WorldView = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverGradient: string | null;
  coverEmoji: string | null;
  status: World["status"];
  visibility: World["visibility"];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  ownerId: string;
};

function toView(row: World): WorldView {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    coverGradient: row.coverGradient,
    coverEmoji: row.coverEmoji,
    status: row.status,
    visibility: row.visibility,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    ownerId: row.ownerId,
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export type WorldResult = { ok: true; world: WorldView } | { ok: false; error: string };

/** Public discovery listing — published + public only, bounded. */
export async function listPublicWorlds(limit = 24): Promise<WorldView[]> {
  const rows = await db
    .select()
    .from(worlds)
    .where(and(eq(worlds.status, "published"), eq(worlds.visibility, "public")))
    .orderBy(desc(worlds.publishedAt))
    .limit(Math.min(Math.max(limit, 1), 48));
  return rows.map(toView);
}

/** The owner's own worlds — every status, newest first. */
export async function listOwnerWorlds(ownerId: string, limit = 50): Promise<WorldView[]> {
  const rows = await db
    .select()
    .from(worlds)
    .where(eq(worlds.ownerId, ownerId))
    .orderBy(desc(worlds.updatedAt))
    .limit(Math.min(Math.max(limit, 1), 100));
  return rows.map(toView);
}

/**
 * Public read with the personal divide enforced:
 *   public    → anyone
 *   unlisted  → anyone with the slug (but never listed)
 *   private   → only the owner
 */
export async function getWorldForViewer(slug: string, viewerId?: string | null): Promise<WorldView | null> {
  const rows = await db.select().from(worlds).where(eq(worlds.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.visibility === "private" && row.ownerId !== viewerId) return null;
  if (row.status !== "published" && row.ownerId !== viewerId) return null;
  return toView(row);
}

/** Creates a draft world in private visibility. */
export async function createWorld(
  ownerId: string,
  input: { title?: string; description?: string },
): Promise<WorldResult> {
  const title = (input.title ?? "").trim() || "Untitled World";
  if (title.length > MAX_TITLE) return { ok: false, error: `Titles hold up to ${MAX_TITLE} characters.` };
  const description = input.description?.trim() || null;
  if (description && description.length > MAX_DESCRIPTION) {
    return { ok: false, error: `Descriptions hold up to ${MAX_DESCRIPTION} characters.` };
  }

  const base = slugify(title) || "world";
  // Always-suffixed slugs make collisions vanishingly unlikely; the unique
  // index is the final arbiter and a retry would surface a clean error.
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;

  const created = await db
    .insert(worlds)
    .values({ ownerId, title, slug, description, status: "draft", visibility: "private" })
    .returning();
  return { ok: true, world: toView(created[0]) };
}

/** Owner-only edit of identity fields. */
export async function updateWorld(
  ownerId: string,
  slug: string,
  patch: { title?: string; description?: string; coverEmoji?: string; coverGradient?: string; visibility?: WorldVisibility },
): Promise<WorldResult> {
  const rows = await db.select().from(worlds).where(and(eq(worlds.slug, slug), eq(worlds.ownerId, ownerId))).limit(1);
  const row = rows[0];
  if (!row) return { ok: false, error: "World not found." };

  const title = patch.title?.trim();
  if (title !== undefined && (title.length < 1 || title.length > MAX_TITLE)) {
    return { ok: false, error: `Titles need 1–${MAX_TITLE} characters.` };
  }
  const description = patch.description?.trim();
  if (description !== undefined && description.length > MAX_DESCRIPTION) {
    return { ok: false, error: `Descriptions hold up to ${MAX_DESCRIPTION} characters.` };
  }
  const visibility = patch.visibility;
  if (visibility !== undefined && !["private", "unlisted", "public"].includes(visibility)) {
    return { ok: false, error: "Unknown visibility." };
  }

  const updated = await db
    .update(worlds)
    .set({
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description: description || null } : {}),
      ...(patch.coverEmoji !== undefined ? { coverEmoji: patch.coverEmoji.slice(0, 8) || null } : {}),
      ...(patch.coverGradient !== undefined ? { coverGradient: patch.coverGradient.slice(0, 200) || null } : {}),
      ...(visibility !== undefined ? { visibility } : {}),
      updatedAt: new Date(),
    })
    .where(eq(worlds.id, row.id))
    .returning();
  return { ok: true, world: toView(updated[0]) };
}

/** Publishing: draft → published. Sets the first publishedAt stamp. */
export async function publishWorld(ownerId: string, slug: string): Promise<WorldResult> {
  const rows = await db.select().from(worlds).where(and(eq(worlds.slug, slug), eq(worlds.ownerId, ownerId))).limit(1);
  const row = rows[0];
  if (!row) return { ok: false, error: "World not found." };
  if (row.status === "published") return { ok: true, world: toView(row) }; // idempotent
  const updated = await db
    .update(worlds)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(worlds.id, row.id))
    .returning();
  return { ok: true, world: toView(updated[0]) };
}

/** Unpublishing returns a world to draft without deleting it. */
export async function unpublishWorld(ownerId: string, slug: string): Promise<WorldResult> {
  const rows = await db.select().from(worlds).where(and(eq(worlds.slug, slug), eq(worlds.ownerId, ownerId))).limit(1);
  const row = rows[0];
  if (!row) return { ok: false, error: "World not found." };
  const updated = await db
    .update(worlds)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(worlds.id, row.id))
    .returning();
  return { ok: true, world: toView(updated[0]) };
}

/** Hard delete of the owner's own world only. */
export async function deleteWorld(ownerId: string, slug: string): Promise<{ ok: boolean; error?: string }> {
  const deleted = await db
    .delete(worlds)
    .where(and(eq(worlds.slug, slug), eq(worlds.ownerId, ownerId)))
    .returning({ id: worlds.id });
  if (deleted.length === 0) return { ok: false, error: "World not found." };
  return { ok: true };
}
