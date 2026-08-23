/**
 * Exploration Engine — the heart of WithIn's endless universe.
 *
 * Given an ExploreContext, the engine returns a batch of ExploreItems
 * ranked by relevance + serendipity. The engine is stateless; session
 * state (seen items, journey) lives in the caller.
 *
 * Architecture:
 *   Context → Seed Pool → Ranking → Serendipity → Result
 *
 * When a real backend exists, replace getSeedPool() with an API call
 * and the ranking logic with a server-side model. The UI never changes.
 */

import type { ExploreItem, ExploreContext, ExploreResult } from "./types";
import { getSeedPool, AURI_WHISPERS, AURI_SUGGESTIONS } from "./seed";
import { rankAndSelect } from "./ranking";

/* ── Engine configuration ────────────────────────────────────────────── */

const DEFAULT_BATCH_SIZE = 6;
const MAX_EXPLORATIONS = 200; // hard cap per session to prevent infinite loops

/* ── "Take me somewhere" transition whispers — Auri speaks as the door opens ── */

const TAKE_ME_WHISPERS = [
  "Come with me.",
  "There's something here.",
  "I've been watching this one.",
  "This feels right.",
  "Close your eyes for a moment.",
  "The light is different here.",
  "You haven't seen this part yet.",
  "Trust me on this one.",
  "Step through.",
  "Let the universe choose.",
];

/** Select a whisper that feels contextual, not random. */
function pickTakeMeSomewhereWhisper(ctx: ExploreContext): string {
  const index = (ctx.depth + Math.floor(seededRandom(JSON.stringify(ctx.seen)) * TAKE_ME_WHISPERS.length)) % TAKE_ME_WHISPERS.length;
  return TAKE_ME_WHISPERS[index];
}

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return (hash & 0x7fffffff) / 0x7fffffff;
}

/* ── Session seed (deterministic per session) ────────────────────────── */

let sessionSeed = "";

function getSessionSeed(): string {
  if (!sessionSeed) {
    sessionSeed = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return sessionSeed;
}

/* ── Auri suggestion selection ───────────────────────────────────────── */

function selectAuriSuggestion(ctx: ExploreContext): string | undefined {
  const contextTag = ctx.mood ?? (ctx.depth === 0 ? "start" : "curious");

  const matching = AURI_SUGGESTIONS.filter((s) =>
    s.contexts.some((c) => contextTag.includes(c) || c.includes(contextTag))
  );

  if (matching.length === 0) return undefined;

  const index = ctx.depth % matching.length;
  return matching[index].text;
}

/* ── Main engine ─────────────────────────────────────────────────────── */

/**
 * The exploration engine — given a context, returns a batch of discoveries.
 */
export function explore(
  ctx: ExploreContext,
  batchSize = DEFAULT_BATCH_SIZE
): ExploreResult {
  if (ctx.seen.length >= MAX_EXPLORATIONS) {
    return {
      items: [],
      context: ctx,
      hasMore: false,
      auriSuggestion: "You've wandered far. Maybe it's time to rest.",
    };
  }

  const pool = getSeedPool();
  const items = rankAndSelect(pool, ctx, batchSize, getSessionSeed());

  return {
    items,
    context: ctx,
    hasMore: ctx.seen.length + items.length < MAX_EXPLORATIONS,
    auriSuggestion: selectAuriSuggestion(ctx),
  };
}

/**
 * "Take me somewhere" — the signature WithIn interaction.
 * Returns a single discovery with an Auri whisper.
 */
export function takeMeSomewhere(ctx: ExploreContext): ExploreResult {
  const pool = getSeedPool();
  const items = rankAndSelect(pool, ctx, 1, getSessionSeed());

  return {
    items,
    context: ctx,
    hasMore: true,
    auriSuggestion: pickTakeMeSomewhereWhisper(ctx),
  };
}

/**
 * "The Unexpected Door" — after several explorations, Auri presents
 * a low-probability discovery. Called periodically, not every time.
 */
export function unexpectedDoor(ctx: ExploreContext): ExploreResult | null {
  if (ctx.depth < 4 || ctx.depth % 8 !== 4) return null;

  const pool = getSeedPool();
  const surprising = pool.filter((item) => item.serendipity === "surprising");
  if (surprising.length === 0) return null;

  const index = ctx.depth % surprising.length;

  return {
    items: [surprising[index]],
    context: ctx,
    hasMore: true,
    auriSuggestion: AURI_WHISPERS.door[0],
  };
}

/**
 * Returns the full seed pool for debugging / admin views.
 */
export function getAllDiscoveries(): ExploreItem[] {
  return getSeedPool();
}
