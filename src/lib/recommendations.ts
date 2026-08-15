/**
 * The WithIn recommendation engine.
 *
 * Inputs: the user's selected mood + the current time of day.
 * Outputs: an ordered deck of content cards.
 *
 * Today the scoring is deterministic and transparent — a piece speaks to
 * certain moods and hours (tags on lib/content.ts), and the deck is ranked
 * by how well it matches the current environment, with a stable fallback
 * order so nothing jumps around arbitrarily. This is the integration point
 * for a future model-based recommender: keep the signature, replace the
 * scoring body.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * async function recommend(picks, ctx) → scores[]   // future model
 * Replace `rankPicks` below; the UI consumes `recommendFor` unchanged.
 * ───────────────────────────────────────────────────────────────────────
 */

import { PICKS, type PickItem } from "@/lib/content";
import type { MoodId } from "@/lib/mood";
import type { TimePeriod } from "@/lib/auri";

/** A short, time-aware frame for the recommendations header. */
export function timeHeadline(period: TimePeriod): string {
  switch (period) {
    case "morning":
      return "A gentle morning";
    case "afternoon":
      return "This afternoon";
    case "evening":
      return "Tonight on WithIn";
    case "night":
      return "Late-night WithIn";
  }
}

type Ranked = { pick: PickItem; score: number; order: number };

/**
 * Deterministic scoring: mood affinity is the loudest signal, time of day a
 * quiet nudge, and the catalog order breaks ties so the deck is stable.
 */
function rankPicks(moodId: MoodId | null, period: TimePeriod): Ranked[] {
  return PICKS.map((pick, order) => {
    let score = 0;
    if (moodId && pick.moods.includes(moodId)) score += 3;
    if (pick.times.includes(period)) score += 1;
    return { pick, score, order };
  }).sort((a, b) => b.score - a.score || a.order - b.order);
}

/**
 * The deck for the current moment. Pure and deterministic: same environment,
 * same deck — so "Refresh picks" can safely rotate from a stable base.
 */
export function recommendFor(moodId: MoodId | null, period: TimePeriod): PickItem[] {
  return rankPicks(moodId, period).map((ranked) => ranked.pick);
}

/** A one-line reason Auri can share — honest about what the engine knows. */
export function recommendationReason(moodId: MoodId | null, period: TimePeriod): string {
  const parts: string[] = [];
  if (moodId) parts.push(`your ${moodId} mood`);
  if (period === "night" || period === "evening") parts.push("the late light");
  if (parts.length === 0) return "a quiet moment";
  return parts.join(" and ");
}
