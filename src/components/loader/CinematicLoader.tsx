"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCinematicIntro } from "@/lib/useCinematicIntro";
import LoaderParticles from "@/components/loader/LoaderParticles";
import LoaderWordmark from "@/components/loader/LoaderWordmark";
import LoaderRipples from "@/components/loader/LoaderRipples";
import LoaderWaterSurface from "@/components/loader/LoaderWaterSurface";

type Phase = "hidden" | "spark" | "pulse" | "surface" | "gather" | "ripples" | "cosmic" | "letters" | "credit" | "out" | "done";

/**
 * THE FIRST BREATH — Auri awakening.
 *
 * A cinematic timeline: void → light → pulse → water surface → particles gather
 * → ripples → cosmic glow → wordmark forms → credits → dissolve into the world.
 *
 * For reduced-motion users: a beautiful static composition that fades in and out.
 *
 * Timeline (full animation): ~7 seconds, skippable at any moment.
 * Timeline (reduced motion): ~4 seconds, static composition with fade.
 */
const TIMELINE: Array<[Phase, number]> = [
  ["spark", 100],
  ["pulse", 600],
  ["surface", 1200],
  ["gather", 1800],
  ["ripples", 2400],
  ["cosmic", 3200],
  ["letters", 4000],
  ["credit", 5200],
  ["out", 6200],
  ["done", 7000],
];

/** Reduced motion timeline — much faster, skips animation phases */
const REDUCED_TIMELINE: Array<[Phase, number]> = [
  ["spark", 50],
  ["pulse", 200],
  ["surface", 400],
  ["gather", 600],
  ["ripples", 800],
  ["cosmic", 1000],
  ["letters", 1200],
  ["credit", 2000],
  ["out", 2800],
  ["done", 3200],
];

export default function CinematicLoader() {
  const { play, reduced, markSeen } = useCinematicIntro();
  const [phase, setPhase] = useState<Phase>("hidden");
  const skippedRef = useRef(false);
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    markSeen();
    setPhase("done");
  };

  const skip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    const out = window.setTimeout(() => setPhase("out"), 0);
    const end = window.setTimeout(finish, 950);
    timersRef.current = [out, end];
  };

  useEffect(() => {
    if (!play) return;

    const timeline = reduced ? REDUCED_TIMELINE : TIMELINE;
    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };
    timersRef.current = timers;

    timeline.forEach(([next, ms]) => schedule(() => setPhase(next), ms));
    // Final completion
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, reduced]);

  const visible = phase !== "hidden" && phase !== "done";
  const dissolving = phase === "out" || phase === "done";

  // Determine which sub-systems are active
  const showParticles = phase === "gather" || phase === "ripples" || phase === "cosmic" || phase === "letters" || phase === "credit";
  const showRipples = phase === "ripples" || phase === "cosmic" || phase === "letters" || phase === "credit";
  const showSurface = phase === "surface" || phase === "gather" || phase === "ripples" || phase === "cosmic" || phase === "letters" || phase === "credit";
  const showCosmic = phase === "cosmic" || phase === "letters" || phase === "credit";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cinematic-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: dissolving ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.3 : 0.8, ease: "easeInOut" }}
          onClick={skip}
          className="fixed inset-0 z-[90] flex cursor-pointer items-center justify-center overflow-hidden bg-black"
          role="status"
          aria-live="polite"
          aria-label="WithIn is opening"
        >
          <span className="sr-only">WithIn is loading</span>

          {/* Core spark — the first light */}
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={
              reduced
                ? { scale: 1, opacity: 1 }
                : dissolving
                  ? { scale: 2, opacity: 0 }
                  : phase === "spark"
                    ? { scale: [0, 0.6], opacity: [0, 0.8] }
                    : { scale: [0.6, 1, 1.1, 1], opacity: [0.8, 1, 0.9, 1] }
            }
            transition={{
              duration: reduced ? 0.3 : phase === "spark" ? 0.7 : 2,
              ease: "easeOut",
            }}
            className="relative h-2 w-2 rounded-full bg-white"
            style={{ boxShadow: "0 0 60px rgba(var(--mood-rgb), 0.5), 0 0 120px rgba(var(--mood-rgb), 0.2)" }}
          >
            {/* Halo — the pulse */}
            <motion.span
              className="absolute -inset-8 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(var(--mood-rgb), 0.12), transparent 70%)" }}
              animate={
                reduced
                  ? { opacity: 0.5 }
                  : dissolving
                    ? { opacity: 0 }
                    : phase === "pulse" || phase === "surface"
                      ? { opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.2, 0.9] }
                      : { opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }
              }
              transition={{ duration: 3, repeat: reduced ? 0 : Infinity, ease: "easeInOut" }}
            />
          </motion.span>

          {/* Water surface — concentric ellipses below the core */}
          <LoaderWaterSurface visible={showSurface} dissolving={dissolving} reduced={reduced} />

          {/* Cosmic glow — appears above the water as the scene deepens */}
          {showCosmic && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={dissolving ? { opacity: 0, scale: 1.2 } : { opacity: 0.25, scale: 1 }}
              transition={{ duration: reduced ? 0.3 : dissolving ? 0.8 : 2, ease: "easeOut" }}
              className="pointer-events-none absolute left-1/2 top-[35%] h-[35vmin] w-[35vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-soft"
              style={{ background: "radial-gradient(circle, rgba(var(--mood-rgb), 0.15), rgba(52,211,153,0.05) 40%, transparent 70%)" }}
            />
          )}

          {/* Particles — gathering around the core */}
          <LoaderParticles
            drifting={showParticles && !dissolving}
            dissolving={dissolving}
          />

          {/* Ripples — concentric rings expanding from the core */}
          <LoaderRipples visible={showRipples} dissolving={dissolving} reduced={reduced} />

          {/* Wordmark + credits */}
          <div className="relative flex flex-col items-center">
            <LoaderWordmark
              showLetters={phase === "letters" || phase === "credit"}
              creditStage={phase === "credit" ? 1 : 0}
              reduced={reduced}
            />
          </div>

          {/* Skip hint */}
          <motion.p
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "credit" || dissolving ? 0 : 0.3 }}
            transition={{ duration: 1 }}
            className="absolute bottom-10 text-[10px] font-medium uppercase tracking-[0.45em] text-white/40"
          >
            Tap anywhere to skip
          </motion.p>

          {/* Accessible skip */}
          <button
            type="button"
            onClick={skip}
            className="sr-only focus:not-sr-only focus:absolute focus:bottom-8 focus:left-1/2 focus:-translate-x-1/2 focus:rounded-full focus:border focus:border-white/20 focus:bg-white/10 focus:px-5 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest focus:text-white focus:backdrop-blur"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
