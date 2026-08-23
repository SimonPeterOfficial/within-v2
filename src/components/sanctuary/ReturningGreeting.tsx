"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  getUniverseState,
  getUniverseDepth,
  getDominantInterest,
} from "@/lib/universe/state";

/**
 * ReturningGreeting — a subtle atmospheric moment when returning users arrive.
 *
 * Not a notification. Not a popup. A tiny atmospheric whisper that appears
 * briefly then dissolves. The user should feel: "WithIn noticed I'm back."
 *
 * Only shows for users with depth > 1 (not first visit).
 * Deterministic — same state = same message.
 * Appears once per page load, then fades.
 */
function computeGreeting(): string | null {
  try {
    const state = getUniverseState();
    const depth = getUniverseDepth(state);

    // Only show for returning users
    if (depth <= 1) return null;

    const dominant = getDominantInterest(state);
    const hour = new Date().getHours();

    // Time-aware greeting
    if (hour >= 5 && hour < 12) return "The morning light is different here.";
    if (hour >= 12 && hour < 17) return "The afternoon is still unfolding.";
    if (hour >= 17 && hour < 22) return "Evening settles gently.";

    // Depth-aware
    if (depth >= 5) return "You've wandered far since last time.";
    if (state.betweenVisited) return "The spaces between still echo.";
    if (state.doorDiscovered) return "The door is still open.";

    // Content-aware
    if (dominant) {
      const contentMessages: Record<string, string> = {
        original: "The stories are still here.",
        music: "The sound hasn't stopped.",
        book: "The pages are patient.",
        photo: "The light is still waiting.",
        creator: "Someone new may be nearby.",
        community: "The rooms are quiet tonight.",
      };
      if (contentMessages[dominant]) return contentMessages[dominant];
    }

    return "The night remembers you.";
  } catch {
    return null;
  }
}

export default function ReturningGreeting() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [message, setMessage] = useState<string | null>(() => computeGreeting());

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-x-0 top-20 z-[8] flex justify-center px-6"
        >
          <span className="rounded-full border border-white/[0.04] bg-white/[0.02] px-5 py-2 text-[11px] italic text-gray-500/40 backdrop-blur-sm">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
