/**
 * Explore — the endless universe module.
 *
 * Usage:
 *   import { explore, createExploreContext, getThread } from "@/lib/explore";
 */

export { explore, takeMeSomewhere, unexpectedDoor, getAllDiscoveries } from "./engine";
export { addToJourney, getJourney, clearJourney, getCurrentNode, getJourneyStats, buildJourneyTree } from "./journey";
export type { JourneyNode } from "./journey";
export { reasonLabel, createExploreContext } from "./types";
export type { ExploreItem, ExploreContext, ExploreResult, ExploreReason, DiscoveryType } from "./types";
export { getSeedPool, AURI_SUGGESTIONS, AURI_WHISPERS } from "./seed";
export { getThread, getAnotherDoor } from "./thread";
export type { ThreadConnection } from "./thread";
