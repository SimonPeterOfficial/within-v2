/**
 * Light Memory — session-based ambient persistence.
 *
 * WithIn remembers the places you have visited, not to personalize or
 * profile you, but so the world feels like it was waiting for your return.
 * Each destination you enter leaves a soft glow — like warmth remaining in
 * a room after someone has been there. Returning to a place shows its light
 * slightly brighter, as if the room remembers you.
 *
 * This is session-only: it lives in memory, never in localStorage, never
 * in a database, never sent anywhere. It is not personalization — it is
 * courtesy. The world acknowledges that you were here.
 *
 * Every destination in UNIVERSE_NAV is tracked independently. The glow
 * decays gently over time so the world does not become permanently lit.
 */

type VisitRecord = {
  /** How many times this destination has been entered this session. */
  visits: number;
  /** Timestamp of the most recent entry (ms epoch). */
  lastSeen: number;
};

/** Maximum visits tracked per destination — keeps the glow bounded. */
const MAX_VISITS = 5;

/** How long a visit remains "fresh" before the glow starts fading (ms). */
const FRESH_WINDOW_MS = 5 * 60 * 1000;

/** How long until a glow fully decays (ms). */
const DECAY_WINDOW_MS = 30 * 60 * 1000;

const visits = new Map<string, VisitRecord>();

/**
 * Mark a destination as entered. Call this when the user arrives at a route.
 */
export function recordVisit(href: string): void {
  const now = Date.now();
  const existing = visits.get(href);
  if (existing) {
    existing.visits = Math.min(MAX_VISITS, existing.visits + 1);
    existing.lastSeen = now;
  } else {
    visits.set(href, { visits: 1, lastSeen: now });
  }
}

/**
 * Get the glow intensity for a destination (0–1).
 *
 * Returns 0 when the destination has never been visited or the glow has
 * fully decayed. Returns a higher value for recently and frequently visited
 * destinations.
 */
export function getVisitGlow(href: string): number {
  const record = visits.get(href);
  if (!record) return 0;

  const now = Date.now();
  const age = now - record.lastSeen;

  // Fully decayed — remove the record to keep the map clean.
  if (age > DECAY_WINDOW_MS) {
    visits.delete(href);
    return 0;
  }

  // Freshness factor: 1.0 when just visited, decaying to 0 over the decay window.
  const freshness = Math.max(0, 1 - age / DECAY_WINDOW_MS);

  // Frequency factor: more visits = brighter glow, capped at MAX_VISITS.
  const frequency = record.visits / MAX_VISITS;

  // Combine: frequency sets the ceiling, freshness determines how much of it shows.
  return frequency * freshness;
}

/**
 * Get all destinations that currently have a glow (visited recently).
 */
export function getGlowingDestinations(): Array<{ href: string; glow: number }> {
  const result: Array<{ href: string; glow: number }> = [];
  for (const [href] of visits) {
    const glow = getVisitGlow(href);
    if (glow > 0) {
      result.push({ href, glow });
    }
  }
  return result;
}

/**
 * Clear all visit records. Used by sign-out.
 */
export function clearVisits(): void {
  visits.clear();
}

export type { VisitRecord };
