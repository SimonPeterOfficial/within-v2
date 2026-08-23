"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useHomeFeedComposition } from "@/components/sanctuary/HomeFeedShuffler";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * HomeFeed — the curated feed that renders based on universe state.
 *
 * This component reads the feed composition from HomeFeedShuffler
 * and renders each section in the determined order with subtle
 * entrance animations. Each section is wrapped in Suspense for
 * code-splitting.
 */
export default function HomeFeed() {
  const prefersReducedMotion = useReducedMotionSafe();
  const { mode, sections } = useHomeFeedComposition();

  return (
    <div className="relative">
      {/* Feed mode indicator — extremely subtle, for observability */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center py-2"
      >
        <span className="text-[9px] font-medium uppercase tracking-[0.5em] text-white/[0.04]">
          {mode}
        </span>
      </div>

      {/* The curated sections */}
      <motion.div
        variants={staggerContainer(0.08, 0.1)}
        initial={prefersReducedMotion ? undefined : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "show"}
        viewport={{ once: true, amount: 0.1 }}
        className="space-y-0"
      >
        {sections.map((section) => (
          <motion.div
            key={section.id}
            variants={blurUp}
          >
            <Suspense fallback={null}>
              <section.component />
            </Suspense>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
