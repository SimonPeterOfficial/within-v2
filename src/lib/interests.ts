/**
 * Interests — the small set of things a person cares about, collected once
 * during onboarding and used to shape their home (deterministically, no AI
 * claims). Stored through the memory layer, so it's local and honest about it.
 */

import { useEffect, useState } from "react";
import { memory } from "@/lib/memory";

export type InterestId =
  | "films"
  | "books"
  | "music"
  | "photography"
  | "stories"
  | "art"
  | "communities"
  | "writing";

export type Interest = {
  id: InterestId;
  label: string;
  emoji: string;
  /** The discovery shelf this interest maps to (for "Because you chose…"). */
  category: string;
  /** A warm one-liner Auri can share. */
  line: string;
};

export const INTERESTS: Interest[] = [
  { id: "films", label: "Films", emoji: "🎬", category: "Films", line: "cinema that makes the room feel smaller, in the best way" },
  { id: "books", label: "Books", emoji: "📚", category: "Books", line: "stories that sit with you for days" },
  { id: "music", label: "Music", emoji: "🎧", category: "Music", line: "soundscapes for the way you feel" },
  { id: "photography", label: "Photography", emoji: "📷", category: "Photography", line: "stillness, captured by people who wait for the light" },
  { id: "stories", label: "Stories", emoji: "📖", category: "Stories", line: "short stories and the quiet worlds they open" },
  { id: "art", label: "Art", emoji: "🎨", category: "Creators", line: "the people who make the universe, and the worlds they build" },
  { id: "communities", label: "Communities", emoji: "🤝", category: "Communities", line: "rooms full of kindred souls" },
  { id: "writing", label: "Writing", emoji: "✍️", category: "Stories", line: "written worlds — letters, pages, and morning pages" }
];

const INTERESTS_KEY = "interests";

/** Resolves an interest id to its definition (undefined for unknown ids). */
export function getInterest(id: string): Interest | undefined {
  return INTERESTS.find((interest) => interest.id === id);
}

/** Reads the persisted interests (empty array = nothing chosen yet). */
export function getStoredInterests(): InterestId[] {
  const raw = memory.get<InterestId[]>("onboarding", INTERESTS_KEY);
  return Array.isArray(raw)
    ? raw.filter((id): id is InterestId => Boolean(getInterest(id)))
    : [];
}

/** Persists the chosen interests — local only, nothing leaves the device. */
export function storeInterests(ids: InterestId[]) {
  memory.set("onboarding", INTERESTS_KEY, ids);
}

/** True when this browser has completed onboarding (interests chosen). */
export function hasCompletedOnboarding(): boolean {
  return getStoredInterests().length > 0;
}

/** Human summary of chosen interests for "Because you chose…" framing. */
export function interestSummary(ids: InterestId[]): string {
  return ids
    .map((id) => getInterest(id)?.label)
    .filter((label): label is string => Boolean(label))
    .join(", ");
}

/**
 * Reads the stored interests after mount — the one hydration-safe way to
 * personalize client components (BecauseYouChose, the home shelves). SSR and
 * the first client pass see an empty list, then the real choice resolves.
 */
export function useStoredInterests(): InterestId[] {
  const [interests, setInterests] = useState<InterestId[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setInterests(getStoredInterests()));
    return () => cancelAnimationFrame(frame);
  }, []);

  return interests;
}
