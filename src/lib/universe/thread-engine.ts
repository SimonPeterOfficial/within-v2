/**
 * The Within Thread engine — everything can lead somewhere.
 *
 * A thread is a personal, explorable path through the universe: film →
 * creator → photography → community → book → back to you. Threads build
 * on the existing journey store (lib/explore/journey.ts) and the content
 * graph (lib/explore/thread.ts connections), adding:
 *
 *   - persistent threads with names, branches, bookmarks
 *   - resume: the last thread you were following
 *   - connections derived from REAL seed relationships, never fabricated
 *
 * All persistence is local (the user's own device) — the memory layer
 * contract means a future backend can take over without consumer changes.
 */

import { getJourney, type JourneyNode } from "@/lib/explore/journey";
import { getThread, type ThreadConnection } from "@/lib/explore/thread";
import type { DiscoveryType } from "@/lib/explore/types";
import { memory } from "@/lib/memory";

/* ── Thread shapes ───────────────────────────────────────────────────── */

export type ThreadStep = {
  /** Journey node id this step came from (or a synthetic id) */
  nodeId: string;
  title: string;
  type: string;
  destination: string;
  reason: string;
  cover?: { gradient: string; emoji: string };
  at: number;
};

export type WithinThread = {
  id: string;
  /** Human name — "The night ocean thread" */
  name: string;
  /** Where the thread began */
  origin: ThreadStep;
  /** Steps taken so far, in order */
  steps: ThreadStep[];
  /** Bookmarked destinations along the way */
  bookmarks: string[];
  createdAt: number;
  updatedAt: number;
  /** Whether the thread is still being followed */
  active: boolean;
};

export type ThreadResume = {
  thread: WithinThread;
  /** Where you left off — the last step */
  lastStep: ThreadStep;
  /** Where you could go next (real connections from the last step) */
  next: ThreadConnection[];
};

/* ── Storage keys (namespaced under the memory contract) ─────────────── */

const KEYS = {
  threads: "universe:threads",
  active: "universe:active-thread",
  bookmarks: "universe:thread-bookmarks",
} as const;

function readThreads(): WithinThread[] {
  return memory.get<WithinThread[]>("user-created", KEYS.threads) ?? [];
}

function writeThreads(threads: WithinThread[]) {
  memory.set("user-created", KEYS.threads, threads);
}

/* ── Step conversion: journey nodes become thread steps ──────────────── */

function journeyToStep(node: JourneyNode): ThreadStep {
  return {
    nodeId: node.id,
    title: node.title,
    type: node.type,
    destination: node.destination,
    reason: node.reason,
    cover: node.cover,
    at: node.timestamp,
  };
}

/* ── Creation & persistence ──────────────────────────────────────────── */

/** Creates a thread from the current journey (or a single origin node). */
export function createThread(name?: string): WithinThread | null {
  const journey = getJourney();
  if (journey.length === 0) return null;

  const steps = journey.map(journeyToStep);
  const origin = steps[0];
  const thread: WithinThread = {
    id: `thread-${Date.now()}`,
    name: name ?? defaultThreadName(origin, steps),
    origin,
    steps,
    bookmarks: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    active: true,
  };

  const threads = readThreads();
  threads.unshift(thread);
  writeThreads(threads.slice(0, 20)); // keep the atlas light
  memory.set("user-created", KEYS.active, thread.id);
  return thread;
}

function defaultThreadName(origin: ThreadStep, steps: ThreadStep[]): string {
  const span = steps.length;
  if (span <= 1) return `The ${origin.type} that started it`;
  return `From ${origin.title}`;
}

/** All saved threads, newest first. */
export function listThreads(): WithinThread[] {
  return readThreads();
}

/** Fetches one thread by id. */
export function openThread(id: string): WithinThread | null {
  return readThreads().find((thread) => thread.id === id) ?? null;
}

/** The thread to resume — the most recently active one with next steps. */
export function resumeThread(): ThreadResume | null {
  const activeId = memory.get<string>("user-created", KEYS.active);
  const threads = readThreads();
  const thread =
    (activeId ? threads.find((t) => t.id === activeId) : undefined) ??
    threads.find((t) => t.active) ??
    threads[0];
  if (!thread || thread.steps.length === 0) return null;

  const lastStep = thread.steps[thread.steps.length - 1];
  const next = getThread(asDiscoveryType(lastStep.type), extractId(lastStep.destination)).slice(0, 4);
  return { thread, lastStep, next };
}

/** Destination routes look like /originals/salt-stars — pull the tail id. */
function extractId(destination: string): string {
  const parts = destination.split("/").filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : parts[0] ?? "";
}

/**
 * Steps may carry free-form types (category labels like "films"), while the
 * graph expects a DiscoveryType. Coerce safely — unknown types fall through
 * to the graph's generic-thread path rather than crashing.
 */
function asDiscoveryType(type: string): DiscoveryType {
  const known: DiscoveryType[] = [
    "original",
    "book",
    "music",
    "photo",
    "creator",
    "community",
    "reflection",
    "auri-moment",
  ];
  return (known as string[]).includes(type) ? (type as DiscoveryType) : "reflection";
}

