"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { fireRipple } from "@/lib/ripple";
import { addToJourney } from "@/lib/explore";
import { markDoorDiscovered, recordDiscovery } from "@/lib/universe/state";

/**
 * HiddenDoor — rare discovery triggers throughout WithIn.
 *
 * Not every door is obvious. Some appear only when the user is paying
 * attention — a subtle glyph, a tiny constellation, a quiet region
 * that responds to presence. Finding one should feel like:
 *   "you found something"
 * rather than:
 *   "CLICK HERE"
 *
 * Visual variants:
 *   glyph     — a tiny symbol that glows on hover
 *   constellation — a cluster of tiny stars that parts when approached
 *   void      — an empty region that reveals itself on proximity
 *   whisper   — a floating sentence that appears in quiet moments
 *   portal    — a subtle circular opening
 *
 * States:
 *   sleeping  — invisible, waiting
 *   noticed   — the user is near
 *   awakening — the door is responding
 *   open      — the door is revealing its destination
 *   departed  — the user has passed through
 */

type HiddenDoorVariant = "glyph" | "constellation" | "void" | "whisper" | "portal";
type HiddenDoorState = "sleeping" | "noticed" | "awakening" | "open" | "departed";

type HiddenDoorProps = {
  /** Where the door leads */
  destination: string;
  /** Label shown on the door */
  label: string;
  /** Visual variant */
  variant?: HiddenDoorVariant;
  /** Icon/emoji for the glyph variant */
  glyph?: string;
  /** Cover for journey recording */
  cover?: { gradient: string; emoji: string };
  /** Content type for journey recording */
  contentType?: string;
  /** Reason text */
  reason?: string;
  /** Cooldown in ms before this door can appear again */
  cooldownMs?: number;
  /** Position offset */
  className?: string;
  /** children for custom rendering */
  children?: React.ReactNode;
  /** Accessible label */
  ariaLabel?: string;
};

const STORAGE_KEY = "within:hidden-doors";

function getSeenDoors(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function markDoorSeen(id: string) {
  try {
    const doors = getSeenDoors();
    doors[id] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doors));
  } catch {
    /* ignore */
  }
}

export default function HiddenDoor({
  destination,
  label,
  variant = "glyph",
  glyph = "◎",
  cover,
  contentType = "reflection",
  reason = "You found something hidden.",
  cooldownMs = 5 * 60 * 1000,
  className = "",
  children,
  ariaLabel,
}: HiddenDoorProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [state, setState] = useState<HiddenDoorState>("sleeping");
  const containerRef = useRef<HTMLDivElement>(null);
  const doorId = `hidden-${destination}-${variant}`;
  const stateRef = useRef<HiddenDoorState>("sleeping");

  // Check cooldown — read once on mount, before first render
  const [initiallyHidden] = useState(() => {
    const seen = getSeenDoors();
    const lastSeen = seen[doorId] ?? 0;
    return Date.now() - lastSeen < cooldownMs;
  });

  // Proximity detection — the door notices when the pointer is near
  useEffect(() => {
    if (prefersReducedMotion || state === "departed") return;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const current = stateRef.current;

      if (dist < 200 && current === "sleeping") {
        stateRef.current = "noticed";
        setState("noticed");
      } else if (dist < 100 && current === "noticed") {
        stateRef.current = "awakening";
        setState("awakening");
      } else if (dist >= 200 && current !== "sleeping" && current !== "open" && current !== "departed") {
        stateRef.current = "sleeping";
        setState("sleeping");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReducedMotion, state]);

  const activate = useCallback(() => {
    if (stateRef.current === "departed" || stateRef.current === "open") return;
    stateRef.current = "open";
    setState("open");
    fireRipple({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
    markDoorDiscovered();
    markDoorSeen(doorId);
    addToJourney({
      id: doorId,
      title: label,
      type: contentType as "reflection",
      destination,
      reason,
      parentId: null,
      cover,
    });
    recordDiscovery(contentType);

    // Auto-advance after a moment
    setTimeout(() => {
      window.location.href = destination;
    }, 1200);
  }, [doorId, label, contentType, destination, reason, cover]);

  if (initiallyHidden || state === "departed") return null;

  const isGlowing = state === "noticed" || state === "awakening";
  const isOpening = state === "open";

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      {children ?? (
        <motion.button
          type="button"
          onClick={activate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") activate();
          }}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={
            isOpening
              ? { scale: [1, 1.5, 0], opacity: [1, 1, 0] }
              : { scale: 1, opacity: state === "sleeping" ? 0.15 : state === "noticed" ? 0.5 : 0.85 }
          }
          transition={
            isOpening
              ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.5, ease: "easeOut" }
          }
          className={`relative flex items-center justify-center rounded-full border transition-all duration-700 ${
            variant === "portal"
              ? "h-10 w-10 border-white/[0.06] bg-white/[0.02]"
              : variant === "constellation"
              ? "h-8 w-8 border-white/[0.04] bg-white/[0.01]"
              : variant === "void"
              ? "h-12 w-12 border-transparent bg-transparent"
              : variant === "whisper"
              ? "rounded-full border-white/[0.04] bg-white/[0.01] px-3 py-1"
              : "h-6 w-6 border-white/[0.06] bg-white/[0.02]"
          } ${isGlowing ? "border-[rgba(var(--mood-rgb),0.2)] bg-white/[0.04]" : ""}`}
          aria-label={ariaLabel ?? `Hidden door: ${label}`}
        >
          {variant === "whisper" ? (
            <span className="text-[10px] italic text-gray-500/40">{label}</span>
          ) : variant === "glyph" ? (
            <span className="text-xs text-gray-500/30">{glyph}</span>
          ) : variant === "portal" ? (
            <span className="text-sm text-gray-500/25">◎</span>
          ) : variant === "constellation" ? (
            <span className="text-[8px] text-gray-500/20">✦</span>
          ) : (
            <span className="text-sm text-gray-500/15">·</span>
          )}

          {/* Glow effect when noticed */}
          {isGlowing && !prefersReducedMotion && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.15, scale: 1.5 }}
              className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.3),transparent_70%)]"
            />
          )}
        </motion.button>
      )}

      {/* Whisper text when noticed */}
      <AnimatePresence>
        {isGlowing && variant !== "whisper" && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="pointer-events-none absolute -bottom-6 whitespace-nowrap text-[9px] italic text-gray-500/30"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
