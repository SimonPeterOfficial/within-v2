"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  resumeThread,
  extendThread,
} from "@/lib/universe/thread-engine";
import { getUniverseState, updateUniverseState } from "@/lib/universe/state";

/**
 * ThreadObserver — the quiet bridge between navigation and the Thread.
 *
 * When the user follows a fork (from the compass, the Serendipity Door, or
 * any content surface), they navigate to a real route. This observer closes
 * the loop: when the active thread's next suggested destination is visited,
 * the step is appended automatically — the trail reflects what the user
 * actually did, nothing more.
 *
 * It also records universe-state recency (which content types the user is
 * near), which keeps the Serendipity Door's "outside your usual path"
 * weighting honest.
 *
 * Renders nothing. Never fabricates steps for routes the user didn't visit.
 */

const KNOWN_TYPES: Record<string, string> = {
  "/originals": "films",
  "/books": "books",
  "/music": "music",
  "/photography": "photography",
  "/communities": "communities",
  "/creators": "creators",
  "/explore": "explore",
  "/discover": "explore",
  "/within": "reflection",
};

export default function ThreadObserver() {
  const pathname = usePathname();
  const lastRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    // Universe-state recency — which shelf the user is near right now.
    const type = Object.entries(KNOWN_TYPES).find(([prefix]) =>
      pathname.startsWith(prefix)
    )?.[1];
    if (type) {
      const state = getUniverseState();
      updateUniverseState({
        recentContentTypes: [type, ...state.recentContentTypes].slice(0, 8),
      });
    }

    // Thread continuity — did the user land on the thread's next step?
    const resume = resumeThread();
    if (!resume) return;
    const { thread, next } = resume;
    if (next.length === 0) return;

    // Skip duplicates: the same destination recorded twice in a row.
    if (lastRecordedRef.current === pathname) return;

    const fork = next.find((n) => n.destination === pathname);
    if (fork && thread.steps[thread.steps.length - 1]?.destination !== pathname) {
      extendThread(thread.id, {
        nodeId: fork.id,
        title: fork.label,
        type: fork.type,
        destination: fork.destination,
        reason: fork.reason,
        cover: fork.cover,
      });
      lastRecordedRef.current = pathname;
    }
  }, [pathname]);

  return null;
}
