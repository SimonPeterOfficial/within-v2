/**
 * The Atlas cosmos engine — everything the sky instruments observe.
 *
 * Pure functions, deterministic from (time, seed) so the server and the
 * client always agree on what the sky looks like. No external calls: the
 * sky is computed, honestly, from real astronomical approximations.
 */

/* ── Seeded randomness — the same seed always grows the same sky ─────── */

export function hashSeed(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 — small, fast, good-enough PRNG. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SkyPoint = { x: number; y: number; size: number; brightness: number };

/** Deterministic star field for a given seed — points in a 0–100 space. */
export function generateStars(seed: string, count = 64): SkyPoint[] {
  const rand = seededRandom(hashSeed(seed));
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: 0.6 + rand() * 2.2,
    brightness: 0.25 + rand() * 0.75,
  }));
}

/* ── The moon — phase, illumination, name ────────────────────────────── */

/** Synodic month in days. */
const SYNODIC = 29.53058867;
/** A known new moon: 2000-01-06 18:14 UTC. */
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 86400000;

export type MoonPhase = {
  /** 0 = new, 0.5 = full, wraps at 1 */
  phase: number;
  /** 0–1 illuminated fraction */
  illumination: number;
  /** Waxing between new and full */
  waxing: boolean;
  /** Human name of the phase */
  name: string;
  /** Emoji glyph for the phase */
  glyph: string;
  /** Days until the next full moon */
  daysToFull: number;
};

const PHASE_NAMES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
] as const;

const PHASE_GLYPHS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"] as const;

export function moonPhase(date: Date = new Date()): MoonPhase {
  const days = date.getTime() / 86400000 - KNOWN_NEW_MOON;
  const phase = ((days / SYNODIC) % 1 + 1) % 1;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const idx = Math.round(phase * 8) % 8;
  const daysToFull = phase <= 0.5 ? (0.5 - phase) * SYNODIC : (1.5 - phase) * SYNODIC;
  return {
    phase,
    illumination,
    waxing: phase < 0.5,
    name: PHASE_NAMES[idx],
    glyph: PHASE_GLYPHS[idx],
    daysToFull: Math.round(daysToFull * 10) / 10,
  };
}

/* ── Sidereal time — what constellation the sky points at ────────────── */

/** Approximate Greenwich Mean Sidereal Time in degrees. */
export function siderealTime(date: Date = new Date()): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + t * t * 0.000387933;
  return ((gmst % 360) + 360) % 360;
}

export type Constellation = {
  id: string;
  name: string;
  latin: string;
  story: string;
  /** Right ascension hours (0–24) the constellation culminates at */
  ra: number;
  season: "spring" | "summer" | "autumn" | "winter";
  stars: SkyPoint[];
  lines: [number, number][];
};

