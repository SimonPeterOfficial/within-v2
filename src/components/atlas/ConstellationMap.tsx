"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { CONSTELLATIONS, culminatingConstellation, generateStars } from "@/lib/atlas/cosmos";

/**
 * ConstellationMap — the five Atlas constellations on one canvas. The
 * currently-culminating one glows by default; selecting any constellation
 * draws its lines and tells its story. Background stars are deterministic.
 */
export default function ConstellationMap() {
  const now = useAtlasTime();
  const culminating = culminatingConstellation(now);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const active = CONSTELLATIONS.find((c) => c.id === selectedId) ?? culminating;

  const bgStars = generateStars(`map-bg`, 40);

  return (
    <GlassCard tone="soft" hoverLift className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AtlasHeading
          icon="star"
          title="Constellation Map"
          line="Five constellations the Atlas keeps. Select one to draw its lines."
        />
        {/* Selector */}
        <div className="flex flex-wrap gap-1.5">
          {CONSTELLATIONS.map((c) => {
            const isActive = active.id === c.id;
            const isCulm = culminating.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
                  isActive
                    ? "border-[rgba(var(--mood-rgb),0.45)] bg-[rgba(var(--mood-rgb),0.12)] text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-gray-400 hover:border-white/[0.18] hover:text-gray-200"
                }`}
              >
                {c.latin}
                {isCulm && !isActive && (
                  <span aria-hidden className="ml-1 text-[rgba(var(--mood-rgb),0.9)]">•</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* The canvas */}
        <div
          className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.05]"
          style={{ background: "radial-gradient(ellipse at 50% 60%, #0a0a20 0%, #030309 70%)" }}
        >
          {/* Background stars */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {bgStars.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.size * 0.12}
                fill={`rgba(255,255,255,${s.brightness * 0.35})`}
              />
            ))}
          </svg>

          {/* The active constellation */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {/* Lines */}
            <AnimatePresence mode="wait">
              <motion.g
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                {active.lines.map(([a, b], i) => (
                  <motion.line
                    key={i}
                    x1={active.stars[a].x}
                    y1={active.stars[a].y}
                    x2={active.stars[b].x}
                    y2={active.stars[b].y}
                    stroke="rgba(167,139,250,0.4)"
                    strokeWidth="0.25"
                    strokeDasharray="1.5 1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: i * 0.12 }}
                  />
                ))}
                {active.stars.map((s, i) => (
                  <g key={i}>
                    <circle cx={s.x} cy={s.y} r={s.size * 0.45} fill="rgba(226,214,255,0.95)" />
                    <circle cx={s.x} cy={s.y} r={s.size * 1.1} fill="rgba(167,139,250,0.18)" />
                  </g>
                ))}
              </motion.g>
            </AnimatePresence>
          </svg>

          {/* Culminating badge */}
          {culminating.id === active.id && (
            <span className="absolute right-3 top-3 rounded-full border border-[rgba(var(--mood-rgb),0.35)] bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[#c4b5fd] backdrop-blur">
              Highest now
            </span>
          )}
        </div>

        {/* The story panel */}
        <div className="flex flex-col justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                {active.latin} · {active.season}
              </p>
              <h4 className="mt-2 font-display text-2xl font-medium text-white">
                {active.name}
              </h4>
              <p className="mt-3 text-[14px] italic leading-relaxed text-gray-300/85">
                “{active.story}”
              </p>
              <p className="mt-4 text-[11px] text-gray-600">
                Culminates near {active.ra.toFixed(1)}h right ascension.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  );
}
