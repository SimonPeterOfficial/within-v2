"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { useEnvironment } from "@/lib/environment";
import { weatherForMood, weatherForHour } from "@/lib/atlas/aura";

/**
 * MoodWeather — the emotional weather report. If a mood is selected, the
 * forecast follows it; otherwise the hour's drifting weather. The scene
 * animates the condition: rain falls, fog drifts, embers rise.
 */
export default function MoodWeather() {
  const now = useAtlasTime();
  const { moodId } = useEnvironment();
  const moodWeather = weatherForMood(moodId);
  const weather = moodId ? moodWeather : weatherForHour(now);

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col overflow-hidden p-6">
      <AtlasHeading
        icon="moon"
        title="Mood Weather"
        line="The forecast for your inner rooms."
      />

      {/* The scene */}
      <div className="relative mt-6 h-36 overflow-hidden rounded-2xl border border-white/[0.05] bg-[#050510]">
        {/* Ambient tint by intensity */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, rgba(167,139,250,${0.1 * weather.intensity + 0.05}), transparent 65%)`,
          }}
        />

        {/* Condition-specific particles */}
        {(weather.condition === "soft-rain" || weather.condition === "storm") &&
          Array.from({ length: 14 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute h-3 w-px bg-cyan-200/40"
              style={{ left: `${(i * 7 + 4) % 100}%` }}
              animate={{ y: ["-10%", "440%"] }}
              transition={{
                duration: weather.condition === "storm" ? 0.7 : 1.3,
                delay: i * 0.18,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

        {weather.condition === "snow" &&
          Array.from({ length: 12 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/70"
              style={{ left: `${(i * 8 + 6) % 100}%` }}
              animate={{ y: ["-8%", "420%"], x: [0, 8, -6, 0] }}
              transition={{
                duration: 4 + (i % 3),
                delay: i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

        {(weather.condition === "ember-haze" || weather.condition === "golden") &&
          Array.from({ length: 8 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-amber-400/60"
              style={{ left: `${(i * 12 + 8) % 100}%`, bottom: "-4%" }}
              animate={{ y: [0, -130], opacity: [0, 0.9, 0] }}
              transition={{
                duration: 3.2 + (i % 3),
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

        {(weather.condition === "fog" || weather.condition === "aurora") &&
          Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute inset-y-0 w-1/2 rounded-full blur-xl"
              style={{
                background:
                  weather.condition === "fog"
                    ? "rgba(148,163,184,0.12)"
                    : "linear-gradient(90deg, transparent, rgba(110,231,183,0.18), transparent)",
              }}
              animate={{ x: ["-30%", "120%"] }}
              transition={{
                duration: 11 + i * 4,
                delay: i * 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

        {/* Clear — just breathing light */}
        {weather.condition === "clear" && (
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08), transparent 60%)" }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* The readout */}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-display text-2xl font-medium text-white">
            <span aria-hidden>{weather.glyph}</span> {weather.label}
          </p>
          <p className="mt-2 text-[13px] italic leading-relaxed text-gray-400/85">
            {weather.line}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
            moodId
              ? "border-[rgba(var(--mood-rgb),0.35)] bg-[rgba(var(--mood-rgb),0.08)] text-[#c4b5fd]"
              : "border-white/[0.1] bg-white/[0.03] text-gray-500"
          }`}
        >
          {moodId ? "From your mood" : "From the hour"}
        </span>
      </div>
    </GlassCard>
  );
}
