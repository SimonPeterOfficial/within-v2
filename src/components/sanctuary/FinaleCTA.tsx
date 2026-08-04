"use client";

import { motion } from "framer-motion";
import StarField from "@/components/sanctuary/StarField";
import LightRays from "@/components/effects/LightRays";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import GradientText from "@/components/ui/GradientText";
import { blurUp, staggerContainer } from "@/lib/animations";

/** Closing cinematic moment — a door left open. */
export default function FinaleCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32 text-center text-white">
      {/* Central mood glow + closing light rays */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.07)] blur-glow"
      />
      <LightRays intensity={0.22} />
      <StarField count={40} seed={13} />

      <motion.div
        variants={staggerContainer(0.14, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="relative z-10"
      >
        <motion.p
          variants={blurUp}
          className="text-xs font-semibold uppercase tracking-[0.5em] text-emerald-400"
        >
          The door is open
        </motion.p>

        <motion.h2
          variants={blurUp}
          className="mt-6 text-5xl font-black leading-tight tracking-tight md:text-7xl"
        >
          Your universe is <GradientText>waiting.</GradientText>
        </motion.h2>

        <motion.p
          variants={blurUp}
          className="mx-auto mt-6 max-w-xl text-gray-400"
        >
          Every story, every feeling, every connection — one sanctuary within.
        </motion.p>

        <motion.div
          variants={blurUp}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic>
            <Button href="/login" variant="primary" size="xl">
              Enter WithIn
            </Button>
          </Magnetic>
          <Magnetic>
            <Button href="/signup" variant="outline" size="xl">
              Create your sanctuary
            </Button>
          </Magnetic>
        </motion.div>
      </motion.div>
    </section>
  );
}
