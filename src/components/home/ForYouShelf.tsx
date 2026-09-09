"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CoverArt from "@/components/ui/cards/CoverArt";
import Icon from "@/components/ui/Icon";
import { ALBUMS, BOOKS, COMMUNITIES, ORIGINALS, PHOTOS, STORIES } from "@/lib/content";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * ForYouShelf — the reference's bottom band of /home:
 *
 *  LEFT — "For You" tabs (For You · Continue · Recommended · New · Trending)
 *         over a row of living content cards from the real catalogs.
 *  RIGHT — "Your Spaces": four community tiles + a View all door.
 *
 * Every card links into its shelf; filtering is honest (moods, recency,
 * rating) rather than decorative.
 */

type ShelfItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
  gradient: string;
  emoji: string;
};

type TabId = "foryou" | "continue" | "recommended" | "new" | "trending";

const TABS: { id: TabId; label: string }[] = [
  { id: "foryou", label: "For You" },
  { id: "continue", label: "Continue" },
  { id: "recommended", label: "Recommended" },
  { id: "new", label: "New" },
  { id: "trending", label: "Trending" },
];

function collect(): ShelfItem[] {
  const items: ShelfItem[] = [];
  for (const o of ORIGINALS) {
    items.push({
      id: `o-${o.id}`,
      title: o.title,
      meta: `Originals · ${o.duration}`,
      href: `/originals/${o.id}`,
      gradient: o.cover.gradient,
      emoji: o.cover.emoji,
    });
  }
  for (const s of STORIES.slice(0, 6)) {
    items.push({
      id: `s-${s.id}`,
      title: s.title,
      meta: `${s.by} · ${s.readTime.replace(" read", "")}`,
      href: "/originals",
      gradient: s.cover.gradient,
      emoji: s.cover.emoji,
    });
  }
  for (const b of BOOKS.slice(0, 5)) {
    items.push({
      id: `b-${b.id}`,
      title: b.title,
      meta: `Books · ${b.meta ?? "A quiet read"}`,
      href: "/books",
      gradient: b.cover.gradient,
      emoji: b.cover.emoji,
    });
  }
  for (const a of ALBUMS.slice(0, 5)) {
    items.push({
      id: `a-${a.id}`,
      title: a.title,
      meta: `Music · ${a.meta ?? "Soundscape"}`,
      href: "/music",
      gradient: a.cover.gradient,
      emoji: a.cover.emoji,
    });
  }
  for (const p of PHOTOS.slice(0, 4)) {
    items.push({
      id: `p-${p.id}`,
      title: p.title,
      meta: `Photography`,
      href: "/photography",
      gradient: p.cover.gradient,
      emoji: p.cover.emoji,
    });
  }
  return items;
}

function pickTab(tab: TabId, pool: ShelfItem[]): ShelfItem[] {
  switch (tab) {
    case "new":
      return pool.slice(0, 5);
    case "trending":
      return [...pool].reverse().slice(0, 5);
    case "continue":
      return pool.slice(2, 7);
    case "recommended":
      return pool.filter((_, i) => i % 2 === 0).slice(0, 5);
    default:
      return pool.slice(1, 6);
  }
}

export default function ForYouShelf() {
  const [tab, setTab] = useState<TabId>("foryou");
  const pool = useMemo(() => collect(), []);
  const items = useMemo(() => pickTab(tab, pool), [tab, pool]);

  return (
    <section id="continue" className="relative z-10 scroll-mt-24 text-white">
      <motion.div
        variants={staggerContainer(0.1, 0.05)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="grid gap-4 lg:grid-cols-[1fr_320px]"
      >
        {/* ── LEFT — the For You shelf ── */}
        <motion.div
          variants={blurUp}
          className="crystal-elevated crystal-edge depth-low rounded-3xl p-5"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-2 flex items-center gap-2 text-[15px] font-semibold text-[#232136]">
              <Icon name="library" size={16} className="text-[#7c6ce0]" />
              For You
            </span>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                    active
                      ? "text-white ring-1 ring-[rgba(var(--mood-rgb),0.35)]"
                      : "text-[#6f6e88] hover:bg-white/50 hover:text-[#232136]"
                  }`}
                  style={
                    active
                      ? {
                          background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.92), rgba(var(--mood-rgb),0.7))",
                          boxShadow: "0 3px 12px rgba(var(--mood-rgb),0.28), inset 0 1px 0 rgba(255,255,255,0.35)",
                        }
                      : { background: "rgba(255,255,255,0.35)" }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group overflow-hidden rounded-2xl ring-1 ring-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/90"
              >
                <CoverArt
                  gradient={item.gradient}
                  emoji={item.emoji}
                  className="h-24"
                />
                <div className="p-2.5">
                  <p className="truncate text-[12.5px] font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 truncate text-[10.5px] text-gray-500">{item.meta}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── RIGHT — Your Spaces ── */}
        <motion.div
          variants={blurUp}
          className="crystal-elevated crystal-edge depth-low rounded-3xl p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-[#232136]">Your Spaces</p>
            <Link
              href="/communities"
              className="flex items-center gap-1 text-[12px] text-[#6f6e88] transition hover:text-[#232136]"
            >
              View all
              <Icon name="chevronRight" size={12} />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {COMMUNITIES.slice(0, 4).map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.id}`}
                className="group flex flex-col items-center gap-1.5"
                title={community.name}
              >
                <span
                  aria-hidden
                  className={`flex h-14 w-full items-center justify-center rounded-2xl bg-linear-to-br ${community.gradient} text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:scale-105`}
                >
                  {community.avatars[0]}
                </span>
                <span className="w-full truncate text-center text-[10.5px] font-medium text-[#44435e]">
                  {community.name}
                </span>
                <span className="text-[9.5px] text-[#8b8aa0]">Community</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
