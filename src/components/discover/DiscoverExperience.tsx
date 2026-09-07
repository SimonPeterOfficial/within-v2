"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import ContentCard from "@/components/ui/cards/ContentCard";
import AuriEmptyState from "@/components/ui/states/AuriEmptyState";
import AuriSuggestion from "@/components/sanctuary/AuriSuggestion";
import SearchField from "@/components/discover/SearchField";
import FilterBar from "@/components/discover/FilterBar";
import { searchEntries, entryCounts, UNIVERSE, type UniverseEntry, type UniverseFilter } from "@/lib/search";
import { staggerContainer, slideUp } from "@/lib/animations";

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

      {/* Editorial browse state — curated rails, then everything */}
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
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featured.slice(0, 4).map((entry, index) => (
                  <ContentCard
                    key={entry.id}
                    title={entry.title}
                    creator={entry.by}
                    description={entry.description}
                    meta={entry.meta}
                    href={entry.href}
                    cover={{ gradient: entry.gradient, emoji: entry.emoji }}
                    badges={[{ label: "Featured", tone: "mood" as const }]}
                    delay={index * 0.06}
                  />
                ))}
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
                      cover={{ gradient: entry.gradient, emoji: entry.emoji }}
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
        {results.length > 0 ? (
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
                  cover={{ gradient: entry.gradient, emoji: entry.emoji }}
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
