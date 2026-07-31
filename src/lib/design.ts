/**
 * Design tokens for the WithIn Sanctuary.
 * Single source of truth so the visual language stays consistent across components.
 */

export const shadows = {
  /** Floating dock shadow */
  dock: "0 10px 40px rgba(0, 0, 0, 0.4)",
  /** Purple bloom for primary brand elements */
  glowPurple: "0 0 60px rgba(168, 85, 247, 0.45)",
  /** Bloom behind the primary CTA */
  glowCTA: "0 0 45px rgba(168, 85, 247, 0.45)",
  /** Bloom behind the Auri orb */
  glowOrb: "0 0 40px rgba(168, 85, 247, 0.45)",
  /** Hover bloom for glass cards */
  cardHover: "0 0 50px rgba(168, 85, 247, 0.25)"
} as const;

export const gradients = {
  /** Brand gradient — purple to emerald (horizontal) */
  brand: "linear-gradient(90deg, #a78bfa 0%, #34d399 100%)",
  /** Soft orb gradient for the Auri core (bottom-right) */
  orb: "linear-gradient(135deg, #a78bfa 0%, #34d399 100%)"
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
