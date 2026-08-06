"use client";

import dynamic from "next/dynamic";

/**
 * Client-side gate for the cinematic loader.
 *
 * Next.js 16 forbids `ssr: false` inside Server Components, so the code-split
 * `dynamic()` import of the loader must live in a Client Component. Server
 * pages render this gate instead of importing the loader directly — the
 * loader itself stays fully client-only and never participates in SSR.
 */
const CinematicLoader = dynamic(() => import("@/components/loader/CinematicLoader"), {
  ssr: false
});

export default function CinematicLoaderGate() {
  return <CinematicLoader />;
}
