/**
 * The discovery index — one searchable, filterable map of the universe.
 *
 * Every catalog in the content layer (Originals, Stories, Books, Music,
 * Photography, Communities) plus the Creator ecosystem is flattened into a
 * single `UniverseEntry[]`. Search and filtering are pure functions over
 * that index, so /discover stays data-driven and a real search backend can
 * replace the local matching without touching UI.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * async function search(query, filters) → UniverseEntry[]   // future API
 * Replace `searchUniverse` below; the UI consumes it unchanged.
 * ───────────────────────────────────────────────────────────────────────
 */

import {
  ALBUMS,
  BOOKS,
  COMMUNITIES,
  ORIGINALS,
  PHOTOS,
  STORIES,
  type CommunityItem,
  type ContentItem
} from "@/lib/content";
import { CREATORS, type Creator } from "@/lib/creators";

/** A thing in the universe, ready for cards — one shape across all kinds. */
export type UniverseEntry = {
  id: string;
  title: string;
  /** The shelf it lives on: Films / Stories / Books / Music / Photography / Communities / Creators */
  category: string;
  /** Primary attribution */
  by: string;
  description: string;
  gradient: string;
  emoji: string;
  /** Small metadata line, e.g. "1h 42m · Film" */
  meta: string;
  /** Where the card leads */
  href: string;
  /** Searchable tags */
  tags: string[];
  /** Optional 0–5 rating */
  rating?: number;
  /** Optional release status label */
  statusLabel?: string;
  /** Mood ids this speaks to (used by Auri's discovery moments) */
  moods: string[];
};

/** All filter shelves in the same order the segmented control shows them. */
export const UNIVERSE_FILTERS = [
  "All",
  "Films",
  "Stories",
  "Books",
  "Music",
  "Photography",
  "Communities",
  "Creators"
] as const;

export type UniverseFilter = (typeof UNIVERSE_FILTERS)[number];

function fromContent(item: ContentItem & { by?: string; meta?: string }, category: string, href: string, kindLabel: string): UniverseEntry {
  const by = item.creator ?? item.by ?? "";
  const meta = item.meta ?? `${kindLabel}${item.rating ? ` · ${item.rating}★` : ""}`;
  return {
    id: item.id,
    title: item.title,
    category,
    by,
    description: item.description ?? "",
    gradient: item.cover.gradient,
    emoji: item.cover.emoji,
    meta,
    href,
    tags: item.tags ?? [],
    rating: item.rating,
    statusLabel: item.status ? statusLabelFor(item.status) : undefined,
    moods: item.moods
  };
}

/** Friendly chip text for a release status. */
export function statusLabelFor(status: "new" | "coming-soon" | "featured"): string {
  switch (status) {
    case "new":
      return "New";
    case "coming-soon":
      return "Coming soon";
    case "featured":
      return "Featured";
  }
}

function fromCommunity(community: CommunityItem): UniverseEntry {
  return {
    id: community.id,
    title: community.name,
    category: "Communities",
    by: `${community.members.toLocaleString()} souls`,
    description: community.description ?? community.tagline,
    gradient: community.gradient,
    emoji: community.avatars[0] ?? "✦",
    meta: community.tagline,
    href: "/communities",
    tags: community.tags ?? [],
    moods: []
  };
}

function fromCreator(creator: Creator): UniverseEntry {
  return {
    id: creator.id,
    title: creator.name,
    category: "Creators",
    by: creator.handle,
    description: creator.bio,
    gradient: creator.gradient,
    emoji: creator.avatar,
    meta: `${creator.followers.toLocaleString()} followers`,
    href: `/creators/${creator.id}`,
    tags: [...creator.categories, creator.name.toLowerCase()],
    moods: []
  };
}

/** Every discoverable thing in the universe, in a stable catalog order. */
export const UNIVERSE: UniverseEntry[] = [
  ...ORIGINALS.map((item) => fromContent(item, "Films", `/originals/${item.id}`, item.type)),
  ...STORIES.map((item) => fromContent(item, "Stories", "/home#memories", "Story")),
  ...BOOKS.map((item) => fromContent(item, "Books", "/books", "Book")),
  ...ALBUMS.map((item) => fromContent(item, "Music", "/music", "Album")),
  ...PHOTOS.map((item) => fromContent(item, "Photography", "/photography", "Photo")),
  ...COMMUNITIES.map(fromCommunity),
  ...CREATORS.map(fromCreator)
];

/** Normalizes a query for matching — lowercased, de-accented, trimmed. */
function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function matches(entry: UniverseEntry, needle: string): boolean {
  const haystack = normalize(
    [entry.title, entry.by, entry.category, entry.description, ...entry.tags].join(" ")
  );
  return haystack.includes(needle);
}

/**
 * Filters + searches any entry collection. Pure and deterministic:
 * `query` matches title/creator/description/tags; `filter` narrows the shelf.
 * Empty query returns the whole (filtered) shelf — the /discover browsing state.
 *
 * Accepts any `UniverseEntry[]`, so the same UI searches the static catalog
 * (`searchUniverse`) or live server data (`listPublishedContent`) unchanged.
 */
export function searchEntries(entries: UniverseEntry[], query: string, filter: UniverseFilter = "All"): UniverseEntry[] {
  const needle = normalize(query);
  const filtered = filter === "All" ? entries : entries.filter((entry) => entry.category === filter);
  if (!needle) return filtered;
  return filtered.filter((entry) => matches(entry, needle));
}

/** Filters + searches the static catalog — the original browsing state. */
export function searchUniverse(query: string, filter: UniverseFilter = "All"): UniverseEntry[] {
  return searchEntries(UNIVERSE, query, filter);
}

/** Counts per shelf for any collection — how much lives in each corner. */
export function entryCounts(entries: UniverseEntry[]): Record<UniverseFilter, number> {
  const counts = Object.fromEntries(UNIVERSE_FILTERS.map((f) => [f, 0])) as Record<UniverseFilter, number>;
  for (const entry of entries) {
    const key = entry.category as UniverseFilter;
    if (key in counts) counts[key] += 1;
  }
  counts.All = entries.length;
  return counts;
}

/** Counts per shelf over the static catalog. */
export function universeCounts(): Record<UniverseFilter, number> {
  return entryCounts(UNIVERSE);
}
