/**
 * The personal library — the user's corner of WithIn.
 *
 * Saved content, likes, recently viewed pieces, and reading/listening
 * progress live here. Today the library is a clean, local abstraction over
 * the AuriMemory layer (localStorage in this browser — nothing leaves the
 * device, nothing is claimed to be server-side). The interface below is the
 * contract a future account backend must satisfy: swap the implementation
 * and every consumer (profile, discover, continue) keeps working unchanged.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * When a real user backend exists, implement the same functions against it.
 * Consumers never touch storage directly — they speak only to this module.
 * ───────────────────────────────────────────────────────────────────────
 */

import { memory } from "@/lib/memory";

const KEY_RECENT = "recently-viewed";
const KEY_PROGRESS = "progress";

/** Kinds of shelves in the personal library. */
export type LibraryShelf = "saved" | "liked" | "recently-viewed";

const MAX_RECENT = 12;

function readList(key: string): string[] {
  const raw = memory.get<string[]>("favorite-content", key);
  return Array.isArray(raw) ? raw : [];
}

function writeList(key: string, items: string[]) {
  memory.set("favorite-content", key, items);
}

/** Toggle an item in/out of a shelf; returns the new state (true = present). */
export function toggleShelf(shelf: LibraryShelf, itemId: string): boolean {
  const items = readList(shelf);
  const present = items.includes(itemId);
  const next = present ? items.filter((id) => id !== itemId) : [itemId, ...items];
  writeList(shelf, next);
  return !present;
}

/** Adds an item to a shelf (no-op when already present). */
export function addToShelf(shelf: LibraryShelf, itemId: string) {
  const items = readList(shelf);
  if (!items.includes(itemId)) writeList(shelf, [itemId, ...items]);
}

/** Removes an item from a shelf. */
export function removeFromShelf(shelf: LibraryShelf, itemId: string) {
  writeList(
    shelf,
    readList(shelf).filter((id) => id !== itemId)
  );
}

/** True when the item sits on the shelf. */
export function isOnShelf(shelf: LibraryShelf, itemId: string): boolean {
  return readList(shelf).includes(itemId);
}

/** The full shelf, most recent first. */
export function getShelf(shelf: LibraryShelf): string[] {
  return readList(shelf);
}

/** Records a view — the piece rises to the top of recently-viewed. */
export function recordView(itemId: string) {
  const items = readList(KEY_RECENT).filter((id) => id !== itemId);
  writeList(KEY_RECENT, [itemId, ...items].slice(0, MAX_RECENT));
}

/** Recently-viewed items, most recent first. */
export function getRecent(): string[] {
  return readList(KEY_RECENT);
}

/** A stored piece of progress — e.g. book chapter or album track. */
export type ProgressRecord = {
  /** Completion 0–1 */
  progress: number;
  /** Human label, e.g. "Chapter 4 of 9" */
  label?: string;
  updatedAt: number;
};

/** Reads saved progress for an item (or null when none is stored). */
export function getProgress(itemId: string): ProgressRecord | null {
  const all = memory.get<Record<string, ProgressRecord>>("favorite-content", KEY_PROGRESS) ?? {};
  return all[itemId] ?? null;
}

/** Saves progress for an item — the "continue where you left off" contract. */
export function setProgress(itemId: string, record: Omit<ProgressRecord, "updatedAt">) {
  const all = memory.get<Record<string, ProgressRecord>>("favorite-content", KEY_PROGRESS) ?? {};
  all[itemId] = { ...record, updatedAt: Date.now() };
  memory.set("favorite-content", KEY_PROGRESS, all);
}

/** All items with stored progress, most recently updated first. */
export function getInProgress(): { itemId: string; record: ProgressRecord }[] {
  const all = memory.get<Record<string, ProgressRecord>>("favorite-content", KEY_PROGRESS) ?? {};
  return Object.entries(all)
    .map(([itemId, record]) => ({ itemId, record }))
    .sort((a, b) => b.record.updatedAt - a.record.updatedAt);
}

/** Count of items on a shelf — for profile summaries. */
export function shelfCount(shelf: LibraryShelf): number {
  return readList(shelf).length;
}
