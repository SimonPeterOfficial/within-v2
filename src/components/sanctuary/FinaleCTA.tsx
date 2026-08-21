"use client";

import { motion } from "framer-motion";
import StarField from "@/components/sanctuary/StarField";
import LightRays from "@/components/effects/LightRays";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import GradientText from "@/components/ui/GradientText";
import { blurUp, staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

type FinaleCTAProps = {
  primaryHref?: string;
};

/**
 * Closing cinematic moment — like the end of a movie trailer.
 *
 * "There is more Within." — large atmospheric space, very minimal.
 * Stars, light rays, and a deep vignette frame the final invitation.
 */
export default function FinaleCTA({ primaryHref = "/login" }: FinaleCTAProps) {
  return (
    <section className="relative overflow-hidden px-6 py-44 text-center text-white">
      {/* Central mood glow — the room answering the final call */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[45%] h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.03)] blur-glow"
      />
      <LightRays intensity={0.12} />
      <StarField count={42} seed={13} />

      {/* Deep vignette — cinematic framing */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.68)_100%)]"
      />

      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      <motion.div
        variants={staggerContainer(0.2, 0.14)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="relative z-10"
      >
        <motion.p
          variants={blurUp}
          className="text-[11px] font-semibold uppercase tracking-[0.5em] text-emerald-400/55"
        >
          The door is open
        </motion.p>

        <motion.h2
          variants={blurUp}
          className="mx-auto mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.0] tracking-[-0.025em] md:text-6xl lg:text-7xl"
        >
          There is more
          <GradientText className="italic"> Within.</GradientText>
        </motion.h2>

        <motion.p
          variants={blurUp}
          className="mx-auto mt-6 max-w-md text-[15px] leading-[1.75] text-gray-400/60"
        >
          Every story, every feeling, every connection — one sanctuary within.
        </motion.p>

        <motion.div
          variants={blurUp}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic>
            <Button href={primaryHref} variant="primary" size="xl" onClick={(e) => fireRipple(e)}>
              Enter the universe
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
