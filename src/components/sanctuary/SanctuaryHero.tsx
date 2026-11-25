"use client";

import { motion } from "framer-motion";
import StarField from "@/components/sanctuary/StarField";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { blurUp, staggerContainer } from "@/lib/animations";

/** Founder copy — verbatim, per docs/vision/sanctuary-spec.md §3.C. */
const HEADLINE = "You can slow down here.";
const SUPPORTING =
  "Take a breath. Leave the noise behind for a moment. This space is yours.";

/**
 * SanctuaryHero — the opening of the quiet room.
 *
 * Evolved in place (not superseded): the previous cinematic "WithIn"
 * display headline gives way to the founder's own words, and the parallax
 * layers are retired in favor of stillness — the world behind the room
 * already breathes on its own. What remains is light: one warm glow,
 * a slow starfield, and typography given room.
 *
 * Motion discipline (BRAND §5): a single entrance, no loops; everything
 * settles. Reduced motion collapses the entrance to a simple appear.
 */
export default function SanctuaryHero() {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <section
      aria-label="Sanctuary"
      className="relative flex min-h-[78vh] items-center justify-center px-6 pb-12 pt-28 md:min-h-[84vh]"
    >
      {/* ── Atmosphere — the world shows through; only light is added here ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Star drift over the dusk — reserved for the upper air */}
        <div className="absolute inset-x-0 top-0 h-[58%] opacity-60 [mask-image:linear-gradient(180deg,black,transparent)]">
          <StarField count={30} seed={11} />
        </div>
        {/* One quiet glow behind the words — settles, never pulses */}
        <div
          className="absolute left-1/2 top-[36%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(var(--within-gold-rgb),0.1) 0%, transparent 70%)",
          }}
        />
        {/* The horizon line the room was always going to have */}
        <span className="absolute bottom-14 left-1/2 h-px w-40 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(var(--within-gold-rgb),0.4),transparent)] md:w-56" />
      </div>

      {/* ── The words ── */}
      <motion.div
        variants={staggerContainer(0.16, 0.12)}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.p
          variants={prefersReducedMotion ? undefined : blurUp}
          className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[rgba(var(--within-gold-rgb),0.85)]"
        >
          Sanctuary
        </motion.p>

        <motion.h1
          variants={prefersReducedMotion ? undefined : blurUp}
          className="mt-7 font-display text-[clamp(2.6rem,7vw,4.5rem)] font-medium leading-[1.04] tracking-[-0.02em] text-ui-ink"
        >
          {HEADLINE}
        </motion.h1>

        <motion.p
          variants={prefersReducedMotion ? undefined : blurUp}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-ui-soft md:text-base"
        >
          {SUPPORTING}
        </motion.p>

      </motion.div>
    </section>
  );
}
