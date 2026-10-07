"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * WorldEntrance — the transition into a new world.
 *
 * A subtle entrance animation that plays when entering a new page.
 * The world doesn't snap into place — it fades in gently, like
 * stepping through a doorway. The entrance is brief and respects
 * reduced motion.
 *
 * The entrance is not a flashy animation — it's a soft fade that
 * feels like the world is revealing itself. The transition is
 * continuous, not jarring.
 */
export default function WorldEntrance({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
