/**
 * The WithIn content layer — every piece of content the sanctuary shows,
 * typed and separated from the UI.
 *
 * These are deterministic mock catalogs today. Each item carries `moods` and
 * `times` tags so the recommendation engine (lib/recommendations.ts) can
 * respond to the environment without hard-coding section logic. When a real
 * catalog/backend exists, replace these constants with fetched data of the
 * same shapes — components do not change.
 */

import type { MoodId } from "@/lib/mood";
import type { TimePeriod } from "@/lib/auri";

/** The broad kinds of content in the universe. */
export type ContentKind = "story" | "film" | "series" | "book" | "album" | "photo";

/** A badge chip — label plus optional material tone. */
export type ContentBadge = {
  label: string;
  tone?: "mood" | "emerald" | "neutral" | "warm";
};

/** Minimal cover spec consumed by CoverArt. */
export type CoverArtSpec = {
  gradient: string;
  emoji: string;
  className?: string;
};

/** Release status labels — mock, never real release claims. */
export type ReleaseStatus = "new" | "coming-soon" | "featured";

/** Base shape every content item shares. */
export type ContentItem = {
  id: string;
  title: string;
  kind: ContentKind;
  /** Primary attribution — some catalogs name it artist/author/by instead. */
  creator?: string;
  cover: CoverArtSpec;
  description?: string;
  meta?: string;
  /** Which moods this piece speaks to (recommendation input). */
  moods: MoodId[];
  /** Which times of day this piece suits (recommendation input). */
  times: TimePeriod[];
  /* ── Discovery taxonomy — powers search, filtering, and the universe index. */
  /** Human category label for filtering, e.g. "Film" / "Music" / "Books" */
  category?: string;
  /** Free-form tags for search, e.g. "desert", "rain", "late-night" */
  tags?: string[];
  /** 0–5 editorial rating (mock) */
  rating?: number;
  /** Mock release/kept date — "2026-04" style */
  releaseDate?: string;
  /** Release status label (NEW / COMING SOON / FEATURED) */
  status?: ReleaseStatus;
};

/* ── Originals ───────────────────────────────────────────────────────── */

export type OriginalItem = ContentItem & {
  kind: "film" | "series" | "book";
  type: "Film" | "Series" | "Book";
  duration: string;
};

/* ── Stories ─────────────────────────────────────────────────────────── */

export type StoryItem = ContentItem & {
  kind: "story";
  /** Reading time, e.g. "6 min read" */
  readTime: string;
  by: string;
};

/** Short stories — the quietest shelf in the universe. */
export const STORIES: StoryItem[] = [
  {
    id: "letters-to-the-moon",
    title: "Letters to the Moon",
    by: "Noor Adeyemi",
    readTime: "6 min read",
    kind: "story",
    cover: { gradient: "from-pink-600 to-rose-500", emoji: "💌" },
    description: "Every night a girl writes to the moon — tonight, the moon writes back.",
    meta: "6 min read",
    category: "Stories",
    tags: ["moon", "letters", "quiet"],
    rating: 4.8,
    releaseDate: "2026-03",
    status: "new",
    moods: ["reflective", "hopeful"],
    times: ["night", "evening"]
  },
  {
    id: "lighthouse-keeper",
    title: "The Lighthouse Keeper",
    by: "Jonas Wu",
    readTime: "8 min read",
    kind: "story",
    cover: { gradient: "from-purple-600 to-indigo-600", emoji: "🌊" },
    description: "A keeper tends a light for ships that no longer exist — until a letter arrives from the water.",
    meta: "8 min read",
    category: "Stories",
    tags: ["sea", "lighthouse", "letters"],
    rating: 4.9,
    releaseDate: "2026-01",
    status: "featured",
    moods: ["lost", "reflective"],
    times: ["night"]
  },
  {
    id: "what-the-rain-remembers",
    title: "What the Rain Remembers",
    by: "Priya Nair",
    readTime: "5 min read",
    kind: "story",
    cover: { gradient: "from-slate-500 to-slate-800", emoji: "🌧" },
    description: "A city, a downpour, and the things people say to strangers under one awning.",
    meta: "5 min read",
    category: "Stories",
    tags: ["rain", "city", "strangers"],
    rating: 4.6,
    releaseDate: "2026-04",
    status: "new",
    moods: ["calm", "lost"],
    times: ["evening", "night"]
  },
  {
    id: "the-ember-fields",
    title: "The Ember Fields",
    by: "Omar Hale",
    readTime: "7 min read",
    kind: "story",
    cover: { gradient: "from-orange-500 to-red-700", emoji: "🔥" },
    description: "After the fires, a girl learns to read the fields by the warmth they keep.",
    meta: "7 min read",
    category: "Stories",
    tags: ["fire", "fields", "renewal"],
    rating: 4.7,
    releaseDate: "2026-02",
    status: "featured",
    moods: ["hopeful", "inspired"],
    times: ["evening"]
  },
  {
    id: "the-last-ferry-2am",
    title: "The Last Ferry, 2 a.m.",
    by: "Lena Vos",
    readTime: "4 min read",
    kind: "story",
    cover: { gradient: "from-teal-600 to-emerald-800", emoji: "⛴" },
    description: "Every light on the water is a person going home — one of them isn't.",
    meta: "4 min read",
    category: "Stories",
    tags: ["ferry", "night", "harbor"],
    rating: 4.5,
    releaseDate: "2026-05",
    status: "new",
    moods: ["reflective", "peaceful"],
    times: ["night"]
  }
];

