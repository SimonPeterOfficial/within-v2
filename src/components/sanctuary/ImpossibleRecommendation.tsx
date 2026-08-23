"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useEnvironment } from "@/lib/environment";
import { fireRipple } from "@/lib/ripple";
import { addToJourney } from "@/lib/explore";
import type { DiscoveryType } from "@/lib/explore";
import Icon from "@/components/ui/Icon";

/**
 * ImpossibleRecommendation — "Before you leave..."
 *
 * One intentional, editorial recommendation that feels unlike normal cards.
 * It appears once per section visit, timed to the user's mood and hour.
 * The visual treatment is special: a single luminous object floating
 * in negative space, not a grid card.
 *
 * The copy should feel human, never algorithmic.
 * The interaction should feel like finding something left out for you.
 */

type ImpossiblePick = {
  id: string;
  title: string;
  type: string;
  description: string;
  emoji: string;
  destination: string;
  coverGradient: string;
  reason: string;
};

const PICKS_BY_HOUR: Record<string, ImpossiblePick[]> = {
  morning: [
    {
      id: "imp-morning-1",
      title: "Paper Constellations",
      type: "Book",
      description: "A book of folded maps for people who got lost on purpose.",
      emoji: "🪐",
      destination: "/books",
      coverGradient: "from-emerald-500 to-teal-700",
      reason: "Because the morning is for finding new paths.",
    },
    {
      id: "imp-morning-2",
      title: "First Light",
      type: "Photography",
      description: "Morning arrived as a rumor, then proved itself.",
      emoji: "🏔",
      destination: "/photography",
      coverGradient: "from-amber-500 to-orange-700",
      reason: "Because you're awake before most people.",
    },
  ],
  afternoon: [
    {
      id: "imp-afternoon-1",
      title: "Letters to the Moon",
      type: "Story",
      description: "Every night a girl writes to the moon — tonight, the moon writes back.",
      emoji: "💌",
      destination: "/originals",
      coverGradient: "from-pink-600 to-rose-500",
      reason: "Because something quiet belongs here.",
    },
    {
      id: "imp-afternoon-2",
      title: "Tide & Silence",
      type: "Music",
      description: "Slow tides and softer breathing — ambient blooms for the afternoon.",
      emoji: "🌊",
      destination: "/music",
      coverGradient: "from-cyan-500 to-blue-700",
      reason: "Because the afternoon is yours to shape.",
    },
  ],
  evening: [
    {
      id: "imp-evening-1",
      title: "Salt & Stars",
      type: "Original Film",
      description: "Two strangers, one desert, a horizon that refuses to stay still.",
      emoji: "🌌",
      destination: "/originals",
      coverGradient: "from-purple-600 via-indigo-600 to-blue-600",
      reason: "Because evening is for stories that need darkness.",
    },
    {
      id: "imp-evening-2",
      title: "The Lighthouse Keeper",
      type: "Story",
      description: "A keeper tends a light for ships that no longer exist.",
      emoji: "🌊",
      destination: "/originals",
      coverGradient: "from-purple-600 to-indigo-600",
      reason: "Because someone left a light on for you.",
    },
  ],
  night: [
    {
      id: "imp-night-1",
      title: "Embers",
      type: "Music",
      description: "Slow-burn soundscapes for the inspired hour after midnight.",
      emoji: "🔥",
      destination: "/music",
      coverGradient: "from-orange-500 to-rose-700",
      reason: "Because the night is for people still making something.",
    },
    {
      id: "imp-night-2",
      title: "Rain on Glass",
      type: "Photography",
      description: "The city blurred itself kindly for one night.",
      emoji: "🌧",
      destination: "/photography",
      coverGradient: "from-slate-500 to-slate-800",
      reason: "Because quiet nights deserve quiet beauty.",
    },
  ],
};

/** The opening line — changes with the hour. */
function getOpeningLine(period: string): string {
  switch (period) {
    case "morning":
      return "Before the day begins...";
    case "afternoon":
      return "Before you move on...";
    case "evening":
      return "Before the light fades...";
    case "night":
      return "Before you sleep...";
    default:
      return "Before you leave...";
  }
}

export default function ImpossibleRecommendation() {
  const prefersReducedMotion = useReducedMotionSafe();
  const { period } = useEnvironment();
  const [revealed, setRevealed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [pick] = useState<ImpossiblePick>(() => {
    const pool = PICKS_BY_HOUR[period] ?? PICKS_BY_HOUR.evening;
    // Using Date.now() in a stable initializer — set once per mount
    return pool[Math.floor(Date.now() / 3600000) % pool.length];
  });

  const openingLine = getOpeningLine(period);

  // Reveal after a slight delay so it feels discovered, not loaded
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!pick || hasInteracted) return null;

  return (
    <section className="relative mx-auto max-w-2xl px-6 py-20">
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Editorial label */}
            <p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.5em] text-white/15">
              One impossible recommendation
            </p>

            {/* The card — special, not like other cards */}
            <motion.a
              href={pick.destination}
              onClick={(e) => {
                fireRipple(e);
                addToJourney({
                  id: pick.id,
                  title: pick.title,
                  type: pick.type.toLowerCase() as DiscoveryType,
                  destination: pick.destination,
                  reason: pick.reason,
                  parentId: null,
                  cover: { gradient: pick.coverGradient, emoji: pick.emoji },
                });
                setHasInteracted(true);
              }}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="group relative block overflow-hidden rounded-2xl border border-white/[0.04] transition-all duration-700 hover:border-[rgba(var(--mood-rgb),0.12)]"
            >
              {/* Background glow — the special treatment */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent" />

              {/* Content */}
              <div className="relative flex items-center gap-6 p-8">
                {/* Emoji — the luminous object */}
                <div className="relative shrink-0">
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${pick.coverGradient} opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-35`}
                  />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03]">
                    <span className="text-2xl">{pick.emoji}</span>
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/20">
                    {openingLine}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-medium text-white/85 group-hover:text-white transition-colors">
                    {pick.title}
                  </h3>
                  <p className="mt-1 text-[12px] text-gray-400/50 line-clamp-1">
                    {pick.description}
                  </p>
                  <p className="mt-2 text-[11px] italic text-emerald-400/35">
                    {pick.reason}
                  </p>
                </div>

                {/* Arrow */}
                <div className="shrink-0 text-white/10 transition-colors group-hover:text-[rgba(var(--mood-rgb),0.4)]">
                  <Icon name="forward" size={16} />
                </div>
              </div>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
