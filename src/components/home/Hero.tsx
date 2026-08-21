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
import MultilingualFragments from "@/components/home/MultilingualFragments";
import { blurUp, staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

/**
 * The WithIn landing hero — the opening scene of a cinematic universe.
 *
 * COMPOSITION (back to front):
 *   Deep background:  nebula + mesh + aurora + stars
 *   Mid atmosphere:   breathing light core + teal accent ring
 *   Environment:      particles + starfield + floating orb
 *   Presence:         Auri watching from the atmosphere
 *   Light motif:      light-on-water ripple (signature WithIn)
 *   Editorial:        WITHIN wordmark (atmospheric) → "Feel You." (statement)
 *   Chrome:           navbar + scroll cue
 *
 * The pointer drives atmospheric drift. The world responds to presence.
 * Typography hierarchy: display → statement → body → metadata.
 */
export default function Hero() {
  const prefersReducedMotion = useReducedMotionSafe();

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
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02030a] text-white"
    >
      {/* ── Deep background (furthest → nearest) ── */}
      <GlowBackground variant="hero" />

      {/* Nebula layers — deepest parallax, spacious and expensive */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : nebulaX, y: prefersReducedMotion ? 0 : nebulaY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-[15%] top-[12%] h-[32rem] w-[32rem] rounded-full bg-[rgba(var(--mood-rgb),0.05)] blur-smoke" />
        <div className="absolute bottom-[15%] right-[12%] h-80 w-80 rounded-full bg-teal-500/[0.03] blur-smoke" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.035] blur-haze" />
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
              : { scale: [1, 1.06, 1], opacity: [0.45, 0.7, 0.45] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="h-[62vmin] w-[62vmin] rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.11)_0%,rgba(45,212,191,0.025)_28%,rgba(99,102,241,0.012)_48%,transparent_68%)] blur-3xl"
        />
      </motion.div>

      {/* Secondary atmosphere — teal accent ring, slower breathing */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : coreX, y: prefersReducedMotion ? 0 : coreY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [1.04, 1, 1.04], opacity: [0.2, 0.35, 0.2] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="h-[74vmin] w-[74vmin] rounded-full border border-teal-500/[0.025] bg-[radial-gradient(circle,transparent_32%,rgba(45,212,191,0.015)_52%,transparent_72%)]"
        />
      </motion.div>

      {/* Starfield — mid parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : starsX, y: prefersReducedMotion ? 0 : starsY }}
        className="pointer-events-none absolute inset-0"
      >
        <StarField count={50} seed={3} />
      </motion.div>

      <PresenceMemory />
      <MultilingualFragments />
      <ParticleField count={14} seed={5} />

      {/* Auri — the guardian watching from the atmosphere */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : auriX, y: prefersReducedMotion ? 0 : auriY }}
        className="pointer-events-none absolute right-[6%] top-[10%] hidden opacity-20 md:block"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { y: [0, -14, 0], scale: [1, 1.05, 1] }
          }
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        >
          <AuriOwl size={64} state="curious" />
        </motion.div>
      </motion.div>

      {/* Floating orb — depth accent, scroll-linked */}
      <Parallax offset={70} className="pointer-events-none absolute right-[8%] top-[14%] hidden lg:block">
        <motion.div
          aria-hidden
          animate={prefersReducedMotion ? undefined : { y: [0, -18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="h-40 w-40 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(168,85,247,0.2),rgba(168,85,247,0.025)_52%,transparent_70%)] blur-soft"
        />
      </Parallax>

      {/* ── Light on Water — the signature WithIn motif ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.35, 0.65, 0.35], scale: [1, 1.25, 1] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.4),0_0_45px_rgba(var(--mood-rgb),0.22)]"
        />
        {!prefersReducedMotion && (
          <>
            <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045] [animation:rippleBreath_6s_ease-in-out_infinite]" />
            <span className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] [animation:rippleBreath_6s_ease-in-out_1.5s_infinite]" />
            <span className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.018] [animation:rippleBreath_6s_ease-in-out_3s_infinite]" />
          </>
        )}
      </div>

      {/* Horizontal light seam — thin luminous anchor */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-[43%] h-px bg-[linear-gradient(90deg,transparent_5%,rgba(var(--mood-rgb),0.05)_22%,rgba(var(--mood-rgb),0.1)_50%,rgba(var(--mood-rgb),0.05)_78%,transparent_95%)]"
      />

      {/* Deep vignette — cinematic framing */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.75)_100%)]" />

      {/* Bottom fade */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#02030a] via-[#02030a]/80 to-transparent" />

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
            className="text-[11px] font-semibold uppercase tracking-[0.5em] text-emerald-400/45 md:text-xs"
          >
            A universe that feels you
          </motion.p>

          {/* WITHIN wordmark — atmospheric backdrop, iconic */}
          <motion.div variants={blurUp} className="mt-5 md:mt-7">
            <motion.h1
              style={{ x: prefersReducedMotion ? 0 : wordmarkX, y: prefersReducedMotion ? 0 : wordmarkY }}
              className="font-display text-[22vw] font-medium leading-[0.8] tracking-[-0.06em] text-white/[0.035] sm:text-[16vw] md:text-[14vw] lg:text-[13vw]"
              aria-hidden
            >
              WITHIN
            </motion.h1>
          </motion.div>

          {/* Main statement — the editorial headline */}
          <motion.h2
            variants={staggerContainer(0.22, 0.5)}
            initial="hidden"
            animate="show"
            className="relative -mt-5 font-display text-[18vw] font-medium leading-[0.86] tracking-[-0.04em] sm:text-7xl md:text-8xl lg:text-[8rem]"
          >
            <motion.span variants={blurUp} className="block text-white/[0.88]">
              Feel
            </motion.span>
            <motion.span variants={blurUp} className="block relative">
              <GradientText className="italic drop-shadow-[0_0_50px_rgba(var(--mood-rgb),0.3)]">
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

          {/* Subtitle — editorial body */}
          <motion.p
            variants={blurUp}
            className="mx-auto mt-10 max-w-lg text-[15px] leading-[1.75] text-gray-400/65 md:text-base"
          >
            Stories. Emotions. People. Imagination.
            <br className="hidden sm:block" />
            All connected. All WithIn.
          </motion.p>

          {/* CTAs — tactile, inviting */}
          <motion.div
            variants={blurUp}
            className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Magnetic strength={0.25}>
              <div data-cta-entrance className="cta-entrance-glow rounded-full">
                <Button href="/signup" variant="gradient" size="xl" className="shadow-brand-cta" onClick={(e) => fireRipple(e)}>
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

          <motion.p variants={blurUp} className="mt-8 text-[11px] tracking-wide text-gray-500/50">
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
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/10 p-1.5">
          <span className="h-2 w-1 rounded-full bg-emerald-400/50" />
        </span>
      </motion.a>
    </section>
  );
}
