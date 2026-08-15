"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { applyMood, getMood, moods, onMoodChange, rgbString } from "@/lib/mood";

/** Atmosphere shifter — a floating orbit of moods that rewrite the sanctuary. */
export default function MoodOrbit() {
  const [selected, setSelected] = useState<string | null>(null);
  const [ripple, setRipple] = useState(0);
  const prefersReducedMotion = useReducedMotionSafe();

  const selectedMood = getMood(selected);

  // Stay in sync when a mood is applied from elsewhere (e.g. Auri's quick chips)
  useEffect(() => onMoodChange((id) => setSelected(id)), []);

  const handleSelect = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next);
    applyMood(next);
    setRipple((count) => count + 1);
  };

  return (
    <section id="mood" className="scroll-mt-24 px-6 py-24 text-white">
      <SectionHeader
        eyebrow="Your mood"
        title="Find the center of your universe"
        subtitle="Touch a feeling — the entire sanctuary responds."
      />

      <div className="relative mx-auto mt-12 h-[300px] w-[300px] sm:h-[440px] sm:w-[440px]">
        {/* Emotional color-shift aura */}
        <AnimatePresence>
          {selected && (
            <motion.span
              key={selected}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden
              className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.35)] blur-3xl"
            />
          )}
        </AnimatePresence>

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

        {/* Pulsing core — breathes in the current mood color */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.08, 1], y: [0, -8, 0] }
            }
            transition={{
              duration: selected ? 2.5 : 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, rgba(var(--mood-rgb),1), rgba(var(--mood-rgb),0.55))"
            }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full shadow-orb md:h-28 md:w-28"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={selected ?? "default"}
                initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="text-3xl"
                aria-hidden
              >
                {selectedMood ? selectedMood.emoji : "✦"}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Ripple feedback */}
        {ripple > 0 && (
          <motion.span
            key={ripple}
            aria-hidden
            initial={{ opacity: 0.5, scale: 0.4, x: "-50%", y: "-50%" }}
            animate={{ opacity: 0, scale: 1.9, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => setRipple(0)}
            className="absolute left-1/2 top-1/2 h-24 w-24 rounded-full border border-emerald-300/50 md:h-28 md:w-28"
          />
        )}

        {/* Mood chips floating around the orbit — spring in */}
        {moods.map((mood, index) => {
          const angle = (index / moods.length) * Math.PI * 2 - Math.PI / 2;
          // 40% keeps eight moods on the ring without spilling off small screens
          const radius = 40;
          const isSelected = selected === mood.id;
          return (
            <motion.button
              key={mood.id}
              style={{
                left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                top: `calc(50% + ${Math.sin(angle) * radius}%)`,
                borderColor: isSelected ? rgbString(mood.rgb, 0.7) : undefined,
                backgroundColor: isSelected ? rgbString(mood.rgb, 0.14) : undefined,
                boxShadow: isSelected
                  ? `0 0 22px ${rgbString(mood.rgb, 0.45)}, inset 0 1px 0 rgba(255,255,255,0.22)`
                  : undefined
              }}
              initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.7 }}
              animate={{
                opacity: 1,
                x: "-50%",
                y: "-50%",
                scale: isSelected ? 1.12 : 1
              }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { scale: isSelected ? 1.18 : 1.1, transition: { type: "spring", stiffness: 300, damping: 18 } }
              }
              whileTap={{ scale: 0.92, transition: { duration: 0.1 } }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 20,
                delay: 0.3 + index * 0.09
              }}
              onClick={() => handleSelect(mood.id)}
              aria-pressed={isSelected}
              className={`absolute rounded-full border px-2 py-1.5 text-[11px] backdrop-blur transition-colors duration-300 sm:px-4 sm:py-2 sm:text-sm ${
                isSelected
                  ? "text-white"
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
      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="mx-auto mt-10 max-w-md"
          >
            <GlassCard className="p-5 text-center">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-emerald-300">
                  Feeling {selectedMood.label.toLowerCase()}?
                </span>{" "}
                {selectedMood.line}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Auri is curating your universe… ✨
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
