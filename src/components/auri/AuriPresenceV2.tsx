"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import type { AuriState } from "@/lib/auri";

/**
 * AuriPresenceV2 — Auri integrated into the world.
 *
 * Auri is not a chatbot bubble or a floating widget. She is a presence
 * that lives inside the environment — sometimes barely there, sometimes
 * clearly present, sometimes guiding, sometimes simply observing.
 *
 * Visual language: owl-inspired, luminous, organic, mysterious, elegant,
 * non-human, intelligent, calm, pearlescent, crystalline.
 *
 * States: RESTING, LISTENING, THINKING, RESPONDING, QUIET, ATTENTION,
 * DISCOVERING, GUIDING.
 *
 * Motion: RESTING barely moves. LISTENING subtly reacts. THINKING has
 * restrained internal motion. RESPONDING uses subtle light. GUIDING
 * briefly illuminates. QUIET appears as reflection/light.
 */

const STATE_GLOW: Record<AuriState, { color: string; intensity: number; scale: number }> = {
  idle: { color: "rgba(168, 150, 250, 0.15)", intensity: 0.4, scale: 1 },
  observing: { color: "rgba(168, 150, 250, 0.2)", intensity: 0.5, scale: 1.02 },
  curious: { color: "rgba(139, 122, 236, 0.25)", intensity: 0.6, scale: 1.04 },
  greeting: { color: "rgba(139, 122, 236, 0.3)", intensity: 0.7, scale: 1.06 },
  thinking: { color: "rgba(99, 102, 241, 0.2)", intensity: 0.5, scale: 1.01 },
  listening: { color: "rgba(34, 211, 238, 0.2)", intensity: 0.5, scale: 1.02 },
  responding: { color: "rgba(139, 122, 236, 0.3)", intensity: 0.7, scale: 1.05 },
  sleeping: { color: "rgba(99, 102, 241, 0.1)", intensity: 0.3, scale: 0.98 },
  dormant: { color: "rgba(99, 102, 241, 0.05)", intensity: 0.2, scale: 0.96 },
  emerging: { color: "rgba(168, 150, 250, 0.35)", intensity: 0.8, scale: 1.08 },
  celebrating: { color: "rgba(245, 158, 11, 0.3)", intensity: 0.8, scale: 1.1 },
  dissolving: { color: "rgba(168, 150, 250, 0.1)", intensity: 0.3, scale: 0.97 },
};

export default function AuriPresenceV2({
  size = 120,
  state = "idle",
}: {
  size?: number;
  state?: AuriState;
}) {
  const prefersReducedMotion = useReducedMotionSafe();
  const glow = STATE_GLOW[state] ?? STATE_GLOW.idle;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Auri is ${state}`}
    >
      {/* The halo — Auri's presence in the world */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glow.color} 0%, transparent 70%)`,
          filter: "blur(8px)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [1, glow.scale, 1],
                opacity: [glow.intensity * 0.7, glow.intensity, glow.intensity * 0.7],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The light body — Auri's form */}
      <motion.svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden
        animate={
          prefersReducedMotion
            ? undefined
            : {
                y: [0, -3, 0],
              }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Head orb — pearlescent, crystalline */}
        <circle cx="50" cy="42" r="18" fill="url(#auri-head)" />
        {/* Internal bloom — the light within */}
        <circle cx="50" cy="42" r="10" fill="url(#auri-bloom)" />
        {/* Ring-iris eyes — calm light points */}
        <circle cx="44" cy="40" r="4" fill="none" stroke="rgba(139,122,236,0.6)" strokeWidth="1.5" />
        <circle cx="56" cy="40" r="4" fill="none" stroke="rgba(139,122,236,0.6)" strokeWidth="1.5" />
        <circle cx="44" cy="40" r="1.5" fill="rgba(255,255,255,0.9)" />
        <circle cx="56" cy="40" r="1.5" fill="rgba(255,255,255,0.9)" />
        {/* Flowing light-hair arcs — organic, mysterious */}
        <path
          d="M32 36 Q28 50 34 64"
          stroke="rgba(168,150,250,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M68 36 Q72 50 66 64"
          stroke="rgba(168,150,250,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Waveform collar — the crystalline necklace */}
        <path
          d="M38 62 Q42 58 46 62 Q50 66 54 62 Q58 58 62 62"
          stroke="rgba(139,122,236,0.5)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Light motes — the small luminous particles */}
        <circle cx="30" cy="50" r="1.5" fill="rgba(255,255,255,0.6)" />
        <circle cx="70" cy="48" r="1" fill="rgba(255,255,255,0.5)" />
        <circle cx="50" cy="28" r="1" fill="rgba(255,255,255,0.4)" />

        <defs>
          <radialGradient id="auri-head" cx="0.4" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="50%" stopColor="rgba(230,225,250,0.8)" />
            <stop offset="100%" stopColor="rgba(200,190,230,0.6)" />
          </radialGradient>
          <radialGradient id="auri-bloom" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
