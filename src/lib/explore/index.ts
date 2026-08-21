/**
 * Explore — the endless universe module.
 *
 * Usage:
 *   import { explore, createExploreContext } from "@/lib/explore";
 *
 *   const ctx = createExploreContext({ mood: "calm" });
 *   const result = explore(ctx);
 *   // result.items → ExploreItem[]
 *   // result.auriSuggestion → "Take me somewhere."
 */

export { explore, takeMeSomewhere, unexpectedDoor, getAllDiscoveries } from "./engine";
export { addToJourney, getJourney, clearJourney, getCurrentNode, getJourneyStats, buildJourneyTree } from "./journey";
export type { JourneyNode } from "./journey";
export { reasonLabel, createExploreContext } from "./types";
export type { ExploreItem, ExploreContext, ExploreResult, ExploreReason, DiscoveryType } from "./types";
export { getSeedPool, AURI_SUGGESTIONS, AURI_WHISPERS } from "./seed";
