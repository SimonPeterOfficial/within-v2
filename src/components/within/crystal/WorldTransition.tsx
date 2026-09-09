"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * WorldTransition — moving between routes feels like the same world
 * changing state, not a page reloading.
 *
 * A template-mounted light veil breathes once per route change: the
 * environment dims a whisper as you leave and brightens as you arrive.
 * The per-world tint tells the body which room it entered, so the shell's
 * environment can settle differently for Sanctuary vs. Discovery.
 */

const WORLD_TINT: Record<string, string> = {
  "/home": "rgba(200,185,252,0.16)",
  "/sanctuary": "rgba(190,220,235,0.2)",
  "/mirror": "rgba(175,185,235,0.18)",
  "/within": "rgba(200,180,252,0.2)",
  "/atlas": "rgba(150,190,240,0.16)",
  "/explore": "rgba(160,205,240,0.16)",
  "/discover": "rgba(160,205,240,0.16)",
  "/originals": "rgba(185,170,250,0.14)",
  "/conversations": "rgba(190,210,245,0.16)",
};

export default function WorldTransition() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotionSafe();
  const tint = WORLD_TINT[pathname] ?? "rgba(190,195,250,0.14)";

  return (
    <>
      {/* Per-world ambient tint — the room's own light */}
      <motion.div
        aria-hidden
        key={pathname}
        className="pointer-events-none fixed inset-0 z-[2]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 1.6, ease: "easeOut" }}
        style={{ background: `radial-gradient(ellipse 90% 60% at 50% 0%, ${tint}, transparent 70%)` }}
      />
      {/* The arrival veil — a single soft breath on route change */}
      <AnimatePresence mode="wait">
        <motion.div
          aria-hidden
          key={pathname}
          className="pointer-events-none fixed inset-0 z-[80] bg-white/40"
          initial={{ opacity: prefersReducedMotion ? 0 : 0.5 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: "easeOut" }}
        />
      </AnimatePresence>
    </>
  );
}