export const ORIGINALS: OriginalItem[] = [
  {
    id: "salt-stars",
    title: "Salt & Stars",
    type: "Film",
    duration: "1h 42m",
    creator: "Mira Okoye",
    kind: "film",
    cover: { gradient: "from-purple-600 via-indigo-600 to-blue-600", emoji: "🌌" },
    description: "Two strangers, one desert, a horizon that refuses to stay still. An original film about leaving everything to find anyone.",
    category: "Films",
    tags: ["desert", "journey", "strangers"],
    rating: 4.9,
    releaseDate: "2026-04",
    status: "featured",
    moods: ["curious", "reflective"],
    times: ["evening", "night"]
  },
  {
    id: "quiet-tide",
    title: "The Quiet Tide",
    type: "Series",
    duration: "8 eps",
    creator: "The Quiet Studio",
    kind: "series",
    cover: { gradient: "from-cyan-500 to-blue-700", emoji: "🌊" },
    description: "Eight episodes of a small town learning to listen to the sea.",
    category: "Films",
    tags: ["sea", "small-town", "slow"],
    rating: 4.7,
    releaseDate: "2026-02",
    status: "new",
    moods: ["calm", "reflective"],
    times: ["afternoon", "evening"]
  },
  {
    id: "paper-constellations",
    title: "Paper Constellations",
    type: "Book",
    duration: "224 pages",
    creator: "Noor Adeyemi",
    kind: "book",
    cover: { gradient: "from-emerald-500 to-teal-700", emoji: "🪐" },
    description: "A book of folded maps for people who got lost on purpose.",
    category: "Books",
    tags: ["maps", "constellations", "wandering"],
    rating: 4.8,
    releaseDate: "2026-03",
    status: "new",
    moods: ["curious", "inspired"],
    times: ["morning", "afternoon"]
  },
  {
    id: "midnight-garden",
    title: "Midnight Garden",
    type: "Film",
    duration: "58 min",
    creator: "Lena Voss",
    kind: "film",
    cover: { gradient: "from-pink-500 to-rose-700", emoji: "🌸" },
    description: "A garden that only blooms at night — and the two people who keep its secret.",
    category: "Films",
    tags: ["garden", "night", "secret"],
    rating: 4.6,
    releaseDate: "2026-05",
    status: "new",
    moods: ["calm", "hopeful"],
    times: ["night"]
  },
  {
    id: "echoes-home",
    title: "Echoes of Home",
    type: "Series",
    duration: "6 eps",
    creator: "Ibrahim Cole",
    kind: "series",
    cover: { gradient: "from-amber-500 to-orange-700", emoji: "🏠" },
    description: "Six episodes about the doors we keep open — and the ones we finally walk through.",
    category: "Films",
    tags: ["home", "family", "return"],
    rating: 4.7,
    releaseDate: "2026-01",
    status: "featured",
    moods: ["hopeful", "reflective"],
    times: ["morning", "evening"]
  },
  {
    id: "last-aurora",
    title: "The Last Aurora",
    type: "Film",
    duration: "1h 12m",
    creator: "Sofia Marchetti",
    kind: "film",
    cover: { gradient: "from-fuchsia-500 to-purple-700", emoji: "🌠" },
    description: "What remains when the light goes — a meditation on endings filmed as beginnings.",
    category: "Films",
    tags: ["aurora", "light", "endings"],
    rating: 4.8,
    releaseDate: "2026-06",
    status: "coming-soon",
    moods: ["inspired", "lost"],
    times: ["night"]
  }
];

