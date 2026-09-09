"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CrystalSurface } from "@/components/within/crystal/Crystal";
import Icon, { type IconName } from "@/components/ui/Icon";
import {
  personalAtlas,
  listThreads,
  followThread,
  archiveThread,
  deleteThread,
  type WithinThread,
  type AtlasSummary,
} from "@/lib/universe/thread-engine";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * PersonalAtlas — Gen 12's Personal Exploration Atlas.
 *
 * A private, user-controlled map of what the user has explored:
 * threads followed, steps taken, worlds visited, bookmarks kept.
 * Built only from real local state — no surveillance, no server
 * profile, no fabricated history. The user controls it fully:
 *
 *   follow / archive / delete each thread
 *   clear the entire atlas (with confirm)
 *   honest empty state when nothing has been explored yet
 */

const TYPE_ICONS: Record<string, IconName> = {
  original: "originals",
  films: "originals",
  music: "music",
  book: "book",
  books: "book",
  photo: "camera",
  photography: "camera",
  creator: "star",
  creators: "star",
  community: "users",
  communities: "users",
  reflection: "eye",
};

function threadIcon(thread: WithinThread): IconName {
  return TYPE_ICONS[thread.origin.type] ?? "sparkles";
}

export default function PersonalAtlas() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [atlas, setAtlas] = useState<AtlasSummary | null>(null);
  const [threads, setThreads] = useState<WithinThread[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    // Defer outside the effect body — async read of the external store.
    const frame = requestAnimationFrame(() => {
      setAtlas(personalAtlas());
      setThreads(listThreads());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const refresh = () => {
    setAtlas(personalAtlas());
    setThreads(listThreads());
  };

  const clearAll = () => {
    for (const thread of threads) deleteThread(thread.id);
    refresh();
    setConfirmClear(false);
  };

  if (!atlas) return null;

  const empty = threads.length === 0;

  return (
    <CrystalSurface level="soft" depth="medium" sheen className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
            Personal exploration atlas
          </p>
          <p className="mt-1 font-display text-xl font-medium text-[#232136]">
            {empty ? "Your map is waiting" : "Where you've been"}
          </p>
        </div>
        {!empty && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="crystal-focus rounded-full px-3 py-1.5 text-[11px] font-medium text-[#8b8aa0] ring-1 ring-white/60 transition hover:bg-white/50 hover:text-rose-500"
          >
            Clear my atlas
          </button>
        )}
      </div>

      {empty ? (
        <div className="mt-6 text-center">
          <p className="text-[13px] leading-relaxed text-[#6f6e88]">
            Nothing explored yet. Every film, song, book and community you
            visit can become part of a thread — a path you can follow and
            return to.
          </p>
          <Link
            href="/explore"
            className="crystal-focus mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))",
              boxShadow: "0 4px 14px rgba(var(--mood-rgb),0.32)",
            }}
          >
            Start exploring
            <Icon name="forward" size={12} />
          </Link>
        </div>
      ) : (
        <>
          {/* The summary row — real numbers from the atlas engine */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Steps taken", value: atlas.stepsTaken },
              { label: "Active threads", value: atlas.threadsFollowed },
              { label: "Bookmarks", value: atlas.bookmarks },
              { label: "Worlds visited", value: atlas.worldsVisited },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/45 px-4 py-3 ring-1 ring-white/60"
              >
                <p className="font-display text-xl font-medium text-[#232136]">{stat.value}</p>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#8b8aa0]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* The trail list */}
          <ul className="mt-5 flex flex-col gap-2">
            {threads.map((thread, index) => {
              const isActive = atlas.activeThread?.id === thread.id;
              return (
                <motion.li
                  key={thread.id}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition ${
                      isActive
                        ? "bg-white/70 ring-white"
                        : "bg-white/40 ring-white/60 hover:bg-white/60"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/80 ${
                        isActive ? "text-white" : "bg-white/60 text-[#7c6ce0]"
                      }`}
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))",
                              boxShadow: "0 3px 10px rgba(var(--mood-rgb),0.3)",
                            }
                          : undefined
                      }
                    >
                      <Icon name={threadIcon(thread)} size={15} />
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        followThread(thread.id);
                        refresh();
                      }}
                      className="min-w-0 flex-1 text-left"
                      aria-label={`Follow thread ${thread.name}`}
                    >
                      <span className="block truncate text-[13px] font-semibold text-[#232136]">
                        {thread.name}
                        {isActive && (
                          <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#7c6ce0]">
                            Following
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[11px] text-[#8b8aa0]">
                        {thread.steps.length} step{thread.steps.length === 1 ? "" : "s"} · began with{" "}
                        {thread.origin.title}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Link
                        href={thread.steps[thread.steps.length - 1].destination}
                        className="crystal-focus rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-[#44435e] ring-1 ring-white/70 transition hover:bg-white/90"
                      >
                        Resume
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          archiveThread(thread.id);
                          refresh();
                        }}
                        className="crystal-focus rounded-full p-1.5 text-[#8b8aa0] transition hover:bg-white/60 hover:text-[#44435e]"
                        aria-label={`Archive ${thread.name}`}
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          {/* Types you explore most — quiet, honest */}
          {atlas.recentTypes.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-[#8b8aa0]">You wander most in:</span>
              {atlas.recentTypes.map(({ type, count }) => (
                <span
                  key={type}
                  className="rounded-full bg-white/50 px-3 py-1 text-[11px] font-medium capitalize text-[#44435e] ring-1 ring-white/60"
                >
                  {type} · {count}
                </span>
              ))}
            </div>
          )}

          {/* Confirm clear */}
          {confirmClear && (
            <div
              className="mt-4 rounded-2xl bg-white/55 p-4 ring-1 ring-white/70"
              role="alertdialog"
              aria-label="Clear exploration history"
            >
              <p className="text-[12.5px] font-medium text-[#232136]">
                Clear your whole atlas? This erases every thread, step and
                bookmark — on this device only. It cannot be undone.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="crystal-focus rounded-full bg-rose-500/90 px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-rose-500"
                >
                  Clear everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="crystal-focus rounded-full px-4 py-1.5 text-[12px] font-medium text-[#44435e] transition hover:bg-white/60"
                >
                  Keep my atlas
                </button>
              </div>
            </div>
          )}
        </>
      )}      {/* Honesty footer — where this data lives */}
      <p className="mt-5 text-[11px] leading-relaxed text-[#8b8aa0]">
        Kept privately on this device — never uploaded, never sold.
      </p>
    </CrystalSurface>
  );
}
