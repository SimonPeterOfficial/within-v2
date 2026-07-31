"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { applyMood, getMood, moods } from "@/lib/mood";

export default function EmotionSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedMood = getMood(selected);

  const handleSelect = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next);
    applyMood(next);
  };

  return (
    <section id="emotions" className="scroll-mt-24 bg-black px-6 py-24 text-white">
      <h2 className="text-center text-4xl font-bold md:text-5xl">
        How are you feeling today?
      </h2>

      <p className="mx-auto mt-4 max-w-lg text-center text-gray-400">
        Pick a mood and we&apos;ll find the story that fits.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {moods.map((mood, index) => {
          const isSelected = selected === mood.id;
          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => handleSelect(mood.id)}
              aria-pressed={isSelected}
              className={`rounded-full border px-6 py-3 backdrop-blur transition-all duration-300 ${
                isSelected
                  ? "border-emerald-400/60 bg-emerald-400/10 text-white shadow-emerald"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <span className="mr-2" aria-hidden>
                {mood.emoji}
              </span>
              {mood.label}
            </motion.button>
          );
        })}
      </div>

      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto mt-10 max-w-md"
        >
          <GlassCard className="p-6 text-center">
            <p className="text-sm font-medium text-emerald-300">
              Feeling {selectedMood.label.toLowerCase()}? {selectedMood.line}
            </p>
            <Button href="#stories" variant="outline" size="sm" className="mt-4">
              Find my story
            </Button>
          </GlassCard>
        </motion.div>
      )}
    </section>
  );
}
