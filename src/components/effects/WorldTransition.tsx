"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * WorldTransition — the transition between worlds.
 *
 * A subtle, cinematic transition that plays when navigating between
 * routes. The world doesn't snap — it dissolves and reforms. The
 * transition is brief (under 400ms) and respects reduced motion.
 *
 * The transition is not a flashy animation — it's a soft crossfade
 * that feels like moving through a doorway. The world is continuous.
 */
export default function WorldTransition() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotionSafe();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      key={pathname}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)",
      }}
    />
  );
}
