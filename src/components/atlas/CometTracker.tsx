"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { cometSightings } from "@/lib/atlas/cosmos";

/**
 * CometTracker — the visitors with schedules. Each comet's orbit progress,
 * closest-approach countdown, and current brightness are computed live from
 * the Atlas clock. The nearest visitor is featured; the rest are quiet rows.
 */
export default function CometTracker() {
  const now = useAtlasTime();
  const sightings = cometSightings(now);
  const [featured, ...rest] = sightings;

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="star"
        title="Comet Tracker"
        line="Long-period visitors, each on its own honest orbit."
      />

      {featured && (
        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-lg font-medium text-white">{featured.name}</p>
            <p className="shrink-0 text-xs text-gray-400">
              {featured.visible ? (
                <span className="text-emerald-300">Closest approach region</span>
              ) : (
                `${featured.daysAway.toLocaleString()} days away`
              )}
            </p>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-400/85">{featured.story}</p>

          {/* Orbit progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
              <span>Orbit progress</span>
              <span>{Math.round(featured.orbitProgress * 100)}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-cyan-300/70 to-violet-400/80"
                initial={{ width: 0 }}
                animate={{ width: `${featured.orbitProgress * 100}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {rest.map((comet) => (
          <li
            key={comet.id}
            className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-white/[0.06] hover:bg-white/[0.02]"
          >
            {/* Tail — a small streak tinted by the comet's light */}
            <span
              aria-hidden
              className={`h-1.5 w-10 shrink-0 rounded-full bg-linear-to-r ${comet.tail} bg-black/20`}
              style={{ opacity: 0.35 + comet.brightness * 0.65 }}
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-gray-200">{comet.name}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-gray-500">
              {comet.daysAway.toLocaleString()}d
            </span>
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-gray-400">
              {Math.round(comet.brightness * 100)}%
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-4 text-[11px] leading-relaxed text-gray-600">
        Brightness and distance are idealized from each comet&apos;s period — close enough to feel
        the sky, honest enough to admit it.
      </p>
    </GlassCard>
  );
}
