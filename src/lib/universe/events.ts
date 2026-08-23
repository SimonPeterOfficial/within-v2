/**
 * Rare Events — the uncommon magical moments of WithIn.
 *
 * These are NOT notifications. They are not popups. They are not alerts.
 * They are rare atmospheric moments that appear and dissolve naturally,
 * making the user think: "Wait... I've never seen this before."
 *
 * Events are triggered by conditions (time, depth, route, randomness)
 * and have cooldowns so they never feel like spam.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * When a real backend exists, events could be server-pushed. For now,
 * all logic is client-side and deterministic where possible.
 * ───────────────────────────────────────────────────────────────────────
 */

import { getUniverseState, type UniverseState } from "./state";

/* ── Event types ────────────────────────────────────────────────────── */

export type EventType =
  | "quiet-hour"      // The universe becomes unusually minimal
  | "falling-star"    // A tiny star crosses the interface
  | "lost-page"       // A hidden destination appears
  | "auri-note"       // Auri leaves a short sentence
  | "second-door"     // A second portal appears somewhere unexpected
  | "constellation-shift" // The stars rearrange slightly
  | "memory-echo"     // A previous discovery echoes back
  | "depth-whisper";  // At unusual depth, a quiet acknowledgment

export type RareEvent = {
  id: EventType;
  /** How likely this event is per check (0-1). Lower = rarer. */
  probability: number;
  /** Minimum conditions for this event to be possible */
  minDepth?: number;
  minDiscoveries?: number;
  minTimeSpent?: number; // seconds
  /** Cooldown in ms — how long before this can fire again */
  cooldownMs: number;
  /** The atmospheric message (if any) */
  message?: string;
  /** The destination (if any) */
  destination?: string;
  /** Visual variant */
  variant: "subtle" | "floating" | "portal" | "whisper" | "star";
};

/* ── Event registry ─────────────────────────────────────────────────── */

const EVENTS: RareEvent[] = [
  {
    id: "quiet-hour",
    probability: 0.03,
    minDepth: 2,
    cooldownMs: 60 * 60 * 1000, // 1 hour
    message: "The universe is breathing slowly.",
    variant: "whisper",
  },
  {
    id: "falling-star",
    probability: 0.02,
    cooldownMs: 30 * 60 * 1000, // 30 min
    variant: "star",
  },
  {
    id: "lost-page",
    probability: 0.015,
    minDepth: 3,
    minDiscoveries: 5,
    cooldownMs: 2 * 60 * 60 * 1000, // 2 hours
    message: "You found something that wasn't on the map.",
    destination: "/between",
    variant: "portal",
  },
  {
    id: "auri-note",
    probability: 0.025,
    minDepth: 1,
    cooldownMs: 45 * 60 * 1000, // 45 min
    variant: "floating",
  },
  {
    id: "second-door",
    probability: 0.01,
    minDepth: 4,
    minDiscoveries: 8,
    cooldownMs: 3 * 60 * 60 * 1000, // 3 hours
    message: "There's another way through.",
    destination: "/explore",
    variant: "portal",
  },
  {
    id: "constellation-shift",
    probability: 0.02,
    minDepth: 2,
    cooldownMs: 60 * 60 * 1000,
    variant: "subtle",
  },
  {
    id: "memory-echo",
    probability: 0.02,
    minDepth: 3,
    minDiscoveries: 4,
    cooldownMs: 90 * 60 * 1000, // 90 min
    message: "Something you found before is glowing.",
    variant: "whisper",
  },
  {
    id: "depth-whisper",
    probability: 0.03,
    minDepth: 5,
    minTimeSpent: 120,
    cooldownMs: 2 * 60 * 60 * 1000,
    variant: "floating",
  },
];

/* ── Auri encounter messages (for the "auri-note" event) ────────────── */

const AURI_NOTES = [
  "You went farther than most.",
  "That one doesn't open for everyone.",
  "You came back.",
  "The light noticed you.",
  "I think you've been here a while.",
  "This corner remembers you.",
  "Not everything needs a destination.",
  "Stay as long as you need.",
  "There's more than you've seen.",
  "The spaces between things matter.",
];

/* ── Cooldown storage ───────────────────────────────────────────────── */

const COOLDOWN_KEY = "within:universe:event-cooldowns";

function getCooldowns(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCooldowns(cooldowns: Record<string, number>) {
  try {
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
  } catch {
    /* ignore */
  }
}

function isInCooldown(eventId: string, cooldownMs: number): boolean {
  const cooldowns = getCooldowns();
  const lastFired = cooldowns[eventId] ?? 0;
  return Date.now() - lastFired < cooldownMs;
}

function recordFiring(eventId: string) {
  const cooldowns = getCooldowns();
  cooldowns[eventId] = Date.now();
  setCooldowns(cooldowns);
}

/* ── Deterministic pseudo-random ────────────────────────────────────── */

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return (hash & 0x7fffffff) / 0x7fffffff;
}

