/**
 * Ranking — controlled serendipity for the exploration engine.
 *
 * Discoveries are not purely predictable. The ranking system ensures:
 *   ~70% relevant  (mood-matched, interest-aligned)
 *   ~20% adjacent   (related but not obvious)
 *   ~10% surprising  (serendipitous, low-probability)
 *
 * This ratio is deterministic for testing and will be replaced by a
 * real ranking service in the future.
 */

import type { ExploreItem, ExploreContext } from "./types";

/* ── Serendipity buckets ─────────────────────────────────────────────── */

type Bucket = "relevant" | "adjacent" | "surprising";

const BUCKET_RATIOS: Record<Bucket, number> = {
  relevant: 0.7,
  adjacent: 0.2,
  surprising: 0.1,
};

/* ── Scoring helpers ─────────────────────────────────────────────────── */

/** Base relevance score based on how well an item matches the context. */
function scoreRelevance(item: ExploreItem, ctx: ExploreContext): number {
  let score = 0.3; // base

  // Mood match is the strongest signal
  if (ctx.mood && item.mood === ctx.mood) {
    score += 0.35;
  }

  // Interest tag overlap
  if (item.tags && ctx.interests.length > 0) {
    const overlap = item.tags.filter((t) => ctx.interests.includes(t)).length;
    score += Math.min(overlap * 0.08, 0.2);
  }

  // Recency bonus — "new" items get a slight lift
  if (item.reason.kind === "new") {
    score += 0.05;
  }

  // Followed creator bonus
  if (item.creator && ctx.followedCreators.includes(item.creator)) {
    score += 0.1;
  }

  // Depth bonus — deeper exploration rewards variety
  if (ctx.depth > 3) {
    if (item.serendipity === "adjacent") score += 0.05;
    if (item.serendipity === "surprising") score += 0.08;
  }

  return Math.min(score, 1);
}

/** Deterministic pseudo-random based on a seed string. */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash * 31 + char) | 0;
  }
  return ((hash & 0x7fffffff) / 0x7fffffff);
}

/* ── Main ranking function ───────────────────────────────────────────── */

/**
 * Ranks a pool of items by relevance + serendipity, then selects a
 * balanced batch respecting the 70/20/10 bucket ratios.
 *
 * @param pool - All available ExploreItems
 * @param ctx - Current exploration context
 * @param batchSize - How many items to return (default 6)
 * @param sessionSeed - A session-specific seed for deterministic shuffling
 */
export function rankAndSelect(
  pool: ExploreItem[],
  ctx: ExploreContext,
  batchSize = 6,
  sessionSeed = "default"
): ExploreItem[] {
  // Filter out already-seen items
  const unseen = pool.filter((item) => !ctx.seen.includes(item.id));
  if (unseen.length === 0) return [];

  // Score each item
  const scored = unseen.map((item) => ({
    item,
    score: scoreRelevance(item, ctx),
    // Add a small deterministic noise so the same context doesn't always
    // return identical results — but it IS deterministic per sessionSeed
    noise: seededRandom(`${sessionSeed}-${item.id}`) * 0.15,
  }));

  // Sort by combined score
  scored.sort((a, b) => (b.score + b.noise) - (a.score + a.noise));

  // Distribute into buckets
  const buckets: Record<Bucket, typeof scored> = {
    relevant: [],
    adjacent: [],
    surprising: [],
  };

  for (const entry of scored) {
    buckets[entry.item.serendipity].push(entry);
  }

  // Select items respecting the ratio
  const selected: ExploreItem[] = [];
  const counts: Record<Bucket, number> = {
    relevant: Math.ceil(batchSize * BUCKET_RATIOS.relevant),
    adjacent: Math.ceil(batchSize * BUCKET_RATIOS.adjacent),
    surprising: Math.ceil(batchSize * BUCKET_RATIOS.surprising),
  };

  // Fill each bucket
  for (const bucket of ["relevant", "adjacent", "surprising"] as Bucket[]) {
    const available = buckets[bucket];
    const needed = counts[bucket];
    for (let i = 0; i < Math.min(needed, available.length); i++) {
      selected.push(available[i].item);
    }
  }

  // If we don't have enough, fill from any bucket
  if (selected.length < batchSize) {
    const selectedIds = new Set(selected.map((i) => i.id));
    for (const entry of scored) {
      if (selected.length >= batchSize) break;
      if (!selectedIds.has(entry.item.id)) {
        selected.push(entry.item);
        selectedIds.add(entry.item.id);
      }
    }
  }

  // Shuffle deterministically using session seed
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(`${sessionSeed}-shuffle-${i}`) * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected.slice(0, batchSize);
}
