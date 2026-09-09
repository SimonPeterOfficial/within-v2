"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CrystalSurface } from "@/components/within/crystal/Crystal";
import Icon, { type IconName } from "@/components/ui/Icon";
import {
  resumeThread,
  extendThread,
  compassFor,
  listThreads,
  followThread,
  archiveThread,
  type ThreadResume,
  type WithinThread,
  type ThreadStep,
  type ThreadFork,
} from "@/lib/universe/thread-engine";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * ThreadTrail — the Within Thread rendered as a journey, not a graph.
 *
 * WHERE DID I COME FROM?  the origin node, always visible
 * WHERE AM I?             the glowing current node
 * WHERE CAN I GO?         the compass — real next steps with a "why"
 * WHY IS THIS CONNECTED?  every edge carries its reason
 *
 * The line is soft and organic; nodes are crystal surfaces floating in
 * the environment. Following a step extends the thread — exploration
 * leaves a trail you can return to.
 */

const TYPE_ICONS: Record<string, IconName> = {
  original: "originals",
  film: "originals",
  music: "music",
  book: "book",
  photo: "camera",
  creator: "star",
  community: "users",
  reflection: "eye",
  "auri-moment": "sparkles",
};

function stepIcon(step: ThreadStep): IconName {
  return TYPE_ICONS[step.type] ?? "sparkles";
}

function stepHref(step: ThreadStep): string {
  return step.destination || "/explore";
}

