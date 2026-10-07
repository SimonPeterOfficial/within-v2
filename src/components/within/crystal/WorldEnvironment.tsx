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
 *
 * WORLD STAGE — the environment is a place, not a wallpaper. Five depth
 * layers behind the interface, far to near:
 *   1. sky        the time-tinted light field
 *   2. clouds     slow cloud banks drifting at the horizon
 *   3. architecture  distant towers + a citadel silhouette in the haze
 *   4. isles      floating islands with waterfalls falling into the lake
 *   5. lake       the reflective water the world floats above
 * Motion is a whisper (48–90s cycles); reduced motion freezes it in place.
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

  // The world stage dims and simplifies in the calm rooms — the quiet rooms
  // face away from the citadel; the lake and sky remain.
  const stageOpacity = calm ? 0.45 : 1;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* ── 1. The deep sky ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: calm
            ? "radial-gradient(ellipse 100% 60% at 18% -8%, rgba(200, 228, 245, 0.3), transparent 55%), radial-gradient(ellipse 85% 55% at 88% 105%, rgba(235, 228, 250, 0.3), transparent 58%)"
            : "radial-gradient(ellipse 110% 70% at 80% -12%, rgba(190, 170, 250, 0.22), transparent 58%), radial-gradient(ellipse 95% 60% at 5% 10%, rgba(170, 215, 245, 0.28), transparent 60%), radial-gradient(ellipse 70% 45% at 50% 108%, rgba(245, 235, 252, 0.36), transparent 62%)",
        }}
      />

      {/* ── 2. The lake — the world floats above still water ───────── */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[30vh]"
        style={{ opacity: stageOpacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(214, 218, 242, 0.4) 34%, rgba(190, 196, 232, 0.7) 100%)",
          }}
        />
        {/* The far shore haze where water meets sky */}
        <div
          className="absolute inset-x-0 top-0 h-8"
          style={{
            background: "linear-gradient(180deg, rgba(244, 246, 254, 0.9), transparent)",
            filter: "blur(6px)",
          }}
        />
        {/* Reflection shimmer — slow bands of pearl light on the water */}
        {[22, 48, 74].map((x, i) => (
          <motion.span
            key={x}
            className="absolute rounded-full border border-white/45"
            style={{ left: `${x}%`, top: `${34 + i * 16}%`, width: 90 - i * 14, height: 9, opacity: 0.35 }}
            animate={prefersReducedMotion ? undefined : { opacity: [0.18, 0.42, 0.18], scaleX: [1, 1.12, 1] }}
            transition={{ duration: 11 + i * 3, repeat: Infinity, ease: "easeInOut", delay: i * 2.2 }}
          />
        ))}
      </motion.div>

      {/* ── 3. Distant architecture — towers in the haze ─────────────── */}
      <div className="absolute inset-x-0 bottom-[24vh] h-[34vh]" style={{ opacity: 0.5 * stageOpacity }}>
        {/* Far citadel — a soft monumental silhouette, left of center */}
        <svg
          className="absolute bottom-0 left-[6%] h-full w-auto"
          viewBox="0 0 240 220"
          fill="none"
          preserveAspectRatio="xMinYMax meet"
        >
          <g fill="#a9aede">
            <path d="M30 220 L30 130 Q52 112 74 130 L74 220 Z" opacity="0.55" />
            <path d="M96 220 L96 88 Q118 66 140 88 L140 220 Z" opacity="0.7" />
            <path d="M162 220 L162 148 Q182 132 202 148 L202 220 Z" opacity="0.5" />
            <path d="M96 88 Q118 62 140 88 L140 80 Q118 54 96 80 Z" fill="#b7b4e2" opacity="0.85" />
            <path d="M30 130 Q52 108 74 130 L74 124 Q52 102 30 124 Z" fill="#b7b4e2" opacity="0.7" />
            <path d="M162 148 Q182 128 202 148 L202 142 Q182 122 162 142 Z" fill="#b7b4e2" opacity="0.65" />
            {/* Spire needle */}
            <path d="M116 70 L118 28 L120 70 Z" fill="#b7b4e2" opacity="0.9" />
          </g>
        </svg>
        {/* Right-hand tower group — farther, fainter */}
        <svg
          className="absolute bottom-0 right-[10%] h-full w-auto"
          viewBox="0 0 180 200"
          fill="none"
          preserveAspectRatio="xMaxYMax meet"
        >
          <g fill="#b0b3dd">
            <path d="M20 200 L20 120 Q38 106 56 120 L56 200 Z" opacity="0.42" />
            <path d="M84 200 L84 76 Q104 58 124 76 L124 200 Z" opacity="0.58" />
            <path d="M84 76 Q104 52 124 76 L124 70 Q104 46 84 70 Z" fill="#c0bde6" opacity="0.75" />
            <path d="M102 60 L104 22 L106 60 Z" fill="#c0bde6" opacity="0.7" />
            <path d="M146 200 L146 140 Q160 128 174 140 L174 200 Z" opacity="0.35" />
          </g>
        </svg>
      </div>

      {/* ── 4. Floating isles — small verdant silhouettes with falls ── */}
      <div className="absolute inset-x-0 top-[12%] h-[38vh]" style={{ opacity: stageOpacity }}>
        <motion.div
          className="absolute left-[10%] top-[18%] hidden md:block"
          animate={prefersReducedMotion ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="132" height="78" viewBox="0 0 132 78" fill="none">
            <path d="M8 38 Q66 24 124 38 Q66 56 8 38 Z" fill="#88a082" opacity="0.85" />
            <path d="M24 44 L40 72 L56 46 Z" fill="#a9a0cc" opacity="0.8" />
            <path d="M78 46 L94 74 L110 46 Z" fill="#a096c6" opacity="0.8" />
            <circle cx="48" cy="32" r="8" fill="#93a888" />
            <circle cx="76" cy="28" r="10" fill="#879a80" />
            <circle cx="100" cy="33" r="7" fill="#93a888" />
            <rect x="62" y="42" width="5" height="30" rx="2.5" fill="url(#env-fall)" opacity="0.7" />
            <defs>
              <linearGradient id="env-fall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#eef4ff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#bcd4f2" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <motion.div
          className="absolute right-[16%] top-[8%] hidden lg:block"
          animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <svg width="104" height="62" viewBox="0 0 104 62" fill="none">
            <path d="M6 30 Q52 18 98 30 Q52 46 6 30 Z" fill="#8fa487" opacity="0.8" />
            <circle cx="34" cy="24" r="8" fill="#97ac8c" />
            <circle cx="62" cy="21" r="10" fill="#88997e" />
            <path d="M48 34 L58 54 L68 36 Z" fill="#a89fce" opacity="0.75" />
          </svg>
        </motion.div>
      </div>

      {/* ── 5. Cloud banks — slow masses drifting at the horizon ────── */}
      <motion.div
        className="absolute inset-x-[-20%] top-[30%] h-[22vh]"
        style={{ opacity: 0.55 * stageOpacity }}
        animate={prefersReducedMotion ? undefined : { x: [0, 26, 0] }}
        transition={{ duration: 90, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 22% 55% at 14% 60%, rgba(250,250,255,0.65), transparent 70%), radial-gradient(ellipse 30% 62% at 42% 40%, rgba(246,246,252,0.55), transparent 72%), radial-gradient(ellipse 26% 58% at 74% 55%, rgba(252,250,255,0.6), transparent 70%), radial-gradient(ellipse 20% 48% at 92% 45%, rgba(248,246,252,0.45), transparent 72%)",
            filter: "blur(14px)",
          }}
        />
      </motion.div>

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
