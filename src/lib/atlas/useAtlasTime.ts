"use client";

import { useSyncExternalStore } from "react";

/**
 * The Atlas clock — one shared, hydration-safe source of "now".
 *
 * Server and first client render agree on the last whole minute (a stable
 * snapshot), then the clock ticks live every second. Every instrument reads
 * the sky through this hook so the whole Atlas shares a single heartbeat.
 */

const subscribe = (onStoreChange: () => void) => {
  const interval = setInterval(onStoreChange, 1000);
  const visibility = () => onStoreChange();
  document.addEventListener("visibilitychange", visibility);
  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", visibility);
  };
};

/** Stable on the server — floored to the minute so the snapshot is pure. */
const getServerTime = () => new Date(Math.floor(Date.now() / 60000) * 60000);

export function useAtlasTime(): Date {
  return useSyncExternalStore(subscribe, () => new Date(), getServerTime);
}
