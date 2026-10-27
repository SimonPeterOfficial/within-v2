"use client";

import { useSyncExternalStore } from "react";

/**
 * Hydration detection — true once the client has taken over from the server.
 *
 * The server renders `false`, the first client (hydration) render matches
 * with `false`, and every render after hydration resolves to `true`.
 * Clock- and locale-dependent text uses this so SSR and hydration stay
 * identical (see TimeDisplay, StarClock, MoodLab, TimeRift, AuriPanel).
 */
const noopSubscribe = () => () => {};

export function useMountedSafe(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
