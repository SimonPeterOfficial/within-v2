"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";

const emotions = [
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

export default function EmotionSection() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section id="emotions" className="scroll-mt-24 bg-black px-6 py-24 text-white">
      <h2 className="text-center text-4xl font-bold md:text-5xl">
        How are you feeling today?
      </h2>

      <p className="mx-auto mt-4 max-w-lg text-center text-gray-400">
        Pick a mood and we&apos;ll find the story that fits.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {emotions.map((emotion, index) => {
          const isSelected = selected === emotion.label;
          return (
            <motion.button
              key={emotion.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setSelected(isSelected ? null : emotion.label)}
              aria-pressed={isSelected}
              className={`rounded-full border px-6 py-3 backdrop-blur transition-all duration-300 ${
                isSelected
                  ? "border-emerald-400/60 bg-emerald-400/10 text-white shadow-[0_0_30px_rgba(52,211,153,0.25)]"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <span className="mr-2" aria-hidden>
                {emotion.emoji}
              </span>
              {emotion.label}
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto mt-10 max-w-md"
        >
          <GlassCard className="p-6 text-center">
            <p className="text-sm font-medium text-emerald-300">
              Feeling {selected}? {moodLines[selected] ?? "We'll find something that fits."}
            </p>
            <a
              href="#stories"
              className="mt-3 inline-block text-sm font-semibold text-white underline decoration-emerald-400/60 underline-offset-4 transition hover:decoration-emerald-400"
            >
              Find my story →
            </a>
          </GlassCard>
        </motion.div>
      )}
    </section>
  );
}
