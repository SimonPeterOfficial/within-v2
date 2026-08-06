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
  emerald: "#34d399"
} as const;

export const gradients = {
  /** Brand gradient — purple to emerald (horizontal) */
  brand: `linear-gradient(90deg, ${colors.purple} 0%, ${colors.emerald} 100%)`,
  /** Soft orb gradient for glowing cores (bottom-right) */
  orb: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.emerald} 100%)`
} as const;

export const ease: {
  /** Standard deceleration curve */
  standard: [number, number, number, number];
  /** Emphasized, spring-like deceleration */
  emphasized: [number, number, number, number];
} = {
  standard: [0.4, 0, 0.2, 1],
  emphasized: [0.16, 1, 0.3, 1]
};

export const durations = {
  fast: 0.2,
  base: 0.4,
  slow: 0.7
} as const;

/** Builds an rgba() string from the live mood color (alpha 0–1). */
export function moodGlow(alpha: number): string {
  return `rgba(var(--mood-rgb), ${alpha})`;
}

/** Typography recipes — the type system.
 * Every text style in the universe comes from here so headlines never drift
 * between sections. Consume via the <Text> primitive or directly. */
export const typography = {
  /** Largest statement — landing heroes */
  display: "text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl",
  /** Page-level hero heading */
  hero: "text-4xl font-bold tracking-tight md:text-6xl",
  /** Section headings */
  sectionTitle: "text-4xl font-bold tracking-tight md:text-5xl",
  /** Supportive subheadings */
  subtitle: "text-lg text-gray-400",
  /** Default body copy */
  body: "text-base leading-relaxed",
  /** Small auxiliary text */
  caption: "text-sm text-gray-500",
  /** Uppercase kicker above titles */
  eyebrow: "text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400",
  /** Compact labels (chips, form labels) */
  label: "text-xs font-medium uppercase tracking-widest"
} as const;