/* ── Music ───────────────────────────────────────────────────────────── */

export type MusicItem = ContentItem & {
  kind: "album";
  artist: string;
  tracks: number;
};

export const ALBUMS: MusicItem[] = [
  {
    id: "tide",
    title: "Tide & Silence",
    artist: "Lumen",
    tracks: 12,
    kind: "album",
    cover: { gradient: "from-cyan-500 to-blue-700", emoji: "🌊" },
    description: "Slow tides and softer breathing — ambient blooms for the afternoon.",
    category: "Music",
    tags: ["ambient", "tides", "slow"],
    rating: 4.5,
    releaseDate: "2026-02",
    status: "featured",
    moods: ["calm", "peaceful"],
    times: ["afternoon", "evening"]
  },
  {
    id: "embers",
    title: "Embers",
    artist: "Nocturne",
    tracks: 9,
    kind: "album",
    cover: { gradient: "from-orange-500 to-rose-700", emoji: "🔥" },
    description: "Slow-burn soundscapes for the inspired hour after midnight.",
    category: "Music",
    tags: ["soundscapes", "midnight", "warm"],
    rating: 4.6,
    releaseDate: "2026-03",
    status: "new",
    moods: ["inspired", "motivated"],
    times: ["night"]
  },
  {
    id: "rainfall",
    title: "Rainfall Studies",
    artist: "Aster",
    tracks: 14,
    kind: "album",
    cover: { gradient: "from-indigo-500 to-slate-700", emoji: "🌧" },
    description: "Fourteen studies of rain, from drizzle to downpour.",
    category: "Music",
    tags: ["rain", "studies", "night"],
    rating: 4.4,
    releaseDate: "2026-04",
    status: "featured",
    moods: ["lost", "reflective"],
    times: ["evening", "night"]
  },
  {
    id: "garden",
    title: "Night Garden",
    artist: "Mira",
    tracks: 10,
    kind: "album",
    cover: { gradient: "from-emerald-500 to-teal-700", emoji: "🌱" },
    description: "Ambient blooms for late hours — soft synths, slower breathing.",
    category: "Music",
    tags: ["garden", "night", "ambient"],
    rating: 4.7,
    releaseDate: "2026-05",
    status: "new",
    moods: ["calm", "hopeful"],
    times: ["night"]
  }
];

/* ── Books ───────────────────────────────────────────────────────────── */

export type BookItem = ContentItem & {
  kind: "book";
  author: string;
  progress: number;
  chapter: string;
  meta: string;
};

export const BOOKS: BookItem[] = [
  {
    id: "paper-constellations-book",
    title: "Paper Constellations",
    author: "Elena Marek",
    progress: 0.44,
    chapter: "Chapter 4 of 9",
    meta: "84 pages left",
    kind: "book",
    cover: { gradient: "from-emerald-500 to-teal-700", emoji: "🪐" },
    description: "A book of folded maps for people who got lost on purpose.",
    category: "Books",
    tags: ["maps", "constellations", "wandering"],
    rating: 4.8,
    releaseDate: "2026-03",
    status: "featured",
    moods: ["curious", "reflective"],
    times: ["morning", "afternoon"]
  },
  {
    id: "tide-returns",
    title: "The Tide Returns",
    author: "Jonas Wu",
    progress: 0.71,
    chapter: "Chapter 7 of 10",
    meta: "38 pages left",
    kind: "book",
    cover: { gradient: "from-sky-500 to-indigo-700", emoji: "🌊" },
    description: "A coastal town learns that the sea gives everything back, eventually.",
    category: "Books",
    tags: ["sea", "tide", "return"],
    rating: 4.6,
    releaseDate: "2026-01",
    status: "new",
    moods: ["calm", "lost"],
    times: ["afternoon", "evening"]
  },
  {
    id: "garden-whispers",
    title: "Garden Whispers",
    author: "Priya Nair",
    progress: 0.18,
    chapter: "Chapter 1 of 8",
    meta: "212 pages left",
    kind: "book",
    cover: { gradient: "from-rose-500 to-pink-700", emoji: "🌸" },
    description: "What a garden says when no one is listening closely enough.",
    category: "Books",
    tags: ["garden", "whispers", "growth"],
    rating: 4.5,
    releaseDate: "2026-02",
    status: "new",
    moods: ["hopeful", "peaceful"],
    times: ["morning"]
  },
  {
    id: "light-keepers",
    title: "Light Keepers",
    author: "Omar Hale",
    progress: 0.92,
    chapter: "Epilogue",
    meta: "6 pages left",
    kind: "book",
    cover: { gradient: "from-amber-500 to-orange-700", emoji: "🏮" },
    description: "Four generations of a family who kept a lantern lit on the same hill.",
    category: "Books",
    tags: ["light", "family", "lantern"],
    rating: 4.9,
    releaseDate: "2025-11",
    status: "featured",
    moods: ["inspired", "motivated"],
    times: ["evening", "night"]
  }
];

