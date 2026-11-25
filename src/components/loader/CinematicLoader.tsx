"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playWithinIdent } from "@/lib/within-sound";
import { useEntrance } from "@/components/entrance/EntranceProvider";
import WithinMark from "@/components/ui/WithinMark";

type CinematicLoaderProps = {
  reduced: boolean;
  returning: boolean;
  markSeen: () => void;
};

type Phase =
  | "arrival"
  | "emblem"
  | "reflection"
  | "message"
  | "welcome"
  | "aperture"
  | "out"
  | "done";

const FIRST_VISIT: Array<[Phase, number]> = [
  ["emblem", 650],
  ["reflection", 1550],
  ["message", 2550],
  ["welcome", 3550],
  ["aperture", 4450],
  ["out", 4800],
  ["done", 5000],
];

const REDUCED_MOTION: Array<[Phase, number]> = [
  ["emblem", 80],
  ["message", 180],
  ["welcome", 340],
  ["out", 620],
  ["done", 800],
];

const RETURNING_VISIT: Array<[Phase, number]> = [
  ["emblem", 90],
  ["welcome", 260],
  ["aperture", 650],
  ["out", 900],
  ["done", 1100],
];

export default function CinematicLoader({ reduced, returning, markSeen }: CinematicLoaderProps) {
  const { markReady } = useEntrance();
  const [phase, setPhase] = useState<Phase>("arrival");
  const skippedRef = useRef(false);
  const completedRef = useRef(false);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markSeen();
    markReady();
    setPhase("done");
  }, [markSeen, markReady]);

  const skip = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    const out = window.setTimeout(() => setPhase("out"), 0);
    const end = window.setTimeout(finish, 420);
    timersRef.current = [out, end];
  }, [finish]);

  useEffect(() => {
    playWithinIdent({ reduced });

    const timeline = reduced
      ? REDUCED_MOTION
      : returning
        ? RETURNING_VISIT
        : FIRST_VISIT;
    const timers: number[] = [];
    timeline.forEach(([next, ms]) => {
      timers.push(window.setTimeout(() => setPhase(next), ms));
    });
    timers.push(
      window.setTimeout(() => finish(), timeline[timeline.length - 1][1]),
    );

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    skipButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        skip();
      } else if (event.key === "Tab") {
        event.preventDefault();
        skipButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    timersRef.current = timers;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [reduced, returning, skip, finish]);

  const visible = phase !== "done";
  const dissolving = phase === "out" || phase === "done";
  const markVisible = phase !== "arrival" && !dissolving;
  const messageVisible =
    phase === "message" || phase === "welcome" || phase === "aperture";
  const welcomeVisible = phase === "welcome" || phase === "aperture";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cinematic-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: dissolving ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.18 : 0.38, ease: "easeOut" }}
          onClick={skip}
          className="elysian-loader fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="WithIn is opening"
        >
          <motion.div
            aria-hidden="true"
            className="elysian-loader__light"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "arrival" ? 0.4 : 1 }}
            transition={{ duration: reduced ? 0.12 : 1.1, ease: "easeOut" }}
          />

          <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-6 text-center">
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{
                opacity: markVisible ? 1 : 0,
                scale: phase === "aperture" ? 1.12 : 1,
                y: markVisible ? 0 : 8,
              }}
              transition={{ duration: reduced ? 0.16 : 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="elysian-loader__emblem relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44"
            >
              <span className="elysian-loader__inner-light" />
              <WithinMark
                variant="mark"
                size={112}
                className="relative z-10 drop-shadow-[0_8px_32px_rgba(167,139,250,0.16)] sm:[&>span>svg]:!h-[128px] sm:[&>span>svg]:!w-[128px]"
              />
              {phase === "reflection" && !reduced && (
                <motion.span
                  key="emblem-reflection"
                  className="elysian-loader__reflection"
                  initial={{ x: "-145%", opacity: 0 }}
                  animate={{ x: "145%", opacity: [0, 0.8, 0] }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                />
              )}
            </motion.div>

            <div className="mt-6 min-h-[112px] sm:mt-8 sm:min-h-[124px]">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: messageVisible ? 1 : 0, y: messageVisible ? 0 : 8 }}
                transition={{ duration: reduced ? 0.14 : 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="text-[10px] font-medium uppercase tracking-[0.34em] text-[rgba(246,240,229,0.62)] sm:text-[11px]"
              >
                A moment to arrive.
              </motion.p>
              <motion.h1
                id="cinematic-loader-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: welcomeVisible ? 1 : 0, y: welcomeVisible ? 0 : 10 }}
                transition={{ duration: reduced ? 0.14 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 font-display text-[clamp(2.1rem,7vw,3.5rem)] font-medium leading-none tracking-[-0.035em] text-[var(--elysian-ink)]"
              >
                Welcome Within.
              </motion.h1>
            </div>
          </div>

          <button
            ref={skipButtonRef}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              skip();
            }}
            className="absolute bottom-8 z-20 rounded-full px-4 py-3 text-[10px] font-medium uppercase tracking-[0.26em] text-[rgba(246,240,229,0.48)] transition-colors hover:text-[var(--elysian-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(246,240,229,0.82)] sm:bottom-10"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
