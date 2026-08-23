/**
 * Universe State — the living awareness of WithIn.
 *
 * This module is NOT surveillance. It is an experience state — a lightweight
 * understanding of where the user is in their journey through the universe.
 * It tracks:
 *   - which routes have been visited
 *   - how deep exploration has gone
 *   - which content types have been seen
 *   - whether The Door has been discovered
 *   - whether The Between has been visited
 *   - how many Auri encounters have happened
 *   - the last few content types encountered
 *
 * All data lives in localStorage and never leaves the browser.
 * A future backend could persist a server-side mirror of this shape.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * When a real backend exists, replace localStorage reads/writes with
 * an API call. The `UniverseState` type is the contract.
 * ───────────────────────────────────────────────────────────────────────
 */

/* ── The shape of the universe's memory ────────────────────────────── */

export type UniverseState = {
  /** Routes the user has visited (e.g. "/explore", "/within") */
  visitedRoutes: string[];
  /** Max exploration depth reached in any session */
  maxDepth: number;
  /** Content types the user has encountered */
  contentTypesSeen: string[];
  /** Number of discoveries made */
  totalDiscoveries: number;
  /** Whether The Door has been discovered at least once */
  doorDiscovered: boolean;
  /** Whether The Between has been visited */
  betweenVisited: boolean;
  /** Number of Auri encounters experienced */
  auriEncounters: number;
  /** Last N content types in order (for recency tracking) */
  recentContentTypes: string[];
  /** Total time spent (in seconds, approximate) */
  timeSpent: number;
  /** Whether the user has visited /within (conversational space) */
  withinVisited: boolean;
  /** Number of times user has returned to a previously visited route */
  revisitCount: number;
  /** Session start timestamp */
  firstSeenAt: number;
  /** Last active timestamp */
  lastActiveAt: number;
};

/* ── Default empty state ────────────────────────────────────────────── */

const STORAGE_KEY = "within:universe:state";

const DEFAULT_STATE: UniverseState = {
  visitedRoutes: [],
  maxDepth: 0,
  contentTypesSeen: [],
  totalDiscoveries: 0,
  doorDiscovered: false,
  betweenVisited: false,
  auriEncounters: 0,
  recentContentTypes: [],
  timeSpent: 0,
  withinVisited: false,
  revisitCount: 0,
  firstSeenAt: Date.now(),
  lastActiveAt: Date.now(),
};

/* ── Safe localStorage access ───────────────────────────────────────── */

function safeGet(): UniverseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<UniverseState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function safeSet(state: UniverseState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — the universe simply doesn't remember */
  }
}

/* ── Public API ─────────────────────────────────────────────────────── */

/** Read the current universe state. */
export function getUniverseState(): UniverseState {
  return safeGet();
}

/** Update the universe state with a partial patch. */
export function updateUniverseState(patch: Partial<UniverseState>) {
  const current = safeGet();
  safeSet({ ...current, ...patch, lastActiveAt: Date.now() });
}

/** Record a route visit. */
export function recordRouteVisit(route: string) {
  const state = safeGet();
  const isRevisit = state.visitedRoutes.includes(route);
  const visitedRoutes = [...new Set([...state.visitedRoutes, route])];
  updateUniverseState({
    visitedRoutes,
    revisitCount: state.revisitCount + (isRevisit ? 1 : 0),
  });
}

/** Record a discovery. */
export function recordDiscovery(contentType: string) {
  const state = safeGet();
  const contentTypesSeen = [...new Set([...state.contentTypesSeen, contentType])];
  const recentContentTypes = [contentType, ...state.recentContentTypes].slice(0, 8);
  updateUniverseState({
    contentTypesSeen,
    recentContentTypes,
    totalDiscoveries: state.totalDiscoveries + 1,
  });
}

/** Record exploration depth. */
export function recordExplorationDepth(depth: number) {
  const state = safeGet();
  if (depth > state.maxDepth) {
    updateUniverseState({ maxDepth: depth });
  }
}

/** Mark The Door as discovered. */
export function markDoorDiscovered() {
  updateUniverseState({ doorDiscovered: true });
}

/** Mark The Between as visited. */
export function markBetweenVisited() {
  updateUniverseState({ betweenVisited: true });
}

/** Record an Auri encounter. */
export function recordAuriEncounter() {
  const state = safeGet();
  updateUniverseState({ auriEncounters: state.auriEncounters + 1 });
}

/** Record time spent (call periodically). */
export function recordTimeSpent(seconds: number) {
  const state = safeGet();
  updateUniverseState({ timeSpent: state.timeSpent + seconds });
}

/** Mark /within as visited. */
export function markWithinVisited() {
  updateUniverseState({ withinVisited: true });
}

/* ── Derived insights ───────────────────────────────────────────────── */

/** How "deep" into the universe the user has ventured. */
export function getUniverseDepth(state: UniverseState): number {
  let depth = 0;
  if (state.visitedRoutes.length > 3) depth += 1;
  if (state.totalDiscoveries > 5) depth += 1;
  if (state.maxDepth > 3) depth += 1;
  if (state.doorDiscovered) depth += 1;
  if (state.betweenVisited) depth += 1;
  if (state.auriEncounters > 2) depth += 1;
  if (state.timeSpent > 300) depth += 1; // >5 minutes
  return depth;
}

/** The user's dominant content interest based on recent activity. */
export function getDominantInterest(state: UniverseState): string | null {
  if (state.recentContentTypes.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const type of state.recentContentTypes) {
    counts[type] = (counts[type] ?? 0) + 1;
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = type;
      bestCount = count;
    }
  }
  return best;
}

/** Whether this feels like a "returning" universe (the user has been here before). */
export function isReturningUniverse(state: UniverseState): boolean {
  return state.visitedRoutes.length > 2 || state.totalDiscoveries > 3;
}

/** A short atmospheric description of the universe's current feel. */
export function getUniverseFeel(state: UniverseState): string {
  const depth = getUniverseDepth(state);
  if (depth === 0) return "just waking";
  if (depth <= 2) return "gently unfolding";
  if (depth <= 4) return "deeply alive";
  return "infinitely aware";
}
