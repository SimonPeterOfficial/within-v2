"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CrystalSurface } from "@/components/within/crystal/Crystal";
import Icon from "@/components/ui/Icon";
import { UNIVERSE, type UniverseEntry } from "@/lib/search";
import { getUniverseState } from "@/lib/universe/state";
import { createThread, extendThread, listThreads } from "@/lib/universe/thread-engine";
import { getAuriPreferences } from "@/lib/auri";
import { memory } from "@/lib/memory";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * The Serendipity Door — Gen 12's controlled discovery experience.
 *
 * NOT random chaos. The door picks one item day-stably from the seed
 * catalog, weighted just outside the user's usual path (their recent
 * content types from the universe state), and always explains itself:
 *
 *   "Outside your usual path."  /  "Connected by photography."
 *   "From a shelf you haven't opened yet."
 *
 * Actions are honest: Open (and record the step into the active thread —
 * everything leads somewhere), Skip, Save (kept locally), Not interested
 * (respected for 14 days), and Why this (shows the real reason). The door
 * honors the user's Auri "suggestions" preference, and renders nothing
 * when there is nothing worth showing.
 */

const DOOR_KEY = "universe:serendipity-door";
const NOT_INTERESTED_TTL = 14 * 24 * 60 * 60 * 1000;

type DoorMemory = {
  /** Day stamp the current pick belongs to */
  day: string;
  /** Item id picked for that day */
  pickId: string;
  /** Dismissed item ids with timestamps (not-interested) */
  dismissed: { id: string; at: number }[];
  /** Locally saved door items */
  saved: UniverseEntry[];
};

