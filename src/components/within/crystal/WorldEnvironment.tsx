"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * WorldEnvironment — the Crystal World's atmosphere.
 *
 * Light-first: soft sky, mist, pearl light moving through the world.
 * Time-aware — reads data-time set by Auri's clock and tints the ambient
 * light: warm morning, clear day, lavender evening, deeper night. The
 * environment stays luminous at every hour; night deepens without
 * collapsing back into the old dark theme.
 */

type Props = {
  /** "world" full crystal atmosphere; "calm" for Sanctuary/Mirror */
  variant?: "world" | "calm";
  /** Ambient light tint override (weather/Auri integration later) */
  tint?: "neutral" | "warm" | "cool" | "lavender";
};

const TINTS: Record<NonNullable<Props["tint"]>, { a: string; b: string }> = {
  neutral: { a: "rgba(168, 150, 250, 0.16)", b: "rgba(160, 205, 240, 0.2)" },
  warm: { a: "rgba(250, 210, 160, 0.22)", b: "rgba(255, 230, 200, 0.24)" },
  cool: { a: "rgba(150, 200, 235, 0.2)", b: "rgba(170, 215, 245, 0.22)" },
  lavender: { a: "rgba(190, 165, 245, 0.2)", b: "rgba(215, 190, 250, 0.18)" },
};

function timeOfDay(): "morning" | "day" | "evening" | "night" {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export default function WorldEnvironment({ variant = "world", tint = "neutral" }: Props) {
  const prefersReducedMotion = useReducedMotionSafe();
  // Hydration-safe: first render neutral, sync to live hour after mount.
  const [daylight, setDaylight] = useState<"morning" | "day" | "evening" | "night">("day");

  useEffect(() => {
    const update = () => setDaylight(timeOfDay());
    update();
    const interval = setInterval(update, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const colors = TINTS[tint];
  const calm = variant === "calm";

  // Ambient light — warm in the morning, cooler toward night.
  const ambientA =
    daylight === "morning" ? colors.b : daylight === "night" ? "rgba(150, 160, 235, 0.18)" : colors.a;
  const ambientB =
    daylight === "morning" ? colors.a : daylight === "evening" ? TINTS.lavender.b : colors.b;

  // Light motes — sparse, slow, luminous dust in the air.
  const motes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: (i * 61.8) % 100,
        y: (i * 38.2) % 100,
        size: 1.5 + ((i * 7) % 3),
        duration: 30 + ((i * 13) % 20),
        delay: (i * 3.9) % 14,
      })),
    []
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* The deep environment — mist and light fields */}
      <div
        className="absolute inset-0"
        style={{
          background: calm
            ? "radial-gradient(ellipse 100% 60% at 18% -8%, rgba(200, 228, 245, 0.3), transparent 55%), radial-gradient(ellipse 85% 55% at 88% 105%, rgba(235, 228, 250, 0.3), transparent 58%)"
            : "radial-gradient(ellipse 110% 70% at 80% -12%, rgba(190, 170, 250, 0.22), transparent 58%), radial-gradient(ellipse 95% 60% at 5% 10%, rgba(170, 215, 245, 0.28), transparent 60%), radial-gradient(ellipse 70% 45% at 50% 108%, rgba(245, 235, 252, 0.36), transparent 62%)",
        }}
      />

      {/* Ambient light sources — drifting like sun through glass */}
      <motion.div
        className="absolute -left-[12%] top-[4%] h-[44vmax] w-[44vmax] rounded-full"
        style={{ background: ambientA, filter: "blur(120px)" }}
        animate={prefersReducedMotion ? undefined : { x: [0, 44, 0], y: [0, 26, 0], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[10%] bottom-[2%] h-[38vmax] w-[38vmax] rounded-full"
        style={{ background: ambientB, filter: "blur(120px)" }}
        animate={prefersReducedMotion ? undefined : { x: [0, -34, 0], y: [0, -22, 0], opacity: [0.65, 0.95, 0.65] }}
        transition={{ duration: 56, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* A horizon light low in the world — the "sun through morning glass" */}
      {daylight === "morning" && !calm && (
        <div
          className="absolute inset-x-[15%] top-[62%] h-[24vmax]"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, rgba(255, 226, 180, 0.22), transparent 65%)",
            filter: "blur(60px)",
          }}
        />
      )}

      {/* Luminous motes — barely-there, weightless */}
      {motes.map((mote) => (
        <motion.span
          key={mote.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: mote.size,
            height: mote.size,
            boxShadow: "0 0 8px rgba(255,255,255,0.9)",
          }}
          animate={prefersReducedMotion ? undefined : { y: [0, -40, 0], opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: mote.duration, repeat: Infinity, ease: "easeInOut", delay: mote.delay }}
        />
      ))}

      {/* Soft vignette — the world's edges stay gentle */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 62%, rgba(235, 235, 248, 0.35) 100%)" }}
      />
    </div>
  );
}
