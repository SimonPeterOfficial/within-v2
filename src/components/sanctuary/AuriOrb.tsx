"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useSession } from "@/lib/auth/session";
import { useEnvironment } from "@/lib/environment";
import { applyMood } from "@/lib/mood";
import { moodGlow } from "@/lib/design";
import {
  bumpAuriOpenCount,
  hasSeenAuriEntrance,
  markAuriEntranceSeen,
  TIME_WHISPERS,
  type AuriContext,
  type AuriState
} from "@/lib/auri";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import AuriPanel from "@/components/sanctuary/AuriPanel";
import AuriEntrance from "@/components/sanctuary/AuriEntrance";

/** Dispatched when anything in the universe asks Auri to appear (e.g. QuickActions). */
export const AURI_OPEN_EVENT = "within:auri-open";

/** How long the room can stay untouched before Auri rests her eyes. */
const SLEEP_AFTER_MS = 90 * 1000;

/**
 * Auri — a quiet presence living inside WithIn.
 *
 * A small owl rests in the corner of every page. She breathes, blinks, and
 * notices the cursor; tap her and she opens an intimate glass chamber with a
 * greeting shaped by the hour, the route, your mood, and whether you're new.
 * The very first time she appears she arrives with a short cinematic —
 * dust, a small light, an owl gathering in it.
 *
 * The environment (src/lib/environment.tsx) owns the hour and your mood;
 * Auri reads them here. Her presence runs a small state machine — idle,
 * observing, curious, greeting, thinking, listening, responding, sleeping —
 * and each state is a whisper, never a performance.
 */
