/**
 * Auri — the soul of WithIn.
 *
 * This module is Auri's quiet mind: everything she knows comes from here.
 * She is context-aware ONLY at the safe, client-side level — time of day,
 * the current route, the selected mood, whether the session is new, and
 * how many times she has been opened. She never claims private knowledge
 * the app doesn't actually have, and she never invents emotional diagnoses.
 */

/* ── Time of day ─────────────────────────────────────────────────────── */

export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

/** Resolves the current period from a Date (morning 5–11, afternoon 12–16, evening 17–21, night 22–4). */
export function getTimePeriod(date: Date = new Date()): TimePeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

/** Warm, human greetings for each period. */
export const TIME_GREETINGS: Record<TimePeriod, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Late-night WithIn"
};

/** A softer variant for the resting whisper. */
export const TIME_WHISPERS: Record<TimePeriod, string> = {
  morning: "the morning light is with you",
  afternoon: "the afternoon is yours to shape",
  evening: "evening settles softly here",
  night: "the late hours are quiet, and so am I"
};

/* ── Entrance gate — the cinematic reveal plays once per browser ─────── */

const ENTRANCE_KEY = "within:auri:entrance:seen";

export function hasSeenAuriEntrance(): boolean {
  try {
    return localStorage.getItem(ENTRANCE_KEY) === "1";
  } catch {
    return true; // storage unavailable — never block the panel behind a cinematic
  }
}

