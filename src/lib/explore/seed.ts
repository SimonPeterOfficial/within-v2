/**
 * Seed data — converts existing WithIn content catalogs into ExploreItems.
 *
 * This is the bridge between the current mock catalogs and the exploration
 * engine. When a real CMS exists, replace this module with an API fetch
 * that returns ExploreItem[].
 */

import type { ExploreItem, DiscoveryType, ExploreReason } from "./types";
import { ORIGINALS, STORIES, ALBUMS, BOOKS, PHOTOS, COMMUNITIES } from "@/lib/content";
import { CREATORS } from "@/lib/creators";

/* ── Auri's conversational suggestions ───────────────────────────────── */

export type AuriSuggestion = {
  id: string;
  text: string;
  /** Contexts where this suggestion feels natural */
  contexts: string[];
};

export const AURI_SUGGESTIONS: AuriSuggestion[] = [
  { id: "take-me-somewhere", text: "Take me somewhere.", contexts: ["start", "stuck", "bored"] },
  { id: "peaceful", text: "I want something peaceful.", contexts: ["calm", "night", "tired"] },
  { id: "beautiful", text: "Show me something beautiful.", contexts: ["start", "curious"] },
  { id: "story", text: "I want a story.", contexts: ["start", "reflective"] },
  { id: "discover", text: "Who should I discover?", contexts: ["start", "curious", "social"] },
  { id: "curious", text: "I'm curious.", contexts: ["start", "curious"] },
  { id: "music", text: "Play something.", contexts: ["evening", "night", "calm"] },
  { id: "inspired", text: "I want to feel inspired.", contexts: ["morning", "motivated"] },
  { id: "surprise", text: "Surprise me.", contexts: ["start", "bored", "adventurous"] },
  { id: "deep", text: "Something deep.", contexts: ["night", "reflective", "lost"] },
  { id: "lost", text: "I feel a little lost.", contexts: ["lost", "night", "reflective"] },
  { id: "quiet", text: "Something quiet.", contexts: ["calm", "morning", "night"] },
  { id: "wonder", text: "I wonder what's here.", contexts: ["start", "curious", "morning"] },
  { id: "warmth", text: "Something warm.", contexts: ["evening", "night", "inspired"] },
];

/* ── Auri's whispered transitions ────────────────────────────────────── */

export const AURI_WHISPERS = {
  discovery: [
    "Let's see where this leads.",
    "I found something.",
    "Come with me.",
    "There's a door here.",
    "Look at this.",
    "This one chose you.",
    "Trust me on this one.",
    "Step through.",
  ],
  unexpected: [
    "This wasn't what you asked for.",
    "Maybe that's the point.",
    "Something different.",
    "A side path.",
    "The universe insists.",
    "You didn't know you needed this.",
  ],
  journey: [
    "Here's where you've been.",
    "You found this because...",
    "Your universe is forming.",
    "Every path led here.",
  ],
  door: [
    "There's something I didn't show you.",
    "You haven't seen this part yet.",
    "One more door.",
  ],
};

/* ── Conversion helpers ──────────────────────────────────────────────── */

function makeExploreItem(
  id: string,
  type: DiscoveryType,
  title: string,
  description: string,
  cover: { gradient: string; emoji: string } | undefined,
  reason: ExploreReason,
  destination: string,
  relevance: number,
  serendipity: "relevant" | "adjacent" | "surprising",
  extras?: { creator?: string; tags?: string[]; mood?: string }
): ExploreItem {
  return {
    id: `explore-${id}`,
    type,
    title,
    description,
    cover,
    reason,
    destination,
    relevance,
    serendipity,
    ...extras,
  };
}

/* ── Seed pool — all content as ExploreItems ─────────────────────────── */

/**
 * The master seed pool. Every piece of content in WithIn lives here as
 * an ExploreItem. The engine samples from this pool based on context.
 *
 * In a real implementation, this would be a database query with filters.
 */
