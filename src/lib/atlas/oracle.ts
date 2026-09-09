/**
 * The Atlas oracle — light cards, runes, dreams, sigils, names.
 *
 * Every draw is deterministic from (seed, day) so a reading never flickers:
 * the same question on the same day draws the same card. The oracle deals
 * *reflections*, never fortunes — every card is a mirror, not a verdict.
 */

import { hashSeed, seededRandom, moonPhase } from "@/lib/atlas/cosmos";

/* ── Light cards — the deck of mirrors ───────────────────────────────── */

export type LightCard = {
  id: string;
  name: string;
  glyph: string;
  /** Which of three reading positions it was drawn into */
  position?: "past" | "present" | "becoming";
  reflection: string;
  hue: string;
};

export const LIGHT_DECK: Omit<LightCard, "position">[] = [
  { id: "threshold", name: "The Threshold", glyph: "🚪", reflection: "You are between rooms. The next door only opens outward.", hue: "#a78bfa" },
  { id: "lantern", name: "The Lantern", glyph: "🏮", reflection: "Something you already carry is the light you've been looking for.", hue: "#fbbf24" },
  { id: "tide", name: "The Tide", glyph: "🌊", reflection: "What left is circling back on its own schedule, not yours.", hue: "#67e8f9" },
  { id: "ember", name: "The Ember", glyph: "🔥", reflection: "Low and slow outlasts loud and fast. Tend, don't ignite.", hue: "#fb923c" },
  { id: "map", name: "The Folded Map", glyph: "🗺", reflection: "The route exists. It's allowed to be drawn as you walk.", hue: "#34d399" },
  { id: "mirror", name: "The Still Mirror", glyph: "🪞", reflection: "What you keep meeting in others is standing in you too.", hue: "#f472b6" },
  { id: "seed", name: "The Quiet Seed", glyph: "🌱", reflection: "The smallest version of the plan is already the plan.", hue: "#a3e635" },
  { id: "arch", name: "The Arch", glyph: "🏛", reflection: "What you built to hold weight is holding it. Look up.", hue: "#94a3b8" },
  { id: "candle", name: "The Last Candle", glyph: "🕯", reflection: "One small flame is enough to prove the dark isn't total.", hue: "#fde68a" },
  { id: "comet", name: "The Passing Comet", glyph: "☄", reflection: "Rare things feel late because they're far. They're still coming.", hue: "#22d3ee" },
  { id: "garden", name: "The Night Garden", glyph: "🌙", reflection: "Some things only grow in hours nobody else is using.", hue: "#818cf8" },
  { id: "bell", name: "The Distant Bell", glyph: "🔔", reflection: "The faint signal is still a signal. Follow the hum.", hue: "#e879f9" },
];

/** Day-stable draw — same day, same three cards. */
export function drawLightCards(question: string, date: Date = new Date()): LightCard[] {
  const dayKey = Math.floor(date.getTime() / 86400000);
  const rand = seededRandom(hashSeed(`cards:${question.toLowerCase().trim()}:${dayKey}`));
  const pool = [...LIGHT_DECK];
  const positions: LightCard["position"][] = ["past", "present", "becoming"];
  return positions.map((position) => {
    const idx = Math.floor(rand() * pool.length);
    const card = pool.splice(idx, 1)[0];
    return { ...card, position };
  });
}

/* ── Star runes — thirteen marks, one cast ───────────────────────────── */

export type Rune = {
  id: string;
  glyph: string;
  name: string;
  meaning: string;
  reversed: boolean;
};

const RUNE_FACES: Omit<Rune, "reversed">[] = [
  { id: "is", glyph: "◈", name: "Ice Stillness", meaning: "Pause is not loss. Crystalline patience." },
  { id: "sowilo", glyph: "⟡", name: "Sun Road", meaning: "The path brightens from the walking, not the planning." },
  { id: "laguz", glyph: "≈", name: "Deep Water", meaning: "Feel it fully; the current knows the way down." },
  { id: "eihwaz", glyph: "↕", name: "World Tree", meaning: "You are the axis — roots below, reach above." },
  { id: "fehu", glyph: "✧", name: "First Light", meaning: "Beginnings are wealth. Spend the spark." },
  { id: "uruz", glyph: "⊙", name: "Wild Strength", meaning: "Untamed health moves through you tonight." },
  { id: "berkana", glyph: "❀", name: "Birch", meaning: "New growth wants a gentle hand, not a plan." },
  { id: "othala", glyph: "⌂", name: "Homeland", meaning: "What is truly yours cannot be un-owned." },
  { id: "jera", glyph: "⇄", name: "The Turning", meaning: "The wheel is already moving your way." },
  { id: "wunjo", glyph: "✺", name: "Shared Joy", meaning: "The good thing multiplies when shown." },
  { id: "kenaz", glyph: "◤", name: "Torch", meaning: "One clear knowing cuts a whole fog." },
  { id: "ingwaz", glyph: "◈", name: "The Seed Vault", meaning: "Stored light, waiting for its season." },
  { id: "dagaz", glyph: "☀", name: "Daybreak", meaning: "A threshold flips. Darkness becomes technicality." },
];

