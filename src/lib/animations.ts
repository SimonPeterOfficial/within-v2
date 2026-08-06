import type { Variants } from "framer-motion";
import { durations, ease } from "@/lib/design";

/** Container variant that staggers its children on reveal */
export const staggerContainer = (staggerChildren = 0.12, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } }
});

/** Pure fade — the quietest reveal */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: durations.base, ease: ease.standard } }
};

/** Fade + rise — the signature reveal */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: durations.base, ease: ease.emphasized } }
};

/** Cinematic pop-in for heroes and key frames */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: durations.base, ease: ease.emphasized } }
};

/** Cinematic blur-in (used by hero rotating words) */
export const blurUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: durations.base, ease: ease.emphasized }
  }
};

/** Cinematic dissolve — soft blur + scale + fade. The loader exit and any
 * smoke-like reveal. `hidden` is the settled state, `show` dissolves away. */
export const smokeDissolve: Variants = {
  hidden: { opacity: 1, scale: 1, filter: "blur(0px)" },
  show: {
    opacity: 0,
    scale: 1.05,
    filter: "blur(24px)",
    transition: { duration: 0.9, ease: ease.emphasized }
  }
};

/** Container variant that staggers its letters (used by the loader wordmark) */
export const letterStagger = (staggerChildren = 0.07): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren } }
});

/** Per-letter cinematic reveal — each glyph blurs sharp into focus */
export const letterReveal: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: ease.emphasized }
  }
};

/** Infinite ambient breathing — slow scale/opacity for glows and orbs */
export const ambientBreathe = (scale = 1.08, duration = 6): Variants => ({
  hidden: { scale: 1, opacity: 1 },
  show: {
    scale: [1, scale, 1],
    opacity: [1, 0.85, 1],
    transition: { duration, repeat: Infinity, ease: "easeInOut" }
  }
});

/** Glass shimmer — a light band glides across a surface once */
export const glassShimmer: Variants = {
  hidden: { x: "-130%" },
  show: { x: "230%", transition: { duration: 1.6, ease: ease.standard } }
};

/** Infinite gentle bob — use with animate="show" */
export const floating = (distance = 12, duration = 4): Variants => ({
  hidden: { y: 0 },
  show: {
    y: [0, -distance, 0],
    transition: { duration, repeat: Infinity, ease: "easeInOut" }
  }
});

/** Infinite breathing glow — use with animate="show" */
export const glowPulse = (glow = "rgba(var(--mood-rgb), 0.5)"): Variants => ({
  hidden: { boxShadow: `0 0 18px ${glow}` },
  show: {
    boxShadow: [`0 0 18px ${glow}`, `0 0 46px ${glow}`, `0 0 18px ${glow}`],
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
  }
});

/** Canonical name for the pulsing-glow variant */
export const pulseGlow = glowPulse;

/** Hover lift — cards and chips float up toward the cursor (whileHover="show") */
export const hoverLift = (distance = 6, duration = 0.3): Variants => ({
  hidden: { y: 0 },
  show: { y: -distance, transition: { duration, ease: ease.emphasized } }
});

/** Hover glow — a soft mood-tinted bloom wakes under the element (whileHover="show") */
export const hoverGlow = (glow = "rgba(var(--mood-rgb), 0.4)", duration = 0.35): Variants => ({
  hidden: { boxShadow: "0 0 0 rgba(0, 0, 0, 0)" },
  show: {
    boxShadow: `0 4px 32px ${glow}`,
    transition: { duration, ease: ease.standard }
  }
});

/** Dynamic reveal variant — pass a delay via the `custom` prop */
export const revealVariant = (distance = 24): Variants => ({
  hidden: { opacity: 0, y: distance },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: ease.emphasized, delay }
  })
});

/** Dreamy route transition — the page blurs sharp into focus as it rises */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: durations.slow, ease: ease.emphasized }
  }
};

/** Icon micro-interaction — pops in on a soft spring */
export const iconPop: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 24 }
  }
};

/** Canonical motion presets — pick by name instead of hand-rolling variants */
export const presets = {
  fade: fadeIn,
  rise: slideUp,
  scale: scaleIn,
  blur: blurUp,
  page: pageTransition,
  smoke: smokeDissolve,
  shimmer: glassShimmer,
  pop: iconPop
} as const;

/** Spring preset for micro-interactions (dock indicator, icon hops) */
export const spring: { type: "spring"; stiffness: number; damping: number } = {
  type: "spring",
  stiffness: 380,
  damping: 28
};

/** Backwards-compatible alias */
export const fadeUp = slideUp;
