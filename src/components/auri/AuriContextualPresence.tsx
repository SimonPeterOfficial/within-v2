"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import type { AuriState } from "@/lib/auri";

/**
 * AuriContextualPresence — Auri integrated into the world contextually.
 *
 * Auri is not a chatbot bubble or a floating widget. She is a presence
 * that lives inside the environment — sometimes barely there, sometimes
 * clearly present, sometimes guiding, sometimes simply observing.
 *
 * The visual state changes based on the current route:
 *   Home → idle / welcoming
 *   Explore → curious / discovering
 *   Studio → focused / creative
 *   Sanctuary → soft / quiet
 *   Messages → subtle / attentive
 *   Worlds → exploratory
 *
 * IMPORTANT: This is purely visual. No fake intelligence is claimed.
 * The states are visual representations of Auri's presence, not
 * claims of real AI capabilities.
 */

const ROUTE_STATE: Record<string, AuriState> = {
  "/home": "idle",
  "/explore": "curious",
  "/discover": "curious",
  "/studio": "thinking",
  "/sanctuary": "sleeping",
  "/mirror": "observing",
  "/conversations": "listening",
  "/communities": "observing",
  "/creators": "curious",
  "/originals": "observing",
  "/books": "idle",
  "/music": "listening",
  "/photography": "observing",
  "/atlas": "thinking",
  "/within": "greeting",
  "/journey": "observing",
  "/profile": "idle",
  "/settings": "idle",
};

const STATE_LABEL: Record<AuriState, string> = {
  idle: "resting",
  observing: "watching",
  curious: "wondering",
  greeting: "welcoming",
  thinking: "thinking",
  listening: "listening",
  responding: "responding",
  sleeping: "sleeping",
  dormant: "quiet",
  emerging: "emerging",
  celebrating: "celebrating",
  dissolving: "fading",
};

export default function AuriContextualPresence() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotionSafe();
  const state = ROUTE_STATE[pathname] ?? "idle";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed bottom-24 left-4 z-navigation hidden lg:block"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2">
        {/* Auri's luminous form */}
        <motion.div
          className="relative"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, -2, 0],
                }
          }
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* The halo */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(168, 150, 250, 0.12) 0%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />
          {/* The form */}
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" className="relative">
            <circle cx="50" cy="42" r="18" fill="url(#auri-ctx-head)" />
            <circle cx="50" cy="42" r="10" fill="url(#auri-ctx-bloom)" />
            <circle cx="44" cy="40" r="4" fill="none" stroke="rgba(139,122,236,0.6)" strokeWidth="1.5" />
            <circle cx="56" cy="40" r="4" fill="none" stroke="rgba(139,122,236,0.6)" strokeWidth="1.5" />
            <circle cx="44" cy="40" r="1.5" fill="rgba(255,255,255,0.9)" />
            <circle cx="56" cy="40" r="1.5" fill="rgba(255,255,255,0.9)" />
            <path d="M38 62 Q42 58 46 62 Q50 66 54 62 Q58 58 62 62" stroke="rgba(139,122,236,0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <defs>
              <radialGradient id="auri-ctx-head" cx="0.4" cy="0.3" r="0.8">
                <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="50%" stopColor="rgba(230,225,250,0.8)" />
                <stop offset="100%" stopColor="rgba(200,190,230,0.6)" />
              </radialGradient>
              <radialGradient id="auri-ctx-bloom" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
        {/* The state label */}
        <span className="text-[10px] font-medium tracking-wide text-[#8b8aa0]">
          {STATE_LABEL[state]}
        </span>
      </div>
    </motion.div>
  );
}
