"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * WithinEnvironment — the world the interface floats inside.
 *
 * A fixed, GPU-cheap atmosphere: deep color fields, two ambient light
 * sources that drift over minutes (not seconds), sparse particles that
 * suggest depth, and a vignette that keeps the edges of the world dark.
 * Rendered once per page root; every surface above refracts it.
 */

type Props = {
  /** "cosmos" full depth; "calm" reduces field intensity for Sanctuary/Mirror */
  variant?: "cosmos" | "calm";
  /** Particle count — keep low (4–8) for performance */
  particles?: number;
};

export default function WithinEnvironment({ variant = "cosmos", particles = 6 }: Props) {
  const prefersReducedMotion = useReducedMotionSafe();

  // Deterministic particles — stable between server and client.
  const dots = useMemo(
    () =>
      Array.from({ length: particles }, (_, i) => ({
        id: i,
        x: ((i * 61.8) % 100),
        y: ((i * 38.2) % 100),
        size: 1 + ((i * 7) % 3) * 0.7,
        duration: 26 + ((i * 13) % 18),
        delay: (i * 3.7) % 12,
        cyan: i % 3 === 0,
      })),
    [particles]
  );

  const calm = variant === "calm";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep field — the base of the world */}
      <div
        className="absolute inset-0"
        style={{
          background: calm
            ? "radial-gradient(ellipse 110% 65% at 18% -8%, rgba(45,212,191,0.045), transparent 55%), radial-gradient(ellipse 90% 55% at 88% 105%, rgba(99,102,241,0.05), transparent 58%)"
            : "radial-gradient(ellipse 120% 70% at 80% -12%, rgba(88,52,168,0.13), transparent 58%), radial-gradient(ellipse 95% 60% at 6% 108%, rgba(34,211,238,0.055), transparent 60%), radial-gradient(ellipse 65% 45% at 48% 42%, rgba(120,90,190,0.045), transparent 62%)",
        }}
      />

      {/* Ambient light sources — drifting over ~40s, nearly subliminal */}
      <motion.div
        className="absolute -left-[15%] top-[8%] h-[46vmax] w-[46vmax] rounded-full blur-glow"
        style={{ background: calm ? "rgba(45,212,191,0.04)" : "rgba(139,92,246,0.07)" }}
        animate={prefersReducedMotion ? undefined : { x: [0, 40, 0], y: [0, 26, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[12%] bottom-[6%] h-[38vmax] w-[38vmax] rounded-full blur-glow"
        style={{ background: calm ? "rgba(99,102,241,0.04)" : "rgba(34,211,238,0.05)" }}
        animate={prefersReducedMotion ? undefined : { x: [0, -30, 0], y: [0, -20, 0], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Depth particles — sparse, slow, weightless */}
      {dots.map((dot) => (
        <motion.span
          key={dot.id}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            background: dot.cyan ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.4)",
            boxShadow: dot.cyan ? "0 0 6px rgba(34,211,238,0.4)" : "0 0 5px rgba(255,255,255,0.25)",
          }}
          animate={prefersReducedMotion ? undefined : { y: [0, -34, 0], opacity: [0.12, 0.5, 0.12] }}
          transition={{ duration: dot.duration, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
        />
      ))}

      {/* Vignette — the edges of the world stay dark */}
      <div className="vignette absolute inset-0" />
    </div>
  );
}
