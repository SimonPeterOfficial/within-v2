"use client";

import { motion } from "framer-motion";
import StarField from "@/components/sanctuary/StarField";
import LightRays from "@/components/effects/LightRays";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import GradientText from "@/components/ui/GradientText";
import { blurUp, staggerContainer } from "@/lib/animations";

type FinaleCTAProps = {
  primaryHref?: string;
};

/**
 * Closing cinematic moment — a door left open.
 *
 * "There is more Within." — the culmination of the journey.
 * Stars, light rays, and a deep vignette frame the final invitation.
 */
export default function FinaleCTA({ primaryHref = "/login" }: FinaleCTAProps) {
  return (
    <section className="relative overflow-hidden px-6 py-36 text-center text-white">
      {/* Central mood glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.04)] blur-glow"
      />
      <LightRays intensity={0.15} />
      <StarField count={40} seed={13} />

      {/* Deep vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]"
      />

      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      <motion.div
        variants={staggerContainer(0.18, 0.12)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="relative z-10"
      >
        <motion.p
          variants={blurUp}
          className="text-[11px] font-semibold uppercase tracking-[0.5em] text-emerald-400/60"
        >
          The door is open
        </motion.p>

        <motion.h2
          variants={blurUp}
          className="mx-auto mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] md:text-6xl lg:text-7xl"
        >
          There is more
          <GradientText className="italic"> Within.</GradientText>
        </motion.h2>

        <motion.p
          variants={blurUp}
          className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-gray-400/70"
        >
          Every story, every feeling, every connection — one sanctuary within.
        </motion.p>

        <motion.div
          variants={blurUp}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic>
            <Button href={primaryHref} variant="primary" size="xl">
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
