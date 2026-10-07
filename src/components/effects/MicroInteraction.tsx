"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * MicroInteraction — consistent micro-interaction wrapper.
 *
 * Provides consistent timing and material behavior for small interactions:
 * - button press
 * - navigation activation
 * - tab selection
 * - portal interaction
 * - save / follow / open / close
 *
 * Timing tokens:
 *   fast: 150ms (small controls, feedback)
 *   medium: 280ms (panels, navigation)
 *   slow: 500ms (large surfaces)
 *
 * Do not animate everything. Every interaction should have a reason.
 */

type MicroInteractionProps = {
  children: React.ReactNode;
  variant?: "press" | "lift" | "fade" | "scale";
  duration?: "fast" | "medium" | "slow";
  className?: string;
};

export default function MicroInteraction({
  children,
  variant = "press",
  duration = "fast",
  className = "",
}: MicroInteractionProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const durationMap = {
    fast: 0.15,
    medium: 0.28,
    slow: 0.5,
  };

  const variants = {
    press: {
      whileTap: { scale: 0.97 },
      transition: { duration: durationMap[duration], ease: [0.4, 0, 0.2, 1] as const },
    },
    lift: {
      whileHover: { y: -2 },
      whileTap: { scale: 0.98 },
      transition: { duration: durationMap[duration], ease: [0.16, 1, 0.3, 1] as const },
    },
    fade: {
      whileHover: { opacity: 0.9 },
      whileTap: { opacity: 0.8 },
      transition: { duration: durationMap[duration], ease: [0.4, 0, 0.2, 1] as const },
    },
    scale: {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { duration: durationMap[duration], ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <motion.div className={className} {...variants[variant]}>
      {children}
    </motion.div>
  );
}
