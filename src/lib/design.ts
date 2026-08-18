/**
 * WithIn design tokens — the TS side of the visual language.
 *
 * Class-level tokens (radius, blur, elevation, spacing) are declared in
 * `src/app/globals.css` inside `@theme`, which generates utilities such as
 * `rounded-card`, `blur-veil`, and `shadow-dock`. This module holds the
 * values that must be referenced from JavaScript (inline styles, variants).
 */

/** Brand palette — the two lights every gradient is built from. */
export const colors = {
  purple: "#a78bfa",
  violet: "#8b5cf6",
  indigo: "#6366f1",
  teal: "#2dd4bf",
  emerald: "#34d399",
  cyan: "#22d3ee",
  pink: "#ec4899",
  rose: "#f43f5e",
  amber: "#f59e0b"
} as const;

export const gradients = {
  /** Brand gradient — purple to emerald (horizontal) */
  brand: `linear-gradient(90deg, ${colors.purple} 0%, ${colors.emerald} 100%)`,
  /** Soft orb gradient for glowing cores (bottom-right) */
  orb: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.emerald} 100%)`,
  /** Deep cinematic — violet to indigo */
  cinematic: `linear-gradient(135deg, ${colors.violet} 0%, ${colors.indigo} 100%)`,
  /** Quiet editorial — subtle purple wash */
  editorial: `linear-gradient(135deg, ${colors.violet} 0%, ${colors.purple} 50%, ${colors.teal} 100%)`,
  /** Teal warmth — for peaceful sections */
  calm: `linear-gradient(135deg, ${colors.teal} 0%, ${colors.emerald} 100%)`
} as const;

export const ease: {
  /** Standard deceleration curve */
  standard: [number, number, number, number];
  /** Emphasized, spring-like deceleration */
  emphasized: [number, number, number, number];
  /** Slow cinematic ease */
  cinematic: [number, number, number, number];
} = {
  standard: [0.4, 0, 0.2, 1],
  emphasized: [0.16, 1, 0.3, 1],
  cinematic: [0.25, 0.1, 0.25, 1]
};

export const durations = {
  instant: 0.1,
  fast: 0.2,
  base: 0.4,
  slow: 0.7,
  cinematic: 1.2
} as const;

/** Builds an rgba() string from the live mood color (alpha 0–1). */
export function moodGlow(alpha: number): string {
  return `rgba(var(--mood-rgb), ${alpha})`;
}

/**
 * Mood-specific color mappings — when a mood is selected, these colors
 * guide the atmosphere engine. Each mood maps to a primary palette so
 * the whole universe shifts together.
 */
export const moodColors = {
  inspired: { primary: "#a78bfa", glow: "rgba(167,139,250,0.45)" },
  reflective: { primary: "#6366f1", glow: "rgba(99,102,241,0.45)" },
  peaceful: { primary: "#2dd4bf", glow: "rgba(45,212,191,0.45)" },
  lost: { primary: "#8b5cf6", glow: "rgba(139,92,246,0.45)" },
  hopeful: { primary: "#34d399", glow: "rgba(52,211,153,0.45)" },
  curious: { primary: "#22d3ee", glow: "rgba(34,211,238,0.45)" },
  motivated: { primary: "#f59e0b", glow: "rgba(245,158,11,0.45)" },
  calm: { primary: "#2dd4bf", glow: "rgba(45,212,191,0.4)" },
  nostalgic: { primary: "#ec4899", glow: "rgba(236,72,153,0.4)" },
  overwhelmed: { primary: "#6366f1", glow: "rgba(99,102,241,0.4)" }
} as const;

/** Typography recipes — the type system.
 * Headlines speak in the editorial display face (Fraunces) with generous
 * leading and tightened tracking; body copy stays in Geist. Every style in
 * the universe comes from here so headlines never drift between sections.
 * Consume via the <Text> primitive or directly. */
export const typography = {
  /** Largest statement — the landing hero */
  display: "font-display font-medium text-6xl leading-[0.98] tracking-[-0.03em] md:text-8xl",
  /** Page-level hero heading */
  hero: "font-display font-medium text-4xl leading-[1.02] tracking-[-0.02em] md:text-6xl",
  /** Section headings — editorial, wide-set */
  sectionTitle: "font-display font-semibold text-3xl leading-[1.08] tracking-[-0.02em] md:text-5xl",
  /** Sub-section headings */
  subsection: "font-display font-medium text-2xl leading-[1.12] tracking-[-0.01em] md:text-3xl",
  /** Supportive subheadings */
  subtitle: "text-lg leading-relaxed text-gray-400",
  /** Default body copy */
  body: "text-base leading-relaxed",
  /** Small auxiliary text */
  caption: "text-sm text-gray-500",
  /** Micro text — metadata, timestamps */
  micro: "text-xs text-gray-500",
  /** Uppercase kicker above titles — quiet, widely tracked */
  eyebrow: "text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400",
  /** Compact labels (chips, form labels) */
  label: "text-[11px] font-medium uppercase tracking-[0.2em]"
} as const;
