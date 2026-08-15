/**
 * The WithIn creator ecosystem.
 *
 * Creators are the people who make the universe: they publish stories,
 * albums, films and photographs, run communities, and — eventually — submit
 * Originals, earn, and build profiles. Today this is a deterministic mock
 * catalog shaped so a real creator backend can replace it later: keep the
 * `Creator` shape, swap `CREATORS` for fetched data, and every surface
 * (creators page, profile, badges, discovery) renders unchanged.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * const creators = await fetch("/api/creators");   // → Creator[]
 * ───────────────────────────────────────────────────────────────────────
 */

/** Subtle labels that say what a creator is — never a fake verification claim. */
export type CreatorBadgeType =
  | "creator"
  | "within-original"
  | "featured"
  | "rising"
  | "studio";

export type Creator = {
  id: string;
  name: string;
  handle: string;
  /** One-line presence — the first thing someone reads about them */
  bio: string;
  /** Longer profile text for the creator detail page */
  story?: string;
  /** Emoji avatar — no image assets yet, the visual language stays gradient + glyph */
  avatar: string;
  /** Tailwind gradient stops for the avatar halo */
  gradient: string;
  /** Which corners of the universe they work in */
  categories: string[];
  /** Badges — keep honest: only "within-original"/"featured" claim special standing */
  badges: CreatorBadgeType[];
  /** Mock follower count */
  followers: number;
  /** Featured work id (matches content ids where possible) */
  featuredWorkId?: string;
  /** Works they've published — titles + kind, resolved to routes per surface */
  works: { id: string; title: string; kind: string }[];
  /** True when the profile should read as a studio rather than an individual */
  studio?: boolean;
};

/** The badge vocabulary — label + tone for the chip. */
export const CREATOR_BADGES: Record<CreatorBadgeType, { label: string; tone: "mood" | "emerald" | "warm" | "neutral" }> = {
  creator: { label: "Creator", tone: "neutral" },
  "within-original": { label: "WithIn Original", tone: "emerald" },
  featured: { label: "Featured", tone: "mood" },
  rising: { label: "Rising", tone: "warm" },
  studio: { label: "Studio", tone: "neutral" }
};

