/**
 * Explore types — the vocabulary of WithIn's endless universe.
 *
 * Every discovery the exploration engine surfaces is an ExploreItem.
 * Each knows WHY it appeared (reason) and WHERE it leads (destination).
 * The architecture is designed so a real backend/CMS can replace mock data
 * by implementing the same shapes.
 */

/* ── Discovery taxonomy ──────────────────────────────────────────────── */

/** The kinds of content that can appear as discoveries. */
export type DiscoveryType =
  | "original"
  | "book"
  | "music"
  | "photo"
  | "creator"
  | "community"
  | "reflection"
  | "auri-moment";

/* ── Reason ──────────────────────────────────────────────────────────── */

/** Why this discovery appeared — the UI can display these to the user. */
export type ExploreReason =
  | { kind: "mood-match"; mood: string }
  | { kind: "liked-before"; title: string }
  | { kind: "nearby"; description: string }
  | { kind: "auri-pick"; note?: string }
  | { kind: "creator-follow"; creator: string }
  | { kind: "world-shift"; from: string; to: string }
  | { kind: "unexpected"; note?: string }
  | { kind: "trending"; scope: string }
  | { kind: "new"; note?: string }
  | { kind: "serendipity"; note?: string };

/** Human-readable label for a reason. */
export function reasonLabel(reason: ExploreReason): string {
  switch (reason.kind) {
    case "mood-match":
      return `Because you feel ${reason.mood}`;
    case "liked-before":
      return `Because you liked "${reason.title}"`;
    case "nearby":
      return reason.description;
    case "auri-pick":
      return reason.note ?? "Auri found this for you";
    case "creator-follow":
      return `From ${reason.creator}`;
    case "world-shift":
      return `From ${reason.from}`;
    case "unexpected":
      return reason.note ?? "Something unexpected";
    case "trending":
      return `Trending in ${reason.scope}`;
    case "new":
      return reason.note ?? "Just arrived";
    case "serendipity":
      return reason.note ?? "A door you didn't know was there";
  }
}

/* ── ExploreItem ─────────────────────────────────────────────────────── */

/** A single discovery surfaced by the exploration engine. */
export type ExploreItem = {
  id: string;
  type: DiscoveryType;
  title: string;
  description: string;
  /** Optional gradient/emoji cover — mirrors the existing CoverArtSpec pattern */
  cover?: { gradient: string; emoji: string };
  creator?: string;
  tags?: string[];
  mood?: string;
  /** Why this item appeared — the UI displays this as contextual copy */
  reason: ExploreReason;
  /** Where the item leads — a route the user can navigate to */
  destination: string;
  /** 0–1 relevance score (1 = perfect match, 0 = pure serendipity) */
  relevance: number;
  /** Serendipity bucket: "relevant" | "adjacent" | "surprising" */
  serendipity: "relevant" | "adjacent" | "surprising";
};

/* ── ExploreContext ──────────────────────────────────────────────────── */

/** The current exploration context — what the engine knows about the visitor. */
export type ExploreContext = {
  /** Current mood id (or null) */
  mood: string | null;
  /** Interest tags the user selected during onboarding */
  interests: string[];
  /** IDs of items already seen in this session — prevents repeats */
  seen: string[];
  /** The discovery type the user most recently interacted with */
  lastType?: DiscoveryType;
  /** IDs of creators the user follows (empty until a backend exists) */
  followedCreators: string[];
  /** Session exploration depth — increases with each interaction */
  depth: number;
};

/* ── ExploreResult ───────────────────────────────────────────────────── */

/** The engine's response — a batch of discoveries with metadata. */
export type ExploreResult = {
  items: ExploreItem[];
  /** The context used to generate this result (for debugging/display) */
  context: ExploreContext;
  /** Whether more results are available */
  hasMore: boolean;
  /** Auri's optional whispered suggestion alongside the discoveries */
  auriSuggestion?: string;
};

/* ── Default context ─────────────────────────────────────────────────── */

/** Creates a fresh exploration context. */
export function createExploreContext(overrides?: Partial<ExploreContext>): ExploreContext {
  return {
    mood: null,
    interests: [],
    seen: [],
    followedCreators: [],
    depth: 0,
    ...overrides,
  };
}
