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

/** Route-change veil — blur-rise reveal (used by app/template.tsx) */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: durations.base, ease: ease.emphasized }
  }
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

/** Spring preset for micro-interactions (dock indicator, icon hops) */
export const spring: { type: "spring"; stiffness: number; damping: number } = {
  type: "spring",
  stiffness: 380,
  damping: 28
};

/** Backwards-compatible alias */
export const fadeUp = slideUp;