/** The deterministic mock catalog — replace with a backend fetch later. */
export const CREATORS: Creator[] = [
  {
    id: "mira-okoye",
    name: "Mira Okoye",
    handle: "@miraokoye",
    bio: "Filmmaker of quiet skies. Salt & Stars is her first WithIn Original.",
    story:
      "Mira started shooting desert light on her phone during a cross-country drive and never put it down. Salt & Stars grew from a single frame she couldn't let go of — two strangers, one horizon, and the long silence between them.",
    avatar: "🌌",
    gradient: "from-purple-600 to-indigo-600",
    categories: ["Film", "Stories"],
    badges: ["creator", "within-original", "featured"],
    followers: 12840,
    featuredWorkId: "salt-stars",
    works: [
      { id: "salt-stars", title: "Salt & Stars", kind: "Film" },
      { id: "salt-flats", title: "Salt flats at dusk", kind: "Photography" }
    ]
  },
  {
    id: "quiet-studio",
    name: "The Quiet Studio",
    handle: "@quietstudio",
    bio: "A studio that makes things to feel slowly — series, books, and sound.",
    story:
      "The Quiet Studio is a small collective that believes attention is the rarest material. Every project is made slowly, in the same room, with the same light. The Quiet Tide is their longest conversation with the sea yet.",
    avatar: "🌊",
    gradient: "from-cyan-500 to-blue-700",
    categories: ["Series", "Books"],
    badges: ["studio", "within-original"],
    followers: 9602,
    featuredWorkId: "quiet-tide",
    works: [
      { id: "quiet-tide", title: "The Quiet Tide", kind: "Series" },
      { id: "tide-returns", title: "The Tide Returns", kind: "Book" }
    ],
    studio: true
  },
  {
    id: "elena-marek",
    name: "Elena Marek",
    handle: "@elenamarek",
    bio: "Writes folded maps for people who got lost on purpose.",
    story:
      "Elena's books are quiet, intricate things — paper constellations, tide charts, gardens that only bloom at night. Paper Constellations began as a letter to her younger self about what it means to choose the long way home.",
    avatar: "🪐",
    gradient: "from-emerald-500 to-teal-700",
    categories: ["Books"],
    badges: ["creator", "rising"],
    followers: 4187,
    featuredWorkId: "paper-constellations-book",
    works: [
      { id: "paper-constellations-book", title: "Paper Constellations", kind: "Book" },
      { id: "garden-whispers", title: "Garden Whispers", kind: "Book" }
    ]
  },
  {
    id: "nocturne",
    name: "Nocturne",
    handle: "@nocturnemusic",
    bio: "Slow-burn soundscapes for the inspired hour after midnight.",
    story:
      "Nocturne composes in the dark hours, one loop at a time. Embers is nine tracks written for people who are still awake because they're still making something.",
    avatar: "🔥",
    gradient: "from-orange-500 to-rose-700",
    categories: ["Music"],
    badges: ["creator", "rising"],
    followers: 15320,
    featuredWorkId: "embers",
    works: [
      { id: "embers", title: "Embers", kind: "Album" },
      { id: "rainfall", title: "Rainfall Studies", kind: "Album" }
    ]
  },
  {
    id: "lena-vos",
    name: "Lena Vos",
    handle: "@lenavos",
    bio: "Photographs the places where the sky gives up.",
    story:
      "Lena waits. For the light to lean a certain way, for the ferry to leave, for the tide to admit it's coming in. Her frames are kept deliberately quiet so the feeling has room.",
    avatar: "🌅",
    gradient: "from-amber-500 to-orange-600",
    categories: ["Photography"],
    badges: ["creator", "featured"],
    followers: 8821,
    featuredWorkId: "salt-flats",
    works: [
      { id: "salt-flats", title: "Salt flats at dusk", kind: "Photography" },
      { id: "last-ferry", title: "The last ferry", kind: "Photography" },
      { id: "midnight-garden", title: "Midnight Garden", kind: "Film" }
    ]
  },
  {
    id: "ibrahim-cole",
    name: "Ibrahim Cole",
    handle: "@ibrahimcole",
    bio: "Stories about going home, and what it costs.",
    story:
      "Ibrahim writes and directs from the city he left and the city he returned to. Echoes of Home is six episodes about the doors we keep open — and the ones we finally walk through.",
    avatar: "🏠",
    gradient: "from-amber-500 to-orange-700",
    categories: ["Series", "Stories"],
    badges: ["creator", "within-original"],
    followers: 7394,
    featuredWorkId: "echoes-home",
    works: [
      { id: "echoes-home", title: "Echoes of Home", kind: "Series" },
      { id: "horizon", title: "Horizon", kind: "Film" }
    ]
  },
  {
    id: "mira-chen",
    name: "Mira Chen",
    handle: "@mirachen",
    bio: "Night city photographer. Rain is her favorite weather.",
    story:
      "Mira shoots the city after everyone has gone home — rain on glass, neon blur, one lit window in a dark tower. Every frame is a small proof that someone is still awake.",
    avatar: "🌧",
    gradient: "from-slate-500 to-slate-800",
    categories: ["Photography"],
    badges: ["creator"],
    followers: 5213,
    featuredWorkId: "rain-on-glass",
    works: [
      { id: "rain-on-glass", title: "Rain on glass", kind: "Photography" },
      { id: "lonely-star", title: "A lonely star", kind: "Photography" }
    ]
  },
  {
    id: "sofia-marchetti",
    name: "Sofia Marchetti",
    handle: "@sofiamarchetti",
    bio: "Films the last light of beautiful things.",
    story:
      "Sofia's cinema is about endings — of seasons, cities, eras — filmed as if they were beginnings. The Last Aurora is her meditation on what remains when the light goes.",
    avatar: "🌠",
    gradient: "from-fuchsia-500 to-purple-700",
    categories: ["Film"],
    badges: ["creator", "within-original"],
    followers: 10876,
    featuredWorkId: "last-aurora",
    works: [
      { id: "last-aurora", title: "The Last Aurora", kind: "Film" },
      { id: "first-light", title: "First light", kind: "Photography" }
    ]
  }
];

/** Resolves a creator by id (undefined for unknown ids — callers render a fallback). */
export function getCreator(id: string): Creator | undefined {
  return CREATORS.find((creator) => creator.id === id);
}
