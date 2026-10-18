"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { getVisitGlow } from "@/lib/light-memory";

/**
 * NavGlow — a soft light that remains behind navigation items you have visited.
 *
 * Not a badge, not a counter, not a "you were here" trophy. Just a gentle
 * glow — like warmth remaining in a room after someone has been there. The
 * glow brightens with repeat visits and fades gently over time.
 *
 * It uses only session memory: nothing is stored, nothing is sent anywhere.
 * It is courtesy, not personalization.
 */
export default function NavGlow({ href }: { href: string }) {
  const prefersReducedMotion = useReducedMotionSafe();
  const glow = getVisitGlow(href);

  if (glow <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: glow }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{
        background: `radial-gradient(circle at 50% 50%, rgba(var(--mood-rgb), ${glow * 0.12}), transparent 70%)`,
      }}
    />
  );
}
