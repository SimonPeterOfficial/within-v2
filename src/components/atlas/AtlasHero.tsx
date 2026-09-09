"use client";

import { motion } from "framer-motion";
import AuriHeart from "@/components/sanctuary/AuriHeart";
import { AuriCaption } from "@/components/sanctuary/AuriHeart";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { skyPalette, moonPhase } from "@/lib/atlas/cosmos";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * AtlasHero — the observatory's opening frame: the eyebrow, the gradient
 * ATLAS wordmark, tonight's palette line, and the winged Auri presiding
 * over the whole wing on the right.
 */
export default function AtlasHero() {
  const now = useAtlasTime();
  const palette = skyPalette(now);
  const moon = moonPhase(now);

  return (
    <section className="relative overflow-hidden">
      {/* Tonight's computed palette wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 62% 30%, ${palette.mid}, transparent 68%), linear-gradient(180deg, ${palette.deep}cc, transparent 40%)`,
        }}
      />

      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-8 px-6 pb-16 pt-32 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <motion.div variants={staggerContainer(0.14, 0.25)} initial="hidden" animate="show">
          <motion.p
            variants={blurUp}
            className="text-[13px] font-medium tracking-[0.08em] text-[#8b7cc8]"
          >
            An observatory for how you feel
          </motion.p>

          <motion.h1
            variants={blurUp}
            className="mt-4 select-none bg-[linear-gradient(92deg,#ffffff_0%,#f1ecff_34%,#a78bfa_60%,#67e8f9_92%)] bg-clip-text font-display text-[clamp(4rem,10vw,8.5rem)] font-medium leading-[0.95] tracking-[-0.03em] text-transparent"
          >
            Atlas
          </motion.h1>

          <motion.p variants={blurUp} className="mt-6 max-w-md text-[15px] leading-[1.75] text-gray-400/85">
            Every instrument in this room is live — the moon, the sidereal hours,
            the aurora forecast, the comets. Computed from the real sky, rendered
            as atmosphere.
          </motion.p>

          <motion.div
            variants={blurUp}
            className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-3 backdrop-blur"
          >
            <span aria-hidden className="text-xl">{moon.glyph}</span>
            <div>
              <p className="text-[13px] font-medium text-white/90">{palette.line}</p>
              <p className="text-[11px] text-gray-500/80">
                {moon.name} · {Math.round(moon.illumination * 100)}% lit
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Auri presides over the wing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden flex-col items-center md:flex"
        >
          <AuriHeart size={380} wings showRing />
          <div className="-mt-4">
            <AuriCaption />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
