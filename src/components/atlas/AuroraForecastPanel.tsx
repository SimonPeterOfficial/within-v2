"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { auroraForecast, shootingStars } from "@/lib/atlas/cosmos";

/**
 * AuroraForecastPanel — tonight's aurora as a live instrument. The Kp index
 * comes from the cosmos engine; the curtain above renders that intensity
 * with animated color bands, plus a few deterministic shooting stars.
 */
export default function AuroraForecastPanel() {
  const now = useAtlasTime();
  const forecast = auroraForecast(now);
  // Stars reseed once per minute — a stable, simple expression for deps.
  const minute = Math.floor(now.getTime() / 60000);
  const stars = useMemo(() => shootingStars(new Date(minute * 60000), "aurora-shower", 3), [minute]);

  const bands = 5;

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col overflow-hidden p-6">
      <AtlasHeading
        icon="sparkles"
        title="Aurora Forecast"
        line={forecast.line}
      />

      {/* The curtain simulation */}
      <div className="relative mt-6 h-32 overflow-hidden rounded-2xl border border-white/[0.05] bg-[#040510]">
        {/* Faint stars */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 45% 60%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 75% 30%, rgba(255,255,255,0.65), transparent), radial-gradient(1px 1px at 88% 75%, rgba(255,255,255,0.4), transparent)",
          }}
        />

        {/* The color bands — one per band, intensity from Kp */}
        {Array.from({ length: bands }, (_, i) => (
          <motion.div
            key={i}
            className="absolute inset-x-0"
            style={{
              top: `${8 + i * 14}%`,
              height: `${10 + i * 4}%`,
              background: `linear-gradient(90deg, transparent, ${forecast.hue}, transparent)`,
              filter: "blur(10px)",
              opacity: Math.max(0.06, forecast.intensity - i * 0.12),
            }}
            animate={{
              x: ["-6%", "6%", "-6%"],
              skewX: [-4, 4, -4],
            }}
            transition={{
              duration: 7 + i * 1.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Shooting stars — deterministic passes */}
        {forecast.intensity > 0.35 &&
          stars.map((star) => (
            <motion.span
              key={star.id}
              className="absolute h-px w-10 bg-white/80"
              style={{ left: `${star.x}%`, top: `${star.y}%`, rotate: `${star.angle}deg` }}
              animate={{ x: ["0%", "220%"], opacity: [0, 1, 0] }}
              transition={{
                duration: 1.4,
                delay: star.delay,
                repeat: Infinity,
                repeatDelay: 9 + star.id * 3,
                ease: "easeOut",
              }}
            />
          ))}

        {/* Ground silhouette */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-6"
          style={{ background: "linear-gradient(180deg, transparent, #02030a 80%)" }}
        />
      </div>

      {/* The index */}
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="font-display text-3xl font-medium text-white tabular-nums">
            Kp {forecast.kp.toFixed(1)}
          </p>
          <p className="mt-1 text-[12px] uppercase tracking-[0.2em] text-gray-500">
            {forecast.levelLabel}
          </p>
        </div>
        {/* Kp meter */}
        <div className="flex items-end gap-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="w-2.5 rounded-sm"
              style={{
                height: `${8 + i * 6}px`,
                background: i * 2 < forecast.kp ? forecast.hue : "rgba(255,255,255,0.08)",
                boxShadow: i * 2 < forecast.kp ? `0 0 8px ${forecast.hue}66` : "none",
              }}
              initial={false}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
