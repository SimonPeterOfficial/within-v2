/**
 * Journey — the constellation of a user's exploration through WithIn.
 *
 * Each node is a discovery the user encountered. Connections form a tree
 * (not a graph) showing the path taken. This lives entirely client-side
 * for now; a future backend would persist it.
 *
 * The journey is visualized as a constellation on /journey — glowing
 * nodes connected by faint lines, each labeled with the content type.
 */

import type { DiscoveryType } from "./types";

/* ── Journey node ────────────────────────────────────────────────────── */

export type JourneyNodeRarity = "discovered" | "unexpected" | "rare" | "between";

export type JourneyNode = {
  id: string;
  /** Discovery title */
  title: string;
  /** Content type */
  type: DiscoveryType;
  /** Route the user navigated to */
  destination: string;
  /** Timestamp */
  timestamp: number;
  /** The reason this discovery appeared */
  reason: string;
  /** ID of the previous node (null for the root) */
  parentId: string | null;
  /** How rare this discovery was */
  rarity?: JourneyNodeRarity;
  /** Cover gradient/emoji for visual rendering */
  cover?: { gradient: string; emoji: string };
};

/* ── Journey store ───────────────────────────────────────────────────── */

const STORAGE_KEY = "within-journey";
const MAX_NODES = 50; // prevent unbounded growth

/**
 * Returns the current journey from localStorage.
 * Safe to call during SSR (returns empty array).
 */
export function getJourney(): JourneyNode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JourneyNode[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Appends a node to the journey. Returns the updated journey.
 */
export function addToJourney(node: Omit<JourneyNode, "timestamp">): JourneyNode[] {
  const journey = getJourney();
  const entry: JourneyNode = {
    ...node,
    timestamp: Date.now(),
  };

  journey.push(entry);

  // Trim to max size — keep the most recent nodes
  const trimmed = journey.length > MAX_NODES
    ? journey.slice(journey.length - MAX_NODES)
    : journey;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable — silently degrade
  }

  return trimmed;
}

/**
 * Clears the journey history.
 */
export function clearJourney(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently degrade
  }
}

/**
 * Returns the most recent node (the "current position" in the constellation).
 */
export function getCurrentNode(): JourneyNode | null {
  const journey = getJourney();
  return journey.length > 0 ? journey[journey.length - 1] : null;
}

/**
 * Returns journey statistics for display.
 */
export function getJourneyStats(): {
  totalNodes: number;
  types: Record<DiscoveryType, number>;
  depth: number;
  firstTimestamp: number | null;
} {
  const journey = getJourney();
  const types: Record<string, number> = {};

  for (const node of journey) {
    types[node.type] = (types[node.type] ?? 0) + 1;
  }

  return {
    totalNodes: journey.length,
    types: types as Record<DiscoveryType, number>,
    depth: journey.length,
    firstTimestamp: journey.length > 0 ? journey[0].timestamp : null,
  };
}

/**
 * Builds a tree structure from the flat journey array.
 * Useful for rendering the constellation visualization.
 */
export function buildJourneyTree(): Map<string, JourneyNode[]> {
  const journey = getJourney();
  const children = new Map<string, JourneyNode[]>();

  for (const node of journey) {
    const parentId = node.parentId ?? "__root__";
    if (!children.has(parentId)) {
      children.set(parentId, []);
    }
    children.get(parentId)!.push(node);
  }

  return children;
}
