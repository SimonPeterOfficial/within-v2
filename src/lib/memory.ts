/**
 * Auri Memory — a privacy-first abstraction for everything WithIn remembers.
 *
 * Today the memory is a thin, safe layer over the user's own browser
 * (localStorage) — nothing leaves the device, nothing is ever claimed to be
 * server-side. The interfaces below are the contract a future backend must
 * satisfy: swap the `memory` export for a server-backed implementation and
 * every consumer (mood persistence, journey, Auri) keeps working unchanged.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * When a real user backend exists, implement the same `AuriMemory`
 * interface against it (one `get`/`set` per category). Consumers never read
 * localStorage directly — they speak only to `memory`.
 * ───────────────────────────────────────────────────────────────────────
 *
 * Privacy rules: only store what the user explicitly chose (their mood, a
 * favorited piece of content, onboarding answers). Never store sensitive
 * information unnecessarily. All reads/writes are try/catch guarded so a
 * blocked storage can never break the experience.
 */

export type MemoryCategory =
  | "preferences"
  | "favorite-content"
  | "selected-mood"
  | "onboarding"
  | "user-created";

/** One remembered thing — the canonical shape a real backend will persist. */
export type UserMemory<T = unknown> = {
  id: string;
  category: MemoryCategory;
  key: string;
  value: T;
  createdAt: number;
  updatedAt: number;
};

/** A lightweight preference — the common case (key → value string). */
export type MemoryPreference = {
  key: string;
  value: string;
};

/** The contract every memory consumer speaks. */
export interface AuriMemory {
  get<T>(category: MemoryCategory, key: string): T | null;
  set<T>(category: MemoryCategory, key: string, value: T): void;
  remove(category: MemoryCategory, key: string): void;
  getPreference(key: string): string | null;
  setPreference(key: string, value: string): void;
  /** How many times this browser has entered WithIn (session-less count). */
  getVisitCount(): number;
  setVisitCount(count: number): void;
}

/** Well-known memory keys — one vocabulary, no magic strings in consumers. */
export const memoryKeys = {
  mood: "selected-mood",
  visits: "visits"
} as const;

const PREFIX = "within:mem";

/**
 * Legacy flat keys the app has always used. New memories get namespaced keys;
 * these two keep their original storage so nothing users have set is lost.
 */
const legacyKeys: Partial<Record<string, string>> = {
  [memoryKeys.mood]: "within:mood",
  [memoryKeys.visits]: "within:visits"
};

function storageKey(category: MemoryCategory, key: string): string {
  return legacyKeys[key] ?? `${PREFIX}:${category}:${key}`;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the world simply doesn't remember */
  }
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * The current implementation — a quiet, local-only memory.
 * Values are JSON-encoded; legacy plain strings (e.g. the old mood key)
 * are read gracefully so pre-existing preferences keep working.
 */
export const memory: AuriMemory = {
  get<T>(category: MemoryCategory, key: string): T | null {
    const raw = safeGet(storageKey(category, key));
    if (raw === null || raw === "") return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Legacy plain-string value (pre-JSON format) — hand it back as-is.
      return raw as T;
    }
  },

  set<T>(category: MemoryCategory, key: string, value: T) {
    safeSet(storageKey(category, key), JSON.stringify(value));
  },

  remove(category: MemoryCategory, key: string) {
    safeRemove(storageKey(category, key));
  },

  getPreference(key: string): string | null {
    const value = this.get<string>("preferences", key);
    return value ?? null;
  },

  setPreference(key: string, value: string) {
    this.set("preferences", key, value);
  },

  getVisitCount(): number {
    const raw = this.get<string>("preferences", memoryKeys.visits);
    const count = Number(raw);
    return Number.isFinite(count) && count > 0 ? count : 0;
  },

  setVisitCount(count: number) {
    this.set("preferences", memoryKeys.visits, String(count));
  }
};

/**
 * Builds a full UserMemory envelope — handy when a consumer wants to hold a
 * memory object (e.g. before handing it to a future backend).
 */
export function makeMemory<T>(
  category: MemoryCategory,
  key: string,
  value: T,
  now = Date.now()
): UserMemory<T> {
  return { id: `${category}:${key}`, category, key, value, createdAt: now, updatedAt: now };
}
