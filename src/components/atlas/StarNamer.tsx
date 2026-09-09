"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { nameAStar } from "@/lib/atlas/oracle";
import { generateStars } from "@/lib/atlas/cosmos";

/**
 * StarNamer — christen a star of your own. A seed word (a name, a place,
 * a feeling) becomes a generated star name, a mock catalog designation,
 * and a small sky where your star visibly burns.
 */
export default function StarNamer() {
  const now = useAtlasTime();
  const [seed, setSeed] = useState("");
  const [baptized, setBaptized] = useState<string | null>(null);

  const result = baptized ? nameAStar(baptized, now) : null;
  // Your sky: one bright star among generated companions.
  const sky = baptized ? generateStars(`star-sky:${baptized}:${result?.name}`, 26) : [];
  const yourStar = { x: 46 + ((result?.name.length ?? 3) % 9), y: 40 };

  const christen = () => {
    const trimmed = seed.trim();
    setBaptized(trimmed || "esther");
  };

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="star"
        title="Star Namer"
        line="Give a word to the sky and it gives a star back, named."
      />

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && christen()}
          placeholder="A name, a place, a feeling…"
          aria-label="Seed word for your star"
          className="min-w-0 flex-1 rounded-full border border-white/[0.08] bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[rgba(var(--mood-rgb),0.45)]"
        />
        <button
          type="button"
          onClick={christen}
          className="shrink-0 rounded-full bg-linear-to-br from-amber-300 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] transition hover:brightness-110"
        >
          Christen
        </button>
      </div>

      {result && (
        <AnimatePresence>
          <motion.div
            key={result.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 flex-1"
          >
            {/* The sky with your star in it */}
            <div className="relative h-28 overflow-hidden rounded-2xl border border-white/[0.05] bg-[#04030c]">
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                {sky.map((star, i) => (
                  <circle
                    key={i}
                    cx={star.x}
                    cy={(star.y / 100) * 60}
                    r={star.size * 0.4}
                    fill="#fff"
                    opacity={star.brightness * 0.6}
                  />
                ))}
                {/* Your star — brighter, warmer, breathing */}
                <motion.circle
                  cx={yourStar.x}
                  cy={yourStar.y * 0.6}
                  r="1.6"
                  fill="#fde68a"
                  animate={{ opacity: [0.7, 1, 0.7], r: [1.4, 1.9, 1.4] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 0 3px rgba(253,230,138,0.9))" }}
                />
              </svg>
              <p className="absolute bottom-2 right-3 text-[10px] uppercase tracking-[0.25em] text-gray-500">
                Your star burns here
              </p>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-medium text-white">{result.name}</p>
                <p className="mt-0.5 text-[12px] text-gray-500">
                  Cataloged as {result.catalog}
                </p>
              </div>
              <p className="max-w-[55%] text-right text-[12px] italic leading-relaxed text-amber-200/75">
                “{result.meaning}”
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <p className="mt-auto pt-5 text-[11px] text-gray-600">
        Names are day-stable — the same word, the same star, forever.
      </p>
    </GlassCard>
  );
}
