import type { Variants } from "framer-motion";
import { durations, ease } from "@/lib/design";

/** Container variant that staggers its children on reveal */
export const staggerContainer = (staggerChildren = 0.12, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } }
});

/** Fade + rise — the signature reveal */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: durations.base, ease: ease.emphasized } }
};

/** Cinematic blur-in (used by hero rotating words) */
export const blurUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: durations.base, ease: ease.emphasized } }
};

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
