/**
 * WithIn Sonic Identity — "a candle appearing in darkness."
 *
 * The sound begins almost imperceptibly: a single soft sine tone in silence,
 * a slow harmonic bloom (a fifth above, then a warm octave), a gentle swell,
 * then resolution. No samples, no files, no downloads — the ident is
 * synthesized with the Web Audio API, so it ships in ~2KB of code and can
 * never 404. The same DNA drives the longer Originals ident (a slower bloom,
 * a low bloom layer, a longer resolve).
 *
 * Rules encoded here:
 *   • Sound is OFF until the user opts in (Settings → Sound) — browsers
 *     require a gesture anyway, and nobody is ever ambushed by audio.
 *   • Playback is a single shared AudioContext, created lazily on first
 *     opt-in gesture, and closed politely when the page hides.
 *   • Reduced motion implies a quieter, shorter ident — calm across senses.
 *   • The API is an abstraction: when real recorded assets exist, swap the
 *     synth bodies for `Audio` elements at the same call sites.
 */

/* ── Sound preferences ─────────────────────────────────────────────────
 * Stored through the memory layer (local, honest). Categories map to the
 * Settings surface: master, interface, cinematic, music, Auri voice. */

export type SoundPreferences = {
  master: boolean;
  interface: boolean;
  cinematic: boolean;
  music: boolean;
  auriVoice: boolean;
};

export const DEFAULT_SOUND_PREFERENCES: SoundPreferences = {
  master: false, // opt-in — sound is never on by default
  interface: true,
  cinematic: true,
  music: true,
  auriVoice: false, // no voice exists yet; the switch is honest
};

const SOUND_KEY = "sound-preferences";

/** Reads sound preferences (never throws; storage unavailable → defaults). */
export function getSoundPreferences(): SoundPreferences {
  try {
    // Direct localStorage read keeps this module dependency-free for the
    // server build; the memory layer is client-only.
    const raw = localStorage.getItem(`within:mem:preferences:${SOUND_KEY}`);
    if (!raw) return DEFAULT_SOUND_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<SoundPreferences>;
    return {
      master: parsed.master === true,
      interface: parsed.interface !== false,
      cinematic: parsed.cinematic !== false,
      music: parsed.music !== false,
      auriVoice: parsed.auriVoice === true,
    };
  } catch {
    return DEFAULT_SOUND_PREFERENCES;
  }
}

/** Persists sound preferences — local only, nothing leaves the device. */
export function saveSoundPreferences(prefs: SoundPreferences) {
  try {
    localStorage.setItem(`within:mem:preferences:${SOUND_KEY}`, JSON.stringify(prefs));
  } catch {
    /* storage unavailable — the preference simply doesn't persist */
  }
}

/* ── The shared audio context ────────────────────────────────────────── */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

/** Returns the shared context, creating it lazily inside a user gesture. */
function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5; // restrained — presence, not announcement
    master.connect(ctx.destination);
    return ctx;
  } catch {
    return null;
  }
}

/** One soft sine voice with an attack/decay envelope. */
function voice(
  context: AudioContext,
  destination: AudioNode,
  freq: number,
  startAt: number,
  duration: number,
  peak: number,
  type: OscillatorType = "sine"
) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + duration * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/* ── The Within Ident — ~3.2s ──────────────────────────────────────────
 * silence → tiny tonal presence → harmonic movement → expansion →
 * warm resonance → resolution. Root A3 (220Hz), bloom to E4, then A4. */

export function playWithinIdent(options?: { reduced?: boolean }): void {
  const prefs = getSoundPreferences();
  if (!prefs.master || !prefs.cinematic) return;
  const context = ensureContext();
  if (!context || !master) return;
  if (context.state === "suspended") void context.resume();

  const t = context.currentTime + 0.05;
  const reduced = options?.reduced ?? false;
  const length = reduced ? 1.8 : 3.2;
  const peakScale = reduced ? 0.5 : 1;

  // 1. The candle — a single, almost-imperceptible tone.
  voice(context, master, 220, t, length * 0.55, 0.05 * peakScale);
  // 2. The bloom — the fifth above joins (harmonic movement).
  voice(context, master, 329.63, t + length * 0.22, length * 0.5, 0.035 * peakScale);
  // 3. The expansion — the octave, warm and brief.
  voice(context, master, 440, t + length * 0.5, length * 0.42, 0.028 * peakScale);
  // 4. The resonance — a low root underneath, felt more than heard.
  voice(context, master, 110, t + length * 0.1, length * 0.8, 0.02 * peakScale);
}

/* ── The Originals Ident — ~6s, same DNA, longer breath ────────────────
 * darkness → tiny light → environmental movement → expansion →
 * motif → resolution. Slower bloom, deeper root, a final suspended chord. */

export function playOriginalsIdent(options?: { reduced?: boolean }): void {
  const prefs = getSoundPreferences();
  if (!prefs.master || !prefs.cinematic) return;
  const context = ensureContext();
  if (!context || !master) return;
  if (context.state === "suspended") void context.resume();

  const t = context.currentTime + 0.05;
  const reduced = options?.reduced ?? false;
  const length = reduced ? 3 : 6;
  const peakScale = reduced ? 0.5 : 1;

  // The tiny light.
  voice(context, master, 220, t, length * 0.4, 0.04 * peakScale);
  // Environmental movement — a shimmering third.
  voice(context, master, 277.18, t + length * 0.18, length * 0.5, 0.022 * peakScale, "triangle");
  // The expansion — fifth and octave.
  voice(context, master, 329.63, t + length * 0.4, length * 0.45, 0.03 * peakScale);
  voice(context, master, 440, t + length * 0.55, length * 0.4, 0.024 * peakScale);
  // The deep root.
  voice(context, master, 110, t + length * 0.08, length * 0.85, 0.022 * peakScale);
  // The resolve — a suspended fourth settling home.
  voice(context, master, 587.33, t + length * 0.78, length * 0.2, 0.016 * peakScale);
}

/* ── Interface blips — tiny, quiet, optional ─────────────────────────── */

/** A soft confirmation tick — for toasts and quiet confirmations. */
export function playInterfaceTick(): void {
  const prefs = getSoundPreferences();
  if (!prefs.master || !prefs.interface) return;
  const context = ensureContext();
  if (!context || !master) return;
  if (context.state === "suspended") void context.resume();
  const t = context.currentTime + 0.01;
  voice(context, master, 660, t, 0.18, 0.02);
  voice(context, master, 880, t + 0.07, 0.14, 0.012);
}

/* ── Asset hooks — for real recorded audio later ────────────────────────
 * When recorded idents exist, place them in /public/sound/ and swap the
 * synth bodies above for Audio elements. The call sites never change:
 *
 *   const audio = new Audio("/sound/within-ident.mp3");
 *   audio.volume = 0.5;
 *   void audio.play().catch(() => undefined);
 *
 * Nothing else in the app needs to know which implementation is live. */
export const SOUND_ASSET_PATHS = {
  withinIdent: "/sound/within-ident.mp3",
  originalsIdent: "/sound/within-originals-ident.mp3",
} as const;
