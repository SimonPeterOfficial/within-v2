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

const floorToMinute = () => new Date(Math.floor(Date.now() / 60000) * 60000);

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
