"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import Icon from "@/components/ui/Icon";
import { hashSeed, seededRandom } from "@/lib/atlas/cosmos";

/**
 * NebulaWeave — a loom for nebulae. Every weave index seeds a new field of
 * light: drifting clouds with their own hues, drift directions, and cores.
 * Reweaving is honest randomness — the same seed always grows the same sky.
 */

type Blob = {
  x: number; y: number; r: number; hue: string; drift: number; delay: number;
};

const HUES = ["#7c3aed", "#22d3ee", "#f472b6", "#818cf8", "#34d399", "#fbbf24"];
const NAMES = ["Veil of Quiet Hours", "The Long Violet", "Ember Shoals", "Cyan Meridian", "Rose Drift", "The Slow Aurora"];

function weave(index: number): { blobs: Blob[]; name: string } {
  const rand = seededRandom(hashSeed(`nebula-weave:${index}`));
  const blobs = Array.from({ length: 7 }, (_, i) => ({
    x: 12 + rand() * 76,
    y: 12 + rand() * 76,
    r: 14 + rand() * 30,
    hue: HUES[Math.floor(rand() * HUES.length)],
    drift: (rand() - 0.5) * 14,
    delay: i * 0.6,
  }));
  return { blobs, name: NAMES[index % NAMES.length] };
}

export default function NebulaWeave() {
  const [weaveIndex, setWeaveIndex] = useState(0);
  const { blobs, name } = useMemo(() => weave(weaveIndex), [weaveIndex]);

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="sparkles"
        title="Nebula Weave"
        line="Light, woven from seeds. Every weave is a sky that could exist."
      />

      {/* The loom */}
      <div className="relative mt-6 min-h-[190px] flex-1 overflow-hidden rounded-2xl border border-white/[0.05] bg-[#04030c]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <filter id="nebula-blur" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>
          {blobs.map((blob, i) => (
            <motion.ellipse
              key={`${weaveIndex}-${i}`}
              cx={blob.x}
              cy={blob.y}
              rx={blob.r}
              ry={blob.r * 0.62}
              fill={blob.hue}
              opacity={0.16 + (i % 3) * 0.05}
              filter="url(#nebula-blur)"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: [0.1, 0.22, 0.1],
                x: [0, blob.drift, 0],
                scale: [0.9, 1.05, 0.9],
              }}
              transition={{
                duration: 12 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: blob.delay,
              }}
              style={{ transformOrigin: `${blob.x}px ${blob.y}px` }}
            />
          ))}
          {/* Embedded stars */}
          {blobs.map((blob, i) => (
            <circle
              key={`star-${weaveIndex}-${i}`}
              cx={(blob.x * 7.3) % 100}
              cy={(blob.y * 3.1) % 100}
              r={0.5 + (i % 3) * 0.3}
              fill="#fff"
              opacity={0.5}
            />
          ))}
        </svg>

        <div className="absolute bottom-3 left-4">
          <p className="font-display text-sm font-medium text-white/90">{name}</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
            Weave nº {String(weaveIndex + 1).padStart(3, "0")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setWeaveIndex((i) => i + 1)}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-gray-200 transition hover:border-[rgba(var(--mood-rgb),0.4)] hover:bg-[rgba(var(--mood-rgb),0.08)] hover:text-white"
      >
        <Icon name="refresh" size={14} />
        Weave another sky
      </button>
    </GlassCard>
  );
}
