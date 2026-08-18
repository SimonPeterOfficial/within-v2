"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import GlowBackground from "@/components/effects/GlowBackground";
import ParticleField from "@/components/effects/ParticleField";
import StarField from "@/components/sanctuary/StarField";
import Parallax from "@/components/effects/Parallax";
import PresenceMemory from "@/components/effects/PresenceMemory";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import Magnetic from "@/components/ui/Magnetic";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * The WithIn landing hero — entering a living digital universe.
 *
 * COMPOSITION:
 *   Background: nebula layers + mesh + aurora + stars
 *   Midground:  breathing light core + secondary atmosphere ring
 *   Foreground: WITHIN wordmark (atmospheric) → "Feel You." (editorial)
 *   Ground:     light-on-water ripple motif
 *   Chrome:     navbar + scroll cue
 *
 * The pointer drives atmospheric drift. The world responds to presence.
 */
export default function Hero() {
  const prefersReducedMotion = useReducedMotionSafe();

  // Mouse parallax — each layer drifts at its own depth
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });
  const nebulaX = useTransform(smx, [-0.5, 0.5], [30, -30]);
  const nebulaY = useTransform(smy, [-0.5, 0.5], [20, -20]);
  const starsX = useTransform(smx, [-0.5, 0.5], [12, -12]);
  const starsY = useTransform(smy, [-0.5, 0.5], [8, -8]);
  const coreX = useTransform(smx, [-0.5, 0.5], [8, -8]);
  const coreY = useTransform(smy, [-0.5, 0.5], [6, -6]);
  const auriX = useTransform(smx, [-0.5, 0.5], [10, -10]);
  const auriY = useTransform(smy, [-0.5, 0.5], [6, -6]);
  const wordmarkX = useTransform(smx, [-0.5, 0.5], [4, -4]);
  const wordmarkY = useTransform(smy, [-0.5, 0.5], [3, -3]);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    mx.set(event.clientX / window.innerWidth - 0.5);
    my.set(event.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      id="top"
      onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#03040a] text-white"
    >
      {/* ── Background layers (deepest → shallowest) ── */}
      <GlowBackground variant="hero" />

      {/* Nebula layers — deepest parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : nebulaX, y: prefersReducedMotion ? 0 : nebulaY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-[18%] top-[15%] h-[30rem] w-[30rem] rounded-full bg-[rgba(var(--mood-rgb),0.06)] blur-veil" />
        <div className="absolute bottom-[18%] right-[15%] h-80 w-80 rounded-full bg-teal-500/[0.035] blur-veil" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.04] blur-haze" />
      </motion.div>

      {/* The breathing light core — the heart of the atmosphere */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : coreX, y: prefersReducedMotion ? 0 : coreY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [1, 1.06, 1], opacity: [0.5, 0.75, 0.5] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="h-[60vmin] w-[60vmin] rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.12)_0%,rgba(45,212,191,0.03)_30%,rgba(99,102,241,0.015)_50%,transparent_70%)] blur-3xl"
        />
      </motion.div>

      {/* Secondary atmosphere ring — teal accent, slower breathing */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : coreX, y: prefersReducedMotion ? 0 : coreY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [1.04, 1, 1.04], opacity: [0.25, 0.4, 0.25] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="h-[72vmin] w-[72vmin] rounded-full border border-teal-500/[0.03] bg-[radial-gradient(circle,transparent_35%,rgba(45,212,191,0.02)_55%,transparent_75%)]"
        />
      </motion.div>

      {/* Starfield — mid parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : starsX, y: prefersReducedMotion ? 0 : starsY }}
        className="pointer-events-none absolute inset-0"
      >
        <StarField count={48} seed={3} />
      </motion.div>

      <PresenceMemory />
      <ParticleField count={14} seed={5} />

      {/* Auri — the presence watching from the atmosphere */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : auriX, y: prefersReducedMotion ? 0 : auriY }}
        className="pointer-events-none absolute right-[7%] top-[12%] hidden opacity-25 md:block"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { y: [0, -12, 0], scale: [1, 1.04, 1] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <AuriOwl size={60} state="curious" />
        </motion.div>
      </motion.div>

      {/* Scroll-linked floating orb — depth accent */}
      <Parallax offset={70} className="pointer-events-none absolute right-[10%] top-[16%] hidden lg:block">
        <motion.div
          aria-hidden
          animate={prefersReducedMotion ? undefined : { y: [0, -16, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="h-36 w-36 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(168,85,247,0.22),rgba(168,85,247,0.03)_55%,transparent_72%)] blur-soft"
        />
      </Parallax>

      {/* ── Light on Water — the signature WithIn motif ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.2, 1] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.45),0_0_50px_rgba(var(--mood-rgb),0.25)]"
        />
        {!prefersReducedMotion && (
          <>
            <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05] [animation:rippleBreath_6s_ease-in-out_infinite]" />
            <span className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035] [animation:rippleBreath_6s_ease-in-out_1.5s_infinite]" />
            <span className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02] [animation:rippleBreath_6s_ease-in-out_3s_infinite]" />
          </>
        )}
      </div>

      {/* Horizontal light seam — thin luminous anchor */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-[44%] h-px bg-[linear-gradient(90deg,transparent_5%,rgba(var(--mood-rgb),0.06)_25%,rgba(var(--mood-rgb),0.12)_50%,rgba(var(--mood-rgb),0.06)_75%,transparent_95%)]"
      />

      {/* Deep vignette — cinematic framing */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.72)_100%)]" />

      {/* Bottom fade */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#03040a] via-[#03040a]/80 to-transparent" />

      <Navbar />

      {/* ── Center stage — the editorial statement ── */}
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : coreX }}
        className="relative z-10 px-6 text-center"
      >
        <motion.div variants={staggerContainer(0.2, 0.35)} initial="hidden" animate="show">
          {/* Eyebrow — quiet, atmospheric */}
          <motion.p
            variants={blurUp}
            className="text-[11px] font-semibold uppercase tracking-[0.5em] text-emerald-400/50 md:text-xs"
          >
            A universe that feels you
          </motion.p>

          {/* WITHIN wordmark — atmospheric backdrop, iconic */}
          <motion.div
            variants={blurUp}
            className="mt-6 md:mt-8"
          >
            <motion.h1
              style={{ x: prefersReducedMotion ? 0 : wordmarkX, y: prefersReducedMotion ? 0 : wordmarkY }}
              className="font-display text-[20vw] font-medium leading-[0.82] tracking-[-0.06em] text-white/[0.04] sm:text-[15vw] md:text-[13vw] lg:text-[12vw]"
              aria-hidden
            >
              WITHIN
            </motion.h1>
          </motion.div>

          {/* Main statement — Feel You. */}
          <motion.h2
            variants={staggerContainer(0.22, 0.5)}
            initial="hidden"
            animate="show"
            className="relative -mt-6 font-display text-[16vw] font-medium leading-[0.88] tracking-[-0.04em] sm:text-7xl md:text-8xl lg:text-[7.5rem]"
          >
            <motion.span variants={blurUp} className="block text-white/90">
              Feel
            </motion.span>
            <motion.span variants={blurUp} className="block relative">
              <GradientText className="italic drop-shadow-[0_0_50px_rgba(var(--mood-rgb),0.35)]">
                You.
              </GradientText>
              {!prefersReducedMotion && (
                <span
                  aria-hidden
                  className="absolute inset-0 wordmark-sweep pointer-events-none"
                  style={{ mixBlendMode: "overlay" }}
                />
              )}
            </motion.span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={blurUp}
            className="mx-auto mt-10 max-w-lg text-[15px] leading-[1.7] text-gray-400/70 md:text-base"
          >
            Stories. Emotions. People. Imagination.
            <br className="hidden sm:block" />
            All connected. All WithIn.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={blurUp}
            className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Magnetic strength={0.25}>
              <div data-cta-entrance className="cta-entrance-glow rounded-full">
                <Button href="/signup" variant="gradient" size="xl" className="shadow-brand-cta">
                  Enter WithIn
                </Button>
              </div>
            </Magnetic>
            <Magnetic>
              <Button href="/discover" variant="outline" size="xl">
                Explore the universe
              </Button>
            </Magnetic>
          </motion.div>

          <motion.p variants={blurUp} className="mt-8 text-[11px] tracking-wide text-gray-500/60">
            No account needed to wander — save &amp; personalization come when you&apos;re ready.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#feel"
        aria-label="Scroll to continue"
        animate={prefersReducedMotion ? { x: "-50%" } : { x: "-50%", y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 z-10"
      >
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/12 p-1.5">
          <span className="h-2 w-1 rounded-full bg-emerald-400/60" />
        </span>
      </motion.a>
    </section>
  );
}
