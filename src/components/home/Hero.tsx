"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import GlowBackground from "@/components/effects/GlowBackground";
import ParticleField from "@/components/effects/ParticleField";
import StarField from "@/components/sanctuary/StarField";
import Parallax from "@/components/effects/Parallax";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import Magnetic from "@/components/ui/Magnetic";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * The WithIn landing hero — a luxury statement, not a dashboard greeting.
 *
 * "Feel Seen. Feel Heard. Feel WithIn." sits over a living dreamscape
 * (nebula layers drift with the cursor, stars twinkle at their own depth,
 * dust floats up) with magnetic CTAs that breathe. The page-level DepthLayers
 * provides the slow atmosphere; this hero adds its own interactive depth.
 */
export default function Hero() {
  const prefersReducedMotion = useReducedMotionSafe();

  // Mouse parallax — each layer drifts at its own depth, like standing inside
  // a slow-moving world.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });
  const nebulaX = useTransform(smx, [-0.5, 0.5], [40, -40]);
  const nebulaY = useTransform(smy, [-0.5, 0.5], [26, -26]);
  const starsX = useTransform(smx, [-0.5, 0.5], [16, -16]);
  const starsY = useTransform(smy, [-0.5, 0.5], [12, -12]);
  const coreX = useTransform(smx, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    mx.set(event.clientX / window.innerWidth - 0.5);
    my.set(event.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      id="top"
      onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Deep ambience behind the hero */}
      <GlowBackground variant="hero" />

      {/* Nebula layers — deepest parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : nebulaX, y: prefersReducedMotion ? 0 : nebulaY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/4 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[rgba(var(--mood-rgb),0.08)] blur-veil" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-veil" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/[0.05] blur-haze" />
      </motion.div>

      {/* Starfield — mid parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : starsX, y: prefersReducedMotion ? 0 : starsY }}
        className="pointer-events-none absolute inset-0"
      >
        <StarField count={44} seed={3} />
      </motion.div>

      {/* Floating dust */}
      <ParticleField count={14} seed={5} />

      {/* Scroll-linked floating orb — gives the scroll itself a sense of depth */}
      <Parallax offset={70} className="pointer-events-none absolute right-[12%] top-[18%] hidden lg:block">
        <motion.div
          aria-hidden
          animate={prefersReducedMotion ? undefined : { y: [0, -18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="h-40 w-40 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(168,85,247,0.35),rgba(168,85,247,0.06)_60%,transparent_75%)] blur-soft"
        />
      </Parallax>

      <Navbar />

      {/* Center stage — massive, centered, breathing */}
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : coreX }}
        className="relative z-10 px-6 text-center"
      >
        <motion.div variants={staggerContainer(0.16, 0.2)} initial="hidden" animate="show">
          <motion.p
            variants={blurUp}
            className="text-xs font-semibold uppercase tracking-[0.5em] text-emerald-400 md:text-sm"
          >
            The universe within you
          </motion.p>

          <motion.h1
            variants={staggerContainer(0.18, 0.35)}
            initial="hidden"
            animate="show"
            className="mt-10 font-display text-[15vw] font-medium leading-[0.92] tracking-[-0.03em] sm:text-7xl md:text-8xl lg:text-9xl"
          >
            <motion.span variants={blurUp} className="block">
              Feel Seen.
            </motion.span>
            <motion.span variants={blurUp} className="block">
              Feel Heard.
            </motion.span>
            <motion.span variants={blurUp} className="block">
              <GradientText className="drop-shadow-[0_0_50px_rgba(var(--mood-rgb),0.45)]">
                Feel WithIn.
              </GradientText>
            </motion.span>
          </motion.h1>

          <motion.p
            variants={blurUp}
            className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-gray-300 md:text-lg"
          >
            A home for the things that make you, you — stories, films, music, books and the
            people who make them. Find a place for the way you feel.
          </motion.p>

          {/* Magnetic, breathing CTAs — enter, or wander first (no account needed) */}
          <motion.div
            variants={blurUp}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Magnetic>
              <Button href="/signup" variant="gradient" size="xl" className="shadow-brand-cta">
                Enter WithIn
              </Button>
            </Magnetic>
            <Magnetic>
              <Button href="/discover" variant="outline" size="xl">
                Explore first
              </Button>
            </Magnetic>
          </motion.div>

          <motion.p
            variants={blurUp}
            className="mt-6 text-xs text-gray-500"
          >
            No account needed to wander — save & personalization come when you&apos;re ready.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#continue"
        aria-label="Scroll to continue"
        animate={prefersReducedMotion ? { x: "-50%" } : { x: "-50%", y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 z-10"
      >
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <span className="h-2 w-1 rounded-full bg-emerald-400" />
        </span>
      </motion.a>
    </section>
  );
}