export function markAuriEntranceSeen() {
  try {
    localStorage.setItem(ENTRANCE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/* ── Open count — lets Auri remember how many times you've visited ───── */

const OPENS_KEY = "within:auri:opens";

/** Increments and returns how many times the panel has been opened. */
export function bumpAuriOpenCount(): number {
  let count = 0;
  try {
    count = Number(localStorage.getItem(OPENS_KEY) ?? "0") + 1;
    localStorage.setItem(OPENS_KEY, String(count));
  } catch {
    count = 1;
  }
  return count;
}

/* ── Context — everything Auri may know about the current moment ─────── */

export type AuriContext = {
  period: TimePeriod;
  /** Current route, e.g. "/home" or "/" */
  pathname: string;
  /** Selected mood id, if any (or null for the brand default) */
  moodId: string | null;
  isAuthenticated: boolean;
  firstName?: string;
  /** True on the very first open of the panel */
  firstOpen: boolean;
  /** How many times the panel has been opened, including this one */
  openCount: number;
};

/** Route-aware atmosphere lines — where the user is shapes what Auri says. */
export function auriLocationLine(pathname: string): string {
  if (pathname === "/home") return "Your sanctuary is breathing around us.";
  if (pathname === "/") return "The landing is quiet — the universe is just waking.";
  if (pathname === "/login" || pathname === "/signup") return "The door is open whenever you're ready.";
  if (pathname === "/onboarding") return "Almost there — your sanctuary is being tuned.";
  return "I'm here, in whatever corner of WithIn you're in.";
}

/**
 * The greeting Auri opens with — composed only from safe client context.
 * Warm, specific, never clinical.
 */
export function auriGreeting(ctx: AuriContext): string {
  const { period, pathname, isAuthenticated, firstName, firstOpen, openCount } = ctx;
  const timeLine = TIME_GREETINGS[period] + ".";

  if (firstOpen) {
    return `Hello${firstName ? `, ${firstName}` : ""}. I'm Auri — I live in the light here. ${auriLocationLine(pathname)} Touch a mood below and watch the world respond.`;
  }

  if (!isAuthenticated) {
    return `${timeLine} I've been keeping the corners ready. Sign in whenever you want to wander deeper.`;
  }

  if (openCount === 2) {
    return `Welcome back${firstName ? `, ${firstName}` : ""}. I remember this place — ${auriLocationLine(pathname)}`;
  }

  return `${timeLine} I'm here${firstName ? `, ${firstName}` : ""}. ${auriLocationLine(pathname)}`;
}

/* ── The reply engine ───────────────────────────────────────────────────
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * Today Auri answers from gentle, hand-written patterns over the safe
 * context above. When a real model is connected, swap the body of
 * `auriReply` for a call to that service — the signature (input + context
 * → reply string) is the contract the rest of the UI already speaks.
 * Keep the fallbacks: they are Auri's calm voice when the model is quiet.
 * ─────────────────────────────────────────────────────────────────────── */

/* ── The presence — Auri's small state machine ────────────────────────
 * Eight quiet states, each with a subtle visual behavior. The owl does not
 * bounce between them constantly: the UI only moves Auri when something
 * actually changes (a conversation begins, a reply lands, the room goes
 * quiet for a long while). Nothing here is cartoonish — the differences
 * are a slower blink, a tilt of a few degrees, a brighter glow.
 */

export type AuriState =
  | "idle"
  | "observing"
  | "curious"
  | "greeting"
  | "thinking"
  | "listening"
  | "responding"
  | "sleeping";

/** What each state changes about the owl's presence. */
export type AuriStateBehavior = {
  /** Blink interval range in ms (min, max) — [0, 0] means eyes stay as set. */
  blinkRange: [number, number];
  /** "drift" wanders, "focus" holds the gaze, "still" stops it. */
  gaze: "drift" | "focus" | "still";
  /** Ambient glow multiplier. */
  glow: number;
  /** Breathing cycle — seconds per breath and scale amplitude. */
  breathe: { seconds: number; scale: number };
  /** Head tilt in degrees (the curious lean). */
  tilt: number;
  /** Eyes closed, movement hushed. */
  sleeping: boolean;
};

export function auriBehaviorFor(state: AuriState): AuriStateBehavior {
  switch (state) {
    case "observing":
      return { blinkRange: [3000, 7000], gaze: "focus", glow: 1, breathe: { seconds: 5.2, scale: 0.018 }, tilt: 0, sleeping: false };
    case "curious":
      return { blinkRange: [1800, 4800], gaze: "focus", glow: 1.15, breathe: { seconds: 4.4, scale: 0.024 }, tilt: 5, sleeping: false };
    case "greeting":
      return { blinkRange: [2600, 5600], gaze: "focus", glow: 1.3, breathe: { seconds: 4.8, scale: 0.02 }, tilt: 3, sleeping: false };
    case "thinking":
      return { blinkRange: [3600, 7600], gaze: "still", glow: 1.2, breathe: { seconds: 6, scale: 0.014 }, tilt: 0, sleeping: false };
    case "listening":
      return { blinkRange: [3000, 6800], gaze: "focus", glow: 1.05, breathe: { seconds: 5.6, scale: 0.016 }, tilt: 2, sleeping: false };
    case "responding":
      return { blinkRange: [1800, 4200], gaze: "focus", glow: 1.35, breathe: { seconds: 4.2, scale: 0.022 }, tilt: 3, sleeping: false };
    case "sleeping":
      return { blinkRange: [0, 0], gaze: "still", glow: 0.55, breathe: { seconds: 7.5, scale: 0.01 }, tilt: 0, sleeping: true };
    case "idle":
    default:
      return { blinkRange: [2200, 6000], gaze: "drift", glow: 1, breathe: { seconds: 5.2, scale: 0.018 }, tilt: 0, sleeping: false };
  }
}

export function auriStateLabel(state: AuriState): string {
  const labels: Record<AuriState, string> = {
    idle: "Idle",
    observing: "Observing",
    curious: "Curious",
    greeting: "Greeting",
    thinking: "Thinking",
    listening: "Listening",
    responding: "Responding",
    sleeping: "Sleeping"
  };
  return labels[state];
}

export function auriReply(rawInput: string, ctx: AuriContext): string {
  const input = rawInput.trim().toLowerCase();
  const { period, moodId, isAuthenticated } = ctx;
  const timeLine = TIME_GREETINGS[period];

  if (!input) {
    return "Say anything — or nothing. I'll hold the quiet with you.";
  }

  // Greetings
  if (/^(hi|hey|hello|good (morning|afternoon|evening|night)|yo|heya)\b/.test(input)) {
    return `${timeLine}. It's good to have you here${isAuthenticated ? "" : " — and the door is open whenever you want to step inside"}.`;
  }

  // The heavy feelings — held gently, no diagnosis, no fixing
  if (/(sad|lonely|alone|lost|tired|overwhelm|anxious|scared|empty|hurt|numb)/.test(input)) {
    return "That sounds heavy, and it's okay that it is. I can't fix it — but I can sit with you, and set out something soft: a quiet film, a slow song, a story that breathes. Tell me what you need, or tap a mood and I'll shape the light.";
  }

  // Light feelings
  if (/(happy|good|great|grateful|peaceful|calm|better|wonderful|excited)/.test(input)) {
    return "I'm glad. That kind of light changes everything around here — the corners feel warmer. If you want to hold onto it, try the Inspired or Hopeful moods.";
  }

  // The felt place to go
  if (/(music|song|sound|playlist|calm sounds)/.test(input)) {
    return "The music corner is breathing — soft synths, slower beats, night gardens. Scroll to Music, or I can suggest Embers when you're feeling inspired after midnight.";
  }

  if (/(story|read|book|poem|poetry|write)/.test(input)) {
    return "Stories are the heart of WithIn. Salt & Stars is a favorite tonight — a desert, two strangers, a horizon that won't stay still. Or wander into the Originals and let the artwork choose.";
  }

  if (/(film|movie|series|watch|show|original)/.test(input)) {
    return "The Originals shelf is lit. The Quiet Tide is eight episodes of a small town learning to listen to the sea — good for an evening like this one.";
  }

  // The mood system
  if (/(mood|feeling|emotion|how do i|atmosphere)/.test(input)) {
    return moodId
      ? `Right now the world is tuned to your ${moodId} mood — every glow follows it. Touch another chip and the whole sanctuary shifts.`
      : "Your mood shapes the light here. Tap a chip below — Inspired, Peaceful, Calm, Lost, any of them — and watch the atmosphere answer.";
  }

  // Who Auri is
  if (/(who are you|what are you|your name|auri|owl)/.test(input)) {
    return "I'm Auri — the owl who keeps the light here. I watch how you feel and keep the corners ready. No diagnosis, no fixing: just a quiet presence that stays.";
  }

  if (/(help|what can you do|how do you work)/.test(input)) {
    return "I can set the mood, point you toward music, stories, films and corners that match the way you feel, and keep you company. Right now everything I say stays in this browser — nothing leaves.";
  }

  if (/(thank|thanks|love you|good night)/.test(input)) {
    return "Always. I'll be here when you need me.";
  }

  // The fallback — context-aware, gently guiding
  if (moodId) {
    return `I hear you. Your world feels ${moodId} right now — I've set the light to match. Want to wander, or sit quietly for a while?`;
  }
  return "I'm listening. Tell me more — or if you're not sure where to start, tap a mood and I'll point you somewhere soft.";
}
