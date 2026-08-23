/**
 * Ranking — controlled serendipity for the exploration engine.
 *
 * Discoveries are not purely predictable. The ranking system ensures:
 *   ~70% relevant  (mood-matched, interest-aligned)
 *   ~20% adjacent   (related but not obvious)
 *   ~10% surprising  (serendipitous, low-probability)
 *
 * The ratios gently shift as the user explores deeper — the universe
 * rewards wandering by offering more surprising finds after the third
 * or fourth exploration, making WithIn feel progressively more alive.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * When a real backend exists, replace `rankAndSelect` with a server-side
 * call. The signature is: (pool, context, batchSize, seed) → items[].
 * ───────────────────────────────────────────────────────────────────────
 */

import type { ExploreItem, ExploreContext } from "./types";

/* ── Serendipity buckets ─────────────────────────────────────────────── */

type Bucket = "relevant" | "adjacent" | "surprising";

const BASE_BUCKET_RATIOS: Record<Bucket, number> = {
  relevant: 0.7,
  adjacent: 0.2,
  surprising: 0.1,
};

/**
 * As the user goes deeper, the universe opens wider.
 * At depth 0-2: 70/20/10 (familiar, guided)
 * At depth 3-6: 60/25/15 (more adjacent, more surprise)
 * At depth 7+:  50/25/25 (the universe is wide open)
 */
function getBucketRatios(depth: number): Record<Bucket, number> {
  if (depth >= 7) return { relevant: 0.5, adjacent: 0.25, surprising: 0.25 };
  if (depth >= 3) return { relevant: 0.6, adjacent: 0.25, surprising: 0.15 };
  return BASE_BUCKET_RATIOS;
}

/* ── Time-of-day affinity ────────────────────────────────────────────── */

/**
 * Certain content types and moods feel more natural at certain hours.
 * This is a gentle nudge, not a hard filter.
 */
function timeAffinity(item: ExploreItem): number {
  const hour = new Date().getHours();
  let bonus = 0;

  // Night favors: music, reflection, calm, melancholic stories
  if (hour >= 22 || hour < 5) {
    if (item.type === "music") bonus += 0.06;
    if (item.type === "reflection") bonus += 0.08;
    if (item.mood === "calm" || item.mood === "lost") bonus += 0.05;
  }
  // Morning favors: inspiration, hope, books
  else if (hour >= 5 && hour < 12) {
    if (item.mood === "inspired" || item.mood === "hopeful") bonus += 0.06;
    if (item.type === "book") bonus += 0.04;
  }
  // Afternoon favors: discovery, creators, communities
  else if (hour >= 12 && hour < 17) {
    if (item.type === "creator" || item.type === "community") bonus += 0.05;
  }
  // Evening favors: originals, stories, film
  else if (hour >= 17 && hour < 22) {
    if (item.type === "original") bonus += 0.06;
    if (item.type === "book") bonus += 0.04;
  }

  return bonus;
}

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

  // Content type variety — after seeing many of the same type, reward others
  if (ctx.lastType && item.type === ctx.lastType) {
    score -= 0.03; // slight penalty for repetition
  }

  // Time-of-day affinity
  score += timeAffinity(item);

  return Math.min(Math.max(score, 0), 1);
}

/** Deterministic pseudo-random based on a seed string. */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash * 31 + char) | 0;
  }
  return (hash & 0x7fffffff) / 0x7fffffff;
}

/* ── Main ranking function ───────────────────────────────────────────── */

/**
 * Ranks a pool of items by relevance + serendipity, then selects a
 * balanced batch respecting the depth-adjusted bucket ratios.
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

  // Get depth-aware bucket ratios
  const ratios = getBucketRatios(ctx.depth);

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
    relevant: Math.ceil(batchSize * ratios.relevant),
    adjacent: Math.ceil(batchSize * ratios.adjacent),
    surprising: Math.ceil(batchSize * ratios.surprising),
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
