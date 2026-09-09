"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { auroraForecast, moonPhase, siderealTime } from "@/lib/atlas/cosmos";

/**
 * CosmicPulse — the heartbeat of the whole sky, drawn as one scrolling
 * waveform. The wave is composed from real cycles: the sidereal rotation,
 * the aurora index, and the moon's illumination — so the pulse genuinely
 * changes with the hour, the season, and the phase.
 */
export default function CosmicPulse() {
  const now = useAtlasTime();
  const aurora = auroraForecast(now);
  const moon = moonPhase(now);
  const lst = siderealTime(now);

  // The waveform: three nested cycles sampled across the last two minutes.
  const wave = useMemo(() => {
    const t0 = now.getTime() / 1000;
    return Array.from({ length: 72 }, (_, i) => {
      const t = t0 - (71 - i) * 1.6;
      return (
        Math.sin(t / 9.7) * 0.45 +
        Math.sin(t / 23.3 + lst / 60) * 0.3 +
        Math.sin(t / 61.1 + moon.phase * 6.28) * 0.25
      );
    });
  }, [now, lst, moon.phase]);

  const path = wave
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (wave.length - 1)) * 300} ${40 - v * 30}`)
    .join(" ");

  // The pulse rate — slower when the sky is quiet, quicker in a storm.
  const bpm = Math.round(38 + aurora.kp * 7 + moon.illumination * 6);
  const state =
    aurora.level === "celestial" || aurora.level === "storm"
      ? "Wide awake"
      : aurora.level === "active"
        ? "Restless"
        : aurora.level === "faint"
          ? "Dreaming"
          : "Deep sleep";

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="sparkles"
        title="Cosmic Pulse"
        line="One waveform for the whole sky — rotation, aurora, and moon braided together."
      />

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-4xl font-medium tabular-nums text-white">
            {bpm}
            <span className="ml-1.5 text-sm font-normal text-gray-500">bpm</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[rgba(var(--mood-rgb),0.8)]">
            {state}
          </p>
        </div>
        <div className="text-right text-[11px] leading-relaxed text-gray-500">
          <p>Kp {aurora.kp.toFixed(1)}</p>
          <p>Moon {Math.round(moon.illumination * 100)}%</p>
          <p>LST {lst.toFixed(1)}°</p>
        </div>
      </div>

      {/* The waveform */}
      <div className="relative mt-5 flex-1 overflow-hidden rounded-2xl border border-white/[0.05] bg-black/30">
        <svg viewBox="0 0 300 80" preserveAspectRatio="none" className="h-full min-h-[110px] w-full">
          <defs>
            <linearGradient id="pulse-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#67e8f9" stopOpacity="0.15" />
              <stop offset="0.6" stopColor="#a78bfa" stopOpacity="0.8" />
              <stop offset="1" stopColor="#f0abfc" />
            </linearGradient>
          </defs>
          <motion.path
            d={path}
            fill="none"
            stroke="url(#pulse-line)"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
          {/* The scanning head */}
          <motion.circle
            r="2.6"
            fill="#f0abfc"
            animate={{ cx: 300, opacity: [1, 1] }}
            initial={{ cx: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            cy={40 - wave[wave.length - 1] * 30}
          />
        </svg>
        {/* Grid whisper */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-gray-600">{aurora.line}</p>
    </GlassCard>
  );
}
