"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { moonPhase } from "@/lib/atlas/cosmos";

/**
 * MoonDial — the moon as an instrument. A live SVG dial: the shadow disk
 * sweeps according to the true phase, the rim light follows the lit limb,
 * and the readouts update every second from the Atlas clock.
 */
export default function MoonDial() {
  const now = useAtlasTime();
  const moon = moonPhase(now);

  // The terminator offset — how far the shadow sweeps across the disk.
  const offset = (moon.phase - 0.5) * 2; // -1 … 1

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="moon"
        title="Moon Dial"
        line="Where the moon actually is, right now."
      />

      <div className="mt-6 flex items-center gap-6">
        {/* The dial */}
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full">
            <defs>
              <radialGradient id="moon-surface" cx="0.38" cy="0.34" r="0.9">
                <stop offset="0" stopColor="#f5f3ff" />
                <stop offset="0.7" stopColor="#c7c2e8" />
                <stop offset="1" stopColor="#8f88b8" />
              </radialGradient>
              <clipPath id="moon-clip">
                <circle cx="60" cy="60" r="44" />
              </clipPath>
            </defs>
            {/* Rim glow */}
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(167,139,250,0.25)" strokeWidth="1" />
            {/* The dark disk */}
            <circle cx="60" cy="60" r="44" fill="#161230" />
            {/* The lit disk, eclipsed by the sweeping shadow ellipse */}
            <g clipPath="url(#moon-clip)">
              <circle cx="60" cy="60" r="44" fill="url(#moon-surface)" />
              <motion.ellipse
                cx="60"
                cy="60"
                rx={Math.abs(offset) * 44}
                ry="44"
                fill="#0c0a20"
                initial={false}
                animate={{ cx: offset >= 0 ? 60 + offset * 44 : 60 - offset * 44 - Math.abs(offset) * 44 * 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ display: moon.phase > 0.02 && moon.phase < 0.98 ? undefined : "none" }}
              />
              {/* Craters — faint character on the lit face */}
              <circle cx="46" cy="48" r="6" fill="rgba(90,84,130,0.35)" />
              <circle cx="72" cy="66" r="4.5" fill="rgba(90,84,130,0.3)" />
              <circle cx="56" cy="76" r="3" fill="rgba(90,84,130,0.28)" />
            </g>
          </svg>
          {/* Breathing glow behind the dial */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-xl"
            style={{ background: "radial-gradient(circle, rgba(196,181,253,0.3), transparent 70%)" }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.12, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Readouts */}
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xl text-white/95">
            <span aria-hidden>{moon.glyph}</span> {moon.name}
          </p>
          <p className="mt-2 text-[13px] text-gray-400/85">
            {Math.round(moon.illumination * 100)}% illuminated · {moon.waxing ? "waxing" : "waning"}
          </p>
          <p className="mt-1 text-[13px] text-gray-500/85">
            {moon.daysToFull === 0
              ? "Full tonight."
              : `${moon.daysToFull} days to full moon.`}
          </p>
        </div>
      </div>

      {/* Phase ribbon — where we are in the cycle */}
      <div className="mt-6">
        <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="absolute inset-y-0 rounded-full bg-[linear-gradient(90deg,#a78bfa,#e0e7ff,#a78bfa)]"
            initial={false}
            animate={{ width: `${moon.phase * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-gray-600">
          <span>New</span>
          <span>Full</span>
          <span>New</span>
        </div>
      </div>
    </GlassCard>
  );
}
