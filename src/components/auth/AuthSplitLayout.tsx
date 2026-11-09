"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import WorldScape from "@/components/effects/WorldScape";
import WithinMark from "@/components/ui/WithinMark";
import Icon from "@/components/ui/Icon";
import { blurUp, staggerContainer } from "@/lib/animations";

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  /** Subtitle under the card, shown as a quiet line of trust */
  meta?: string;
};

/**
 * AuthSplitLayout — the illustrated gate into the universe.
 *
 * The painterly world fills the view; one tall pane of liquid glass holds
 * the way in. The diamond wordmark and the universe tagline crown the
 * card, the world's promises frame it: Explore · Connect · Grow on the
 * left, Not just a platform. A place to be. on the right.
 *
 * (Named for the earlier editorial split it replaced; it is now the
 * single auth chrome for entering, beginning, and finding one's way back.)
 */
export default function AuthSplitLayout({ children, meta }: AuthSplitLayoutProps) {
  return (
    <section
      id="main"
      data-scene="auth"
      className="crystal-world relative flex min-h-svh overflow-hidden text-[#232136]"
    >
      {/* The world — the same scene every room shares */}
      <WorldScape />

      {/* The gate's own light — warm bloom behind the card, earth below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_62%_46%_at_50%_42%,rgba(255,243,218,0.38),transparent_72%),radial-gradient(ellipse_120%_56%_at_50%_112%,rgba(26,41,32,0.42),transparent_72%)]"
      />

      {/* Back to the world */}
      <Link
        href="/"
        aria-label="Back to WithIn home"
        className="pane chip-glass-hover crystal-focus absolute left-4 top-4 z-20 flex h-10 items-center gap-2 rounded-full px-4 text-[12px] font-medium ink-body hover:ink-title"
      >
        <Icon name="back" size={14} />
        Back
      </Link>

      {/* The crystal gate */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-16 sm:px-6">
        <motion.div
          variants={staggerContainer(0.14, 0.18)}
          initial="hidden"
          animate="show"
          className="pane edge-glass w-full max-w-[430px] rounded-[32px] px-7 py-9 sm:px-9"
        >
          {/* The brand — the diamond in gold */}
          <motion.div variants={blurUp} className="mb-7 flex flex-col items-center gap-2.5">
            <WithinMark variant="diamond" size={38} tone="gold" />
            <span className="tagline-caps text-[9px]">A universe that feels you</span>
          </motion.div>

          <div className="relative z-[2]">{children}</div>

          {/* A quiet line of trust */}
          <motion.p
            variants={blurUp}
            className="mt-7 text-center text-[11px] leading-relaxed ink-faint"
          >
            {meta ?? (
              <>
                Nothing you write here leaves this device. The light is{" "}
                <span className="font-medium ink-body">keeping your place</span>.
              </>
            )}
          </motion.p>
        </motion.div>
      </div>

      {/* The promises — corners of the gate */}
      <p aria-hidden className="tagline-caps absolute bottom-4 left-5 z-10 hidden text-[9px] sm:block">
        Explore · Connect · Grow
      </p>
      <p aria-hidden className="tagline-caps absolute bottom-4 right-5 z-10 hidden text-[9px] sm:block">
        Not just a platform. A place to be.
      </p>
    </section>
  );
}
