"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";

/**
 * AuriSignatureMoment — the defining interaction of WithIn.
 *
 * After the user has been on the page for a while without interacting,
 * Auri gently reveals a whisper — something like "You don't have to decide yet."
 * Then the interface subtly opens another path.
 *
 * This is rare. It happens once per session. It should feel like
 * WithIn noticed the user — not like a popup or notification.
 *
 * TRIGGER: 12 seconds of no meaningful interaction (no scroll, no click, no key).
 * RESET: Any interaction resets the timer.
 * ONCE: Plays at most once per page visit.
 */

const WHISPERS = [
  { text: "You don\u2019t have to decide yet.", subtext: "There\u2019s no rush here." },
  { text: "This place remembers you.", subtext: "Even if you\u2019re just passing through." },
  { text: "Stay as long as you like.", subtext: "The light will wait." },
];

const TRIGGER_DELAY_MS = 12000;

export default function AuriSignatureMoment() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [whisper, setWhisper] = useState<(typeof WHISPERS)[number] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const activeRef = useRef(true);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!activeRef.current || triggeredRef.current) return;
    timerRef.current = setTimeout(() => {
      if (!activeRef.current || triggeredRef.current) return;
      triggeredRef.current = true;
      const pick = WHISPERS[Math.floor(Math.random() * WHISPERS.length)];
      setWhisper(pick);
    }, TRIGGER_DELAY_MS);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Start the timer
    resetTimer();

    // Any meaningful interaction resets the timer (before trigger)
    const onInteract = () => {
      if (!triggeredRef.current) resetTimer();
    };

    window.addEventListener("scroll", onInteract, { passive: true });
    window.addEventListener("mousemove", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract);
    window.addEventListener("click", onInteract, { passive: true });

    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("mousemove", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("click", onInteract);
    };
  }, [prefersReducedMotion, resetTimer]);

  const dismiss = () => setWhisper(null);

  const openAuri = () => {
    window.dispatchEvent(new Event(AURI_OPEN_EVENT));
    dismiss();
  };

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      {whisper && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="fixed inset-0 z-[80] flex items-end justify-center pb-24 sm:items-center sm:pb-0"
          role="status"
          aria-live="polite"
          onClick={dismiss}
        >
          {/* Backdrop — extremely subtle, almost invisible */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

          {/* The whisper card */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-6 max-w-sm rounded-2xl border border-white/[0.06] bg-[#0a0914]/80 px-8 py-7 text-center backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Tiny Auri glow above the card */}
            <div
              aria-hidden
              className="absolute -top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.15)] blur-soft"
            />

            {/* The whisper text */}
            <p className="font-display text-lg font-medium leading-[1.3] tracking-[-0.01em] text-white/85">
              {whisper.text}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-400/60">
              {whisper.subtext}
            </p>

            {/* Subtle action */}
            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={openAuri}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[12px] font-medium text-gray-300 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white"
              >
                Talk to Auri
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="text-[12px] text-gray-500 transition-colors hover:text-gray-300"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
