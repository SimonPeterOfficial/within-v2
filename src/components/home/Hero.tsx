"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import GlowBackground from "@/components/effects/GlowBackground";
import StarField from "@/components/sanctuary/StarField";
import PresenceMemory from "@/components/effects/PresenceMemory";
import AuriHeart, { AuriCaption } from "@/components/sanctuary/AuriHeart";
import { blurUp, staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

/**
 * The WithIn landing hero — the opening scene of a cinematic universe,
 * composed to match the reference design:
 *
 *   LEFT   — eyebrow → the great gradient "WithIn" wordmark → the
 *            editorial subtitle → "Enter WithIn →" + "Explore the Universe"
 *   RIGHT  — Auri heart: winged owl in her ring of light, nebula behind,
 *            "Auri is here." caption + whisper indicator
 *   MOTIF  — light on water (the glowing point with concentric ripples)
 *
 * The pointer drives a soft parallax drift. Typography hierarchy:
 * wordmark → statement → body → metadata.
 */
export default function Hero() {
  const prefersReducedMotion = useReducedMotionSafe();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });
  const nebulaX = useTransform(smx, [-0.5, 0.5], [26, -26]);
  const nebulaY = useTransform(smy, [-0.5, 0.5], [18, -18]);
  const starsX = useTransform(smx, [-0.5, 0.5], [12, -12]);
  const starsY = useTransform(smy, [-0.5, 0.5], [8, -8]);
  const auriX = useTransform(smx, [-0.5, 0.5], [12, -12]);
  const auriY = useTransform(smy, [-0.5, 0.5], [8, -8]);
  const wordmarkX = useTransform(smx, [-0.5, 0.5], [5, -5]);
  const wordmarkY = useTransform(smx, [-0.5, 0.5], [3, -3]);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    mx.set(event.clientX / window.innerWidth - 0.5);
    my.set(event.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      id="top"
      onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
      className="relative overflow-hidden bg-[#02030a] text-white"
    >
      {/* ── Deep background ── */}
      <GlowBackground variant="hero" />

      {/* Nebula layers — deepest parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : nebulaX, y: prefersReducedMotion ? 0 : nebulaY }}
        className="pointer-events-none absolute inset-0"
      >
        {/* The purple nebula field around Auri (right side, like the reference) */}
        <div className="absolute right-[2%] top-[4%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.13)_0%,rgba(76,29,149,0.06)_45%,transparent_70%)] blur-veil" />
        <div className="absolute right-[16%] top-[36%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.08),transparent_68%)] blur-haze" />
        {/* Teal whisper bottom-left, as the reference's dark water */}
        <div className="absolute bottom-[6%] left-[4%] h-72 w-72 rounded-full bg-teal-500/[0.03] blur-smoke" />
        <div className="absolute left-[38%] top-[52%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.04] blur-haze" />
      </motion.div>

      {/* Starfield — mid parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : starsX, y: prefersReducedMotion ? 0 : starsY }}
        className="pointer-events-none absolute inset-0"
      >
        <StarField count={56} seed={3} />
      </motion.div>

      <PresenceMemory />

      {/* ── The hero stage ── */}
      <div className="relative mx-auto flex min-h-[calc(100svh-1rem)] w-full max-w-[1400px] flex-col px-6 pt-24 sm:px-8 lg:px-12">
        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-4">
          {/* ══ LEFT — the editorial statement ══ */}
          <motion.div
            variants={staggerContainer(0.16, 0.3)}
            initial="hidden"
            animate="show"
            className="relative z-10 max-w-2xl"
          >
            {/* Eyebrow — quiet violet */}
            <motion.p
              variants={blurUp}
              className="text-[13px] font-medium tracking-[0.08em] text-[#8b7cc8]"
            >
              A Universe That Feels You.
            </motion.p>

            {/* The great wordmark — white → violet → teal, like the reference */}
            <motion.div variants={blurUp} className="mt-4">
              <motion.h1
                style={{
                  x: prefersReducedMotion ? 0 : wordmarkX,
                  y: prefersReducedMotion ? 0 : wordmarkY,
                }}
                className="select-none bg-[linear-gradient(92deg,#ffffff_0%,#f1ecff_34%,#a78bfa_58%,#67e8f9_86%,#5eead4_100%)] bg-clip-text font-display text-[clamp(4.5rem,11vw,9.5rem)] font-medium leading-[0.95] tracking-[-0.03em] text-transparent"
              >
                WithIn
              </motion.h1>
              {/* Soft light bloom behind the wordmark */}
              <div
                aria-hidden
                className="pointer-events-none -mt-10 h-24 w-[60%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.12),transparent_70%)] blur-2xl"
              />
            </motion.div>

            {/* Subtitle — the editorial promise */}
            <motion.p
              variants={blurUp}
              className="mt-6 max-w-md text-[15px] leading-[1.75] text-gray-400/85 md:text-base"
            >
              Stories. Emotions. People. Imagination.
              <br />
              All connected. All WithIn.
            </motion.p>

            {/* CTAs — tactile, rounded-xl like the reference */}
            <motion.div variants={blurUp} className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/signup"
                onClick={(e) => fireRipple(e)}
                className="group inline-flex items-center gap-3 rounded-xl bg-[linear-gradient(120deg,#8b5cf6_0%,#7c3aed_55%,#6d28d9_100%)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(124,58,237,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-300 hover:shadow-[0_10px_44px_rgba(124,58,237,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]"
              >
                Enter WithIn
                <motion.span
                  aria-hidden
                  animate={prefersReducedMotion ? undefined : { x: [0, 4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </a>
              <a
                href="/discover"
                onClick={(e) => fireRipple(e)}
                className="inline-flex items-center rounded-xl border border-white/[0.09] bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-gray-200/90 backdrop-blur transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white"
              >
                Explore the Universe
              </a>
            </motion.div>
          </motion.div>

          {/* ══ RIGHT — Auri heart, the winged presence ══ */}
          <motion.div
            style={{ x: prefersReducedMotion ? 0 : auriX, y: prefersReducedMotion ? 0 : auriY }}
            className="relative z-10 hidden items-center justify-center md:flex"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <AuriHeart size={430} wings showRing />

              {/* Caption — "Auri is here." */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="-mt-6"
              >
                <AuriCaption />
              </motion.div>

              {/* Whisper indicator — two dots like the reference carousel cue */}
              <div aria-hidden className="mt-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                <span className="h-1.5 w-1.5 rounded-full border border-white/20 bg-white/[0.06]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Light on Water — the signature WithIn motif, left-of-center ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[40%] top-[64%] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.35, 0.7, 0.35], scale: [1, 1.3, 1] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(167,139,250,0.7),0_0_50px_rgba(167,139,250,0.35)]"
        />
        {!prefersReducedMotion && (
          <>
            <span className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(167,139,250,0.06)] [animation:rippleBreath_6s_ease-in-out_infinite]" />
            <span className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(167,139,250,0.04)] [animation:rippleBreath_6s_ease-in-out_1.5s_infinite]" />
            <span className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02] [animation:rippleBreath_6s_ease-in-out_3s_infinite]" />
          </>
        )}
      </div>

      {/* Deep vignette — cinematic framing */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(0,0,0,0.72)_100%)]" />

      {/* Bottom fade into the mood bar */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#02030a] via-[#02030a]/75 to-transparent" />
    </section>
  );
}
