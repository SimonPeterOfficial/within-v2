"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GradientText from "@/components/ui/GradientText";

const INTRO_KEY = "within:entered";

type IntroState = "pending" | "show" | "done";

/**
 * One-time per-session cinematic veil — the wordmark blooms in over a quiet
 * void, then lifts away to reveal the sanctuary. Respects reduced motion and
 * never plays twice in the same session.
 */
export default function CinematicIntro() {
  const [intro, setIntro] = useState<IntroState>(() => {
    if (typeof window === "undefined") return "done";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "done";
    try {
      if (sessionStorage.getItem(INTRO_KEY)) return "done";
    } catch {
      return "done";
    }
    return "pending";
  });

  useEffect(() => {
    if (intro !== "pending") return;
    try {
      sessionStorage.setItem(INTRO_KEY, "true");
    } catch {
      /* ignore storage errors */
    }
    const show = setTimeout(() => setIntro("show"), 80);
    const hide = setTimeout(() => setIntro("done"), 1900);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [intro]);

  return (
    <AnimatePresence>
      {intro === "show" && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center"
          >
            {/* Core orb */}
            <span
              className="animate-glow relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 text-2xl"
              style={{ boxShadow: "0 0 60px rgba(var(--mood-rgb), 0.6)" }}
            >
              ✦
            </span>
            <motion.span
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-4xl font-black tracking-tight"
            >
              <GradientText>WithIn</GradientText>
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-3 text-[11px] font-medium uppercase tracking-[0.5em] text-emerald-400"
            >
              Entering your universe
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