/* ── Photography ─────────────────────────────────────────────────────── */

export type PhotoItem = ContentItem & {
  kind: "photo";
  by: string;
  caption: string;
  place: string;
  /** Anchors the first frame as the tall centerpiece of the wall. */
  tall?: boolean;
};

export const PHOTOS: PhotoItem[] = [
  {
    id: "salt-flats",
    title: "Salt flats at dusk",
    by: "Lena Vos",
    caption: "The sky folded into the ground and forgot which one it was.",
    place: "Salar de Uyuni",
    kind: "photo",
    cover: { gradient: "from-purple-600 via-indigo-600 to-slate-800", emoji: "🌅" },
    tall: true,
    category: "Photography",
    tags: ["salt flats", "dusk", "mirror"],
    rating: 4.9,
    releaseDate: "2026-03",
    status: "featured",
    moods: ["reflective", "lost"],
    times: ["evening"]
  },
  {
    id: "quiet-tide-photo",
    title: "The quiet tide",
    by: "Omar Hale",
    caption: "It came in the way patience does — without being asked.",
    place: "Pacific coast",
    kind: "photo",
    cover: { gradient: "from-cyan-600 to-blue-800", emoji: "🌊" },
    category: "Photography",
    tags: ["tide", "coast", "patience"],
    rating: 4.6,
    releaseDate: "2026-04",
    status: "new",
    moods: ["calm", "peaceful"],
    times: ["afternoon"]
  },
  {
    id: "first-light",
    title: "First light",
    by: "Priya Nair",
    caption: "Morning arrived as a rumor, then proved itself.",
    place: "High atlas",
    kind: "photo",
    cover: { gradient: "from-amber-500 to-orange-700", emoji: "🏔" },
    category: "Photography",
    tags: ["dawn", "mountains", "light"],
    rating: 4.7,
    releaseDate: "2026-01",
    status: "featured",
    moods: ["hopeful", "inspired"],
    times: ["morning"]
  },
  {
    id: "lonely-star",
    title: "A lonely star",
    by: "Jonas Wu",
    caption: "One point of light, keeping its whole desert company.",
    place: "Namib desert",
    kind: "photo",
    cover: { gradient: "from-slate-700 to-slate-900", emoji: "⭐" },
    category: "Photography",
    tags: ["star", "desert", "night"],
    rating: 4.5,
    releaseDate: "2026-05",
    status: "new",
    moods: ["lost", "reflective"],
    times: ["night"]
  },
  {
    id: "rain-on-glass",
    title: "Rain on glass",
    by: "Mira Chen",
    caption: "The city blurred itself kindly for one night.",
    place: "Old town, 3 a.m.",
    kind: "photo",
    cover: { gradient: "from-slate-500 to-slate-800", emoji: "🌧" },
    category: "Photography",
    tags: ["rain", "city", "night"],
    rating: 4.4,
    releaseDate: "2026-02",
    status: "new",
    moods: ["lost", "calm"],
    times: ["night"]
  },
  {
    id: "last-ferry",
    title: "The last ferry",
    by: "Lena Vos",
    caption: "Every light here is a person going home.",
    place: "Harbor at night",
    kind: "photo",
    cover: { gradient: "from-teal-600 to-emerald-800", emoji: "⛴" },
    category: "Photography",
    tags: ["ferry", "harbor", "night"],
    rating: 4.8,
    releaseDate: "2026-06",
    status: "new",
    moods: ["reflective", "peaceful"],
    times: ["evening", "night"]
  }
];

/* ── Communities ─────────────────────────────────────────────────────── */

export type CommunityItem = {
  id: string;
  name: string;
  tagline: string;
  members: number;
  avatars: string[];
  gradient: string;
  category?: string;
  tags?: string[];
  description?: string;
};

