"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ContentCard from "@/components/ui/cards/ContentCard";
import FeaturedEditorialCard from "@/components/ui/cards/FeaturedEditorialCard";
import AuriEmptyState from "@/components/ui/states/AuriEmptyState";
import AuriSuggestion from "@/components/sanctuary/AuriSuggestion";
import SearchField from "@/components/discover/SearchField";
import FilterBar from "@/components/discover/FilterBar";
import { searchEntries, entryCounts, UNIVERSE, type UniverseEntry, type UniverseFilter } from "@/lib/search";
import { staggerContainer, slideUp } from "@/lib/animations";
import ConstellationView from "@/components/discover/ConstellationView";

/** Status chip tone per shelf label — keeps cards quiet but legible. */
const statusTone = (status?: string): "mood" | "emerald" | "warm" | "neutral" | undefined => {
  if (!status) return undefined;
  if (status === "Featured") return "mood";
  if (status === "New") return "emerald";
  if (status === "Coming soon") return "warm";
  return "neutral";
};

/**
 * Discover — the front door to the whole universe.
 *
 * One search field over every shelf, a segmented filter bar, and grids that
 * respond instantly (pure functions over an entry collection — no network,
 * no waiting).
 *
 * The collection is injected by the page: the server passes live published
 * content (empty → honest empty states), and `entries` falls back to the
 * static catalog when nothing is provided — one surface, two honest data
 * sources, zero duplicated UI.
 */
