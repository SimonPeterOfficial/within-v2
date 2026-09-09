"use client";

import { useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import GlowBackground from "@/components/effects/GlowBackground";
import ParticleField from "@/components/effects/ParticleField";
import StarField from "@/components/sanctuary/StarField";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import GradientText from "@/components/ui/GradientText";
import { useSession } from "@/lib/auth/session";
import { TIME_GREETINGS, getTimePeriod } from "@/lib/auri";
import { blurUp, staggerContainer } from "@/lib/animations";

// Subscribed store for time-of-day — renders a stable value on the server and
// in the first client pass, then swaps to the live greeting. No hydration flash.
const subscribe = () => () => {};
const getClientGreeting = () => TIME_GREETINGS[getTimePeriod()];
const getServerGreeting = () => "Welcome";

/** Time-aware opening lines — the room answers the hour, not a script. */
const TIME_OPENING: Record<string, string> = {
  morning: "The light is new. So is today.",
  afternoon: "The middle of the day — a good place to pause.",
  evening: "The world is slowing. Yours can too.",
  night: "The quiet hours. WithIn keeps the light on."
};

const getClientOpening = () =>
  TIME_OPENING[getTimePeriod()] ?? "The world is slowing. Yours can too.";
const getServerOpening = () => "The world is slowing. Yours can too.";

/** Cinematic opening — layered nebula, living starfield, emotional welcome. */
export default function SanctuaryHero() {
  const prefersReducedMotion = useReducedMotionSafe();
  const { user } = useSession();
  const greeting = useSyncExternalStore(subscribe, getClientGreeting, getServerGreeting);
  // Time-aware opening — stable on the server, live on the client.
  const opening = useSyncExternalStore(subscribe, getClientOpening, getServerOpening);
  // Personalization resolves after hydration — guests see the gentle default.
  const firstName = user?.name.trim().split(/\s+/)[0];
  const salutation = greeting + (firstName ? `, ${firstName}` : ", soul");

  // Mouse parallax — each layer drifts at its own depth.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });
  const nebulaX = useTransform(smx, [-0.5, 0.5], [36, -36]);
  const nebulaY = useTransform(smy, [-0.5, 0.5], [24, -24]);
  const starsX = useTransform(smx, [-0.5, 0.5], [14, -14]);
  const starsY = useTransform(smy, [-0.5, 0.5], [10, -10]);
  const coreX = useTransform(smx, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    mx.set(event.clientX / window.innerWidth - 0.5);
    my.set(event.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      id="sanctuary"
      onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
      className="relative flex min-h-screen scroll-mt-24 items-center justify-center overflow-hidden text-white"
    >
      <GlowBackground variant="hero" />

      {/* Nebula layers — deepest parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : nebulaX, y: prefersReducedMotion ? 0 : nebulaY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[rgba(var(--mood-rgb),0.07)] blur-smoke" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/[0.06] blur-smoke" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/[0.04] blur-haze" />
      </motion.div>

      {/* Starfield — mid parallax */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : starsX, y: prefersReducedMotion ? 0 : starsY }}
        className="pointer-events-none absolute inset-0"
      >
        <StarField count={40} seed={3} />
      </motion.div>

      <ParticleField count={12} seed={5} />

      {/* Center stage */}
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : coreX }}
        className="relative z-10 px-6 text-center"
      >
        <motion.div variants={staggerContainer(0.14, 0.2)} initial="hidden" animate="show">
          <motion.p
            variants={blurUp}
            className="text-xs font-semibold uppercase tracking-[0.5em] text-emerald-400 md:text-sm"
          >
            {salutation}
          </motion.p>

          <motion.h1
            variants={blurUp}
            className="mt-8 font-display text-[18vw] font-medium leading-none tracking-[-0.03em] md:text-[10rem]"
          >
            <GradientText className="drop-shadow-[0_0_45px_rgba(var(--mood-rgb),0.5)]">
              WithIn
            </GradientText>
          </motion.h1>

          {/* Time-aware opening — the room answers the hour */}
          <div className="relative mx-auto mt-6 min-h-[2.75rem] max-w-2xl md:min-h-[3rem]">
            <motion.p
              key={opening}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-gray-300 md:text-2xl"
            >
              {opening}
            </motion.p>
          </div>

          <motion.p
            variants={blurUp}
            className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-gray-400 md:text-base"
          >
            Your sanctuary has been waiting — Auri shaped it around the way you&apos;ve been
            feeling, and it has a few quiet corners picked just for you.
          </motion.p>

          {/* Magnetic CTAs — arrival, not advertisement */}
          <motion.div
            variants={blurUp}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Magnetic>
              <Button href="#mood" variant="primary" size="xl">
                Begin here
              </Button>
            </Magnetic>
            <Magnetic>
              <Button href="#originals" variant="outline" size="xl">
                Wander
              </Button>
            </Magnetic>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#mood"
        aria-label="Scroll to your mood"
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