export default function AuriOrb() {
  const pathname = usePathname();
  const { status, user } = useSession();
  const { period, moodId, visits } = useEnvironment();
  const prefersReducedMotion = useReducedMotionSafe();

  const [open, setOpen] = useState(false);
  const [entrance, setEntrance] = useState(false);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [auriState, setAuriState] = useState<AuriState>("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const decayRef = useRef<number | null>(null);
  const sleepRef = useRef<number | null>(null);

  /* ── The presence state machine ─────────────────────────────────────── */

  const clearSleepTimer = useCallback(() => {
    if (sleepRef.current) {
      window.clearTimeout(sleepRef.current);
      sleepRef.current = null;
    }
  }, []);

  const scheduleSleep = useCallback(() => {
    if (prefersReducedMotion) return;
    clearSleepTimer();
    sleepRef.current = window.setTimeout(() => {
      setAuriState((current) =>
        current === "idle" || current === "observing" ? "sleeping" : current
      );
    }, SLEEP_AFTER_MS);
  }, [prefersReducedMotion, clearSleepTimer]);

  // While resting, if the pointer comes near, she wakes — and the presence
  // (her proximity) keeps her awake as long as you stay close.
  useEffect(() => {
    if (prefersReducedMotion || open) return;
    const onMove = (event: MouseEvent) => {
      const el = buttonRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (Math.hypot(event.clientX - cx, event.clientY - cy) < 320) {
        setAuriState((current) => (current === "sleeping" ? "observing" : current));
        scheduleSleep();
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReducedMotion, open, scheduleSleep]);

  // Schedule the first rest once mounted.
  useEffect(() => {
    scheduleSleep();
    return () => {
      clearSleepTimer();
      if (decayRef.current) window.clearTimeout(decayRef.current);
    };
  }, [scheduleSleep, clearSleepTimer]);

  // The panel reports conversation states (thinking, responding…); transient
  // ones gently settle back to listening.
  const handlePresence = useCallback((next: AuriState) => {
    setAuriState(next);
    if (decayRef.current) {
      window.clearTimeout(decayRef.current);
      decayRef.current = null;
    }
    if (next === "greeting") {
      decayRef.current = window.setTimeout(() => setAuriState("listening"), 2600);
    } else if (next === "responding") {
      decayRef.current = window.setTimeout(() => setAuriState("listening"), 2000);
    }
  }, []);

  /* ── Open / close / first arrival ───────────────────────────────────── */

  const openPanel = useCallback(() => {
    clearSleepTimer();
    setOpenCount(bumpAuriOpenCount());
    setOpen(true);
    setAuriState("greeting");
  }, [clearSleepTimer]);

  const closePanel = useCallback(() => {
    setOpen(false);
    setAuriState("idle");
    // Return focus to the owl — the conversation is over, she stays present.
    requestAnimationFrame(() => buttonRef.current?.focus());
    scheduleSleep();
  }, [scheduleSleep]);

  const finishEntrance = useCallback(() => {
    markAuriEntranceSeen();
    setEntrance(false);
    openPanel();
  }, [openPanel]);

  const handleToggle = useCallback(() => {
    if (open) {
      closePanel();
      return;
    }
    // First ever arrival gets the cinematic — once per browser, and never
    // under Reduced Motion (the panel simply opens).
    if (!hasSeenAuriEntrance() && !prefersReducedMotion) {
      setEntrance(true);
    } else {
      openPanel();
    }
  }, [open, openPanel, closePanel, prefersReducedMotion]);

  // Anywhere in the app can ask Auri to appear (e.g. QuickActions "Talk to Auri").
  useEffect(() => {
    const requestOpen = () => handleToggle();
    window.addEventListener(AURI_OPEN_EVENT, requestOpen);
    return () => window.removeEventListener(AURI_OPEN_EVENT, requestOpen);
  }, [handleToggle]);

  // Escape closes the panel; during the entrance it finishes the reveal.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (entrance) {
        finishEntrance();
      } else if (open) {
        closePanel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [entrance, open, finishEntrance, closePanel]);

  // Cycle the resting whispers so Auri feels present rather than decorative.
  // Returning users get a quiet "Welcome back." before the hour's line.
  const whispers = useMemo(() => {
    const base = [TIME_WHISPERS[period], "tap to talk", "your mood shapes the light", "Auri is listening…"];
    return visits.isReturningUser ? ["Welcome back.", ...base] : base;
  }, [period, visits.isReturningUser]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(
      () => setWhisperIndex((index) => (index + 1) % whispers.length),
      4600
    );
    return () => clearInterval(id);
  }, [prefersReducedMotion, whispers.length]);

  const context: AuriContext = useMemo(
    () => ({
      period,
      pathname,
      moodId,
      isAuthenticated: status === "authenticated",
      firstName: user?.name.trim().split(/\s+/)[0],
      firstOpen: openCount === 1,
      openCount
    }),
    [period, pathname, moodId, status, user, openCount]
  );

  const wake = () => {
    clearSleepTimer();
    setAuriState((current) => (current === "sleeping" ? "idle" : current));
  };

  return (
    <>
      {/* First-arrival cinematic */}
      <AnimatePresence>
        {entrance && <AuriEntrance onComplete={finishEntrance} />}
      </AnimatePresence>

      {/* The presence — rests clear of the mobile menu trigger, above it on phones */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 sm:right-6 lg:bottom-6">
        {/* Soft light emission pool — follows the mood */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -right-4 h-36 w-36 rounded-full blur-2xl transition-opacity duration-700"
          style={{ background: moodGlow(0.28), opacity: entrance ? 0 : 1 }}
        />

        {/* Whisper prompt — a soft word that cycles while Auri rests */}
        {!open && !entrance && (
          <AnimatePresence mode="wait">
            <motion.span
              key={whispers[whisperIndex]}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium tracking-wide text-emerald-300 backdrop-blur"
            >
              {whispers[whisperIndex]}
            </motion.span>
          </AnimatePresence>
        )}

        {/* The chamber — AuriPanel drives its own entrance; this wrapper
            owns the exit so the close never pops abruptly */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="auri-panel"
              className="absolute bottom-full right-0 mb-4"
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <AuriPanel
                context={context}
                moodId={moodId}
                onMoodSelect={(id) => applyMood(id)}
                onClose={closePanel}
                onPresenceChange={handlePresence}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The owl — she notices you when you come near */}
        <motion.button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          onMouseEnter={prefersReducedMotion ? undefined : () => { wake(); setAuriState("curious"); }}
          onMouseLeave={
            prefersReducedMotion
              ? undefined
              : () => {
                  if (!open) {
                    setAuriState("idle");
                    scheduleSleep();
                  }
                }
          }
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={open ? "Close Auri" : "Talk to Auri"}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className="material-soft-clay group relative flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-300 hover:border-[rgba(var(--mood-rgb),0.5)]"
        >
          <AuriOwl size={56} followCursor state={auriState} className="drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)]" />
          <span
            className="absolute right-full mr-3 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-medium text-emerald-300 opacity-0 backdrop-blur transition group-hover:opacity-100"
            aria-hidden
          >
            Auri
          </span>
        </motion.button>
      </div>
    </>
  );
}