export default function DiscoverExperience({ entries }: { entries?: UniverseEntry[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UniverseFilter>("All");
  const [view, setView] = useState<"grid" | "constellation">("grid");
  const [serendipity, setSerendipity] = useState<{ id: string; title: string; creatorName: string | null; username: string; category: string | null; coverGradient: string | null; coverEmoji: string | null; whyThis: string; source: "saved_category" | "new_voice" }[] | null>(null);
  const [serendipityLoading, setSerendipityLoading] = useState(true);
  const [serendipityDismissed, setSerendipityDismissed] = useState(false);

  // Serendipity — genuine unexpected discovery, fetched once on mount.
  // Only shown when not searching and not dismissed.
  useEffect(() => {
    if (serendipityDismissed) return;

    fetch("/api/serendipity")
      .then(async (res) => {
        if (!res.ok) return [];
        const data = await res.json();
        return data.ok ? (data.items ?? []) : [];
      })
      .then((items) => {
        setSerendipity(items);
        setSerendipityLoading(false);
      })
      .catch(() => {
        setSerendipity([]);
        setSerendipityLoading(false);
      });
  }, [serendipityDismissed]);

  const collection = entries ?? UNIVERSE;
  const serverDriven = entries !== undefined;
  const counts = useMemo(() => entryCounts(collection), [collection]);

  const results = useMemo(() => searchEntries(collection, query, filter), [collection, query, filter]);
  const searching = query.trim().length > 0;
  const browsing = !searching;

  // Editorial rails for the untouched browse state — Featured + New.
  const featured = useMemo(() => collection.filter((entry) => entry.statusLabel === "Featured"), [collection]);
  const fresh = useMemo(() => collection.filter((entry) => entry.statusLabel === "New").slice(0, 8), [collection]);

  return (
    <Container>
      {/* Search — the whole universe behind one field */}
      <div className="mx-auto max-w-2xl">
        <SearchField value={query} onChange={setQuery} autoFocus />
      </div>

      <div className="mt-8">
        <FilterBar active={filter} onChange={setFilter} counts={counts} />
      </div>

      {/* View toggle — Grid or Constellation */}
      {!searching && (
        <div className="mt-6 flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[rgba(var(--mood-rgb),0.6)]">
            View
          </span>
          <div className="flex items-center rounded-xl border border-white/[0.14] bg-white/[0.03] p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                view === "grid"
                  ? "bg-white/[0.12] text-white ring-1 ring-[rgba(var(--mood-rgb),0.5)]"
                  : "text-[rgba(var(--mood-rgb),0.4)] hover:bg-white/[0.06]"
              }`}
            >
              <Icon name="book" size={13} />
            </button>
            <button
              type="button"
              onClick={() => setView("constellation")}
              aria-label="Constellation view"
              aria-pressed={view === "constellation"}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                view === "constellation"
                  ? "bg-white/[0.12] text-white ring-1 ring-[rgba(var(--mood-rgb),0.5)]"
                  : "text-[rgba(var(--mood-rgb),0.4)] hover:bg-white/[0.06]"
              }`}
            >
              <Icon name="sparkles" size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Serendipity — this crossed your path */}
      {!searching && !serendipityDismissed && (
        <div className="mt-12">
          {serendipityLoading ? (
            <div className="flex items-center gap-3 text-xs text-gray-400/70">
              <span className="h-3 w-3 rounded-full border-[2px] border-current animate-spin" />
              <span>Something unexpected is gathering…</span>
            </div>
          ) : serendipity && serendipity.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[linear-gradient(135deg,#a78bfa_0%,#34d399_100%)] flex items-center justify-center">
                    <Icon name="sparkles" size={14} className="text-white" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a78bfa]">
                    This crossed your path
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSerendipityDismissed(true)}
                  aria-label="Dismiss serendipity suggestion"
                  className="rounded-full p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon name="close" size={12} />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {serendipity.map((item) => (
                  <ContentCard
                    key={item.id}
                    title={item.title}
                    creator={item.creatorName ?? item.username ?? "Unknown"}
                    description={item.whyThis}
                    meta={item.category ?? undefined}
                    href={`/content/${item.id}`}
                    cover={{
                      gradient: item.coverGradient ?? "from-white/10 via-white/5 to-transparent",
                      emoji: item.coverEmoji ?? "✦",
                    }}
                    variant="compact"
                    badges={[
                      {
                        label: item.source === "saved_category" ? "Matches your taste" : "A new voice",
                        tone: item.source === "saved_category" ? "emerald" : "mood",
                      },
                    ]}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500/60 py-4">
              <span aria-hidden>✦</span>
              <span>The path is quiet here. Explore a shelf instead.</span>
              <span aria-hidden>✦</span>
            </div>
          )}
        </div>
      )}
      {browsing && filter === "All" && (
        <>
          <div className="mt-12">
            <AuriSuggestion />
          </div>

          {featured.length > 0 && (
            <div className="mt-16">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
                    Featured
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.02em]">
                    Right now, in WithIn
                  </h2>
                </div>
              </div>
              <div className="mt-6 gap-8 sm:flex sm:items-end">
                {featured.length > 0 && (
                  <FeaturedEditorialCard
                    key={featured[0].id}
                    title={featured[0].title}
                    description={featured[0].description}
                    category={featured[0].category}
                    creator={featured[0].by}
                    cover={{
                      gradient: featured[0].gradient,
                      emoji: featured[0].emoji,
                      src: featured[0].src,
                      alt: featured[0].title,
                    }}
                    href={featured[0].href}
                    delay={0.06}
                    className="md:w-[60%]"
                  />
                )}
                {featured.slice(1).length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {featured.slice(1, 4).map((entry, index) => (
                      <ContentCard
                        key={entry.id}
                        title={entry.title}
                        creator={entry.by}
                        description={entry.description}
                        meta={entry.meta}
                        href={entry.href}
                        cover={{ gradient: entry.gradient, emoji: entry.emoji, src: entry.src, alt: entry.title }}
                        badges={[{ label: "Featured", tone: "mood" as const }]}
                        delay={0.12 + index * 0.06}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {fresh.length > 0 && (
            <div className="mt-16">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
                    New
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.02em]">
                    Fresh in the universe
                  </h2>
                </div>
              </div>
              <div className="mt-6 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {fresh.map((entry) => (
                  <div key={entry.id} className="w-64 shrink-0">
                    <ContentCard
                      title={entry.title}
                      creator={entry.by}
                      meta={entry.meta}
                      href={entry.href}
                      variant="compact"
                      cover={{ gradient: entry.gradient, emoji: entry.emoji, src: entry.src, alt: entry.title }}
                      badges={[{ label: "New", tone: "emerald" as const }]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Results */}
      <div className="mt-12 min-h-[30vh]">
        {view === "constellation" && !searching && results.length > 0 ? (
          <ConstellationView
            entries={results as unknown as { id: string; title: string; category: string; by: string; description: string; gradient: string; emoji: string; href: string; tags: string[]; moods: string[] }[]}
            className="pb-20"
          />
        ) : results.length > 0 ? (
          <motion.div
            key={`${filter}-${query}`}
            variants={staggerContainer(0.05, 0.08)}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {results.map((entry, index) => (
              <motion.div key={entry.id} variants={slideUp} className="h-full">
                <ContentCard
                  title={entry.title}
                  creator={entry.by}
                  description={entry.description}
                  meta={entry.meta}
                  href={entry.href}
                  cover={{ gradient: entry.gradient, emoji: entry.emoji, src: entry.src, alt: entry.title }}
                  badges={
                    entry.statusLabel
                      ? [{ label: entry.statusLabel, tone: statusTone(entry.statusLabel) ?? "neutral" }]
                      : undefined
                  }
                  delay={index * 0.02}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={searching ? "empty" : "browse"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {searching ? (
                <AuriEmptyState
                  message={`I looked everywhere — nothing in the ${filter === "All" ? "universe" : filter.toLowerCase()} answers "${query.trim()}".`}
                  detail="Try a mood, a place, a feeling — or wander a shelf instead."
                  action={
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setQuery("");
                        setFilter("All");
                      }}
                    >
                      <span className="mr-1.5" aria-hidden>✦</span>
                      Find something
                    </Button>
                  }
                />
              ) : (
                <AuriEmptyState
                  message={
                    serverDriven
                      ? "The universe is still being born — nothing has been published yet."
                      : "This corner is still being shaped — it'll be ready soon."
                  }
                  detail={
                    serverDriven
                      ? "When creators publish their first work, it will gather here."
                      : "Meanwhile, the rest of the universe is open."
                  }
                  action={
                    <Button href="/discover" variant="outline" size="md">
                      <Icon name="refresh" size={14} className="mr-1.5" />
                      Show everything
                    </Button>
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {searching && results.length > 0 && (
        <p className="mt-8 text-center text-xs text-gray-600">
          {results.length} {results.length === 1 ? "thing" : "things"} found
          {serverDriven ? "." : " — all kept in this browser, nothing sent anywhere."}
        </p>
      )}
    </Container>
  );
}
