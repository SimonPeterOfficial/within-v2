import { memory, memoryKeys } from "@/lib/memory";

/**
 * Mood theme system.
 * Touching a mood in the Sanctuary rewrites the global --mood-rgb CSS variable,
 * so every glow across the page (hero, aurora, CTAs, Auri) shifts its color.
 */

export type Mood = {
  id: string;
  label: string;
  emoji: string;
  /** RGB triple (0–255) applied to the global --mood-rgb variable */
  rgb: [number, number, number];
  /** Reply shown after selecting this mood */
  line: string;
};

export type MoodId = Mood["id"];

export const moods: Mood[] = [
  {
    id: "inspired",
    label: "Inspired",
    emoji: "✦",
    rgb: [167, 139, 250],
    line: "Stories that light your next fire."
  },
  {
    id: "reflective",
    label: "Reflective",
    emoji: "🌗",
    rgb: [148, 163, 184],
    line: "Quiet corners for sitting with a thought."
  },
  {
    id: "peaceful",
    label: "Peaceful",
    emoji: "🍃",
    rgb: [110, 231, 183],
    line: "Slow things. Soft light. Room to breathe."
  },
  {
    id: "lost",
    label: "Lost",
    emoji: "🌧",
    rgb: [99, 102, 241],
    line: "Rain-washed stories for wandering hearts."
  },
  {
    id: "motivated",
    label: "Motivated",
    emoji: "🌄",
    rgb: [251, 146, 60],
    line: "A little momentum, gently lit."
  },
  {
    id: "hopeful",
    label: "Hopeful",
    emoji: "✨",
    rgb: [251, 191, 36],
    line: "Bright stories to keep the glow going."
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "🌙",
    rgb: [147, 197, 253],
    line: "Moonlit stories to breathe slowly with."
  },
  {
    id: "curious",
    label: "Curious",
    emoji: "🔭",
    rgb: [34, 211, 238],
    line: "New doors, softly opened."
  },
  {
    id: "nostalgic",
    label: "Nostalgic",
    emoji: "📻",
    rgb: [236, 72, 153],
    line: "Old memories, kept warm."
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    emoji: "🌊",
    rgb: [99, 102, 241],
    line: "Soft, quiet corners to land in."
  }
];

/** Brand purple — the default atmosphere before any mood is chosen. */
export const DEFAULT_RGB: [number, number, number] = [168, 85, 247];

/** Formats an RGB triple as a rgba() string with the given alpha. */
export function rgbString(rgb: [number, number, number], alpha = 1): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** Resolves a mood id (or null to reset) to its Mood definition. */
export function getMood(id: string | null): Mood | undefined {
  if (!id) return undefined;
  return moods.find((mood) => mood.id === id);
}

/**
 * Applies a mood to the whole page by setting --mood-rgb on the root element
 * and broadcasting a mood-change event so components (like the orbit) stay in sync.
 * Pass null to reset back to the brand purple. The choice is remembered so the
 * room returns to the same light on the next visit.
 */
const MOOD_EVENT = "within:mood-change";

export function applyMood(id: string | null) {
  const rgb = getMood(id)?.rgb ?? DEFAULT_RGB;
  document.documentElement.style.setProperty("--mood-rgb", rgb.join(", "));
  // The mood is remembered through the memory layer — one storage source,
  // ready to swap to a real backend later.
  memory.set("selected-mood", memoryKeys.mood, id ?? "");
  window.dispatchEvent(new CustomEvent<string | null>(MOOD_EVENT, { detail: id }));
}

/**
 * Restores the persisted mood after hydration — call once from a mounted
 * client component so the sanctuary wakes in the light you left it in.
 * Unknown/stale ids are ignored (the brand purple stays).
 */
export function restorePersistedMood() {
  if (typeof window === "undefined") return;
  const stored = memory.get<string>("selected-mood", memoryKeys.mood);
  if (!stored || !getMood(stored)) return;
  applyMood(stored);
}

/** Subscribes to mood changes applied from anywhere (e.g. Auri's quick chips). */
export function onMoodChange(handler: (id: string | null) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<string | null>).detail);
  window.addEventListener(MOOD_EVENT, listener);
  return () => window.removeEventListener(MOOD_EVENT, listener);
}
