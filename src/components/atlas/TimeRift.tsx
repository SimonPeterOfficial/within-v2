"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";

/**
 * TimeRift — a window that keeps yesterday. The rift holds the exact sky
 * (moon, palette, constellation) from 24 hours ago beside today's, so you
 * can feel the drift of one ordinary day.
 */

function dayKey(date: Date, offsetDays: number): number {
  return Math.floor(date.getTime() / 86400000) - offsetDays;
}

function riftLine(key: number): string {
  // Deterministic per-day drift description.
  const drift = (key * 2654435761) % 100;
  if (drift < 18) return "Barely moved — a held breath of a day.";
  if (drift < 42) return "The light shifted one room over.";
  if (drift < 68) return "The moon walked a visible step west.";
  return "The whole sky rearranged its furniture.";
}

export default function TimeRift() {
  const now = useAtlasTime();
  const todayKey = dayKey(now, 0);
  const yesterdayKey = dayKey(now, 1);
  const today = new Date(now);
  const yesterday = new Date(now.getTime() - 86400000);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="clock"
        title="Time Rift"
        line="One window on today, one on yesterday — the same hour, one day apart."
      />

      <div className="mt-6 grid flex-1 grid-cols-2 gap-3">
        {[
          { label: "Yesterday", date: yesterday, key: yesterdayKey },
          { label: "Today", date: today, key: todayKey },
        ].map((side, idx) => (
          <div
            key={side.label}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#05040d] p-4"
          >
            {/* A tiny sky — seeded per side */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-70"
              style={{
                background:
                  idx === 1
                    ? "radial-gradient(circle at 70% 20%, rgba(167,139,250,0.22), transparent 55%), radial-gradient(circle at 20% 80%, rgba(34,211,238,0.1), transparent 50%)"
                    : "radial-gradient(circle at 30% 25%, rgba(244,114,182,0.14), transparent 55%), radial-gradient(circle at 75% 75%, rgba(129,140,248,0.12), transparent 50%)",
              }}
            />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
              {side.label}
            </p>
            <p className="relative mt-1 font-display text-lg font-medium text-white">
              {fmt(side.date)}
            </p>
            <div className="relative mt-3 space-y-1" aria-hidden>
              {[0, 1, 2, 3, 4, 5].map((star) => (
                <motion.span
                  key={star}
                  className="absolute h-0.5 w-0.5 rounded-full bg-white"
                  style={{
                    left: `${(star * 17 + side.key) % 90 + 5}%`,
                    top: `${(star * 29 + side.key * 3) % 55 + 35}%`,
                  }}
                  animate={{ opacity: [0.2, 0.9, 0.2] }}
                  transition={{
                    duration: 3 + (star % 3),
                    repeat: Infinity,
                    delay: star * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-gray-400/80">
        {riftLine(todayKey - yesterdayKey === 1 ? todayKey : todayKey)}
      </p>
    </GlassCard>
  );
}