export function castRunes(count = 3, date: Date = new Date()): Rune[] {
  const dayKey = Math.floor(date.getTime() / 86400000);
  const rand = seededRandom(hashSeed(`runes:${count}:${dayKey}`));
  const pool = [...RUNE_FACES];
  return Array.from({ length: Math.min(count, pool.length) }, () => {
    const face = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    return { ...face, reversed: rand() > 0.72 };
  });
}

/* ── Dream seeds — what tonight's sky suggests to the sleeping ───────── */

export type DreamSeed = {
  image: string;
  feeling: string;
  line: string;
};

const DREAM_IMAGES = [
  "a lighthouse that walks", "a staircase made of waterfalls", "letters folded into paper birds",
  "a garden growing clock hands", "two moons trading places", "a train through a cloud forest",
  "a library with no walls", "a door in the side of a hill", "an orchestra of weather",
];

const DREAM_FEELINGS = [
  "quiet vertigo", "long-anticipated arrival", "gentle urgency", "borrowed memory",
  "unhurried wonder", "the comfort of old rain", "a kindness you can't place", "weightless certainty",
];

export function dreamSeed(date: Date = new Date()): DreamSeed {
  const dayKey = Math.floor(date.getTime() / 86400000);
  const rand = seededRandom(hashSeed(`dream:${dayKey}`));
  const phase = moonPhase(date);
  return {
    image: DREAM_IMAGES[Math.floor(rand() * DREAM_IMAGES.length)],
    feeling: DREAM_FEELINGS[Math.floor(rand() * DREAM_FEELINGS.length)],
    line: phase.illumination > 0.85
      ? "Under a full moon, the dream will not stay quiet — write it down."
      : phase.illumination < 0.15
      ? "A new-moon dream: seed-shaped, easy to lose, worth catching."
      : "Let it arrive half-formed. The shape will find you.",
  };
}

/* ── Sigils — a personal mark from a spoken intention ────────────────── */

export type Sigil = {
  /** SVG path data for the mark */
  path: string;
  /** The intention it was distilled from */
  intention: string;
  /** Distilled letter core */
  core: string;
};

/** Deterministic sigil path (in a 100×100 box) from an intention string. */
export function forgeSigil(intention: string, date: Date = new Date()): Sigil {
  const dayKey = Math.floor(date.getTime() / 86400000);
  const rand = seededRandom(hashSeed(`sigil:${intention.toLowerCase().trim()}:${dayKey}`));
  const letters = intention.toUpperCase().replace(/[^A-Z]/g, "");
  const core = Array.from(new Set(letters.split(""))).slice(0, 6).join("") || "WITHIN";

  // Build a flowing path through deterministic anchor points.
  const points = Array.from({ length: 6 }, () => ({
    x: 18 + rand() * 64,
    y: 18 + rand() * 64,
  }));
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2 + (rand() - 0.5) * 24;
    const cy = (prev.y + curr.y) / 2 + (rand() - 0.5) * 24;
    path += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  // Close with a small flourish ring.
  path += ` M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  return { path, intention: intention.trim(), core };
}

/* ── Star namer — christen your own star ─────────────────────────────── */

const NAME_PREFIX = ["Vel", "Ory", "Nim", "Cal", "Ser", "Thal", "Iso", "Mir", "Ael", "Vor", "Lum", "Kes"];
const NAME_MIDDLE = ["a", "e", "i", "o", "u", "ae", "ia", "ei"];
const NAME_SUFFIX = ["ris", "dun", "veth", "lome", "cara", "thys", "neth", "sira", "vel", "quor"];
const CATALOG = ["HD", "GL", "KIC", "TYC", "WIS"];

/** Generates a star name + mock catalog designation from a seed word. */
export function nameAStar(seedWord: string, date: Date = new Date()): {
  name: string;
  catalog: string;
  meaning: string;
} {
  const dayKey = Math.floor(date.getTime() / 86400000);
  const rand = seededRandom(hashSeed(`star-name:${seedWord.toLowerCase()}:${dayKey}`));
  const name =
    NAME_PREFIX[Math.floor(rand() * NAME_PREFIX.length)] +
    NAME_MIDDLE[Math.floor(rand() * NAME_MIDDLE.length)] +
    NAME_SUFFIX[Math.floor(rand() * NAME_SUFFIX.length)];
  const catalog = `${CATALOG[Math.floor(rand() * CATALOG.length)]}-${1000 + Math.floor(rand() * 9000)}${String.fromCharCode(65 + Math.floor(rand() * 26))}`;
  const meanings = [
    "the one who kept watch", "the light that waited", "the far kindness",
    "the lantern of crossings", "the quiet signal", "the last window lit",
  ];
  return { name, catalog, meaning: meanings[Math.floor(rand() * meanings.length)] };
}
