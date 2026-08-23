"use client";

import { useMemo } from "react";
import HiddenDoor from "@/components/explore/HiddenDoor";
import { getUniverseState } from "@/lib/universe/state";

/**
 * HomeHiddenDoor — a subtle hidden door placed in the home feed.
 *
 * The door is only visible if the user has explored enough to "deserve"
 * finding it. It sits quietly between sections, almost invisible,
 * waiting for someone who is paying attention.
 *
 * The variant changes based on the user's journey depth:
 *   - glyph: for newer users (subtle, tiny)
 *   - constellation: for intermediate users (a cluster of stars)
 *   - portal: for deep explorers (a luminous circle)
 */

export default function HomeHiddenDoor() {
  const state = useMemo(() => getUniverseState(), []);
  const depth = state.totalDiscoveries + state.maxDepth;

  // Only show if the user has explored somewhat
  if (depth < 3) return null;

  const variant = depth >= 8 ? "portal" : depth >= 5 ? "constellation" : "glyph";

  return (
    <div className="flex justify-center py-4">
      <HiddenDoor
        destination="/between"
        label="There is more Within"
        variant={variant}
        glyph="·"
        contentType="reflection"
        reason="You found the space between."
        cooldownMs={60 * 60 * 1000}
      />
    </div>
  );
}
