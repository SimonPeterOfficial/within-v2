"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useCinematicIntro } from "@/lib/useCinematicIntro";
import { useEntrance } from "@/components/entrance/EntranceProvider";

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
const CinematicLoader = dynamic(() => import("@/components/loader/CinematicLoader"), {
  ssr: false,
});

export default function CinematicLoaderGate() {
  const { play } = useCinematicIntro();
  const { markReady } = useEntrance();

  useEffect(() => {
    if (!play) {
      // If the cinematic will not play, immediately mark the entrance
      // as ready so the Hero and the rest of the landing render.
      markReady();
    }
  }, [play, markReady]);

  if (!play) return null;
  return <CinematicLoader />;
}
