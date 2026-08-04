"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Hydration-safe reduced-motion detection.
 *
 * `useReducedMotion()` from framer-motion returns `null` on the server but the
 * live value on the client, so any component that branches its rendered output
 * (variants, `animate`, conditional spans/classes) on it produces different
 * HTML on the server than during hydration — a hydration mismatch for users
 * with Reduced Motion enabled.
 *
 * This hook renders `false` on the server and during hydration (identical SSR
 * HTML on both sides), then flips to the live preference immediately after
 * hydration. All reduced-motion behavior is preserved — without mismatches.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
