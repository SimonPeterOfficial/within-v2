"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useEnvironment } from "@/lib/environment";
import { getUniverseState } from "@/lib/universe/state";

/**
 * HomeFeedShuffler — makes the home feed feel curated, not static.
 *
 * Instead of always showing the same sections in the same order,
 * this component uses deterministic seeded logic to vary the composition
 * based on:
 *   - time of day (hour)
 *   - visit count
 *   - universe depth
 *   - current mood
 *
 * The same combination of factors always produces the same layout,
 * so the page doesn't jump randomly on re-renders. But different
 * visits at different times feel different.
 */



// Dynamic imports for sections
const OriginalsShowcase = dynamic(() => import("@/components/sanctuary/OriginalsShowcase"));
const MusicSection = dynamic(() => import("@/components/sanctuary/MusicSection"));
const BooksSection = dynamic(() => import("@/components/sanctuary/BooksSection"));
const PhotographySection = dynamic(() => import("@/components/sanctuary/PhotographySection"));
const CommunitiesSection = dynamic(() => import("@/components/sanctuary/CommunitiesSection"));
const DailyReflection = dynamic(() => import("@/components/sanctuary/DailyReflection"));
const DiscoverSection = dynamic(() => import("@/components/sanctuary/DiscoverSection"));
const FinaleCTA = dynamic(() => import("@/components/sanctuary/FinaleCTA"));

/** Deterministic seed based on current time and visit info. */
function getFeedSeed(hour: number, visitCount: number, depth: number): number {
  return (hour * 7 + visitCount * 13 + depth * 3) % 100;
}

/** Get the home feed sections in a deterministic but varied order. */
export function useHomeFeedOrder(): {
  upper: React.ComponentType[];
  middle: React.ComponentType[];
  lower: React.ComponentType[];
} {
  const { period } = useEnvironment();

  return useMemo(() => {
    const state = getUniverseState();
    const hour = new Date().getHours();
    const seed = getFeedSeed(hour, state.visitedRoutes.length, state.totalDiscoveries);

    // Fixed upper section — mood + continue + because-you-chose
    // These are always near the top
    const upper: React.ComponentType[] = [];

    // Variable middle section — the editorial heart
    const middlePool: { id: string; component: React.ComponentType; weight: number }[] = [
      { id: "originals", component: OriginalsShowcase, weight: period === "evening" || period === "night" ? 3 : 2 },
      { id: "music", component: MusicSection, weight: period === "night" || period === "evening" ? 3 : 2 },
      { id: "books", component: BooksSection, weight: period === "morning" ? 3 : 2 },
      { id: "photography", component: PhotographySection, weight: 2 },
      { id: "communities", component: CommunitiesSection, weight: 2 },
      { id: "reflection", component: DailyReflection, weight: period === "night" ? 3 : 1 },
    ];

    // Sort by weight + seed-based jitter for variety
    middlePool.sort((a, b) => {
      const jitterA = ((seed + a.weight * 7) % 5) * 0.1;
      const jitterB = ((seed + b.weight * 7) % 5) * 0.1;
      return (b.weight + jitterB) - (a.weight + jitterA);
    });

    // Pick 4-5 sections for the middle, always including at least one
    const middleCount = 4 + (seed % 2);
    const middle = middlePool.slice(0, middleCount).map((s) => s.component);

    // Fixed lower section — the editorial close
    const lower: React.ComponentType[] = [DiscoverSection, FinaleCTA];

    return { upper, middle, lower };
  }, [period]);
}

/**
 * Renders the home feed with the TheDoor and ImpossibleRecommendation
 * placed at deterministic but varied positions.
 */
export function getTheDoorPosition(seed: number): "after-mood" | "after-continue" | "after-chose" | "after-originals" {
  const positions = ["after-mood", "after-continue", "after-chose", "after-originals"] as const;
  return positions[seed % positions.length];
}

export function getImpossiblePosition(seed: number): "before-discover" | "after-reflection" | "between-sections" {
  const positions = ["before-discover", "after-reflection", "between-sections"] as const;
  return positions[(seed + 3) % positions.length];
}