export function getSeedPool(): ExploreItem[] {
  const pool: ExploreItem[] = [];

  // Originals
  for (const item of ORIGINALS) {
    pool.push(
      makeExploreItem(
        item.id,
        "original",
        item.title,
        item.description ?? "",
        item.cover,
        { kind: "mood-match", mood: item.moods[0] ?? "curious" },
        `/originals/${item.id}`,
        0.8,
        "relevant",
        { creator: item.creator, tags: item.tags, mood: item.moods[0] }
      )
    );
  }

  // Stories
  for (const item of STORIES) {
    pool.push(
      makeExploreItem(
        item.id,
        "original",
        item.title,
        item.description ?? "",
        item.cover,
        { kind: "mood-match", mood: item.moods[0] ?? "reflective" },
        `/originals/${item.id}`,
        0.75,
        "relevant",
        { creator: item.by, tags: item.tags, mood: item.moods[0] }
      )
    );
  }

  // Music
  for (const item of ALBUMS) {
    pool.push(
      makeExploreItem(
        item.id,
        "music",
        item.title,
        item.description ?? "",
        item.cover,
        { kind: "mood-match", mood: item.moods[0] ?? "calm" },
        `/music`,
        0.7,
        "relevant",
        { creator: item.artist, tags: item.tags, mood: item.moods[0] }
      )
    );
  }

  // Books
  for (const item of BOOKS) {
    pool.push(
      makeExploreItem(
        item.id,
        "book",
        item.title,
        item.description ?? "",
        item.cover,
        { kind: "mood-match", mood: item.moods[0] ?? "curious" },
        `/books`,
        0.7,
        "relevant",
        { creator: item.author, tags: item.tags, mood: item.moods[0] }
      )
    );
  }

  // Photography
  for (const item of PHOTOS) {
    pool.push(
      makeExploreItem(
        item.id,
        "photo",
        item.title,
        item.caption,
        item.cover,
        { kind: "mood-match", mood: item.moods[0] ?? "reflective" },
        `/photography`,
        0.65,
        "adjacent",
        { creator: item.by, tags: item.tags, mood: item.moods[0] }
      )
    );
  }

  // Communities
  for (const item of COMMUNITIES) {
    pool.push(
      makeExploreItem(
        item.id,
        "community",
        item.name,
        item.tagline,
        { gradient: item.gradient, emoji: item.avatars[0] ?? "✦" },
        { kind: "nearby", description: "A room where kindred souls gather" },
        `/communities`,
        0.6,
        "adjacent",
        { tags: item.tags }
      )
    );
  }

  // Creators
  for (const creator of CREATORS) {
    pool.push(
      makeExploreItem(
        creator.id,
        "creator",
        creator.name,
        creator.bio,
        { gradient: creator.gradient, emoji: creator.avatar },
        { kind: "creator-follow", creator: creator.name },
        `/creators/${creator.id}`,
        0.55,
        "adjacent",
        { tags: creator.categories.map((c) => c.toLowerCase()) }
      )
    );
  }

  // Reflections — atmospheric prompts (always generated, never from a catalog)
  const reflections = [
    { id: "reflect-1", title: "What are you carrying tonight?", description: "A quiet prompt for the weight you brought." },
    { id: "reflect-2", title: "Name one thing that made you pause today.", description: "Even small things count." },
    { id: "reflect-3", title: "What would you tell yesterday's self?", description: "No pressure. Just a thought." },
    { id: "reflect-4", title: "Where does your mind go when it's quiet?", description: "Follow it." },
    { id: "reflect-5", title: "What's one thing you're glad you didn't say?", description: "Sometimes silence is the answer." },
  ];

  for (const r of reflections) {
    pool.push(
      makeExploreItem(
        r.id,
        "reflection",
        r.title,
        r.description,
        { gradient: "from-indigo-600 to-purple-800", emoji: "🪞" },
        { kind: "auri-pick", note: "Auri thinks this might help" },
        "/within",
        0.5,
        "surprising"
      )
    );
  }

  // Auri moments — conversational entry points
  const auriMoments = [
    { id: "auri-1", title: "Talk to Auri", description: "You don't have to know where you're going." },
    { id: "auri-2", title: "Let Auri choose", description: "She's been watching the light." },
  ];

  for (const a of auriMoments) {
    pool.push(
      makeExploreItem(
        a.id,
        "auri-moment",
        a.title,
        a.description,
        { gradient: "from-purple-600 to-indigo-700", emoji: "🦉" },
        { kind: "auri-pick" },
        "/within",
        0.4,
        "surprising"
      )
    );
  }

  return pool;
}
