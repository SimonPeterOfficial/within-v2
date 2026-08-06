"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

type LoaderParticlesProps = {
  /** When true the gathered motes drift in a slow orbit */
  drifting?: boolean;
  /** When true the whole scene scatters and fades into the dissolve */
  dissolving?: boolean;
};

/** Deterministic LCG so particle positions are stable across renders. */
function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const PARTICLE_COUNT = 22;

/**
 * The living core of the cinematic loader — a tiny spark that gathers a ring
 * of dust motes around itself, then drifts in a slow orbit. Pure transform /
 * opacity animations, so everything stays on the compositor thread.
 */
export default function LoaderParticles({ drifting = false, dissolving = false }: LoaderParticlesProps) {
  const particles = useMemo(() => {
    const rng = createRng(7);
    return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
      const angle = rng() * Math.PI * 2;
      const radius = 30 + rng() * 42;
      return {
        id: index,
        scatterX: (rng() * 2 - 1) * 260,
        scatterY: (rng() * 2 - 1) * 260,
        orbitX: Math.cos(angle) * radius,
        orbitY: Math.sin(angle) * radius,
        delay: index * 0.045
      };
    });
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Orbit stage — rotates the gathered ring around the viewport center */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "center center" }}
        initial={false}
        animate={drifting && !dissolving ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{ x: particle.scatterX, y: particle.scatterY, opacity: 0, scale: 0.3 }}
            animate={
              dissolving
                ? { x: particle.scatterX * 1.8, y: particle.scatterY * 1.8, opacity: 0, scale: 0.2 }
                : { x: particle.orbitX, y: particle.orbitY, opacity: [0, 0.9, 0.55], scale: 1 }
            }
            transition={{ duration: 2.2, delay: particle.delay, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 h-1 w-1 -ml-0.5 -mt-0.5 rounded-full bg-white/80"
          />
        ))}
      </motion.div>

      {/* Core spark — the first light, then the gathering heart */}
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={
          dissolving
            ? { scale: 1.6, opacity: 0 }
            : { scale: [0, 1, 1.18, 1], opacity: [0, 1, 0.85, 1] }
        }
        transition={{ duration: 2.6, times: [0, 0.35, 0.6, 1], ease: "easeInOut" }}
        className="relative h-2.5 w-2.5 rounded-full bg-linear-to-br from-purple-400 to-emerald-300"
        style={{ boxShadow: "0 0 80px rgba(var(--mood-rgb), 0.55)" }}
      >
        {/* Halo */}
        <motion.span
          className="absolute -inset-6 rounded-full bg-[rgba(var(--mood-rgb),0.14)] blur-soft"
          animate={dissolving ? { opacity: 0 } : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.span>
    </div>
  );
}
