/**
 * The Continue-Journey layer — the quiet doorway back into unfinished worlds.
 *
 * Today these are deterministic mock items (a story, a film, an album in
 * progress). This module is the integration point for real activity data
 * (unfinished content, recently viewed books/music/saved pieces): keep the
 * `JourneyItem` shape, replace `MOCK_JOURNEY` with data from the backend,
 * and the section renders it unchanged.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * const items = await fetch("/api/journey");  // → JourneyItem[]
 * ───────────────────────────────────────────────────────────────────────
 */

import type { ContentBadge } from "@/lib/content";

export type JourneyItem = {
  id: string;
  title: string;
  /** Small uppercase line — e.g. "Story · Chapter 4" */
  kind: string;
  /** Completion 0–1 — renders a progress line */
  progress: number;
  meta: string;
  gradient: string;
  emoji: string;
  badge: ContentBadge;
  /** Where the card leads — resolved per surface by the section */
  href: string;
};

/** Mock progress — real activity replaces this later. */
export const MOCK_JOURNEY: JourneyItem[] = [
  {
    id: "lighthouse",
    title: "The Lighthouse Keeper",
    kind: "Story · Chapter 4",
    progress: 0.62,
    meta: "12 min left",
    gradient: "from-purple-600 to-indigo-600",
    emoji: "🌊",
    badge: { label: "Resume", tone: "mood" },
    href: "#memories"
  },
  {
    id: "horizon",
    title: "Horizon",
    kind: "Original film · 1h 42m",
    progress: 0.4,
    meta: "1h 02m left",
    gradient: "from-amber-500 to-orange-600",
    emoji: "🌅",
    badge: { label: "Watching", tone: "warm" },
    href: "#originals"
  },
  {
    id: "rainfall",
    title: "Rainfall Studies",
    kind: "Album · Track 6 of 14",
    progress: 0.46,
    meta: "8 tracks left",
    gradient: "from-cyan-600 to-blue-700",
    emoji: "🌧",
    badge: { label: "Listening", tone: "emerald" },
    href: "#music"
  }
];
