"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";

const moods = [
  { label: "Happy", emoji: "✨" },
  { label: "Lost", emoji: "🌙" },
  { label: "Inspired", emoji: "🚀" },
  { label: "Calm", emoji: "🌊" },
  { label: "Curious", emoji: "🔮" }
];

const moodLines: Record<string, string> = {
  Happy: "Bright stories to keep the glow going.",
  Lost: "Quiet stories for wandering hearts.",
  Inspired: "Stories that spark your next big idea.",
  Calm: "Slow, gentle stories to breathe with.",
  Curious: "Stories that open new worlds."
};

export default function MoodOrbit() {
  const [selected, setSelected] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="mood" className="scroll-mt-24 bg-black px-6 py-24 text-white">
      <SectionHeader
        eyebrow="Your mood"
        title="Find the center of your universe"
        subtitle="Touch a feeling and the orbit answers."
      />

      <div className="relative mx-auto mt-12 h-[270px] w-[270px] sm:h-[380px] sm:w-[380px]">
        {/* Rotating orbit ring (static under reduced motion) */}
        <motion.div
          aria-hidden
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-white/10"
        >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/70" />
            <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-400/70" />
            <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400/70" />
            <span className="absolute right-0 top-1/2 h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/70" />
        </motion.div>

        {/* Pulsing core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.06, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 shadow-[0_0_60px_rgba(168,85,247,0.45)] md:h-28 md:w-28"
          >
            <span className="text-3xl" aria-hidden>
              {selected ? moods.find((mood) => mood.label === selected)?.emoji : "✦"}
            </span>
          </motion.div>
        </div>

        {/* Mood chips around the orbit */}
        {moods.map((mood, index) => {
          const angle = (index / moods.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 44;
          const isSelected = selected === mood.label;
          return (
            <motion.button
              key={mood.label}
              style={{
                left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                top: `calc(50% + ${Math.sin(angle) * radius}%)`
              }}
              initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.7 }}
              animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
              onClick={() => setSelected(isSelected ? null : mood.label)}
              aria-pressed={isSelected}
              className={`absolute rounded-full border px-3 py-1.5 text-xs backdrop-blur transition-colors duration-300 sm:px-4 sm:py-2 sm:text-sm ${
                isSelected
                  ? "border-emerald-400/60 bg-emerald-400/10 text-white shadow-[0_0_25px_rgba(52,211,153,0.3)]"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <span className="mr-1.5" aria-hidden>
                {mood.emoji}
              </span>
              {mood.label}
            </motion.button>
          );
        })}
      </div>

      {/* Selected mood message */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto mt-10 max-w-md"
        >
          <GlassCard className="p-5 text-center">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-emerald-300">Feeling {selected}?</span>{" "}
              {moodLines[selected] ?? "Auri is gathering stories to match."}
            </p>
            <p className="mt-2 text-xs text-gray-500">Auri is curating your universe… ✨</p>
          </GlassCard>
        </motion.div>
      )}
    </section>
  );
}
