"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type FogLayerProps = {
  /** Fog density 0–1 — keep it a whisper */
  intensity?: number;
  className?: string;
};

/**
 * Subtle ground fog — two broad, heavily blurred veils that drift past each
 * other in opposite directions. It reads as slow cinematic movement, never as
 * texture noise: opacity stays low, and the whole layer sits behind the glow.
 * Pure transform animation, so it stays on the compositor thread.
 */
export default function FogLayer({ intensity = 0.5, className = "" }: FogLayerProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  const opacity = 0.05 * intensity;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      {/* Near fog — low, wide, drifts right */}
      <motion.div
        className="absolute -left-1/4 bottom-[8%] h-[36vh] w-[150vw] rounded-[100%] bg-white blur-haze"
        animate={prefersReducedMotion ? undefined : { x: [0, 90, 0] }}
        transition={{ duration: 46, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Far fog — higher, thinner, drifts left */}
      <motion.div
        className="absolute -right-1/4 bottom-[22%] h-[30vh] w-[130vw] rounded-[100%] bg-emerald-200/40 blur-glow"
        animate={prefersReducedMotion ? undefined : { x: [0, -70, 0] }}
        transition={{ duration: 58, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
