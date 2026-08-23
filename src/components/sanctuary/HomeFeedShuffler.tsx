"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useEnvironment } from "@/lib/environment";
import {
  getUniverseState,
  getUniverseDepth,
  getDominantInterest,
  type UniverseState,
} from "@/lib/universe/state";

/**
 * HomeFeedShuffler — the editorial brain of the home feed.
 *
 * Instead of a fixed section order, the feed is composed from
 * several "editorial modes" that select which sections appear
 * and in what order. The mode is chosen deterministically based
 * on:
 *   - time of day
 *   - universe depth (how deep the user has explored)
 *   - visit count
 *   - dominant content interest
 *   - whether The Door / Between have been discovered
 *
 * The same combination always produces the same layout.
 * But different visits feel like different editorial compositions.
 */

/* ── Editorial modes ────────────────────────────────────────────────── */

type FeedMode =
  | "quiet"      // Calm, reflective — books, photography, recommendations
  | "cinematic"  // Visual — originals, photography, music
  | "curious"    // Discovery — explore, creators, communities
  | "deep"       // Journey-focused — because-you-chose, the door, within
  | "first"      // First visit — orientation, beautiful introduction
  | "return";    // Returning — subtle changes, re-engagement

function selectFeedMode(state: UniverseState, hour: number): FeedMode {
  const depth = getUniverseDepth(state);

  // First visit — prioritize orientation
  if (depth === 0 && state.visitedRoutes.length <= 1) {
    return "first";
  }

  // Returning user — the universe has changed since they left
  if (state.revisitCount > 0 && depth > 2 && !state.betweenVisited) {
    return "return";
  }

  // Returning after Between — the universe shifted
  if (state.betweenVisited && state.revisitCount > 2) {
    return "deep";
  }

  // Deep exploration — show what they've built
  if (depth >= 5) {
    return "deep";
  }

  // Door discovered — reward curiosity with discovery mode
  if (state.doorDiscovered && depth >= 3 && hour >= 12 && hour < 17) {
    return "curious";
  }

  // Night + calm → quiet
  if ((hour >= 22 || hour < 5) && depth >= 2) {
    return "quiet";
  }

  // Morning → cinematic (fresh visual energy)
  if (hour >= 5 && hour < 12) {
    return "cinematic";
  }

  // Afternoon → curious (discovery energy)
  if (hour >= 12 && hour < 17) {
    return "curious";
  }

  // Evening → cinematic or quiet depending on depth
  if (hour >= 17 && hour < 22) {
    return depth >= 3 ? "quiet" : "cinematic";
  }

  // Default: return or first
  return state.visitedRoutes.length > 3 ? "return" : "first";
}

/* ── Section components (code-split) ────────────────────────────────── */

const OriginalsShowcase = dynamic(() => import("@/components/sanctuary/OriginalsShowcase"));
const MusicSection = dynamic(() => import("@/components/sanctuary/MusicSection"));
const BooksSection = dynamic(() => import("@/components/sanctuary/BooksSection"));
const PhotographySection = dynamic(() => import("@/components/sanctuary/PhotographySection"));
const CommunitiesSection = dynamic(() => import("@/components/sanctuary/CommunitiesSection"));
const DailyReflection = dynamic(() => import("@/components/sanctuary/DailyReflection"));
const ImpossibleRecommendation = dynamic(() => import("@/components/sanctuary/ImpossibleRecommendation"));
const TheDoor = dynamic(() => import("@/components/sanctuary/TheDoor"));
const DiscoverSection = dynamic(() => import("@/components/sanctuary/DiscoverSection"));
const FinaleCTA = dynamic(() => import("@/components/sanctuary/FinaleCTA"));
const HomeHiddenDoor = dynamic(() => import("@/components/explore/HomeHiddenDoor"));

/* ── Feed composition per mode ──────────────────────────────────────── */

type FeedSection = {
  id: string;
  component: React.ComponentType;
};

