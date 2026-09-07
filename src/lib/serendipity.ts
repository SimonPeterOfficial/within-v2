/**
 * The Serendipity Engine — meaningful unexpected discovery.
 *
 * Surfaces ONE OR TWO genuinely relevant pieces the user hasn't seen,
 * built only from legitimate signals:
 *   • the categories of things they actually saved
 *   • creators they do NOT already follow (new voices)
 *   • real recency, real publication state
 *
 * Safety: blocked users can never be surfaced. Drafts, private, hidden,
 * and archived content can never be surfaced. Own work is excluded.
 * Every result carries a plain-language `whyThis` — no "the algorithm
 * decided" language, no destiny claims, no engagement optimization.
 *
 * This is NOT a feed. The engine returns at most three items, presented
 * as a moment ("This crossed your path"), dismissible, and honest when
 * nothing qualifies.
 */

import "server-only";
import { and, desc, eq, inArray, ne, notInArray, sql } from "drizzle-orm";import { db, blocks, content, follows, profiles, saves } from "@/lib/db";

export type SerendipityItem = {
  id: string;
  title: string;
  creatorName: string | null;
  username: string;
  category: string | null;
  coverGradient: string | null;
  coverEmoji: string | null;
  /** Plain-language reason, backed by a real signal. */
  whyThis: string;
  /** Which signal produced it — for debugging and explainability. */
  source: "saved_category" | "new_voice";
};

/**
 * Finds a small number of genuinely relevant discoveries for one user.
 * Returns an empty array when nothing qualifies — absence is honest.
 */
export async function findSerendipity(userId: string): Promise<SerendipityItem[]> {
  // ── Signals ─────────────────────────────────────────────────────────
  const [savedRows, followRows, blockRows] = await Promise.all([
    // The categories of things the user actually saved — their real taste.
    db
      .selectDistinct({ category: content.category })
      .from(saves)
      .innerJoin(content, eq(saves.contentId, content.id))
      .where(and(eq(saves.userId, userId), eq(saves.shelf, "saved"))),
    db
      .select({ id: follows.followeeId })
      .from(follows)
      .where(eq(follows.followerId, userId)),
    // Blocks are absolute: their content never crosses your path.
    db
      .select({ id: blocks.blockedId })
      .from(blocks)
      .where(eq(blocks.blockerId, userId)),
  ]);

  const followedIds = followRows.map((r) => r.id);
  const blockedIds = blockRows.map((r) => r.id);
  const savedCategories = savedRows
    .map((r) => r.category)
    .filter((c): c is string => Boolean(c));

  if (blockedIds.length >= 1000) return []; // absurd guard — never happens, cheap

  // ── Candidate pool: published, recent, not own, not followed, not blocked ──
  const conditions = [
    eq(content.status, "published"),
    ne(content.creatorId, userId),
    sql`${content.publishedAt} > now() - interval '60 days'`,
    notInArray(content.creatorId, [...blockedIds, ...followedIds, userId].filter((v, i, a) => a.indexOf(v) === i)),
  ];

  // Relevance: saved categories first; otherwise leave room for a new voice.
  if (savedCategories.length > 0) {
    conditions.push(inArray(content.category, savedCategories));
  }

  const candidates = await db
    .select({
      id: content.id,
      title: content.title,
      category: content.category,
      coverGradient: content.coverGradient,
      coverEmoji: content.coverEmoji,
      creatorName: profiles.displayName,
      username: profiles.username,
      creatorId: content.creatorId,
    })
    .from(content)
    .innerJoin(profiles, eq(profiles.userId, content.creatorId))
    .where(and(...conditions))
    .orderBy(desc(content.publishedAt))
    .limit(12);

  if (candidates.length === 0) return [];

  // ── Diversity: max one per creator, max two total, category varied ──
  const seenCreators = new Set<string>();
  const seenCategories = new Set<string>();
  const picked: SerendipityItem[] = [];

  for (const row of candidates) {
    if (picked.length >= 2) break;
    if (seenCreators.has(row.creatorId)) continue;
    // Prefer category variety across the two picks.
    if (picked.length > 0 && seenCategories.has(row.category ?? "")) continue;

    seenCreators.add(row.creatorId);
    if (row.category) seenCategories.add(row.category);

    picked.push({
      id: row.id,
      title: row.title,
      creatorName: row.creatorName ?? null,
      username: row.username,
      category: row.category,
      coverGradient: row.coverGradient,
      coverEmoji: row.coverEmoji,
      whyThis:
        savedCategories.length > 0 && row.category && savedCategories.includes(row.category)
          ? `Because you saved ${row.category.toLowerCase()} like this.`
          : "A new voice, recently arrived.",
      source:
        savedCategories.length > 0 && row.category && savedCategories.includes(row.category)
          ? "saved_category"
          : "new_voice",
    });
  }

  return picked;
}
