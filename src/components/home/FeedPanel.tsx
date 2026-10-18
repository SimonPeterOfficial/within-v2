"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import type { UniverseEntry } from "@/lib/search";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { WithInEmpty, WithInError } from "@/components/ui/WithInStates";

/**
 * FeedPanel — the "For You" window.
 *
 * Grounded in real published content fetched server-side by the home page
 * (lib/content-service `listPublishedContent`) and passed in as `entries`.
 * Mock catalog entries are no longer presented as discoveries.
 *
 * Tabs switch the lens (For You / Following / Trending):
 *   - For You: a truthful default feed of eligible published content
 *     (newest first). No personalization is claimed — "For You" is the tab
 *     label, not a promise of a personalized algorithm.
 *   - Following: honest unavailable state — no following relationship
 *     query exists, so this tab cannot show content from followed accounts.
 *   - Trending: honest unavailable state — no engagement-based ranking
 *     exists, so this tab cannot surface or label anything as trending.
 *
 * Loading: content is supplied by server rendering, so there is no client
 * fetch and no loading flash on first paint. Retrieval failures are passed
 * in as `error` and rendered honestly (never as mock entries, never as
 * an empty result).
 */

type FeedTab = "For You" | "Following" | "Trending";

interface FeedPanelProps {
  /** Published, public content entries, newest first. */
  entries: UniverseEntry[];
  /** Set when the server could not retrieve published content. */
  error?: string | null;
}

const SCENE: Record<string, string> = {
  story:
    "radial-gradient(circle at 32% 45%, rgba(255,215,170,0.55) 0%, transparent 42%), linear-gradient(180deg, #e8b888 0%, #c88878 45%, #6a5a78 100%)",
  book:
    "radial-gradient(circle at 60% 30%, rgba(255,235,200,0.5) 0%, transparent 45%), linear-gradient(180deg, #a8c0b8 0%, #88a8a0 50%, #48605a 100%)",
  album:
    "radial-gradient(circle at 45% 40%, rgba(255,200,180,0.5) 0%, transparent 45%), linear-gradient(180deg, #e8b0a0 0%, #b88890 50%, #5a4868 100%)",
  photography:
    "radial-gradient(circle at 35% 35%, rgba(255,225,190,0.55) 0%, transparent 40%), linear-gradient(180deg, #90a8c8 0%, #7890b0 55%, #404e68 100%)",
  series:
    "radial-gradient(circle at 50% 45%, rgba(255,210,170,0.5) 0%, transparent 45%), linear-gradient(180deg, #b8a8d0 0%, #9080b0 50%, #4a4068 100%)",
};

function sceneFor(entry: UniverseEntry): string {
  return SCENE[entry.category.toLowerCase()] ?? SCENE.story;
}

type UnavailableTab = Extract<FeedTab, "Following" | "Trending">;

/** Honest unavailable-state panel for the Following and Trending tabs. */
function UnavailableTabPanel({ tab }: { tab: UnavailableTab }) {
  const config: Record<UnavailableTab, { title: string; description: string }> = {
    Following: {
      title: "Following feed",
      description:
        "Follow people to see their published content here. Following relationships aren't available yet, so this tab can't show content from accounts you follow.",
    },
    Trending: {
      title: "Trending",
      description:
        "Trending discovery isn't available yet. There's no engagement-based ranking to surface popular content, so this tab can't label anything as trending.",
    },
  } as const;

  const { title, description } = config[tab];

  return (
    <WithInEmpty
      icon="users"
      title={title}
      description={description}
      action={{ label: "Open the full feed", href: "/explore" }}
    />
  );
}

