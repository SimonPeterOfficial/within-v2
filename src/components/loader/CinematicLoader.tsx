"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCinematicIntro } from "@/lib/useCinematicIntro";
import { ambientBreathe, smokeDissolve } from "@/lib/animations";
import LoaderParticles from "@/components/loader/LoaderParticles";
import LoaderWordmark from "@/components/loader/LoaderWordmark";

type Phase = "hidden" | "spark" | "gather" | "letters" | "credit" | "out" | "done";

/**
 * The cinematic timeline — black screen, first light, gathering particles,
 * the wordmark forming, credit lines, then a smoke dissolve into the page.
 * Roughly 7 seconds, skippable at any moment (click, tap, or any key).
 *
 * Timeline (ms from mount):
 *   spark    80      — a tiny light appears
 *   gather   1150    — dust motes gather around the core
 *   letters  2950    — the WithIn letters form
 *   credit   4600    — "A WithIn Original" / "From Cymon Studios"
 *   out      6400    — smoke dissolve begins
 *   done     7350    — unmount
 */
const TIMELINE: Array<[Phase, number]> = [
  ["spark", 80],
  ["gather", 1150],
  ["letters", 2950],
  ["credit", 4600],
  ["out", 6400],
  ["done", 7350]
];

export default function CinematicLoader() {
  const { play, markSeen } = useCinematicIntro();
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

    const timers: number[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };
    timersRef.current = timers;

    TIMELINE.forEach(([next, ms]) => schedule(() => setPhase(next), ms));
    schedule(finish, 7450);

    document.body.style.overflow = "hidden";

    // Any key skips the sequence (click is handled on the overlay itself).
    const onKeyDown = () => skip();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  const visible = phase !== "hidden" && phase !== "done";
  const dissolving = phase === "out" || phase === "done";

  return (
    visible && (
      <motion.div
        variants={smokeDissolve}
        initial={false}
        animate={dissolving ? "show" : "hidden"}
        onClick={skip}
        className="fixed inset-0 z-[90] flex cursor-pointer items-center justify-center overflow-hidden bg-black"
      >
        {/* Ambient breath behind the scene */}
        <motion.div
          aria-hidden
          variants={ambientBreathe(1.12, 7)}
          initial="hidden"
          animate="show"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[42vmin] w-[42vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.2)] blur-veil"
        />

        <LoaderParticles
          drifting={phase === "letters" || phase === "credit"}
          dissolving={dissolving}
        />

        <div className="relative flex flex-col items-center">
          <LoaderWordmark
            showLetters={phase === "letters" || phase === "credit"}
            creditStage={phase === "credit" ? 1 : 0}
          />
        </div>

        {/* Quiet skip hint — appears after the first beat */}
        <motion.p
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "credit" || dissolving ? 0 : 0.35 }}
          transition={{ duration: 1 }}
          className="absolute bottom-10 text-[10px] font-medium uppercase tracking-[0.45em] text-white/40"
        >
          Tap anywhere to skip
        </motion.p>

        {/* Accessible skip — reachable by keyboard */}
        <button
          type="button"
          onClick={skip}
          className="sr-only focus:not-sr-only focus:absolute focus:bottom-8 focus:left-1/2 focus:-translate-x-1/2 focus:rounded-full focus:border focus:border-white/20 focus:bg-white/10 focus:px-5 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest focus:text-white focus:backdrop-blur"
        >
          Skip intro
        </button>
      </motion.div>
    )
  );
}