/** Marks a thread as the active one being followed. */
export function followThread(id: string) {
  memory.set("user-created", KEYS.active, id);
  const threads = readThreads();
  const thread = threads.find((t) => t.id === id);
  if (thread) {
    thread.active = true;
    thread.updatedAt = Date.now();
    writeThreads(threads);
  }
}

/** Appends a step to a thread (called when the user follows a connection). */
export function extendThread(id: string, step: Omit<ThreadStep, "at">): WithinThread | null {
  const threads = readThreads();
  const thread = threads.find((t) => t.id === id);
  if (!thread) return null;
  thread.steps.push({ ...step, at: Date.now() });
  thread.updatedAt = Date.now();
  writeThreads(threads);
  return thread;
}

/** Branching: a thread splits when the user jumps sideways from a mid-step. */
export function branchThread(sourceId: string, fromStepIndex: number, name?: string): WithinThread | null {
  const source = openThread(sourceId);
  if (!source) return null;
  const forked: WithinThread = {
    ...source,
    id: `thread-${Date.now()}`,
    name: name ?? `${source.name} · branch`,
    origin: source.steps[fromStepIndex] ?? source.origin,
    steps: source.steps.slice(0, fromStepIndex + 1),
    bookmarks: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    active: true,
  };
  const threads = readThreads();
  threads.unshift(forked);
  writeThreads(threads);
  return forked;
}

/* ── Bookmarks ───────────────────────────────────────────────────────── */

export function bookmarkThread(id: string, destination: string) {
  const threads = readThreads();
  const thread = threads.find((t) => t.id === id);
  if (!thread) return;
  if (!thread.bookmarks.includes(destination)) thread.bookmarks.push(destination);
  thread.updatedAt = Date.now();
  writeThreads(threads);
}

export function removeThreadBookmark(id: string, destination: string) {
  const threads = readThreads();
  const thread = threads.find((t) => t.id === id);
  if (!thread) return;
  thread.bookmarks = thread.bookmarks.filter((b) => b !== destination);
  thread.updatedAt = Date.now();
  writeThreads(threads);
}

/* ── Lifecycle ───────────────────────────────────────────────────────── */

export function archiveThread(id: string) {
  const threads = readThreads();
  const thread = threads.find((t) => t.id === id);
  if (!thread) return;
  thread.active = false;
  thread.updatedAt = Date.now();
  writeThreads(threads);
}

export function deleteThread(id: string) {
  writeThreads(readThreads().filter((t) => t.id !== id));
  if (memory.get<string>("user-created", KEYS.active) === id) {
    memory.remove("user-created", KEYS.active);
  }
}

/** Names a thread — the user's words, not ours. */
export function renameThread(id: string, name: string) {
  const threads = readThreads();
  const thread = threads.find((t) => t.id === id);
  if (!thread) return;
  thread.name = name.trim() || thread.name;
  thread.updatedAt = Date.now();
  writeThreads(threads);
}

/* ── The compass: real next-steps from any destination ───────────────── */

export type ThreadFork = ThreadConnection & { why: string };

/**
 * Where can I go from here? Real connections only — sourced from the
 * seed-data graph (same creator, same mood family, shared tags), with a
 * human "why" for every edge.
 */
export function compassFor(type: string, contentId: string): ThreadFork[] {
  const connections = getThread(asDiscoveryType(type), contentId);
  return connections.map((connection, index) => ({
    ...connection,
    why:
      index === 0
        ? "Same frequency — made by the same hand."
        : connection.type === "creator"
          ? "A mind you haven't met yet."
          : connection.type === "music"
            ? "The sound of this feeling."
            : connection.type === "book"
              ? "A page that continues this."
              : "Nearby in the universe — connected by mood.",
  }));
}

/* ── The Personal Atlas ──────────────────────────────────────────────── */

export type AtlasSummary = {
  threadsFollowed: number;
  worldsVisited: number;
  stepsTaken: number;
  bookmarks: number;
  activeThread: WithinThread | null;
  recentTypes: { type: string; count: number }[];
};

/** The user's own exploration map — private, on-device, user-controlled. */
export function personalAtlas(): AtlasSummary {
  const threads = readThreads();
  const active = threads.find((t) => t.id === memory.get<string>("user-created", KEYS.active)) ?? null;
  const typeCounts = new Map<string, number>();
  let steps = 0;
  let worlds = 0;
  for (const thread of threads) {
    steps += thread.steps.length;
    if (thread.active) worlds += 1;
    for (const step of thread.steps) {
      typeCounts.set(step.type, (typeCounts.get(step.type) ?? 0) + 1);
    }
  }
  return {
    threadsFollowed: threads.filter((t) => t.active).length,
    worldsVisited: worlds,
    stepsTaken: steps,
    bookmarks: threads.reduce((sum, t) => sum + t.bookmarks.length, 0),
    activeThread: active,
    recentTypes: [...typeCounts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}
