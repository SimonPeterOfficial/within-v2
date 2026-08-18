"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Star = { x: number; y: number; delay: number };

/**
 * Deterministic star positions for the constellation.
 * Starts with 3 visible stars, gains more as the user explores.
 */
const CONSTELLATION_STARS: Star[] = [
  // Always visible — the starting constellation
  { x: 48, y: 32, delay: 0 },
  { x: 52, y: 28, delay: 0.3 },
  { x: 55, y: 35, delay: 0.6 },
  // Gained after first scroll
  { x: 45, y: 25, delay: 0.8 },
  { x: 58, y: 30, delay: 1.0 },
  // Gained after deeper exploration
  { x: 50, y: 22, delay: 1.2 },
  { x: 42, y: 35, delay: 1.4 },
  { x: 60, y: 25, delay: 1.6 },
];

/**
 * How many stars to show at each exploration threshold.
 * Index = number of thresholds passed.
 */
const STAR_THRESHOLDS = [3, 5, 7, 8];

/**
 * PresenceMemory — "You've been here."
 *
 * A tiny constellation in the hero that subtly gains stars as the user
 * scrolls and interacts. No data is stored — this only lives during the
 * current page session. The effect is almost imperceptible: a quiet
 * acknowledgment that the visitor has explored.
 *
 * Safety: session-only, no cookies, no analytics, no remote storage.
 */
export default function PresenceMemory() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [explorationLevel, setExplorationLevel] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let thresholdsPassed = 0;
    let lastScrollY = 0;
    let interactionCount = 0;

    const checkLevel = () => {
      if (thresholdsPassed < STAR_THRESHOLDS.length) {
        thresholdsPassed++;
        setExplorationLevel(thresholdsPassed);
      }
    };

    // Gain stars on significant scroll
    const onScroll = () => {
      const scrollDelta = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;

      if (scrollDelta > 800) {
        checkLevel();
      }
    };

    // Gain stars on interaction (mood select, card hover, etc.)
    const onInteract = (event: Event) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (target.closest("button, a, [role='button']")) {
        interactionCount++;
        if (interactionCount >= 3) {
          checkLevel();
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onInteract, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onInteract);
    };
  }, [prefersReducedMotion]);

  const visibleCount = STAR_THRESHOLDS[explorationLevel] ?? STAR_THRESHOLDS[0];
  const stars = useMemo(() => CONSTELLATION_STARS.slice(0, visibleCount), [visibleCount]);

  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      {CONSTELLATION_STARS.map((star, index) => {
        const isVisible = index < visibleCount;
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              isVisible
                ? { opacity: 0.6, scale: 1 }
                : { opacity: 0, scale: 0 }
            }
            transition={{
              duration: 2,
              delay: star.delay,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: 2,
              height: 2,
              boxShadow: "0 0 8px rgba(255,255,255,0.5)"
            }}
          />
        );
      })}

      {/* Faint constellation lines connecting visible stars */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {stars.length > 1 &&
          stars.slice(0, -1).map((star, index) => {
            const next = stars[index + 1];
            if (!next) return null;
            return (
              <motion.line
                key={index}
                x1={`${star.x}%`}
                y1={`${star.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.15"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 3, delay: star.delay + 1 }}
              />
            );
          })}
      </svg>
    </div>
  );
}
