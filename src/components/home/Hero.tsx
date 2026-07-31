"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import GlowBackground from "@/components/effects/GlowBackground";
import Navbar from "@/components/layout/Navbar";
import GradientText from "@/components/ui/GradientText";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      <GlowBackground variant="hero" />
      <Navbar />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 px-6 text-center"
      >
        <motion.p
          variants={item}
          className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-400"
        >
          A cinematic universe of stories
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-6 text-6xl font-extrabold leading-[1.05] tracking-tight md:text-8xl"
        >
          Feel <GradientText>everything</GradientText>.
          <br />
          Find your world.
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400"
        >
          WithIn is where stories, emotions, and people connect — a universe built around how
          you feel right now.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#emotions"
            className="rounded-full bg-linear-to-r from-purple-500 to-emerald-400 px-8 py-3.5 text-sm font-bold text-black transition hover:scale-105 hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]"
          >
            Begin your journey
          </a>
          <a
            href="#originals"
            className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-white/30 hover:bg-white/10"
          >
            Explore Originals
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#emotions"
        aria-label="Scroll to moods"
        animate={prefersReducedMotion ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <span className="h-2 w-1 rounded-full bg-emerald-400" />
        </span>
      </motion.a>
    </section>
  );
}
