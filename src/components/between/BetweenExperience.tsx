"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useEnvironment } from "@/lib/environment";
import { fireRipple } from "@/lib/ripple";
import { addToJourney } from "@/lib/explore";
import { getDoorDestination, type ContentNode } from "@/lib/explore/graph";
import { markBetweenVisited, recordDiscovery, getUniverseState } from "@/lib/universe/state";
import DepthLayers from "@/components/effects/DepthLayers";
import StarField from "@/components/sanctuary/StarField";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import Icon from "@/components/ui/Icon";
import type { AuriState } from "@/lib/auri";

/**
 * The Between — the space between WithIn's worlds.
 *
 * Not a normal page. No card grids. No navigation chrome.
 * Imagine: dark water, distant stars, slow-moving light,
 * floating fragments, quiet typography, tiny portals.
 *
 * The user enters through rare discoveries. There is a way back.
 * But the experience feels slightly outside the normal navigation.
 */

const FLOATING_FRAGMENTS = [
  { text: "Not everything needs a destination.", x: 15, y: 20, delay: 0.5 },
  { text: "The spaces between things matter.", x: 70, y: 35, delay: 1.2 },
  { text: "This place was not on the map.", x: 25, y: 65, delay: 2.0 },
  { text: "You found something hidden.", x: 60, y: 75, delay: 0.8 },
  { text: "There is more Within.", x: 45, y: 15, delay: 1.5 },
  { text: "Stay for a moment.", x: 80, y: 50, delay: 2.5 },
];

export default function BetweenExperience() {
  const prefersReducedMotion = useReducedMotionSafe();
  const { moodId } = useEnvironment();
  const [auriState, setAuriState] = useState<AuriState>("idle");
  const [destination, setDestination] = useState<{
    title: string;
    type: string;
    emoji: string;
    destination: string;
    reason: string;
    cover?: { gradient: string; emoji: string };
  } | null>(null);
  const [showPortal, setShowPortal] = useState(false);
  const initializedRef = useRef(false);

  // Mark as visited on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    markBetweenVisited();

    // Auri appears after a quiet moment
    const timer = setTimeout(() => {
      setAuriState("greeting");
      setTimeout(() => setAuriState("observing"), 3000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePortal = useCallback(() => {
    setShowPortal(true);
    fireRipple({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });

    const state = getUniverseState();
    const node = getDoorDestination({
      visited: state.visitedRoutes,
      mood: moodId,
      depth: state.maxDepth,
    });

    if (node) {
      const cover = getCoverForNode(node);
      addToJourney({
        id: node.id,
        title: node.title,
        type: node.type,
        destination: node.destination,
        reason: "The space between revealed this.",
        parentId: null,
        cover,
      });
      recordDiscovery(node.type);

      setDestination({
        title: node.title,
        type: node.type,
        emoji: cover.emoji,
        destination: node.destination,
        reason: "The space between revealed this.",
        cover,
      });
    }

    setTimeout(() => setShowPortal(false), 1500);
  }, [moodId]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#010108] text-white">
      {/* Deep atmosphere — darker than any other room */}
      <DepthLayers preset="sanctuary" particles={2} stars={8} fog={0.2} rays={false} />

      {/* Extra-deep vignette — the between feels enclosed */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)]"
      />

      {/* Star field — sparse, distant */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
        <StarField count={10} seed={99} />
      </div>

      {/* Floating fragments — things the between whispers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[3]">
        {FLOATING_FRAGMENTS.map((fragment, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.06 }
                : {
                    opacity: [0, 0.06, 0.04, 0.06],
                    y: [20, 0, -20, 20],
                  }
            }
            transition={{
              duration: 20 + index * 2,
              delay: fragment.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute whitespace-nowrap font-display text-[11px] italic tracking-wider"
            style={{
              left: `${fragment.x}%`,
              top: `${fragment.y}%`,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {fragment.text}
          </motion.span>
        ))}
      </div>

      {/* The central space — quiet, minimal */}
      <div className="relative z-10 flex flex-col items-center px-6 py-20">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mb-8 text-[10px] font-semibold uppercase tracking-[0.6em] text-white/10"
        >
          The Between
        </motion.p>

        {/* The portal — a luminous circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Ambient glow */}
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 -m-12 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.15),transparent_70%)] blur-xl"
          />

          {/* Concentric rings */}
          {!prefersReducedMotion && (
            <>
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{ scale: [1, 1.05, 1], opacity: [0.08, 0.15, 0.08] }}
                  transition={{ duration: 6 + ring * 2, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]"
                  style={{ width: `${80 + ring * 30}px`, height: `${80 + ring * 30}px` }}
                />
              ))}
            </>
          )}

          {/* The portal button */}
          <motion.button
            type="button"
            onClick={handlePortal}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-colors duration-500 hover:border-[rgba(var(--mood-rgb),0.2)] hover:bg-white/[0.05]"
            aria-label="Step through the portal"
          >
            <span className="text-xl text-white/40">◎</span>
          </motion.button>
        </motion.div>

        {/* Auri — appears occasionally */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 3, duration: 2 }}
          className="mt-12"
        >
          <AuriOwl size={32} state={auriState} />
        </motion.div>

        {/* Destination reveal */}
        <AnimatePresence>
          {destination && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 w-full max-w-sm"
            >
              <a
                href={destination.destination}
                onClick={() => fireRipple({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 })}
                className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-500 hover:border-[rgba(var(--mood-rgb),0.12)] hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  {destination.cover && (
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${destination.cover.gradient}`}
                    >
                      <span className="text-xl">{destination.emoji}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/20">
                      {destination.type}
                    </p>
                    <h4 className="mt-1 text-[14px] font-medium text-white/85 group-hover:text-white">
                      {destination.title}
                    </h4>
                    <p className="mt-1 text-[11px] italic text-emerald-400/35">
                      {destination.reason}
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

        {/* Way back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16"
        >
          <a
            href="/home"
            className="text-[11px] text-white/15 transition-colors duration-500 hover:text-white/30"
          >
            Return to WithIn
          </a>
        </motion.div>
      </div>

      {/* Portal ripple effect */}
      <AnimatePresence>
        {showPortal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[5]"
            aria-hidden
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 3], opacity: [0, 0.2, 0] }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.3),transparent_70%)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
