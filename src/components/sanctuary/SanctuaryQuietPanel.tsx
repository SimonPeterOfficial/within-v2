"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * SanctuaryQuietPanel — the floating affirmation in the top-right corner.
 *
 * "Your sanctuary. Your peace. Your space." with a heart. Matches the
 * approved visual reference: a small frosted glass pill, dismissible,
 * sitting above the top-right of the viewport. The heart is a toggle —
 * pressing it acknowledges the room's invitation with a quiet pulse.
 *
 * No data stored. The gesture is local — this is not a save action.
 */
export default function SanctuaryQuietPanel() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [held, setHeld] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 20, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="fixed right-4 top-20 z-40 max-w-[200px] sm:right-6 sm:top-[72px]"
        >
          <div className="relative overflow-hidden rounded-[18px] border border-[rgba(var(--within-gold-rgb),0.22)] bg-[rgba(26,17,50,0.56)] px-4 py-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {/* Soft gold edge light */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--within-gold-rgb),0.4),transparent)]"
            />

            {/* Dismiss */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[rgba(var(--within-ivory-rgb),0.35)] transition hover:text-[rgba(var(--within-ivory-rgb),0.7)]"
            >
              <Icon name="close" size={10} />
            </button>

            <p className="pr-4 text-[12.5px] font-medium leading-snug text-[rgba(var(--within-ivory-rgb),0.9)]">
              Your sanctuary.
              <br />
              Your peace. Your space.
            </p>

            {/* Heart toggle — a quiet acknowledgement */}
            <button
              type="button"
              onClick={() => setHeld((prev) => !prev)}
              aria-pressed={held}
              aria-label={held ? "Release the moment" : "Hold this moment"}
              className="mt-2.5 flex items-center gap-1.5 transition"
            >
              <motion.span
                animate={held && !prefersReducedMotion ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <Icon
                  name="heart"
                  size={15}
                  className={
                    held
                      ? "text-[rgba(var(--within-gold-rgb),1)]"
                      : "text-[rgba(var(--within-ivory-rgb),0.4)]"
                  }
                />
              </motion.span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
