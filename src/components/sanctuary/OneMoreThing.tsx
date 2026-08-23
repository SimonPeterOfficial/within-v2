"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { fireRipple } from "@/lib/ripple";
import { addToJourney } from "@/lib/explore";
import { getUniverseState, recordDiscovery } from "@/lib/universe/state";
import { getDoorDestination, type ContentNode } from "@/lib/explore/graph";
import Icon from "@/components/ui/Icon";

/**
 * OneMoreThing — the signature end-of-experience interaction.
 *
 * Instead of "Recommended for you" with a grid of cards,
 * sometimes show exactly ONE destination. Not five. Not ten.
 * One doorway.
 *
 * "One more thing."
 * [ tiny luminous object ]
 * "Something you weren't looking for."
 *
 * The destination comes from the graph. Sometimes it's ordinary.
 * Sometimes unexpected. Rarely, it leads to The Between.
 * Never shown on every page.
 */

const INTRO_LINES = [
  "One more thing.",
  "Before you leave…",
  "Something you weren't looking for.",
  "One doorway you missed.",
  "There's one more.",
  "This one found you.",
];

export default function OneMoreThing() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [revealed, setRevealed] = useState(false);
  const [visited, setVisited] = useState(false);

  const destination = useMemo(() => {
    const state = getUniverseState();
    return getDoorDestination({
      visited: state.visitedRoutes,
      mood: null,
      depth: state.maxDepth,
      lastType: state.recentContentTypes[0],
    });
  }, []);

  const introLine = useMemo(() => {
    const hour = new Date().getHours();
    return INTRO_LINES[hour % INTRO_LINES.length];
  }, []);

  if (!destination || visited) return null;

  const cover = getCoverForNode(destination);

  return (
    <section className="relative mx-auto max-w-2xl px-6 py-16">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.button
            key="trigger"
            type="button"
            onClick={() => setRevealed(true)}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group w-full text-center"
          >
            {/* The luminous trigger */}
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              {/* Ambient glow */}
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }
                }
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.15),transparent_70%)] blur-lg"
              />
              {/* The object */}
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] transition-all duration-500 group-hover:border-[rgba(var(--mood-rgb),0.2)] group-hover:bg-white/[0.05]">
                <span className="text-lg text-white/40 group-hover:text-white/60 transition-colors">◎</span>
              </div>
            </div>

            <p className="font-display text-[13px] italic text-white/25 group-hover:text-white/40 transition-colors">
              {introLine}
            </p>
          </motion.button>
        ) : (
          <motion.div
            key="destination"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <a
              href={destination.destination}
              onClick={(e) => {
                fireRipple(e);
                addToJourney({
                  id: destination.id,
                  title: destination.title,
                  type: destination.type,
                  destination: destination.destination,
                  reason: getReasonForNode(),
                  parentId: null,
                  cover,
                });
                recordDiscovery(destination.type);
                setVisited(true);
              }}
              className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-500 hover:border-[rgba(var(--mood-rgb),0.12)] hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${cover.gradient}`}
                >
                  <span className="text-xl">{cover.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/20">
                    {destination.type}
                  </p>
                  <h4 className="mt-1 text-[14px] font-medium text-white/85 group-hover:text-white">
                    {destination.title}
                  </h4>
                  <p className="mt-1 text-[11px] italic text-emerald-400/35">
                    {getReasonForNode()}
                  </p>
                </div>
                <div className="shrink-0 text-white/10 group-hover:text-[rgba(var(--mood-rgb),0.4)]">
                  <Icon name="forward" size={14} />
                </div>
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function getCoverForNode(node: ContentNode): { gradient: string; emoji: string } {
  const covers: Record<string, { gradient: string; emoji: string }> = {
    original: { gradient: "from-purple-600 to-indigo-600", emoji: "🎬" },
    book: { gradient: "from-emerald-500 to-teal-700", emoji: "📚" },
    music: { gradient: "from-cyan-500 to-blue-700", emoji: "🎧" },
    photo: { gradient: "from-amber-500 to-orange-600", emoji: "📷" },
    creator: { gradient: "from-purple-600 to-indigo-600", emoji: "✨" },
    community: { gradient: "from-pink-500 to-rose-600", emoji: "🤝" },
    reflection: { gradient: "from-indigo-600 to-purple-800", emoji: "🪞" },
    "auri-moment": { gradient: "from-purple-600 to-indigo-700", emoji: "🦉" },
  };
  return covers[node.type] ?? { gradient: "from-gray-600 to-gray-800", emoji: "✦" };
}

function getReasonForNode(): string {
  const reasons = [
    "The universe insists.",
    "You didn't know you needed this.",
    "A side path worth taking.",
    "Something you missed.",
    "This one chose you.",
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}
