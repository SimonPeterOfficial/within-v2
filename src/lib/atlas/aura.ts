/**
 * The Atlas aura engine — emotional weather, felt as atmosphere.
 *
 * Every function is pure and deterministic: the same mood blend and hour
 * always produce the same weather. Nothing here diagnoses anyone — the
 * weather describes the *room*, never the person.
 */

import { hashSeed, seededRandom } from "@/lib/atlas/cosmos";

/* ── Emotional weather ────────────────────────────────────────────────── */

export type AuraCondition =
  | "clear" | "soft-rain" | "golden" | "fog" | "storm" | "snow" | "aurora" | "ember-haze";

export type AuraWeather = {
  condition: AuraCondition;
  label: string;
  glyph: string;
  /** 0–1 how strongly the atmosphere should render */
  intensity: number;
  line: string;
};

const CONDITIONS: Record<AuraCondition, Omit<AuraWeather, "condition" | "intensity">> = {
  "clear": { label: "Clear", glyph: "🌤", line: "Still air. The room holds its breath with you." },
  "soft-rain": { label: "Soft Rain", glyph: "🌧", line: "A gentle rain — good weather for quiet thoughts." },
  "golden": { label: "Golden Hour", glyph: "🌅", line: "Warm light moving through everything." },
  "fog": { label: "Slow Fog", glyph: "🌫", line: "The edges soften. Nothing needs deciding today." },
  "storm": { label: "Inner Storm", glyph: "⛈", line: "Loud weather — held safely behind the glass." },
  "snow": { label: "Hush Snow", glyph: "🌨", line: "Slow white falling. The world turned gentler." },
  "aurora": { label: "Light Curtain", glyph: "🌌", line: "The upper air is singing in colors." },
  "ember-haze": { label: "Ember Haze", glyph: "🔥", line: "Low warm fire-light, long shadows, slow hours." },
};

const MOOD_CONDITION: Record<string, AuraCondition> = {
  inspired: "aurora", reflective: "fog", peaceful: "clear", lost: "soft-rain",
  hopeful: "golden", motivated: "ember-haze", calm: "snow", curious: "aurora",
  nostalgic: "golden", overwhelmed: "storm",
};

/** Weather from a mood id — the room's forecast follows the mood. */
export function weatherForMood(moodId: string | null): AuraWeather {
  const condition = (moodId && MOOD_CONDITION[moodId]) || "clear";
  const base = CONDITIONS[condition];
  const rand = seededRandom(hashSeed(`aura:${condition}`));
  return { condition, intensity: 0.45 + rand() * 0.3, ...base };
}

/** Weather drifts slowly through the day even without a mood — by hour. */
export function weatherForHour(date: Date = new Date()): AuraWeather {
  const hourKey = Math.floor(date.getTime() / 3600000);
  const rand = seededRandom(hashSeed(`aura-hour:${hourKey}`));
  const pool: AuraCondition[] = ["clear", "soft-rain", "golden", "fog", "snow", "aurora", "ember-haze"];
  const condition = pool[Math.floor(rand() * pool.length)];
  return { condition, intensity: 0.35 + rand() * 0.4, ...CONDITIONS[condition] };
}

/* ── Synaesthesia — moods rendered as light and sound ────────────────── */

export type Synaesthesia = {
  /** HSL hue 0–360 the mood tastes like */
  hue: number;
  /** Note name the mood hums at */
  note: string;
  /** Frequency in Hz */
  frequency: number;
  /** Texture word */
  texture: string;
};

const NOTE_FREQS: [string, number][] = [
  ["C", 261.63], ["D", 293.66], ["E", 329.63], ["F", 349.23],
  ["G", 392.0], ["A", 440.0], ["B", 493.88],
];

const TEXTURES = ["silk", "warm glass", "river stone", "velvet", "paper light", "deep water", "brass", "morning air"];

/** Deterministic synaesthetic signature for any mood blend. */
export function synaesthesia(moodIds: string[]): Synaesthesia {
  const key = moodIds.slice().sort().join("+") || "empty";
  const rand = seededRandom(hashSeed(`syn:${key}`));
  const hue = Math.floor(rand() * 360);
  const [note, frequency] = NOTE_FREQS[Math.floor(rand() * NOTE_FREQS.length)];
  const texture = TEXTURES[Math.floor(rand() * TEXTURES.length)];
  return { hue, note, frequency, texture };
}

/* ── Mood blends — what happens when two moods mix ───────────────────── */

export type MoodBlend = {
  id: string;
  name: string;
  line: string;
  hueA: string;
  hueB: string;
};

const BLEND_NAMES: [string, string][] = [
  ["Aurora Tide", "Hope landing softly on calm water."],
  ["Ember Glass", "Motivation you can hold without burning."],
  ["Night Bloom", "Curiosity that only opens after dark."],
  ["Silver Rain", "Reflection that never turns heavy."],
  ["Golden Fog", "Nostalgia with the sharp edges sanded off."],
  ["Quiet Fire", "Inspiration that doesn't need to shout."],
];

/** Blends every unordered pair of moods into a named atmosphere. */
export function blendMoods(moodIds: string[]): MoodBlend[] {
  const blends: MoodBlend[] = [];
  for (let i = 0; i < moodIds.length; i++) {
    for (let j = i + 1; j < moodIds.length; j++) {
      const seed = seededRandom(hashSeed(`blend:${moodIds[i]}:${moodIds[j]}`));
      const [name, line] = BLEND_NAMES[Math.floor(seed() * BLEND_NAMES.length)];
      blends.push({
        id: `${moodIds[i]}-${moodIds[j]}`,
        name,
        line,
        hueA: moodColorHex(moodIds[i]),
        hueB: moodColorHex(moodIds[j]),
      });
    }
  }
  return blends;
}

const MOOD_HEX: Record<string, string> = {
  inspired: "#a78bfa", reflective: "#94a3b8", peaceful: "#6ee7b7", lost: "#818cf8",
  hopeful: "#fbbf24", motivated: "#fb923c", calm: "#93c5fd", curious: "#22d3ee",
  nostalgic: "#ec4899", overwhelmed: "#6366f1",
};

export function moodColorHex(moodId: string): string {
  return MOOD_HEX[moodId] ?? "#a78bfa";
}

/* ── Resonance — how two feelings relate ─────────────────────────────── */

export type Resonance = {
  /** 0–100 sympathy between the two moods */
  score: number;
  label: string;
};

const OPPOSITES: [string, string][] = [
  ["inspired", "overwhelmed"], ["hopeful", "lost"], ["calm", "motivated"],
];

/** Scores the sympathy between two moods — deterministic, gentle. */
export function resonance(a: string, b: string): Resonance {
  if (a === b) return { score: 100, label: "The same note, sustained." };
  const opposite = OPPOSITES.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a)
  );
  const rand = seededRandom(hashSeed(`res:${[a, b].sort().join(":")}`));
  const base = opposite ? 18 + rand() * 14 : 58 + rand() * 38;
  const score = Math.round(base);
  const label =
    score > 85 ? "These two harmonize — the room will hum." :
    score > 60 ? "They get along, mostly. A friendly tension." :
    score > 40 ? "Strangers, but the interesting kind." :
    "Opposites — the room will feel the pull.";
  return { score, label };
}
