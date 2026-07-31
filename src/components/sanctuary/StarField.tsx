"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Star = {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

/** Deterministic LCG so the starfield is identical on server and client. */
function generateStars(count: number, seed: number): Star[] {
  let state = seed;
  const rand = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };

  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: 1 + rand() * 2,
    delay: rand() * 6,
    duration: 2.5 + rand() * 4,
    opacity: 0.3 + rand() * 0.6
  }));
}

type StarFieldProps = {
  count?: number;
  seed?: number;
  className?: string;
};

/** Cinematic twinkling starfield — pure transform/opacity animation. */
export default function StarField({
  count = 60,
  seed = 7,
  className = ""
}: StarFieldProps) {
  const prefersReducedMotion = useReducedMotion();
  // Stable across re-renders — identical on server and client thanks to the LCG.
  const stars = useMemo(() => generateStars(count, seed), [count, seed]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {stars.map((star, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            boxShadow: "0 0 6px rgba(255, 255, 255, 0.6)"
          }}
          animate={
            prefersReducedMotion
              ? { opacity: star.opacity }
              : {
                  opacity: [star.opacity * 0.35, star.opacity, star.opacity * 0.35],
                  scale: [1, 1.35, 1]
                }
          }
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
