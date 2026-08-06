"use client";

import { useEffect, useState } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/** Session key — the cinematic plays at most once per tab session. */
const GATE_KEY = "within:cinematic:seen";

/**
 * Session gate + reduced-motion guard for the cinematic loader.
 *
 * Returns `play` (whether the sequence should run) and `markSeen` (call once
 * the sequence finishes or is skipped, so it never plays again this session).
 *
 * Hydration-safe: `play` is always `false` during SSR and the first client
 * pass — the sessionStorage check happens inside an effect, so server HTML
 * always matches hydration. The state flip is deferred into a
 * requestAnimationFrame so it never runs synchronously in the effect body.
 */
export function useCinematicIntro() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    try {
      if (sessionStorage.getItem(GATE_KEY)) return;
    } catch {
      return; // storage unavailable — skip the cinematic
    }

    const frame = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  const markSeen = () => {
    try {
      sessionStorage.setItem(GATE_KEY, "true");
    } catch {
      /* storage unavailable — the gate simply never persists */
    }
  };

  return { play, markSeen };
}