/** Hand-set constellations — small, poetic, drawn in the 0–100 canvas. */
export const CONSTELLATIONS: Constellation[] = [
  {
    id: "lyra", name: "The Lyre", latin: "Lyra",
    story: "Orpheus' harp, hung in the sky so the music could never fully stop.",
    ra: 18.7, season: "summer",
    stars: [{ x: 50, y: 20, size: 2.4, brightness: 1 }, { x: 42, y: 38, size: 1.6, brightness: 0.7 }, { x: 58, y: 44, size: 1.4, brightness: 0.6 }, { x: 50, y: 58, size: 1.5, brightness: 0.65 }, { x: 38, y: 52, size: 1.2, brightness: 0.5 }],
    lines: [[0, 1], [0, 2], [2, 3], [3, 4], [4, 1]],
  },
  {
    id: "orion", name: "The Hunter", latin: "Orion",
    story: "The winter giant — three stars in a row, one belt, endless stories.",
    ra: 5.6, season: "winter",
    stars: [{ x: 30, y: 18, size: 2, brightness: 0.9 }, { x: 70, y: 22, size: 2.1, brightness: 0.9 }, { x: 42, y: 46, size: 1.6, brightness: 0.75 }, { x: 52, y: 47, size: 1.6, brightness: 0.75 }, { x: 62, y: 48, size: 1.6, brightness: 0.75 }, { x: 40, y: 80, size: 2.2, brightness: 1 }, { x: 64, y: 82, size: 2, brightness: 0.95 }],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6]],
  },
  {
    id: "cassiopeia", name: "The Seated Queen", latin: "Cassiopeia",
    story: "A queen chained to her chair, circling the pole forever, still bragging.",
    ra: 1, season: "autumn",
    stars: [{ x: 20, y: 60, size: 1.7, brightness: 0.8 }, { x: 35, y: 42, size: 1.8, brightness: 0.85 }, { x: 50, y: 58, size: 1.9, brightness: 0.9 }, { x: 65, y: 40, size: 1.7, brightness: 0.8 }, { x: 80, y: 55, size: 1.6, brightness: 0.7 }],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: "cygnus", name: "The Swan", latin: "Cygnus",
    story: "A swan flying down the Milky Way — the northern cross in flight.",
    ra: 20.6, season: "summer",
    stars: [{ x: 50, y: 12, size: 2, brightness: 0.95 }, { x: 50, y: 84, size: 2, brightness: 0.9 }, { x: 26, y: 46, size: 1.6, brightness: 0.7 }, { x: 74, y: 50, size: 1.7, brightness: 0.75 }, { x: 50, y: 46, size: 1.5, brightness: 0.65 }],
    lines: [[0, 4], [4, 1], [2, 4], [4, 3]],
  },
  {
    id: "corvus", name: "The Crow", latin: "Corvus",
    story: "The messenger bird — sent for water, kept the cup company instead.",
    ra: 12.3, season: "spring",
    stars: [{ x: 28, y: 30, size: 1.5, brightness: 0.7 }, { x: 68, y: 28, size: 1.6, brightness: 0.72 }, { x: 34, y: 70, size: 1.6, brightness: 0.75 }, { x: 62, y: 68, size: 1.7, brightness: 0.78 }],
    lines: [[0, 1], [1, 3], [3, 2], [2, 0]],
  },
];

/** The constellation currently highest in the sky (by sidereal hour). */
export function culminatingConstellation(date: Date = new Date()): Constellation {
  const lst = siderealTime(date) / 15; // hours
  let best = CONSTELLATIONS[0];
  let bestDelta = 24;
  for (const c of CONSTELLATIONS) {
    const delta = Math.min(Math.abs(lst - c.ra), 24 - Math.abs(lst - c.ra));
    if (delta < bestDelta) {
      bestDelta = delta;
      best = c;
    }
  }
  return best;
}

/* ── The aurora — a forecast the way weather apps do it ──────────────── */

export type AuroraLevel = "silent" | "faint" | "active" | "storm" | "celestial";

export type AuroraForecast = {
  /** 0–10 geomagnetic activity index */
  kp: number;
  level: AuroraLevel;
  levelLabel: string;
  /** 0–1 how bright the simulation should render */
  intensity: number;
  /** Dominant hue of tonight's curtain */
  hue: string;
  line: string;
};

const AURORA_LEVELS: [AuroraLevel, string, string][] = [
  ["silent", "Silent sky", "The curtains are resting tonight."],
  ["faint", "Faint glow", "A whisper of green, far north."],
  ["active", "Active", "Ribbons moving — worth staying up for."],
  ["storm", "Storm", "The sky is wide awake. Look up."],
  ["celestial", "Celestial", "Once-in-a-season light. Everything else can wait."],
];

const AURORA_HUES = ["#34d399", "#22d3ee", "#a78bfa", "#67e8f9", "#f472b6"];

/** A smooth pseudo-Kp that drifts by hour and seed — deterministic per hour. */
export function auroraForecast(date: Date = new Date(), seed = "atlas"): AuroraForecast {
  const hourKey = Math.floor(date.getTime() / 3600000);
  const rand = seededRandom(hashSeed(`${seed}:${hourKey}`));
  // Blend two waves for a natural rise-and-fall.
  const wave = (Math.sin(hourKey / 19) + 1) / 2;
  const kp = Math.round((0.3 + wave * 0.55 + rand() * 0.15) * 100) / 10;
  const idx = Math.min(4, Math.floor(kp / 2));
  const [level, levelLabel, line] = AURORA_LEVELS[idx];
  return {
    kp,
    level,
    levelLabel,
    intensity: kp / 10,
    hue: AURORA_HUES[idx],
    line,
  };
}

