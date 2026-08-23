"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { fireRipple } from "@/lib/ripple";
import { addToJourney } from "@/lib/explore";
import { getDoorDestination, type ContentNode } from "@/lib/explore/graph";
import { getUniverseState, markDoorDiscovered, recordDiscovery } from "@/lib/universe/state";
import { useEnvironment } from "@/lib/environment";
import Icon from "@/components/ui/Icon";

/**
 * TheDoor — the signature WithIn interaction, now graph-aware.
 *
 * The destination is no longer random. It comes from the content graph,
 * considering:
 *   - what the user has already visited
 *   - their current mood
 *   - their exploration depth
 *   - their last content type
 *
 * A music path could lead to: Photography → creator → story → Between
 * A book path could lead to: Original → community → Journey
 * A creator could lead somewhere unexpected.
 *
 * The user should feel: "I followed one thing and somehow ended up
 * somewhere completely different."
 */

type DoorState = "idle" | "gathering" | "revealed";

type DoorDestination = {
  title: string;
  type: string;
  emoji: string;
  destination: string;
  reason: string;
  cover?: { gradient: string; emoji: string };
};

export default function TheDoor() {
  const prefersReducedMotion = useReducedMotionSafe();
  const { moodId } = useEnvironment();
  const [state, setState] = useState<DoorState>("idle");
  const [destination, setDestination] = useState<DoorDestination | null>(null);

  const gatherTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pointer position for the glow
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 100, damping: 20 });
  const sy = useSpring(my, { stiffness: 100, damping: 20 });
  const glowX = useTransform(sx, [0, 1], [-30, 30]);
  const glowY = useTransform(sy, [0, 1], [-30, 30]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReducedMotion) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mx.set((e.clientX - rect.left) / rect.width);
      my.set((e.clientY - rect.top) / rect.height);
    },
    [prefersReducedMotion, mx, my]
  );

  const startGather = useCallback(() => {
    if (state === "gathering" || state === "revealed") return;
    setState("gathering");

    gatherTimerRef.current = setTimeout(() => {
      // Use the content graph to pick a destination
      const universeState = getUniverseState();
      const node = getDoorDestination({
        visited: universeState.visitedRoutes,
        mood: moodId,
        depth: universeState.maxDepth,
        lastType: universeState.recentContentTypes[0],
      });

      if (node) {
        const cover = getCoverForNode(node);
        addToJourney({
          id: node.id,
          title: node.title,
          type: node.type,
          destination: node.destination,
          reason: getReasonForNode(node, universeState),
          parentId: null,
          cover,
        });
        recordDiscovery(node.type);
        markDoorDiscovered();

        setDestination({
          title: node.title,
          type: node.type,
          emoji: cover?.emoji ?? "✦",
          destination: node.destination,
          reason: getReasonForNode(node, universeState),
          cover,
        });
        setState("revealed");
      } else {
        setState("idle");
      }
    }, 800);
  }, [state, moodId]);

  const cancelGather = useCallback(() => {
    if (gatherTimerRef.current) clearTimeout(gatherTimerRef.current);
    if (state === "gathering") setState("idle");
  }, [state]);

  const dismiss = useCallback(() => {
    setState("idle");
    setDestination(null);
  }, []);

  const isGathering = state === "gathering";
  const isRevealed = state === "revealed";

  return (
    <div className="relative mx-auto max-w-2xl px-6 py-16">
      <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.5em] text-white/15">
        Hold the door
      </p>

      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="relative mx-auto flex items-center justify-center"
        style={{ height: 200, width: 200 }}
      >
        {/* Ambient glow — follows the pointer */}
        <motion.div
          aria-hidden
          style={{
            x: prefersReducedMotion ? 0 : glowX,
            y: prefersReducedMotion ? 0 : glowY,
          }}
          className="pointer-events-none absolute inset-0"
        >
          <div
            className={`absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),${
              isGathering ? "0.2" : isRevealed ? "0.3" : "0.08"
            }),transparent_70%)] blur-xl transition-all duration-500`}
          />
        </motion.div>

        {/* Concentric rings — pulse when gathering */}
        {isGathering && !prefersReducedMotion && (
          <>
            {[1, 2, 3, 4].map((ring) => (
              <motion.div
                key={ring}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 1 + ring * 0.15, 0.8],
                  opacity: [0, 0.15, 0],
                }}
                transition={{
                  duration: 2,
                  delay: ring * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
                style={{ width: `${60 + ring * 20}px`, height: `${60 + ring * 20}px` }}
              />
            ))}
          </>
        )}

        {/* The portal circle */}
        <motion.button
          type="button"
          onPointerDown={startGather}
          onPointerUp={cancelGather}
          onPointerLeave={cancelGather}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              startGather();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") cancelGather();
          }}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={
            isGathering
              ? { scale: [1, 1.05, 1], rotate: [0, 180, 360] }
              : { scale: 1, rotate: 0 }
          }
          transition={
            isGathering
              ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 300, damping: 20 }
          }
          className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-colors duration-300 hover:border-[rgba(var(--mood-rgb),0.2)] hover:bg-white/[0.05]"
          aria-label={isRevealed ? "Door opened" : "Press and hold to open the door"}
        >
          <span className="text-2xl">{isRevealed ? "✨" : "◎"}</span>
        </motion.button>
      </div>

      {/* Revealed destination */}
      <motion.div
        initial={false}
        animate={
          isRevealed
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 12, filter: "blur(8px)" }
        }
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 overflow-hidden"
      >
        {destination && (
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
                <p className="mt-1 text-[11px] text-emerald-400/35">
                  {destination.reason}
                </p>
              </div>
              <div className="shrink-0 text-white/10 group-hover:text-[rgba(var(--mood-rgb),0.4)]">
                <Icon name="forward" size={14} />
              </div>
            </div>
          </a>
        )}
      </motion.div>

      {/* Dismiss */}
      {isRevealed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          type="button"
          onClick={dismiss}
          className="mx-auto mt-4 block text-[11px] text-white/20 transition-colors hover:text-white/40"
        >
          Try again
        </motion.button>
      )}
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

function getReasonForNode(node: ContentNode, state: { visitedRoutes: string[]; maxDepth: number }): string {
  if (node.rarity === "rare") return "You found something rare.";
  if (node.rarity === "unexpected") return "An unexpected connection.";
  if (node.category === "between") return "The space between things.";
  if (state.maxDepth > 4 && node.type === "reflection") return "A thought worth sitting with.";
  if (state.visitedRoutes.includes("/music") && node.type === "photo") return "From sound to stillness.";
  if (state.visitedRoutes.includes("/books") && node.type === "original") return "From words to light.";
  if (node.category === "cinematic") return "A story waiting in the dark.";
  if (node.category === "quiet") return "Something gentle for you.";
  return "The universe chose this for you.";
}
