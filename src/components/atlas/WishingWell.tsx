"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { hashSeed, moonPhase, seededRandom } from "@/lib/atlas/cosmos";

/**
 * WishingWell — a well that answers with ripples. Write a wish; the well
 * keeps it on your device, returns a gentle reflection, and the water
 * remembers how many wishes rest at the bottom.
 */

const RIPPLES = [
  "The well keeps it. Wishes weigh almost nothing, together.",
  "Ripples sent. The water says: soon, or later — both arrive.",
  "Kept. Some wishes are instructions you leave for yourself.",
  "The well heard it. Now act like someone being helped.",
  "Sunk softly. The best wishes look like plans from below.",
];

type Wish = { id: number; text: string; at: number };

export default function WishingWell() {
  const now = useAtlasTime();
  const moon = moonPhase(now);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [text, setText] = useState("");
  const [ripple, setRipple] = useState<string | null>(null);

  const makeWish = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const wish: Wish = { id: Date.now(), text: trimmed, at: now.getTime() };
    setWishes((w) => [wish, ...w].slice(0, 8));
    setText("");
    // The well's answer is deterministic from the wish + moonlight.
    const rand = seededRandom(hashSeed(`${trimmed}:${moon.phase.toFixed(3)}`));
    setRipple(RIPPLES[Math.floor(rand() * RIPPLES.length)]);
  };

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="sparkles"
        title="Wishing Well"
        line="Write it, drop it, watch the water. Wishes stay on your device."
      />

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && makeWish()}
          placeholder="I wish…"
          aria-label="Your wish"
          className="min-w-0 flex-1 rounded-full border border-white/[0.08] bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[rgba(var(--mood-rgb),0.45)]"
        />
        <button
          type="button"
          onClick={makeWish}
          className="shrink-0 rounded-full border border-[rgba(var(--mood-rgb),0.4)] bg-[rgba(var(--mood-rgb),0.12)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgba(var(--mood-rgb),0.2)]"
        >
          Drop
        </button>
      </div>

      {/* The water */}
      <div className="relative mt-5 min-h-[120px] flex-1 overflow-hidden rounded-2xl border border-white/[0.05]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 120%, rgba(76,45,140,0.5), rgba(12,10,28,0.9) 60%), linear-gradient(180deg, rgba(20,16,40,0.6), rgba(6,5,14,0.9))",
          }}
        />
        {/* Moon reflection */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-4 h-10 w-10 -translate-x-1/2 rounded-full blur-[2px]"
          style={{ background: `rgba(230,225,255,${0.25 + moon.illumination * 0.55})` }}
          animate={{ opacity: [0.6, 1, 0.6], scaleX: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Concentric ripples for each wish */}
        <AnimatePresence>
          {wishes.map((wish, i) => (
            <motion.span
              key={wish.id}
              aria-hidden
              className="absolute left-1/2 top-1/2 rounded-full border border-violet-300/40"
              initial={{ width: 8, height: 8, x: "-50%", y: "-50%", opacity: 0.9 }}
              animate={{ width: 160 + i * 30, height: 160 + i * 30, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.2, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-3 px-4">
          {ripple ? (
            <motion.p
              key={ripple + wishes[0]?.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[12px] italic leading-relaxed text-violet-200/80"
            >
              “{ripple}”
            </motion.p>
          ) : (
            <p className="text-[12px] text-gray-500">
              The water is still. {wishes.length > 0 && `${wishes.length} wish${wishes.length === 1 ? "" : "es"} rest below.`}
            </p>
          )}
        </div>
      </div>

      {wishes.length > 0 && (
        <ul className="mt-4 flex max-h-24 flex-col gap-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {wishes.map((wish) => (
            <li key={wish.id} className="truncate text-[12px] text-gray-500">
              <span aria-hidden className="mr-1.5 text-violet-400/70">✦</span>
              {wish.text}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
