"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import StarField from "@/components/sanctuary/StarField";

/**
 * UniversePreview — the living editorial window into WithIn.
 *
 * Rotates through curated concepts (Originals, Books, Music, Communities,
 * Auri, Discovery) with atmospheric CSS compositions. Each slide has a
 * category label, a strong editorial headline, and short supporting copy.
 * The background atmosphere shifts subtly with each slide.
 *
 * Supports: pause, prev/next, keyboard navigation, reduced-motion fallback.
 */

type Slide = {
  category: string;
  headline: string;
  description: string;
  /** Atmosphere color for the slide's ambient glow */
  accent: string;
  /** Visual artifact variant */
  artifact: "orb" | "ring" | "wave" | "scatter" | "pulse" | "field";
};

const SLIDES: Slide[] = [
  {
    category: "Originals",
    headline: "Stories that stay with you.",
    description: "Films and series crafted for the way you feel.",
    accent: "rgba(139, 92, 246, 0.5)",
    artifact: "orb",
  },
  {
    category: "Books",
    headline: "Some pages understand you.",
    description: "Stories that sit with you for days.",
    accent: "rgba(212, 176, 120, 0.4)",
    artifact: "field",
  },
  {
    category: "Music",
    headline: "For the feelings without names.",
    description: "Soundscapes tuned to your emotional frequency.",
    accent: "rgba(34, 211, 238, 0.45)",
    artifact: "wave",
  },
  {
    category: "Communities",
    headline: "Find people on the same frequency.",
    description: "Quiet rooms where kindred souls gather.",
    accent: "rgba(52, 211, 153, 0.45)",
    artifact: "scatter",
  },
  {
    category: "Auri",
    headline: "You don't always have to know what to say.",
    description: "A presence that listens — not to fix, just to hold the light.",
    accent: "rgba(168, 85, 247, 0.5)",
    artifact: "pulse",
  },
  {
    category: "Discovery",
    headline: "Meet yourself somewhere here.",
    description: "A universe shaped by how you feel right now.",
    accent: "rgba(99, 102, 241, 0.45)",
    artifact: "ring",
  },
];

const INTERVAL_MS = 6000;

function Artifact({ type, accent }: { type: Slide["artifact"]; accent: string }) {
  const prefersReducedMotion = useReducedMotionSafe();

  const base = "absolute pointer-events-none";

  switch (type) {
    case "orb":
      return (
        <motion.div
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className={`${base} left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl`}
          style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
        />
      );
    case "ring":
      return (
        <div className={`${base} left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2`}>
          <div className="h-40 w-40 rounded-full border border-white/[0.08]" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)`, filter: "blur(20px)" }} />
        </div>
      );
    case "wave":
      return (
        <div className={`${base} bottom-1/3 left-0 right-0 h-px`}>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="absolute top-4 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="absolute top-8 h-px w-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        </div>
      );
    case "scatter":
      return (
        <div className={`${base} inset-0`}>
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/30"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 15}%`,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
          ))}
        </div>
      );
    case "pulse":
      return (
        <motion.div
          animate={prefersReducedMotion ? undefined : { scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`${base} left-1/2 top-1/3 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full`}
          style={{ background: `radial-gradient(circle, ${accent}, transparent 60%)`, filter: "blur(24px)" }}
        />
      );
    case "field":
      return (
        <div className={`${base} inset-0`}>
          <div className="absolute left-[20%] top-[25%] h-24 w-24 rounded-full blur-2xl" style={{ background: accent, opacity: 0.15 }} />
          <div className="absolute bottom-[30%] right-[20%] h-16 w-16 rounded-full blur-xl" style={{ background: accent, opacity: 0.1 }} />
        </div>
      );
  }
}

export default function UniversePreview() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = SLIDES.length;

  const advance = useCallback(
    (direction: 1 | -1 = 1) => {
      setCurrent((prev) => (prev + direction + total) % total);
    },
    [total]
  );

  // Auto-advance
  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    timerRef.current = setInterval(() => advance(1), INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, advance, prefersReducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") advance(-1);
      if (event.key === "ArrowRight") advance(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance]);

  const slide = useMemo(() => SLIDES[current], [current]);

  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="WithIn universe preview"
      aria-roledescription="slideshow"
    >
      {/* Deep atmospheric background */}
      <div className="absolute inset-0 bg-[#040510]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(88,60,160,0.08),transparent_65%)]" />

      <StarField count={18} seed={7} />

      {/* Slide content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Visual artifact */}
            <div className="relative mb-10 h-32 w-32">
              <Artifact type={slide.artifact} accent={slide.accent} />
            </div>

            {/* Category label */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-emerald-400/60">
              0{current + 1} — {slide.category}
            </p>

            {/* Headline */}
            <h2 className="mt-4 font-display text-2xl font-medium leading-[1.1] tracking-[-0.01em] text-white/90 md:text-3xl">
              {slide.headline}
            </h2>

            {/* Description */}
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-gray-400/70">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicators */}
      <div className="relative z-10 flex items-center justify-center gap-2 pb-8">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}: ${SLIDES[index].category}`}
            aria-current={index === current ? "true" : undefined}
            onClick={() => setCurrent(index)}
            className={`group relative h-1.5 rounded-full transition-all duration-500 ${
              index === current
                ? "w-8 bg-emerald-400/70"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
