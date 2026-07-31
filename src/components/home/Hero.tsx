"use client";

import { motion, useReducedMotion } from "framer-motion";
import GlowBackground from "@/components/effects/GlowBackground";
import LightRays from "@/components/effects/LightRays";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import { blurUp, staggerContainer } from "@/lib/animations";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      <GlowBackground variant="hero" />
      <LightRays intensity={0.3} />
      <Navbar />

      <motion.div
        variants={staggerContainer(0.15, 0.2)}
        initial="hidden"
        animate="show"
        className="relative z-10 px-6 text-center"
      >
        <motion.p
          variants={blurUp}
          className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-400"
        >
          A cinematic universe of stories
        </motion.p>

        <motion.h1
          variants={blurUp}
          className="mt-6 text-6xl font-extrabold leading-[1.05] tracking-tight md:text-8xl"
        >
          Feel <GradientText>everything</GradientText>.
          <br />
          Find your world.
        </motion.h1>

        <motion.p
          variants={blurUp}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400"
        >
          WithIn is where stories, emotions, and people connect — a universe built around how
          you feel right now.
        </motion.p>

        <motion.div
          variants={blurUp}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button href="#emotions" variant="gradient" size="lg">
            Begin your journey
          </Button>
          <Button href="#originals" variant="outline" size="lg">
            Explore Originals
          </Button>
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
