"use client";

import { useEffect } from "react";
import CinematicLoader from "@/components/loader/CinematicLoader";
import { useCinematicIntro } from "@/lib/useCinematicIntro";
import { useEntrance } from "@/components/entrance/EntranceProvider";
import { CINEMATIC_LOADER_ENABLED } from "@/components/loader/loader-config";

/**
 * Client-side gate for the cinematic loader.
 *
 * If the cinematic should not play in this session (play === false), we
 * must still signal the EntranceProvider that the app is "ready" so the
 * Hero can begin its reveal. Previously the gate rendered the loader but
 * did not mark ready when the cinematic was skipped, leaving the hero
 * hidden and the landing page blank. Mark readiness explicitly when the
 * cinematic is not played.
 */
export default function CinematicLoaderGate() {
  const intro = useCinematicIntro();
  const play = CINEMATIC_LOADER_ENABLED && intro.play;
  const { markReady } = useEntrance();

  useEffect(() => {
    if (!play) {
      // If the cinematic will not play, immediately mark the entrance
      // as ready so the Hero and the rest of the landing render.
      markReady();
    }
  }, [play, markReady]);

  if (!play) return null;
  return (
    <CinematicLoader
      reduced={intro.reduced}
      returning={intro.returning}
      markSeen={intro.markSeen}
    />
  );
}
