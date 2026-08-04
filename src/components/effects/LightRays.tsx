"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type LightRaysProps = {
  /** Ray intensity 0–1 */
  intensity?: number;
  className?: string;
};

const RAY_GRADIENT =
  "repeating-conic-gradient(" +
  "from 0deg, " +
  "rgba(var(--mood-rgb),0.06) 0deg 10deg, " +
  "transparent 10deg 28deg, " +
  "rgba(52,211,153,0.05) 28deg 38deg, " +
  "transparent 38deg 60deg)";

const RAY_MASK =
  "radial-gradient(circle at center, transparent 22%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.35) 100%)";

/**
 * Cinematic volumetric light rays — a pair of counter-rotating conic beams
 * that breathe behind the content. The center stays clear so typography
 * remains legible; the rays shift with the live mood color. Pure transform
 * rotation, so it stays on the compositor thread.
 */
export default function LightRays({ intensity = 0.3, className = "" }: LightRaysProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        style={{
          x: "-50%",
          y: "-50%",
          background: RAY_GRADIENT,
          WebkitMaskImage: RAY_MASK,
          maskImage: RAY_MASK,
          // Cap the layer so it never exceeds GPU texture limits on large displays
          maxWidth: "2400px",
          maxHeight: "2400px"
        }}
        className="absolute left-1/2 top-1/2 h-[170vmax] w-[170vmax]"
      />
      <motion.div
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        style={{
          x: "-50%",
          y: "-50%",
          background: RAY_GRADIENT,
          WebkitMaskImage: RAY_MASK,
          maskImage: RAY_MASK,
          opacity: 0.45,
          maxWidth: "2400px",
          maxHeight: "2400px"
        }}
        className="absolute left-1/2 top-1/2 h-[130vmax] w-[130vmax]"
      />
    </div>
  );
}