/* ── The node — one place on the trail ──────────────────────────────── */
function ThreadNode({
  step,
  state,
  index,
}: {
  step: ThreadStep;
  state: "origin" | "past" | "current";
  index: number;
}) {
  return (
    <Link
      href={stepHref(step)}
      className="group relative flex items-center gap-3.5"
      aria-label={`${step.title} — ${step.reason}`}
    >
      <span
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:-translate-y-0.5 ${
          state === "current" ? "text-white" : "text-[#5f5e74]"
        }`}
        style={
          state === "current"
            ? {
                background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))",
                boxShadow: "0 4px 16px rgba(var(--mood-rgb),0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
              }
            : {
                background: "rgba(255,255,255,0.55)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.75), var(--depth-low)",
              }
        }
      >
        <Icon name={stepIcon(step)} size={17} strokeWidth={1.9} />
        {state === "origin" && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-bold text-[#7c6ce0] ring-1 ring-[#7c6ce0]/30"
          >
            1
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-semibold text-[#232136] group-hover:text-[#5b4bc4]">
          {step.title}
        </span>
        <span className="block truncate text-[11px] text-[#8b8aa0]">
          {state === "current" ? "You are here · " : ""}
          {step.reason}
        </span>
        <span className="sr-only">Step {index + 1}</span>
      </span>
      <Icon
        name="forward"
        size={13}
        className="ml-auto shrink-0 text-[#c0bfd4] transition-transform group-hover:translate-x-0.5 group-hover:text-[#7c6ce0]"
      />
    </Link>
  );
}

/* ── The trail ──────────────────────────────────────────────────────── */
export type FollowedFork = ThreadFork;

export function ThreadTrail({
  resume,
  forks,
  onFollow,
}: {
  resume: ThreadResume;
  forks: ThreadFork[];
  onFollow: (fork: ThreadFork) => void;
}) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [compassOpen, setCompassOpen] = useState(false);
  const { thread, lastStep } = resume;

  const visibleSteps = thread.steps.slice(-5); // the trail breathes — last 5 steps
  const origin = thread.steps[0];

  return (
    <CrystalSurface level="soft" depth="medium" sheen className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
            Your thread
          </p>
          <p className="mt-0.5 truncate font-display text-lg font-medium text-[#232136]">
            {thread.name}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-[10.5px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.9), rgba(var(--mood-rgb),0.7))" }}
        >
          {thread.steps.length} step{thread.steps.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* The trail */}
      <div className="relative mt-5">
        {/* The connecting line — soft, organic */}
        <span
          aria-hidden
          className="absolute bottom-5 left-[22px] top-5 w-px bg-linear-to-b from-[rgba(var(--mood-rgb),0.5)] via-white/70 to-white/40"
        />
        <div className="flex flex-col gap-4">
          {visibleSteps.map((step, index) => {
            const isLast = index === visibleSteps.length - 1;
            const isOrigin = step.nodeId === origin.nodeId && index === 0;
            return (
              <motion.div
                key={`${step.nodeId}-${index}`}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <ThreadNode
                  step={step}
                  index={thread.steps.length - visibleSteps.length + index}
                  state={isLast ? "current" : isOrigin ? "origin" : "past"}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* The compass — where can I go? */}
      <div className="mt-5 border-t border-white/60 pt-4">
        <button
          type="button"
          onClick={() => setCompassOpen((open) => !open)}
          aria-expanded={compassOpen}
          className="crystal-focus flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left"
        >
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[#44435e]">
            <Icon name="discover" size={14} className="text-[#7c6ce0]" />
            Where can I go from here?
          </span>
          <Icon
            name={compassOpen ? "chevronLeft" : "chevronRight"}
            size={13}
            className="text-[#8b8aa0]"
          />
        </button>

        <AnimatePresence initial={false}>
          {compassOpen && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex flex-col gap-2">
                {forks.length === 0 && (
                  <p className="px-2 text-[12px] text-[#8b8aa0]">
                    This is the edge of the mapped universe — wander somewhere new.
                  </p>
                )}
                {forks.map((fork) => (
                  <button
                    key={fork.id}
                    type="button"
                    onClick={() => onFollow(fork)}
                    className="group flex items-center gap-3 rounded-2xl bg-white/45 px-3 py-2.5 text-left ring-1 ring-white/70 transition hover:bg-white/70"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#7c6ce0] ring-1 ring-white">
                      <Icon name={TYPE_ICONS[fork.type] ?? "sparkles"} size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-[#232136]">
                        {fork.label}
                      </span>
                      <span className="block truncate text-[10.5px] text-[#8b8aa0]">{fork.why}</span>
                    </span>
                    <Icon name="forward" size={12} className="shrink-0 text-[#c0bfd4] group-hover:text-[#7c6ce0]" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Origin return — the thread never traps you */}
      <Link
        href={stepHref(origin)}
        className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-[#8b8aa0] transition hover:text-[#5b4bc4]"
      >
        <Icon name="back" size={11} />
        Return to where it began — {origin.title}
      </Link>

      {/* Keep the last step visible in aria context for screen readers */}
      <span className="sr-only" aria-live="polite">
        Currently at {lastStep.title}.
      </span>
    </CrystalSurface>
  );
}

/* ── ThreadResumeCard — the gentle invitation on /home ───────────────── */
export function ThreadResumeCard() {
  const [resume, setResume] = useState<ThreadResume | null>(null);

  // Thread state lives in localStorage — read it after mount.
  useEffect(() => {
    // Defer outside the effect body — async read of the external store.
    const frame = requestAnimationFrame(() => {
      setResume(resumeThread());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const onFollow = (fork: ThreadFork) => {
    if (!resume) return;
    extendThread(resume.thread.id, {
      nodeId: fork.id,
      title: fork.label,
      type: fork.type,
      destination: fork.destination,
      reason: fork.reason,
      cover: fork.cover,
    });
    setResume(resumeThread());
  };

  if (!resume) return null;

  return (
    <ThreadTrail
      resume={resume}
      forks={compassFor(resume.lastStep.type, extractId(resume.lastStep.destination))}
      onFollow={onFollow}
    />
  );
}

/** Destination routes look like /originals/salt-stars — pull the tail id. */
function extractId(destination: string): string {
  const parts = destination.split("/").filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : parts[0] ?? "";
}

/* ── ThreadAtlasCard — the personal exploration summary ──────────────── */
export function ThreadAtlasCard() {
  const [threads, setThreads] = useState<WithinThread[]>([]);

  useEffect(() => {
    // Defer outside the effect body — async read of the external store.
    const frame = requestAnimationFrame(() => {
      setThreads(listThreads());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (threads.length === 0) return null;

  return (
    <CrystalSurface level="soft" depth="low" className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#232136]">Your paths</p>
        <span className="text-[11px] text-[#8b8aa0]">{threads.length} saved</span>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {threads.slice(0, 4).map((thread) => (
          <li key={thread.id} className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => followThread(thread.id)}
              className="min-w-0 truncate text-left text-[12.5px] font-medium text-[#44435e] transition hover:text-[#5b4bc4]"
            >
              {thread.name}
            </button>
            <button
              type="button"
              onClick={() => {
                archiveThread(thread.id);
                setThreads(listThreads());
              }}
              className="shrink-0 text-[10.5px] text-[#8b8aa0] transition hover:text-rose-400"
              aria-label={`Archive ${thread.name}`}
            >
              Archive
            </button>
          </li>
        ))}
      </ul>
    </CrystalSurface>
  );
}