export default function FeedPanel({ entries, error }: FeedPanelProps) {
  const prefersReducedMotion = useReducedMotionSafe();
  const router = useRouter();
  const [tab, setTab] = useState<FeedTab>("For You");

  const handleRetry = () => router.refresh();

  // ── Retrieval failure: honest, never mock, never silent ──
  if (error) {
    return (
      <WithInError
        title="The feed didn't load"
        description="Published content couldn't be retrieved right now."
        onRetry={handleRetry}
      />
    );
  }

  // ── No published content: an empty database is not a software error ──
  if (entries.length === 0) {
    return (
      <WithInEmpty
        icon="sparkles"
        title="No published content yet"
        description="The feed is empty — no published work is available to discover at the moment."
        action={{ label: "Open the full feed", href: "/explore" }}
      />
    );
  }

  // ── Real published content ──
  const hero = entries[0];
  const side = entries.slice(1, 4);
  const isUnavailableTab = tab === "Following" || tab === "Trending";

  return (
    <section
      aria-label="For you"
      className="crystal-elevated crystal-edge depth-medium crystal-sheen relative overflow-hidden rounded-[26px]"
    >
      {/* Header + tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-white/50 px-5 pt-4">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Feed lens">
          {(["For You", "Following", "Trending"] as FeedTab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={`crystal-focus relative rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                  active ? "text-[#2c2a48]" : "text-[#8b8aa0] hover:text-[#44435e]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="feedtab-light"
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-[2.5px] rounded-full"
                    style={{
                      background: "linear-gradient(90deg, rgba(139,125,235,0.9), rgba(91,75,196,0.7))",
                      boxShadow: "0 0 8px rgba(139,125,235,0.5)",
                    }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1.35fr_1fr]">
        {isUnavailableTab ? (
          <UnavailableTabPanel tab={tab} />
        ) : (
          <>
            {/* ── The editorial moment — full-bleed scene, quiet UI ── */}
            <motion.article
              key={hero.id}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative min-h-[300px] overflow-hidden rounded-[20px]"
            >
              <div aria-hidden className="absolute inset-0" style={{ background: sceneFor(hero) }} />
              <span
                aria-hidden
                className="absolute right-6 top-8 text-6xl opacity-90 transition-transform duration-700 group-hover:scale-105"
                style={{ filter: "drop-shadow(0 4px 12px rgba(40,40,80,0.3))" }}
              >
                {hero.emoji}
              </span>

              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/3"
                style={{ background: "linear-gradient(180deg, transparent, rgba(20,18,40,0.72) 80%)" }}
              />

              <div className="relative flex h-full min-h-[300px] flex-col justify-end p-5">
                <p className="flex items-center gap-2 text-[11px] font-medium text-white/85">
                  <span
                    aria-hidden
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[10px] ring-1 ring-white/40 backdrop-blur"
                  >
                    {hero.emoji}
                  </span>
                  {hero.by} · {hero.meta}
                </p>
                <h3 className="mt-2 font-display text-[26px] font-medium leading-tight text-white drop-shadow-[0_1px_10px_rgba(20,18,40,0.5)]">
                  {hero.title}
                </h3>
                <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-white/85">
                  {hero.description}
                </p>

                {/* Quiet liquid actions */}
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={hero.href.startsWith("#") ? "/explore" : hero.href}
                    className="crystal-focus inline-flex items-center gap-1.5 rounded-full bg-white/22 px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-white/35 backdrop-blur-md transition hover:bg-white/35"
                  >
                    Open
                    <Icon name="forward" size={11} />
                  </Link>
                </div>
              </div>
            </motion.article>

            {/* ── The side list — three quiet rows ── */}
            <ul className="flex flex-col gap-2.5">
              {side.map((entry, index) => (
                <motion.li
                  key={entry.id}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={entry.href.startsWith("#") ? "/explore" : entry.href}
                    className="group flex items-center gap-3 rounded-[18px] bg-white/45 p-2.5 ring-1 ring-white/60 transition hover:bg-white/75"
                  >
                    <span
                      aria-hidden
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${entry.gradient} text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]`}
                    >
                      {entry.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-[#2c2a48]">
                        {entry.title}
                      </span>
                      <span className="block truncate text-[11px] text-[#8b8aa0]">
                        {entry.category} · {entry.meta}
                      </span>
                    </span>
                    <span className="mr-1 flex shrink-0 items-center gap-1 rounded-full bg-white/60 p-2 text-[#5b4bc4] ring-1 ring-white/70 transition group-hover:bg-white">
                      <Icon name="forward" size={12} />
                    </span>
                  </Link>
                </motion.li>
              ))}
              <li>
                <Link
                  href="/explore"
                  className="crystal-focus mt-1 block rounded-[18px] px-3 py-2.5 text-center text-[12px] font-semibold text-[#5b4bc4] transition hover:bg-white/50"
                >
                  Open the full feed
                </Link>
              </li>
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
