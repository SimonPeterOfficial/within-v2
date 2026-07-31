"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import GlassCard from "@/components/ui/GlassCard";

const memories = [
  {
    title: "The Lighthouse Keeper",
    tag: "Saved story",
    meta: "Kept 2 days ago · 8 min",
    emoji: "🌊",
    gradient: "from-purple-600 to-indigo-600"
  },
  {
    title: "Horizon",
    tag: "Original",
    meta: "Now streaming · Film",
    emoji: "🌅",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    title: "Letters to the Moon",
    tag: "Saved story",
    meta: "Kept last week · 6 min",
    emoji: "💌",
    gradient: "from-pink-600 to-rose-500"
  }
];

export default function MemoryCards() {
  return (
    <section id="memories" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader
        eyebrow="Your universe"
        title="Memories, kept safe"
        subtitle="The stories and moments you returned to live here."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {memories.map((memory, index) => (
          <motion.article
            key={memory.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <GlassCard hoverLift className="h-full overflow-hidden">
              <div
                className={`relative h-40 bg-linear-to-br ${memory.gradient} transition-transform duration-500 group-hover:scale-105`}
              >
                <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {memory.tag}
                </span>
                <span className="absolute bottom-4 right-4 text-2xl" aria-hidden>
                  {memory.emoji}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">{memory.title}</h3>
                <p className="mt-2 text-xs text-gray-500">{memory.meta}</p>
              </div>
            </GlassCard>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
