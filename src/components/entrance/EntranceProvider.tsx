"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/**
 * Entrance coordination — the loader and hero share one state so the
 * entrance plays as a single continuous system rather than two
 * competing animations.
 *
 * The CinematicLoader signals `markReady()` when its sequence completes.
 * The Hero waits for `ready` before beginning its staggered reveal.
 *
 * `immediatelyReady` marks the entrance complete on mount — used when the
 * cinematic loader is disabled (loader-config.ts) so the hero reveals
 * right away with no readiness dependency to wait for.
 *
 * Hydration-safe: `ready` is identical on the server and first client
 * pass, so SSR HTML always matches hydration.
 */
type EntranceContextValue = {
  ready: boolean;
  markReady: () => void;
};

const EntranceContext = createContext<EntranceContextValue | null>(null);

export function EntranceProvider({
  children,
  immediatelyReady = false,
}: {
  children: ReactNode;
  immediatelyReady?: boolean;
}) {
  const [ready, setReady] = useState<boolean>(immediatelyReady);
  const markReady = useCallback(() => setReady(true), []);

  return (
    <EntranceContext.Provider value={{ ready, markReady }}>
      {children}
    </EntranceContext.Provider>
  );
}

export function useEntrance(): EntranceContextValue {
  const ctx = useContext(EntranceContext);
  if (!ctx) {
    throw new Error("useEntrance must be used within <EntranceProvider>.");
  }
  return ctx;
}
