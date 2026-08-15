"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { moodGlow } from "@/lib/design";
import AuriOwl from "@/components/sanctuary/AuriOwl";

/**
 * Auri's first arrival — a short, elegant cinematic: dust settles, a small
 * light wakes, an owl silhouette gathers in it, the eyes open, and Auri is
 * here. Roughly three seconds, played once per browser on the first open.
 * Reduced Motion skips straight to the panel.
 */

type AuriEntranceProps = {
  onComplete: () => void;
};

/** Deterministic dust so SSR and client agree. */
const DUST = [
  { left: 22, top: 28, delay: 0.1, size: 3 },
  { left: 64, top: 18, delay: 0.45, size: 2 },
  { left: 78, top: 46, delay: 0.8, size: 2.5 },
  { left: 34, top: 62, delay: 1.1, size: 2 },
  { left: 58, top: 70, delay: 0.3, size: 3 },
  { left: 44, top: 24, delay: 0.65, size: 2 },
  { left: 70, top: 30, delay: 1.35, size: 2 }
];

const PHASE_DURATION = 3200;

export default function AuriEntrance({ onComplete }: AuriEntranceProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  // 0 dust → 1 light → 2 silhouette → 3 eyes → 4 full → 5 out
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 300),
      window.setTimeout(() => setPhase(2), 1000),
      window.setTimeout(() => setPhase(3), 1700),
      window.setTimeout(() => setPhase(4), 2300),
      window.setTimeout(() => setExiting(true), 2850),
      window.setTimeout(onComplete, PHASE_DURATION)
    ];
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [prefersReducedMotion, onComplete]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-xl"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <span className="sr-only">Auri is here.</span>
      <div aria-hidden className="vignette absolute inset-0" />

      {/* Dust — slow settling motes */}
      {DUST.map((dust, index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${dust.left}%`,
            top: `${dust.top}%`,
            width: dust.size,
            height: dust.size,
            background: moodGlow(0.7),
            boxShadow: `0 0 10px ${moodGlow(0.5)}`
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: phase >= 1 ? [0, 0.8, 0] : 0, y: -26 }}
          transition={{ duration: 3.2, delay: dust.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* The small light waking */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle, ${moodGlow(0.4)}, transparent 70%)`,
          opacity: phase >= 1 ? 1 : 0,
          transform: `scale(${phase >= 1 ? 1 : 0.4})`,
          transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.7s ease"
        }}
      />

      {/* The owl — silhouette first, then light gathers in her */}
      <motion.div
        aria-hidden
        className="relative"
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{
          opacity: phase >= 4 ? 1 : phase >= 2 ? 0.45 : 0,
          scale: phase >= 4 ? 1 : 0.92,
          filter: phase >= 4 ? "blur(0px)" : "blur(6px)"
        }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <AuriOwl size={120} glow={phase >= 1} />
        {/* The eyes opening — two small lights before the full face */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[38.75%] top-[52.5%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200 transition-all duration-500"
          style={{
            opacity: phase >= 3 && phase < 4 ? 1 : 0,
            boxShadow: "0 0 14px 4px rgba(255, 220, 150, 0.8)",
            transform: `translate(-50%, -50%) scale(${phase >= 3 ? 1 : 0.3})`
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-[61.25%] top-[52.5%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200 transition-all duration-500"
          style={{
            opacity: phase >= 3 && phase < 4 ? 1 : 0,
            boxShadow: "0 0 14px 4px rgba(255, 220, 150, 0.8)",
            transform: `translate(-50%, -50%) scale(${phase >= 3 ? 1 : 0.3})`
          }}
        />
      </motion.div>
    </motion.div>
  );
}
