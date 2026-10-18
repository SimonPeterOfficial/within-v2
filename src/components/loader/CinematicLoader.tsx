"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCinematicIntro } from "@/lib/useCinematicIntro";
import { playWithinIdent } from "@/lib/within-sound";
import LoaderParticles from "@/components/loader/LoaderParticles";
import LoaderRipples from "@/components/loader/LoaderRipples";
import LoaderWaterSurface from "@/components/loader/LoaderWaterSurface";
import AuriPresence from "@/components/auri/AuriPresence";
import { useEntrance } from "@/components/entrance/EntranceProvider";
import WithinMark from "@/components/ui/WithinMark";

type Phase =
  | "hidden"
  | "spark"
  | "pulse"
  | "surface"
  | "gather"
  | "ripples"
  | "cosmic"
  | "letters"
  | "credit"
  | "out"
  | "done";

/*
 * Simplified cinematic timeline tuned to a logo-centered experience.
 * The goal: a restrained logo emergence that never blocks the app.
 */
const TIMELINE: Array<[Phase, number]> = [
  ["spark", 60],
  ["pulse", 260],
  ["ripples", 560],
  ["letters", 900],
  ["out", 1400],
  ["done", 1600],
];

const REDUCED_TIMELINE: Array<[Phase, number]> = [
  ["spark", 40],
  ["pulse", 120],
  ["letters", 360],
  ["out", 900],
  ["done", 1200],
];

const RETURNING_TIMELINE: Array<[Phase, number]> = [
  ["spark", 30],
  ["letters", 280],
  ["out", 760],
  ["done", 1000],
];

export default function CinematicLoader() {
  const { play, reduced, returning, markSeen } = useCinematicIntro();
  const { markReady } = useEntrance();
  const [phase, setPhase] = useState<Phase>("hidden");
  const skippedRef = useRef(false);
  const completedRef = useRef(false);
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
    const end = window.setTimeout(finish, 500);
    timersRef.current = [out, end];
  }, [finish]);

  useEffect(() => {
    if (!play) return;

    // Optional ident sound
    playWithinIdent({ reduced });

    const timeline = reduced ? REDUCED_TIMELINE : returning ? RETURNING_TIMELINE : TIMELINE;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };
    timersRef.current = timers;

    timeline.forEach(([next, ms]) => schedule(() => setPhase(next), ms));
    const lastMs = timeline[timeline.length - 1][1] + 100;
    schedule(finish, lastMs);

    document.body.style.overflow = "hidden";

    const onKeyDown = () => skip();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [play, reduced, returning, finish, skip]);

  const visible = phase !== "hidden" && phase !== "done";
  const dissolving = phase === "out" || phase === "done";

  const logoVisible = phase === "spark" || phase === "pulse" || phase === "letters" || phase === "ripples" || phase === "cosmic";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cinematic-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: dissolving ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.25 : 0.7, ease: "easeInOut" }}
          onClick={skip}
          className="fixed inset-0 z-[90] flex cursor-pointer items-center justify-center overflow-hidden bg-[#050505]"
          role="status"
          aria-live="polite"
          aria-label="WithIn is opening"
        >
          <span className="sr-only">WithIn is loading</span>

          {/* Central logo presentation — the primary brand moment */}
          <div className="relative flex items-center justify-center">
            {/* Subtle sweep — a narrow monochrome light moving left → right */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={dissolving ? { opacity: 0 } : { opacity: logoVisible ? 0.18 : 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ mixBlendMode: "screen" }}
            >
              <motion.div
                initial={{ x: "-60%" }}
                animate={logoVisible ? { x: "60%" } : { x: "60%" }}
                transition={{ duration: reduced ? 0.9 : 1.6, ease: "easeInOut" }}
                className="h-[24vh] w-[45vh] rounded-full"
                style={{
                  background: "linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.0) 100%)",
                  filter: "blur(18px)",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.86, opacity: 0 }}
              animate={dissolving ? { scale: 1.04, opacity: 0 } : { scale: [0.94, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.45 : 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex items-center justify-center"
            >
              <WithinMark variant="stacked" size={160} className="drop-shadow-[0_0_56px_rgba(255,255,255,0.04)]" />
            </motion.div>

            {/* Soft core elements retained for depth, but de-emphasized */}
            <LoaderWaterSurface visible={phase === "surface" || phase === "gather"} dissolving={dissolving} reduced={reduced} />
            <LoaderRipples visible={phase === "ripples"} dissolving={dissolving} reduced={reduced} />
            <LoaderParticles drifting={phase === "gather" || phase === "ripples" || phase === "cosmic"} dissolving={dissolving} />

            {/* Wordmark — gentle reveal after logo settles */}
            <div className="absolute top-[62%] left-1/2 -translate-x-1/2">
              {/* LoaderWordmark kept for letter stagger (if used elsewhere). Use WithinMark stacked for strongest identity. */}
            </div>
          </div>

          {/* Skip hint — visible but unobtrusive */}
          <motion.p
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: dissolving ? 0 : 0.28 }}
            transition={{ duration: 1 }}
            className="absolute bottom-10 text-[10px] font-medium uppercase tracking-[0.45em] text-white/40"
          >
            Tap anywhere to skip
          </motion.p>

          {/* Accessible skip */}
          <button
            type="button"
            onClick={skip}
            className="sr-only focus:not-sr-only focus:absolute focus:bottom-8 focus:left-1/2 focus:-translate-x-1/2 focus:rounded-full focus:border focus:border-white/20 focus:bg-white/10"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