function composeFeed(mode: FeedMode, state: UniverseState): FeedSection[] {
  const dominant = getDominantInterest(state);

  switch (mode) {
    case "first": {
      // First visit — beautiful introduction, then discovery
      return [
        { id: "originals", component: OriginalsShowcase },
        { id: "photography", component: PhotographySection },
        { id: "the-door", component: TheDoor },
        { id: "music", component: MusicSection },
        { id: "discover", component: DiscoverSection },
        { id: "communities", component: CommunitiesSection },
        { id: "finale", component: FinaleCTA },
      ];
    }

    case "quiet": {
      // Calm, reflective — books, photography, soft recommendations
      return [
        { id: "books", component: BooksSection },
        { id: "photography", component: PhotographySection },
        { id: "reflection", component: DailyReflection },
        { id: "music", component: MusicSection },
        { id: "hidden-door", component: HomeHiddenDoor },
        { id: "impossible", component: ImpossibleRecommendation },
        { id: "discover", component: DiscoverSection },
        { id: "finale", component: FinaleCTA },
      ];
    }

    case "cinematic": {
      // Visual — originals, photography, music
      return [
        { id: "originals", component: OriginalsShowcase },
        { id: "photography", component: PhotographySection },
        { id: "music", component: MusicSection },
        { id: "books", component: BooksSection },
        { id: "the-door", component: TheDoor },
        { id: "communities", component: CommunitiesSection },
        { id: "discover", component: DiscoverSection },
        { id: "finale", component: FinaleCTA },
      ];
    }

    case "curious": {
      // Discovery — explore, creators, unexpected
      return [
        { id: "discover", component: DiscoverSection },
        { id: "originals", component: OriginalsShowcase },
        { id: "communities", component: CommunitiesSection },
        { id: "the-door", component: TheDoor },
        { id: "music", component: MusicSection },
        { id: "impossible", component: ImpossibleRecommendation },
        { id: "books", component: BooksSection },
        { id: "finale", component: FinaleCTA },
      ];
    }

    case "deep": {
      // Journey-focused — because-you-chose, the door, within
      return [
        { id: "the-door", component: TheDoor },
        { id: "hidden-door", component: HomeHiddenDoor },
        { id: "originals", component: OriginalsShowcase },
        { id: "reflection", component: DailyReflection },
        { id: "music", component: MusicSection },
        { id: "impossible", component: ImpossibleRecommendation },
        { id: "photography", component: PhotographySection },
        { id: "discover", component: DiscoverSection },
        { id: "finale", component: FinaleCTA },
      ];
    }

    case "return": {
      // Returning — subtle variation based on dominant interest
      const base: FeedSection[] = [
        { id: "originals", component: OriginalsShowcase },
        { id: "the-door", component: TheDoor },
      ];

      // Emphasize the dominant interest
      if (dominant === "music") {
        base.push({ id: "music", component: MusicSection });
        base.push({ id: "books", component: BooksSection });
      } else if (dominant === "book") {
        base.push({ id: "books", component: BooksSection });
        base.push({ id: "photography", component: PhotographySection });
      } else if (dominant === "photo") {
        base.push({ id: "photography", component: PhotographySection });
        base.push({ id: "music", component: MusicSection });
      } else {
        base.push({ id: "photography", component: PhotographySection });
        base.push({ id: "music", component: MusicSection });
      }

      base.push({ id: "communities", component: CommunitiesSection });
      base.push({ id: "hidden-door", component: HomeHiddenDoor });
      base.push({ id: "discover", component: DiscoverSection });
      base.push({ id: "finale", component: FinaleCTA });

      return base;
    }
  }
}

/* ── Public API ─────────────────────────────────────────────────────── */

export type HomeFeedComposition = {
  mode: FeedMode;
  sections: FeedSection[];
};

/**
 * Get the composed home feed based on universe state.
 * Deterministic: same state + same hour = same composition.
 */
export function useHomeFeedComposition(): HomeFeedComposition {
  const { period } = useEnvironment();

  return useMemo(() => {
    const state = getUniverseState();
    const hour = new Date().getHours();
    const mode = selectFeedMode(state, hour);
    const sections = composeFeed(mode, state);
    return { mode, sections };
    // period triggers re-evaluation when time of day changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);
}

/**
 * Get a contextual subtitle for the home hero based on the feed mode.
 */
export function getFeedModeSubtitle(mode: FeedMode): string {
  switch (mode) {
    case "first":
      return "Your universe is just beginning.";
    case "quiet":
      return "The world is breathing slowly tonight.";
    case "cinematic":
      return "Light, stories, and the spaces between.";
    case "curious":
      return "There are doors you haven't opened yet.";
    case "deep":
      return "You've wandered further than most.";
    case "return":
      return "Something has changed since you left.";
  }
}
