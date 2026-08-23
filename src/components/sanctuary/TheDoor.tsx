"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { fireRipple } from "@/lib/ripple";
import { addToJourney, takeMeSomewhere, createExploreContext } from "@/lib/explore";
import { reasonLabel } from "@/lib/explore";
import { useEnvironment } from "@/lib/environment";
import Icon from "@/components/ui/Icon";

/**
 * TheDoor — the signature WithIn interaction.
 *
 * A luminous circle that follows the pointer at a distance. When pressed
 * and held, the portal gathers light — concentric rings pulse outward,
 * the center brightens, and after a moment the universe reveals a
 * hidden destination. The whole screen briefly breathes as the
 * transition begins.
 *
 * The interaction should feel:
 *   - tactile (press → gather → reveal)
 *   - mysterious (what's inside?)
 *   - rewarding (every destination is meaningful)
 *
 * Architecture:
 *   On hold: gather (300ms) → reveal (destination card)
 *   On release before gather: the portal sighs and resets.
 *   Accessibility: keyboard activation with Enter/Space.
 */

type DoorState = "idle" | "gathering" | "revealed";

export default function TheDoor() {
  const prefersReducedMotion = useReducedMotionSafe();
  const { moodId } = useEnvironment();
  const [state, setState] = useState<DoorState>("idle");
  const [destination, setDestination] = useState<{
    title: string;
    type: string;
    emoji: string;
    destination: string;
    reason: string;
    cover?: { gradient: string; emoji: string };
  } | null>(null);

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
      // Generate a destination
      const ctx = createExploreContext({ mood: moodId });
      const result = takeMeSomewhere(ctx);
      const item = result.items[0];
      if (item) {
        addToJourney({
          id: item.id,
          title: item.title,
          type: item.type,
          destination: item.destination,
          reason: reasonLabel(item.reason),
          parentId: null,
          cover: item.cover,
        });
        setDestination({
          title: item.title,
          type: item.type,
          emoji: item.cover?.emoji ?? "✦",
          destination: item.destination,
          reason: reasonLabel(item.reason),
          cover: item.cover,
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
