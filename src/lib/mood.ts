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

export const moods: Mood[] = [
  {
    id: "happy",
    label: "Happy",
    emoji: "✨",
    rgb: [251, 191, 36],
    line: "Bright stories to keep the glow going."
  },
  {
    id: "lost",
    label: "Lost",
    emoji: "🌙",
    rgb: [99, 102, 241],
    line: "Quiet stories for wandering hearts."
  },
  {
    id: "inspired",
    label: "Inspired",
    emoji: "🚀",
    rgb: [217, 70, 239],
    line: "Stories that spark your next big idea."
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "🌊",
    rgb: [34, 211, 238],
    line: "Slow, gentle stories to breathe with."
  },
  {
    id: "curious",
    label: "Curious",
    emoji: "🔮",
    rgb: [52, 211, 153],
    line: "Stories that open new worlds."
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
 * Pass null to reset back to the brand purple.
 */
const MOOD_EVENT = "within:mood-change";

export function applyMood(id: string | null) {
  const rgb = getMood(id)?.rgb ?? DEFAULT_RGB;
  document.documentElement.style.setProperty("--mood-rgb", rgb.join(", "));
  window.dispatchEvent(new CustomEvent<string | null>(MOOD_EVENT, { detail: id }));
}

/** Subscribes to mood changes applied from anywhere (e.g. Auri's quick chips). */
export function onMoodChange(handler: (id: string | null) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<string | null>).detail);
  window.addEventListener(MOOD_EVENT, listener);
  return () => window.removeEventListener(MOOD_EVENT, listener);
}
