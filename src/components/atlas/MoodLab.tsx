"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { useEnvironment } from "@/lib/environment";
import { onMoodChange } from "@/lib/mood";
import {
  blendMoods,
  moodColorHex,
  resonance,
  weatherForMood,
} from "@/lib/atlas/aura";

/**
 * MoodLab — where the mood system becomes a laboratory. Blends the active
 * mood against every other mood, scores each resonance, and renders the
 * emotional weather the current blend produces.
 */
export default function MoodLab() {
  const { moodId } = useEnvironment();
  // Auri quick-chips fire the mood event outside the provider — keep in sync.
  const [, bump] = useState(0);
  useEffect(() => onMoodChange(() => bump((n) => n + 1)), []);
  const liveMood = moodId ?? null;
  const now = useAtlasTime();

  const weather = weatherForMood(liveMood);
  const others = [
    "inspired", "reflective", "peaceful", "lost",
    "motivated", "curious", "nostalgic", "overwhelmed",
  ].filter((m) => m !== liveMood);
  const scores = others
    .map((m) => ({ mood: m, ...resonance(liveMood ?? "inspired", m) }))
    .sort((a, b) => b.score - a.score);
  const blends = liveMood ? blendMoods([liveMood, scores[0].mood]) : [];
  const hex = moodColorHex(liveMood ?? "inspired");

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="sparkles"
        title="Mood Lab"
        line="Pick a mood anywhere in WithIn — the lab re-blends the whole room live."
      />

      {/* Emotional weather readout */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <span aria-hidden className="text-3xl">{weather.glyph}</span>
        <div className="min-w-0">
          <p className="font-display text-base font-medium text-white">
            {weather.label}
            <span className="ml-2 text-xs font-normal text-gray-500">
              intensity {Math.round(weather.intensity * 100)}%
            </span>
          </p>
          <p className="mt-0.5 text-[13px] text-gray-400/85">{weather.line}</p>
        </div>
      </div>

      {/* Resonance ranking */}
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
        Resonance with the current mood
      </p>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {scores.slice(0, 5).map((row) => (
          <li key={row.mood} className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: moodColorHex(row.mood) }}
            />
            <span className="w-20 shrink-0 text-[12px] capitalize text-gray-300">{row.mood}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${hex}, ${moodColorHex(row.mood)})` }}
                initial={{ width: 0 }}
                animate={{ width: `${row.score}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-gray-500">
              {row.score}
            </span>
          </li>
        ))}
      </ul>

      {/* The top blend */}
      {blends[0] && (
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            borderColor: `${hex}33`,
            background: `linear-gradient(135deg, ${hex}14, ${moodColorHex(scores[0].mood)}14)`,
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Top blend</p>
          <p className="mt-1 font-display text-base font-medium text-white">{blends[0].name}</p>
          <p className="mt-0.5 text-[12px] text-gray-400/85">{blends[0].line}</p>
        </div>
      )}

      <p className="mt-auto pt-4 text-[11px] text-gray-600">
        The weather describes the room, never the person · {now.toLocaleTimeString()}
      </p>
    </GlassCard>
  );
}