export const COMMUNITIES: CommunityItem[] = [
  {
    id: "moonwater",
    name: "Moonwater",
    tagline: "For those who feel too much, too quietly.",
    members: 1284,
    avatars: ["🌙", "🌊", "✨"],
    gradient: "from-indigo-500 to-slate-700",
    category: "Feeling",
    tags: ["quiet", "night", "feelings"],
    description: "A room for people who feel too much, too quietly — no fixing, only company."
  },
  {
    id: "dawn-chorus",
    name: "Dawn Chorus",
    tagline: "Morning people writing their way into the light.",
    members: 2319,
    avatars: ["🌅", "🕊", "☕"],
    gradient: "from-amber-500 to-orange-600",
    category: "Writing",
    tags: ["morning", "writing", "light"],
    description: "Morning people writing their way into the light, one page at a time."
  },
  {
    id: "unsent",
    name: "Letters We Never Sent",
    tagline: "Unsent words, beautifully kept.",
    members: 875,
    avatars: ["💌", "🕯", "📮"],
    gradient: "from-rose-500 to-pink-700",
    category: "Writing",
    tags: ["letters", "unsent", "words"],
    description: "Unsent words, beautifully kept — a room for the letters we almost sent."
  },
  {
    id: "ember-club",
    name: "Ember Club",
    tagline: "Small fires, slow conversations.",
    members: 1560,
    avatars: ["🔥", "🪵", "🌌"],
    gradient: "from-orange-500 to-red-700",
    category: "Conversation",
    tags: ["fires", "conversation", "slow"],
    description: "Small fires, slow conversations — a room that never hurries."
  }
];

/* ── Recommended picks ───────────────────────────────────────────────── */

export type PickItem = ContentItem & {
  kind: ContentKind;
  badges: ContentBadge[];
  /** Where the card leads — resolved per surface by the section */
  href: string;
};

/** Auri's deck — hand-picked, then ranked live by the recommendation engine. */
export const PICKS: PickItem[] = [
  {
    id: "letters",
    title: "Letters to the Moon",
    kind: "story",
    creator: "Auri's pick for you",
    description: "Every night a girl writes to the moon — tonight, the moon writes back.",
    cover: { gradient: "from-pink-600 to-rose-500", emoji: "💌" },
    badges: [{ label: "For you", tone: "mood" }],
    meta: "6 min read",
    href: "#memories",
    moods: ["reflective", "hopeful"],
    times: ["night", "evening"]
  },
  {
    id: "constellations",
    title: "Paper Constellations",
    kind: "book",
    creator: "WithIn Originals",
    description: "A book of folded maps for people who got lost on purpose.",
    cover: { gradient: "from-emerald-500 to-teal-700", emoji: "🪐" },
    badges: [{ label: "New", tone: "emerald" }],
    meta: "Book · 224 pages",
    href: "#originals",
    moods: ["curious", "inspired"],
    times: ["morning", "afternoon"]
  },
  {
    id: "night-garden",
    title: "Night Garden",
    kind: "album",
    creator: "Mira",
    description: "Ambient blooms for late hours — soft synths, slower breathing.",
    cover: { gradient: "from-emerald-500 to-teal-700", emoji: "🌱" },
    badges: [{ label: "Calm", tone: "emerald" }],
    meta: "Album · 10 tracks",
    href: "#music",
    moods: ["calm", "peaceful"],
    times: ["evening", "night"]
  },
  {
    id: "quiet-tide-pick",
    title: "The Quiet Tide",
    kind: "series",
    creator: "WithIn Originals",
    description: "Eight episodes of a small town learning to listen to the sea.",
    cover: { gradient: "from-cyan-500 to-blue-700", emoji: "🌊" },
    badges: [{ label: "Trending", tone: "warm" }],
    meta: "Series · 8 eps",
    href: "#originals",
    moods: ["calm", "reflective"],
    times: ["afternoon", "evening"]
  },
  {
    id: "embers-pick",
    title: "Embers",
    kind: "album",
    creator: "Nocturne",
    description: "Slow-burn soundscapes for the inspired hour after midnight.",
    cover: { gradient: "from-orange-500 to-rose-700", emoji: "🔥" },
    badges: [{ label: "Trending", tone: "warm" }],
    meta: "Album · 9 tracks",
    href: "#music",
    moods: ["inspired", "motivated"],
    times: ["night"]
  },
  {
    id: "salt-stars-pick",
    title: "Salt & Stars",
    kind: "film",
    creator: "WithIn Originals",
    description: "Two strangers, one desert, a horizon that refuses to stay still.",
    cover: { gradient: "from-purple-600 via-indigo-600 to-blue-600", emoji: "🌌" },
    badges: [{ label: "Featured", tone: "mood" }],
    meta: "Film · 1h 42m",
    href: "#originals",
    moods: ["curious", "reflective"],
    times: ["evening", "night"]
  }
];
