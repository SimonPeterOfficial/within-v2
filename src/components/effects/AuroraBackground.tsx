"use client";

import { motion, useReducedMotion } from "framer-motion";

type AuroraBackgroundProps = {
  className?: string;
};

/**
 * Ambient aurora system — three large, slowly drifting volumetric glows
 * (purple, emerald, pink) that create soft depth behind the sanctuary.
 */
export default function AuroraBackground({ className = "" }: AuroraBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute -top-1/4 left-1/4 h-[60vh] w-[60vw] rounded-full bg-[rgba(var(--mood-rgb),0.2)] blur-[120px]"
        animate={
          prefersReducedMotion ? undefined : { x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/4 right-1/4 h-[60vh] w-[50vw] rounded-full bg-emerald-500/15 blur-[120px]"
        animate={
          prefersReducedMotion ? undefined : { x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-[40vh] w-[40vw] rounded-full bg-pink-500/10 blur-[100px]"
          animate={prefersReducedMotion ? undefined : { opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
