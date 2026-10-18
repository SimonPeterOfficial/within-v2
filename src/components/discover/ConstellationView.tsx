"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { staggerContainer } from "@/lib/animations";
import ConstellationNode from "@/components/discover/ConstellationNode";
import ConnectionLine from "@/components/discover/ConnectionLine";

/**
 * ConstellationView — an explorable universe of connected content.
 *
 * Instead of a flat grid, content is placed as nodes in a connected
 * composition. Nodes link when they share something real:
 *   • the same creator
 *   • the same category
 *   • a shared tag
 *
 * Opening a node reveals its connections — its creator, their other works,
 * and content that sits nearby in the same shelf. A path breadcrumb at the
 * top records where you've been and always lets you return.
 *
 * This is Concept B (The Explorable Universe): a spatial metaphor built
 * entirely in CSS, no WebGL, no random placement, no fake data.
 */
type ConstellationEntry = {
  id: string;
  title: string;
  category: string;
  by: string;
  description: string;
  gradient: string;
  emoji: string;
  href: string;
  tags: string[];
  moods: string[];
};

type RelatedPreview = {
  entry: ConstellationEntry;
  reason: string;
};

type ConstellationViewProps = {
  entries: ConstellationEntry[];
  className?: string;
};

export default function ConstellationView({ entries, className = "" }: ConstellationViewProps) {
  const [path, setPath] = useState<string[]>([]); // ids in visit order
  const [opened, setOpened] = useState<string | null>(null); // node whose connections are shown

  // ── Build the real connection graph ────────────────────────────────
  // Two nodes connect when they share a creator, category, or tag.
  // These are genuine relationships from the data — nothing invented.
  const connections = useMemo(() => {
    const edges: { a: string; b: string; reason: string }[] = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];
        let reason: string | null = null;

        if (a.by === b.by && a.by) {
          reason = `by ${a.by}`;
        } else if (a.category === b.category) {
          reason = `same shelf: ${a.category}`;
        } else {
          const shared = a.tags.filter((t) => b.tags.includes(t));
          if (shared.length > 0) {
            reason = `both tagged: ${shared[0]}`;
          }
        }

        if (reason) {
          edges.push({ a: a.id, b: b.id, reason });
        }
      }
    }
    return edges;
  }, [entries]);

  // ── Deterministic spiral placement ─────────────────────────────────
  // No Math.random — positions are derived from index so the constellation
  // is stable across renders and responsive recalculations.
  const placed = useMemo(() => {
    const centerX = 50;
    const centerY = 48;
    return entries.map((entry, i) => {
      const angle = (i / entries.length) * Math.PI * 2 + (i * 0.3);
      const radius = 18 + (i / entries.length) * 34;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius * 0.6;
      // Tier: first node is hero, next few standard, rest quiet
      const tier: "hero" | "standard" | "quiet" =
        i === 0 ? "hero" : i < 4 ? "standard" : "quiet";
      return { ...entry, x, y, tier };
    });
  }, [entries]);

  // ── Related entries per node (pre-computed, no hooks in map) ───────
  const relatedByNode = useMemo(() => {
    const map = new Map<string, RelatedPreview[]>();
    for (const edge of connections) {
      const a = entries.find((e) => e.id === edge.a);
      const b = entries.find((e) => e.id === edge.b);
      if (!a || !b) continue;
      const previewA: RelatedPreview = { entry: b, reason: edge.reason };
      const previewB: RelatedPreview = { entry: a, reason: edge.reason };
      const existingA = map.get(edge.a) ?? [];
      const existingB = map.get(edge.b) ?? [];
      map.set(edge.a, [...existingA, previewA]);
      map.set(edge.b, [...existingB, previewB]);
    }
    return map;
  }, [connections, entries]);

  const onNodeOpen = useCallback((id: string) => {
    setOpened(id);
    setPath((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const onNodeClose = useCallback(() => {
    setOpened(null);
  }, []);

  const onNodeSelect = useCallback(() => {
    // The whole node links to content — navigation handled by the Link
  }, []);

  const isOnPath = (id: string) => path.includes(id);

  const relatedForOpened = useMemo(() => {
    if (!opened) return null;
    return relatedByNode.get(opened) ?? null;
  }, [opened, relatedByNode]);

  return (
    <section
      aria-label="The Constellation — connected discoveries"
      className={`
        relative overflow-hidden min-h-[500px] md:min-h-[640px]
        ${className}
      `}
    >
      {/* Path breadcrumb — continuity, always lets you return */}
      <AnimatePresence>
        {path.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.14] bg-white/[0.08] backdrop-blur-md shadow-lg"
          >
            <Icon name="chevronLeft" size={12} className="text-[rgba(var(--mood-rgb),0.7)]" />
            <span className="text-[11px] font-medium text-white/90 tracking-tight">
              Your path: {path.length} stop{path.length > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => {
                setPath([]);
                setOpened(null);
              }}
              aria-label="Return to the start"
              className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.12] border border-white/[0.2] text-[10px] text-white transition hover:bg-white/[0.25] focus-visible:ring-2 focus-visible:ring-[rgba(var(--mood-rgb),0.6)]"
            >
              <Icon name="home" size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection lines — drawn first so they sit behind nodes */}
      <motion.div
        variants={staggerContainer(0.02, 0)}
        initial="hidden"
        animate="show"
        className="absolute inset-0 pointer-events-none"
      >
        {connections.map((edge) => {
          const a = placed.find((e) => e.id === edge.a);
          const b = placed.find((e) => e.id === edge.b);
          if (!a || !b) return null;
          const active = isOnPath(edge.a) && isOnPath(edge.b);
          return (
            <ConnectionLine
              key={edge.a + "-" + edge.b}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              active={active}
            />
          );
        })}
      </motion.div>

      {/* Nodes */}
      <motion.div
        variants={staggerContainer(0.03, 0.08)}
        initial="hidden"
        animate="show"
        className="absolute inset-0"
      >
        {placed.map((entry) => {
          const nodeOpened = opened === entry.id;
          const nodeOnPath = isOnPath(entry.id);

          return (
            <ConstellationNode
              key={entry.id}
              entry={entry}
              x={entry.x}
              y={entry.y}
              tier={entry.tier}
              onPath={nodeOnPath}
              opened={nodeOpened}
              onOpen={onNodeOpen}
              onClose={onNodeClose}
              onSelect={onNodeSelect}
            />
          );
        })}
      </motion.div>

      {/* Connection preview panel — appears when a node is opened */}
      {relatedForOpened && relatedForOpened.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[420px] w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] backdrop-blur-md p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.25em] text-[rgba(var(--mood-rgb),0.75)]">
              Connected through
            </h3>
            <button
              type="button"
              onClick={onNodeClose}
              aria-label="Close connection view"
              className="rounded-full p-1 text-[rgba(var(--mood-rgb),0.6)] transition hover:bg-white/[0.1]"
            >
              <Icon name="close" size={12} />
            </button>
          </div>
          <p className="text-[11px] text-white/70 mb-3">
            Follow a real connection — each line means something shared.
          </p>
          <div className="grid gap-2">
            {relatedForOpened.map((r) => (
              <Link
                key={r.entry.id}
                href={r.entry.href}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 transition hover:bg-white/[0.08] hover:border-white/[0.18]"
              >
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-2xl"
                >
                  {r.entry.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="block truncate text-[13px] font-medium text-white">
                    {r.entry.title}
                  </h4>
                  <p className="block truncate text-[10px] text-[rgba(var(--mood-rgb),0.5)]">
                    {r.reason} · {r.entry.category}
                  </p>
                </div>
                <Icon name="forward" size={11} className="text-[rgba(var(--mood-rgb),0.5)] shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
