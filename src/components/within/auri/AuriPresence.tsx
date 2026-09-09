"use client";

import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import AuriHeart from "@/components/sanctuary/AuriHeart";

/**
 * AuriPresence — Auri as a being of light inside the Crystal World.
 *
 * She is not a character on a background; she is made of the same material
 * as the world: translucent body forms, pearlescent halo, light moving
 * *through* her, environmental motes drifting around her. Her state shapes
 * the surrounding atmosphere:
 *
 *   RESTING    almost still — a quiet presence in the room
 *   LISTENING  soft attention — halo breathes a little wider
 *   THINKING   internal light activity — gentle oscillation
 *   RESPONDING warm illumination — wings open, bloom rises
 *   QUIET      minimal presence — Sanctuary mode
 *   ATTENTION  small but noticeable environmental focus
 */

export type AuriState =
  | "resting" | "listening" | "thinking" | "responding" | "quiet" | "attention"
  /* Contextual states — the world she is in shapes her presence */
  | "environmental" | "welcome" | "discovery" | "sanctuary" | "mirror";

type Preset = {
  wings: boolean;
  halo: number;
  bloom: number;
  breath: number;
  motes: number;
  scale: number;
  /** Crystal halo hue shifts subtly with her state */
  haloHue: string;
};

const STATES: Record<AuriState, Preset> = {
  resting:    { wings: false, halo: 0.5,  bloom: 0.45, breath: 9,   motes: 3, scale: 1,    haloHue: "rgba(180,160,250,0.2)" },
  listening:  { wings: false, halo: 0.72, bloom: 0.6,  breath: 6.5, motes: 4, scale: 1.02, haloHue: "rgba(160,190,250,0.24)" },
  thinking:   { wings: false, halo: 0.62, bloom: 0.78, breath: 4.5, motes: 5, scale: 1.01, haloHue: "rgba(200,175,250,0.26)" },
  responding: { wings: true,  halo: 0.9,  bloom: 1,    breath: 5.5, motes: 6, scale: 1.05, haloHue: "rgba(190,165,250,0.3)" },
  quiet:      { wings: false, halo: 0.25, bloom: 0.22, breath: 12,  motes: 2, scale: 0.96, haloHue: "rgba(170,170,220,0.12)" },
  attention:  { wings: false, halo: 0.95, bloom: 0.85, breath: 3.8, motes: 5, scale: 1.04, haloHue: "rgba(185,170,252,0.32)" },
  /* ── Contextual: the room she inhabits ── */
  environmental: { wings: false, halo: 0.55, bloom: 0.5,  breath: 10,  motes: 4, scale: 1,    haloHue: "rgba(160,210,240,0.22)" },
  welcome:       { wings: true,  halo: 0.85, bloom: 0.9,  breath: 6,   motes: 5, scale: 1.04, haloHue: "rgba(200,180,252,0.28)" },
  discovery:     { wings: false, halo: 0.68, bloom: 0.62, breath: 5.5, motes: 5, scale: 1.02, haloHue: "rgba(150,200,250,0.26)" },
  sanctuary:     { wings: false, halo: 0.3,  bloom: 0.3,  breath: 11,  motes: 2, scale: 0.97, haloHue: "rgba(190,220,235,0.16)" },
  mirror:        { wings: false, halo: 0.42, bloom: 0.4,  breath: 12,  motes: 3, scale: 0.99, haloHue: "rgba(175,185,235,0.18)" },
};

export default function AuriPresence({
  state = "resting",
  size = 300,
  showMotes = true,
}: {
  state?: AuriState;
  size?: number;
  showMotes?: boolean;
}) {
  const prefersReducedMotion = useReducedMotionSafe();
  const preset = STATES[state];

  return (
    <div className="relative" style={{ width: size, height: size }} aria-label={`Auri — ${state}`}>
      {/* The crystal halo — pearlescent light she exists inside */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-[-20%] rounded-full"
        style={{
          background: `radial-gradient(circle, ${preset.haloHue} 0%, rgba(190,205,250,0.1) 45%, transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [preset.halo * 0.8, preset.halo, preset.halo * 0.8], scale: [1, 1.06, 1] }
        }
        transition={{ duration: preset.breath * 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Light refracting *through* her — a soft vertical beam behind the form */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-[18%] top-[-6%] h-[70%]"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(200,185,252,0.16) 55%, transparent 100%)",
          filter: "blur(18px)",
          transformOrigin: "top",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [0.5, 0.85, 0.5], scaleY: [1, 1.04, 1] }
        }
        transition={{ duration: preset.breath * 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Her form — the winged owl with her ring of light */}
      <motion.div
        className="relative h-full w-full"
        animate={prefersReducedMotion ? undefined : { scale: preset.scale }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <AuriHeart size={size} wings={preset.wings} showRing />
      </motion.div>

      {/* The bloom beneath — light pooling in the crystal air */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[60%] h-[28%] w-[52%] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(190,175,252,0.35) 0%, rgba(170,200,250,0.14) 50%, transparent 72%)",
          filter: "blur(24px)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [preset.bloom * 0.6, preset.bloom, preset.bloom * 0.6] }
        }
        transition={{ duration: preset.breath, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Environmental motes orbiting her — light dust in the crystal air */}
      {showMotes &&
        Array.from({ length: preset.motes }, (_, i) => {
          const angle = (i / preset.motes) * Math.PI * 2;
          return (
            <motion.span
              key={`${state}-${i}`}
              aria-hidden
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white"
              style={{ boxShadow: "0 0 8px rgba(200,185,252,0.95)" }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      x: [0, Math.cos(angle) * size * 0.44],
                      y: [0, Math.sin(angle) * size * 0.44],
                      opacity: [0, 0.85, 0],
                      scale: [0.5, 1.1, 0.5],
                    }
              }
              transition={{
                duration: preset.breath * (1.7 + i * 0.35),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.9,
              }}
            />
          );
        })}
    </div>
  );
}
