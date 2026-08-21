"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Particle = {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  color: string;
  drift: number;
};

const COLORS = [
  "rgba(52, 211, 153, 0.5)",
  "rgba(168, 85, 247, 0.5)",
  "rgba(255, 255, 255, 0.35)"
];

/** Deterministic LCG so SSR and client render identical particle layouts. */
function generateParticles(count: number, seed: number): Particle[] {
  let state = seed;
  const rand = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };

  return Array.from({ length: count }, () => ({
    left: `${rand() * 100}%`,
    top: `${rand() * 100}%`,
    size: 1 + rand() * 2.5,
    delay: rand() * 6,
    duration: 8 + rand() * 10,
    color: COLORS[Math.floor(rand() * COLORS.length)],
    drift: 12 + rand() * 40
  }));
}

type ParticleFieldProps = {
  count?: number;
  seed?: number;
  className?: string;
};

/** Floating ambient particles that drift upward and fade — pure transform/opacity. */

/** Canonical alias — the floating-particles system goes by both names. */
export { ParticleField as FloatingParticles };

export default function ParticleField({ count = 30, seed = 7, className = "" }: ParticleFieldProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  // Stable across re-renders — identical on server and client thanks to the LCG.
  const particles = useMemo(() => generateParticles(count, seed), [count, seed]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            background: particle.color
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : { y: [0, -particle.drift], opacity: [0, 0.8, 0], scale: [0.8, 1.2, 0.8] }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