/* ── Comets — visitors with schedules ────────────────────────────────── */

export type Comet = {
  id: string;
  name: string;
  /** Days between visits (real-ish periods) */
  periodDays: number;
  /** Days since last perihelion at epoch */
  epochOffset: number;
  tail: string;
  story: string;
};

export const COMETS: Comet[] = [
  { id: "halley", name: "Halley's Comet", periodDays: 27759, epochOffset: 14200, tail: "from-teal-300/80 to-transparent", story: "The famous one. Returns in 2061 — it always comes back." },
  { id: "swift", name: "Swift–Tuttle", periodDays: 47680, epochOffset: 9200, tail: "from-violet-300/80 to-transparent", story: "Parent of the Perseids — every August, Earth crosses its old path." },
  { id: "tempel", name: "Tempel–Tuttle", periodDays: 12184, epochOffset: 3100, tail: "from-cyan-300/80 to-transparent", story: "Bringer of the Leonid storms, every thirty-three years or so." },
  { id: "ches", name: "Churyumov–Gerasimenko", periodDays: 2436, epochOffset: 880, tail: "from-rose-300/70 to-transparent", story: "The one we landed on. Rosetta rode beside it for two years." },
];

export type CometSighting = Comet & {
  /** 0–1 progress through its current orbit */
  orbitProgress: number;
  /** Days until closest approach */
  daysAway: number;
  /** 0–1 visual brightness right now */
  brightness: number;
  visible: boolean;
};

export function cometSightings(date: Date = new Date()): CometSighting[] {
  const today = date.getTime() / 86400000;
  return COMETS.map((comet) => {
    const elapsed = (today - comet.epochOffset) % comet.periodDays;
    const orbitProgress = elapsed / comet.periodDays;
    // Closest approach when progress ≈ 0.5 of the (idealized ellipse).
    const daysAway = Math.round(Math.min(elapsed, comet.periodDays - elapsed));
    const brightness = Math.max(0.08, 1 - daysAway / (comet.periodDays * 0.18));
    return { ...comet, orbitProgress, daysAway, brightness, visible: daysAway < comet.periodDays * 0.09 };
  }).sort((a, b) => a.daysAway - b.daysAway);
}

/* ── The sky palette — colors the room should wear right now ─────────── */

export type SkyPalette = {
  /** Deep background wash */
  deep: string;
  /** Mid nebula tone */
  mid: string;
  /** Accent light */
  accent: string;
  /** One-line description of tonight's palette */
  line: string;
};

const PALETTES: SkyPalette[] = [
  { deep: "#05040e", mid: "rgba(88,52,168,0.16)", accent: "#a78bfa", line: "Violet dusk — the classic Atlas night." },
  { deep: "#030810", mid: "rgba(20,120,150,0.14)", accent: "#67e8f9", line: "Deep-water sky — cyan hours." },
  { deep: "#0a040c", mid: "rgba(180,60,120,0.13)", accent: "#f472b6", line: "Rose nebula — a warm darkness." },
  { deep: "#04060c", mid: "rgba(60,90,180,0.15)", accent: "#818cf8", line: "Indigo meridian — the calm between." },
];

/** Palette rotates by day-of-year, stable all night. */
export function skyPalette(date: Date = new Date()): SkyPalette {
  const day = Math.floor(date.getTime() / 86400000);
  return PALETTES[day % PALETTES.length];
}

/* ── Shooting stars — catch them live ───────────────────────────────── */

export type ShootingStar = { id: number; x: number; y: number; angle: number; delay: number };

/** Deterministic set of shooting star passes for a minute-bucket. */
export function shootingStars(date: Date = new Date(), seed = "shower", count = 3): ShootingStar[] {
  const bucket = Math.floor(date.getTime() / 60000);
  const rand = seededRandom(hashSeed(`${seed}:${bucket}`));
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rand() * 80 + 10,
    y: rand() * 40 + 5,
    angle: 20 + rand() * 25,
    delay: rand() * 6,
  }));
}
