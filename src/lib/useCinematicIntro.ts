"use client";

import { useEffect, useState } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * Session key — the cinematic plays at most once per tab session.
 * Stored in sessionStorage so it resets when the tab closes.
 */
const GATE_KEY = "within:cinematic:seen";

/**
 * Returning-visitor key — a browser that has completed the full Genesis
 * before. Their next entry gets the short reveal (~1.6s): the light,
 * the wordmark, the world — the emergence condensed, never skipped to
 * nothing. First visits keep the full Genesis.
 */
const RETURNED_KEY = "within:cinematic:returned";

/**
 * Session gate + reduced-motion + return-visit guard for the cinematic
 * loader.
 *
 * Returns:
 *   `play` — whether the sequence should run
 *   `reduced` — whether reduced motion is active (skip animations, use fades)
 *   `returning` — whether this browser has seen the full Genesis before
 *   `markSeen` — call when the sequence finishes so it doesn't repeat
 *
 * Hydration-safe: `play` is always `false` during SSR and the first client
 * pass — the sessionStorage check happens inside an effect, so server HTML
 * always matches hydration.
 */
export function useCinematicIntro() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [play, setPlay] = useState(false);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    let seen = false;
    let hasReturnedBefore = false;
    try {
      seen = sessionStorage.getItem(GATE_KEY) != null;
      hasReturnedBefore = localStorage.getItem(RETURNED_KEY) === "1";
    } catch {
      return; // storage unavailable — skip the cinematic
    }
    if (seen) return;

    // Defer state update to avoid hydration mismatch
    const frame = requestAnimationFrame(() => {
      setReturning(hasReturnedBefore);
      setPlay(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const markSeen = () => {
    try {
      sessionStorage.setItem(GATE_KEY, "true");
      // After one full Genesis, this browser earns the short reveal.
      localStorage.setItem(RETURNED_KEY, "1");
    } catch {
      /* storage unavailable — the gate simply never persists */
    }
  };

  return { play, reduced: prefersReducedMotion, returning, markSeen };
}
