"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import GlowBackground from "@/components/effects/GlowBackground";
import GradientText from "@/components/ui/GradientText";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Fixed star field positions (percentages) — deterministic to avoid hydration drift
const stars = [
  { x: 12, y: 22, size: 1 },
  { x: 28, y: 14, size: 2 },
  { x: 45, y: 8, size: 1 },
  { x: 62, y: 18, size: 1.5 },
  { x: 78, y: 12, size: 1 },
  { x: 90, y: 30, size: 2 },
  { x: 8, y: 60, size: 1.5 },
  { x: 22, y: 75, size: 1 },
  { x: 38, y: 68, size: 2 },
  { x: 58, y: 82, size: 1 },
  { x: 75, y: 72, size: 1.5 },
  { x: 88, y: 58, size: 1 }
];

export default function SanctuaryHero() {
  const prefersReducedMotion = useReducedMotion();
  const [greeting] = useState(getGreeting);

  return (
    <section
      id="sanctuary"
      className="relative flex min-h-screen scroll-mt-24 items-center justify-center overflow-hidden bg-black text-white"
    >
      <GlowBackground variant="hero" />

      {/* Twinkling star field */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {stars.map((star, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-emerald-300/70"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size * 2,
              height: star.size * 2
            }}
            animate={
              prefersReducedMotion
                ? undefined
                : { opacity: [0.15, 0.9, 0.15], scale: [1, 1.5, 1] }
            }
            transition={{
              duration: 3 + (index % 4),
              repeat: Infinity,
              delay: index * 0.35,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 px-6 text-center"
      >
        <p
          suppressHydrationWarning
          className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-400"
        >
          {greeting}
        </p>
        <h1 className="mt-6 text-6xl font-extrabold leading-[1.05] tracking-tight md:text-8xl">
          Enter your <GradientText>sanctuary</GradientText>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400">
          A universe built from your feelings — quiet, glowing, always yours.
        </p>
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
