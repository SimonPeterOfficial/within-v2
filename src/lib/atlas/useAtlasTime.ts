"use client";

import { useSyncExternalStore } from "react";

/**
 * The Atlas clock — one shared, hydration-safe source of "now".
 *
 * Server and first client render agree on the last whole minute (a stable
 * snapshot), then the clock ticks live. Every instrument reads the sky
 * through this hook so the whole Atlas shares a single heartbeat.
 *
 * Hydration safety: `getSnapshot` and `getServerSnapshot` both floor to the
 * whole minute, so the initial server HTML and the first client hydrate
 * render are identical. React only re-renders when the floored minute
 * actually advances (via `onStoreChange`), never on sub-second drift.
 */

/*
 * Cached minute snapshot — `useSyncExternalStore` requires `getSnapshot` to
 * return a stable value between changes. Returning a fresh `Date` on every
 * call made React treat the store as changed on every render ("result of
 * getSnapshot should be cached"), which sent consumers into an infinite
 * re-render loop that crashed the TopBar on /home (maximum update depth).
 */
let cachedMinuteMs = -1;
let cachedMinute: Date = new Date(0);

const floorToMinute = () => {
  const ms = Math.floor(Date.now() / 60000) * 60000;
  if (ms !== cachedMinuteMs) {
    cachedMinuteMs = ms;
    cachedMinute = new Date(ms);
  }
  return cachedMinute;
};

const subscribe = (onStoreChange: () => void) => {
  const interval = setInterval(onStoreChange, 1000);
  const visibility = () => onStoreChange();
  document.addEventListener("visibilitychange", visibility);
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", visibility);
  };
};

/** Stable on the server and identical to the client's first snapshot. */
const getServerTime = () => floorToMinute();

export function useAtlasTime(): Date {
  return useSyncExternalStore(subscribe, floorToMinute, getServerTime);
}
