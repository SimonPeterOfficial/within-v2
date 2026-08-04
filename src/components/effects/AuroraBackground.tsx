"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type AuroraBackgroundProps = {
  className?: string;
};

/**
 * The WithIn visual engine — living atmosphere.
 * Slow purple and emerald light drifts across layered volumetric glows,
 * always shifting with the active mood.
 */
export default function AuroraBackground({ className = "" }: AuroraBackgroundProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Mood veil — the dominant color, breathes wide */}
      <motion.div
        className="absolute -top-1/4 left-1/4 h-[60vh] w-[60vw] rounded-full bg-[rgba(var(--mood-rgb),0.07)] blur-veil"
        animate={
          prefersReducedMotion ? undefined : { x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Emerald counter-drift */}
      <motion.div
        className="absolute -bottom-1/4 right-1/4 h-[60vh] w-[50vw] rounded-full bg-emerald-500/[0.06] blur-veil"
        animate={
          prefersReducedMotion ? undefined : { x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Deep violet underglow for extra depth */}
      <motion.div
        className="absolute -left-1/4 bottom-1/4 h-[45vh] w-[45vw] rounded-full bg-violet-700/[0.06] blur-veil"
        animate={
          prefersReducedMotion ? undefined : { x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.12, 1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-[40vh] w-[40vw] rounded-full bg-pink-500/[0.04] blur-haze"
          animate={prefersReducedMotion ? undefined : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