/* ── Event evaluation ───────────────────────────────────────────────── */

export type EvaluatedEvent = RareEvent & {
  message: string;
};

/**
 * Check if a rare event should fire.
 * Called periodically (not on every render) — ideally every 30-60 seconds.
 * Returns null if no event should fire.
 */
export function evaluateRareEvent(): EvaluatedEvent | null {
  const state = getUniverseState();
  const now = Date.now();

  for (const event of EVENTS) {
    // Check cooldown
    if (isInCooldown(event.id, event.cooldownMs)) continue;

    // Check minimum conditions
    if (event.minDepth && getUniverseDepthSafe(state) < event.minDepth) continue;
    if (event.minDiscoveries && state.totalDiscoveries < event.minDiscoveries) continue;
    if (event.minTimeSpent && state.timeSpent < event.minTimeSpent) continue;

    // Check probability (deterministic based on current minute)
    const seed = `${event.id}-${Math.floor(now / 60000)}`;
    const roll = seededRandom(seed);
    if (roll > event.probability) continue;

    // Event fires!
    recordFiring(event.id);

    // Resolve message
    let message = event.message ?? "";
    if (event.id === "auri-note") {
      message = AURI_NOTES[Math.floor(roll * AURI_NOTES.length)];
    }

    return { ...event, message };
  }

  return null;
}

function getUniverseDepthSafe(state: UniverseState): number {
  let depth = 0;
  if (state.visitedRoutes.length > 3) depth += 1;
  if (state.totalDiscoveries > 5) depth += 1;
  if (state.maxDepth > 3) depth += 1;
  if (state.doorDiscovered) depth += 1;
  if (state.betweenVisited) depth += 1;
  if (state.auriEncounters > 2) depth += 1;
  if (state.timeSpent > 300) depth += 1;
  return depth;
}

/**
 * Get a contextual Auri encounter message based on the current universe state.
 * Used by AuriOrb and AuriEncounter for route-aware, depth-aware whispers.
 */
export function getAuriContextualMessage(state: UniverseState): string | null {
  const depth = getUniverseDepthSafe(state);
  const hour = new Date().getHours();

  // Returning after deep exploration
  if (state.revisitCount > 3 && state.maxDepth > 4) {
    return "You left quite a trail.";
  }

  // After visiting The Between — a special acknowledgment
  if (state.betweenVisited && depth > 3 && state.revisitCount > 1) {
    const betweenMessages = [
      "You found the space between.",
      "That place doesn't open for everyone.",
      "You carry something from between now.",
    ];
    return betweenMessages[Math.floor(seededRandom(String(state.revisitCount)) * betweenMessages.length)];
  }

  // After discovering The Door
  if (state.doorDiscovered && state.revisitCount === 1) {
    return "The door remembers.";
  }

  // Returning to a previously visited route — subtle
  if (state.revisitCount > 5) {
    const revisitMessages = [
      "Somewhere you've already been.",
      "You came back.",
      "Still here.",
    ];
    return revisitMessages[Math.floor(seededRandom(String(state.revisitCount * 7)) * revisitMessages.length)];
  }

  // Deep exploration
  if (depth > 5) {
    return "You went farther than most.";
  }

  // Heavy on one content type — a gentle observation
  if (state.recentContentTypes.length >= 4) {
    const last4 = state.recentContentTypes.slice(0, 4);
    const allSame = last4.every((t) => t === last4[0]);
    if (allSame) {
      const typeMessages: Record<string, string> = {
        original: "The stories keep drawing you in.",
        music: "The sound found you.",
        book: "You're a reader. I can tell.",
        photo: "You see things others walk past.",
        creator: "You're looking for people, not things.",
        community: "You're looking for belonging.",
      };
      return typeMessages[last4[0]] ?? "I think you've been here a while.";
    }
  }

  // Late night quiet visit
  if ((hour >= 23 || hour < 4) && depth >= 2 && state.timeSpent > 120) {
    return "It's quiet now. Just us.";
  }

  // After many discoveries — rare acknowledgment
  if (state.totalDiscoveries > 15 && state.revisitCount < 2) {
    return "You're collecting the universe, aren't you?";
  }

  // First time in Within
  if (state.withinVisited && state.visitedRoutes.filter((r) => r === "/within").length <= 1) {
    return "You found the inner room.";
  }

  return null;
}
