"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { PICKS, type PickItem } from "@/lib/content";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * FeedPanel — the reference's "For You" window.
 *
 * CONTENT + SPACE + TRANSPARENCY: one large editorial moment (the
 * featured pick, full-bleed scene, quiet metadata) beside a short list
 * of further picks. Tabs switch the lens (For You / Following /
 * Trending) over the same real catalog — Following/Trending show honest
 * subsets until real social data exists. Actions are quiet liquid
 * controls; nothing covers the imagery.
 */

type FeedTab = "For You" | "Following" | "Trending";

/** Editorial hero for the window — the first pick of the active tab. */
function heroFor(tab: FeedTab): PickItem {
  if (tab === "Trending") return PICKS.find((p) => p.badges.some((b) => b.label === "New")) ?? PICKS[0];
  if (tab === "Following") return PICKS[1] ?? PICKS[0];
  return PICKS[0];
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

export default function FeedPanel() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [tab, setTab] = useState<FeedTab>("For You");

  const hero = heroFor(tab);
  const side = PICKS.filter((p) => p.id !== hero.id).slice(0, 3);

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
        <div className="flex items-center gap-1 pb-2 text-[#8b8aa0]">
          <button type="button" aria-label="Grid view" className="crystal-focus rounded-lg p-1.5 transition hover:bg-white/50">
            <Icon name="dashboard" size={14} />
          </button>
          <button type="button" aria-label="List view" className="crystal-focus rounded-lg p-1.5 transition hover:bg-white/50">
            <Icon name="menu" size={14} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1.35fr_1fr]">
        {/* ── The editorial moment — full-bleed scene, quiet UI ────── */}
        <motion.article
          key={hero.id}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="group relative min-h-[300px] overflow-hidden rounded-[20px]"
        >
          <div aria-hidden className="absolute inset-0" style={{ background: SCENE[hero.kind] ?? SCENE.story }} />
          <span
            aria-hidden
            className="absolute right-6 top-8 text-6xl opacity-90 transition-transform duration-700 group-hover:scale-105"
            style={{ filter: "drop-shadow(0 4px 12px rgba(40,40,80,0.35))" }}
          >
            {hero.cover.emoji}
          </span>

          {/* The image speaks — the UI stays out of the way */}
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
                {hero.cover.emoji}
              </span>
              {hero.creator} · {hero.meta}
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
              <button
                type="button"
                aria-label="Like"
                className="crystal-focus rounded-full bg-white/18 p-2 text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/32"
              >
                <Icon name="heart" size={13} />
              </button>
              <button
                type="button"
                aria-label="Comment"
                className="crystal-focus rounded-full bg-white/18 p-2 text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/32"
              >
                <Icon name="message" size={13} />
              </button>
              <button
                type="button"
                aria-label="Save"
                className="crystal-focus rounded-full bg-white/18 p-2 text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/32"
              >
                <Icon name="book" size={13} />
              </button>
              <span className="ml-auto flex items-center gap-2.5 text-[11px] font-medium text-white/75">
                <span className="flex items-center gap-1">
                  <Icon name="heart" size={11} /> 4.8k
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="message" size={11} /> 321
                </span>
              </span>
            </div>
          </div>
        </motion.article>

        {/* ── The side list — three quiet rows ─────────────────────── */}
        <ul className="flex flex-col gap-2.5">
          {side.map((pick, index) => (
            <motion.li
              key={pick.id}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={pick.href.startsWith("#") ? "/explore" : pick.href}
                className="group flex items-center gap-3 rounded-[18px] bg-white/45 p-2.5 ring-1 ring-white/60 transition hover:bg-white/75"
              >
                <span
                  aria-hidden
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${pick.cover.gradient} text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]`}
                >
                  {pick.cover.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-[#2c2a48]">
                    {pick.title}
                  </span>
                  <span className="block truncate text-[11px] text-[#8b8aa0]">
                    {pick.kind} · {pick.meta}
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
      </div>
    </section>
  );
}