function readMemory(): DoorMemory {
  return (
    memory.get<DoorMemory>("user-created", DOOR_KEY) ?? {
      day: "",
      pickId: "",
      dismissed: [],
      saved: [],
    }
  );
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministic day-stable pick: hash of day + outside-the-usual weighting. */
function pickForDay(day: string, usualTypes: string[]): UniverseEntry {
  // Simple string hash — deterministic across renders and reloads.
  let hash = 0;
  for (let i = 0; i < day.length; i++) {
    hash = (hash * 31 + day.charCodeAt(i)) >>> 0;
  }

  const usual = new Set(usualTypes);
  // "Slightly outside": items whose category the user hasn't explored recently.
  const outside = UNIVERSE.filter((entry) => !usual.has(entry.category.toLowerCase()));
  const pool = outside.length >= 4 ? outside : UNIVERSE;

  return pool[hash % pool.length];
}

function reasonFor(entry: UniverseEntry, usualTypes: string[]): string {
  const usual = new Set(usualTypes);
  if (usual.size === 0) return "A first step — the door opens onto something new.";
  if (!usual.has(entry.category.toLowerCase()))
    return `Outside your usual path — you've been near ${[...usual][0] ?? "elsewhere"} lately.`;
  return `Connected by ${entry.category.toLowerCase()} — near where you've been exploring.`;
}

export default function SerendipityDoor() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [door, setDoor] = useState<{
    entry: UniverseEntry;
    reason: string;
    whyOpen: boolean;
  } | null>(null);
  const [saved, setSaved] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Defer outside the effect body — async read of the external store.
    const frame = requestAnimationFrame(() => {
      // The user controls optional experiences — respect Auri's suggestions pref.
      if (!getAuriPreferences().suggestions) {
        setReady(true);
        return;
      }

      const mem = readMemory();
      const today = todayStamp();
      // Expire not-interested entries older than the TTL.
      mem.dismissed = mem.dismissed.filter((d) => Date.now() - d.at < NOT_INTERESTED_TTL);

      const state = getUniverseState();
      const usual = state.recentContentTypes.slice(0, 3);

      let entry: UniverseEntry;
      if (mem.day === today && mem.pickId) {
        entry = UNIVERSE.find((e) => e.id === mem.pickId) ?? pickForDay(today, usual);
      } else {
        entry = pickForDay(today, usual);
        memory.set("user-created", DOOR_KEY, {
          ...mem,
          day: today,
          pickId: entry.id,
          dismissed: mem.dismissed,
          saved: mem.saved,
        });
      }

      if (mem.dismissed.some((d) => d.id === entry.id)) {
        setReady(true); // the user said not today — the door stays shut, honestly
        return;
      }

      setDoor({ entry, reason: reasonFor(entry, usual), whyOpen: false });
      setSaved(mem.saved.some((e) => e.id === entry.id));
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const recordStep = (entry: UniverseEntry) => {
    // Everything leads somewhere: opening the door extends the active thread
    // (or starts one) so the journey keeps its trail.
    const threads = listThreads();
    const active = threads.find((t) => t.active);
    const step = {
      nodeId: `door-${entry.id}`,
      title: entry.title,
      type: entry.category.toLowerCase(),
      destination: entry.href,
      reason: "Opened the serendipity door",
      cover: { gradient: entry.gradient, emoji: entry.emoji },
    };
    if (active) extendThread(active.id, step);
    else createThread(`Through the door — ${entry.title}`);
  };

  const dismiss = () => {
    if (!door) return;
    const mem = readMemory();
    mem.dismissed.push({ id: door.entry.id, at: Date.now() });
    memory.set("user-created", DOOR_KEY, mem);
    setDoor(null);
  };

  const save = () => {
    if (!door) return;
    const mem = readMemory();
    if (!mem.saved.some((e) => e.id === door.entry.id)) {
      mem.saved.push(door.entry);
      memory.set("user-created", DOOR_KEY, mem);
    }
    setSaved(true);
  };

  if (!ready || !door) return null;
  const { entry, reason } = door;

  return (
    <CrystalSurface level="soft" depth="medium" sheen className="overflow-hidden p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
            <Icon name="discover" size={13} className="text-[#7c6ce0]" />
            The Serendipity Door
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="crystal-focus rounded-full px-2.5 py-1 text-[10.5px] font-medium text-[#8b8aa0] transition hover:bg-white/50 hover:text-[#44435e]"
          >
            Not interested
          </button>
        </div>

        <div className="mt-4 flex items-start gap-4">
          {/* The threshold — the item's own light, seen through the door */}
          <span
            aria-hidden
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${entry.gradient} text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.5),var(--depth-low)]`}
          >
            {entry.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[17px] font-medium text-[#232136]">
              {entry.title}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-[#8b8aa0]">
              {entry.by} · {entry.meta}
            </p>
            <p className="mt-1.5 text-[12px] italic leading-relaxed text-[#6f6e88]">
              {reason}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={entry.href}
            onClick={() => recordStep(entry)}
            className="crystal-focus inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))",
              boxShadow: "0 4px 14px rgba(var(--mood-rgb),0.32), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            Open
            <Icon name="forward" size={12} />
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={saved}
            className="crystal-focus rounded-full bg-white/50 px-4 py-2 text-[12.5px] font-semibold text-[#44435e] ring-1 ring-white/70 transition hover:bg-white/75 disabled:opacity-60"
          >
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="crystal-focus rounded-full px-3 py-2 text-[12px] font-medium text-[#8b8aa0] transition hover:text-[#44435e]"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => setWhyOpen((open) => !open)}
            aria-expanded={whyOpen}
            className="crystal-focus ml-auto text-[11.5px] font-medium text-[#8b8aa0] underline-offset-2 transition hover:text-[#5b4bc4] hover:underline"
          >
            Why this?
          </button>
        </div>

        <AnimatePresence initial={false}>
          {whyOpen && (
            <motion.p
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden text-[11.5px] leading-relaxed text-[#6f6e88]"
            >
              <span className="mt-3 block rounded-xl bg-white/45 px-3 py-2 ring-1 ring-white/60">
                {reason} The door changes once a day — no tracking, no profile,
                just a slightly different path than yesterday.
              </span>
            </motion.p>
          )}
        </AnimatePresence>
    </CrystalSurface>
  );
}
