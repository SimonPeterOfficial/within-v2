"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import GlowBackground from "@/components/effects/GlowBackground";

const auriTraits = [
  {
    title: "Always listening",
    description: "Auri meets you wherever you are — no judgment, just presence."
  },
  {
    title: "Feels with you",
    description: "Tuned to your mood, Auri finds the story that mirrors how you feel."
  },
  {
    title: "Remembers your story",
    description: "The more you share, the better the world within understands you."
  }
];

export default function AuriSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="auri"
      className="relative scroll-mt-24 overflow-hidden bg-black px-6 py-24 text-white"
    >
      <GlowBackground variant="ambient" />

      <div className="relative z-10">
        <SectionHeader
          eyebrow="Auri"
          title="An AI companion that feels with you"
          subtitle="Auri lives inside WithIn — a gentle presence that listens to your moods and walks beside your story."
        />

        <div className="mx-auto mt-14 grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          {/* Auri orb + chat card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : { y: [0, -12, 0], scale: [1, 1.03, 1] }
              }
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex h-32 w-32 items-center justify-center"
            >
              <div className="absolute h-32 w-32 rounded-full bg-linear-to-br from-purple-500/40 to-emerald-400/40 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 shadow-[0_0_60px_rgba(168,85,247,0.45)]">
                <span className="text-4xl" aria-hidden>
                  ✦
                </span>
              </div>
            </motion.div>

            <GlassCard className="mx-auto mt-10 max-w-md p-6">
              <p className="text-sm leading-relaxed text-gray-300">
                “Hey, I&apos;m <GradientText>Auri</GradientText>. Tell me how you&apos;re
                feeling — I&apos;ll keep your story close.”
              </p>
              <div className="mt-4 flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-500">
                Type a feeling…
                <motion.span
                  animate={prefersReducedMotion ? undefined : { opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-1 inline-block h-4 w-0.5 rounded-full bg-emerald-400"
                  aria-hidden
                />
              </div>
            </GlassCard>
          </motion.div>

          {/* Auri traits */}
          <div className="space-y-4">
            {auriTraits.map((trait, index) => (
              <motion.div
                key={trait.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                <GlassCard hoverLift className="p-6">
                  <h3 className="text-lg font-bold">
                    <GradientText>{trait.title}</GradientText>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    {trait.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="#join"
            className="inline-block rounded-full bg-linear-to-r from-purple-500 to-emerald-400 px-8 py-3.5 text-sm font-bold text-black transition hover:scale-105 hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]"
          >
            Come say hi
          </a>
        </div>
      </div>
    </section>
  );
}
