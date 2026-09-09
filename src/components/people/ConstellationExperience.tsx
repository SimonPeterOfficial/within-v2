"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CrystalSurface } from "@/components/within/crystal/Crystal";
import Icon from "@/components/ui/Icon";
import {
  buildConstellation,
  focusConstellationNode,
  relationLabel,
  constellationStats,
  type ConstellationNode,
  type ConstellationKind,
} from "@/lib/universe/constellation-engine";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * ConstellationExperience — the Human Constellation.
 *
 * A curated, permission-aware discovery landscape over the public creative
 * work of WithIn. NOT a follower leaderboard, NOT a social graph — the sky
 * shows creators, their works, the communities gathered around them, and
 * the four worlds the work lives in, connected only by real relationships.
 *
 * Interaction model:
 *   tap a node  → its neighborhood unfolds (the focus)
 *   tap again   → back to the whole sky
 *   the legend  → filters by kind
 *
 * The canvas is never the only way in: a structured, screen-reader-first
 * list of every node and its relationships mirrors the sky below it.
 */

const KIND_META: Record<ConstellationKind, { label: string; icon: "star" | "book" | "users" | "globe"; tone: string }> = {
  creator: { label: "Creators", icon: "star", tone: "#7c6ce0" },
  work: { label: "Works", icon: "book", tone: "#4aa8c9" },
  community: { label: "Communities", icon: "users", tone: "#d484c4" },
  world: { label: "Worlds", icon: "globe", tone: "#5b9bc9" },
};

export default function ConstellationExperience() {
  const prefersReducedMotion = useReducedMotionSafe();
  const constellation = useMemo(() => buildConstellation(), []);
  const stats = useMemo(() => constellationStats(), []);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<ConstellationKind | "all">("all");

  const focus = useMemo(
    () => (focusId ? focusConstellationNode(focusId) : null),
    [focusId]
  );

  const visibleNodes = useMemo(() => {
    if (focus) return focus.nodes;
    if (kindFilter === "all") return constellation.nodes;
    return constellation.nodes.filter((n) => n.kind === kindFilter);
  }, [constellation.nodes, focus, kindFilter]);

  const visibleEdges = useMemo(() => {
    if (focus) return focus.edges;
    if (kindFilter === "all") return constellation.edges;
    const ids = new Set(visibleNodes.map((n) => n.id));
    return constellation.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  }, [constellation.edges, focus, kindFilter, visibleNodes]);

  return (
    <div className="mx-auto max-w-5xl">
      {/* ── Summary ── */}
      <p className="text-center text-[13px] text-[#6f6e88]">
        {stats.creators} creators · {stats.works} works · {stats.communities} communities ·{" "}
        {stats.worlds} worlds — connected by {stats.edges} real relationships.
      </p>

      {/* ── Legend / filters ── */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter the constellation">
        <button
          type="button"
          onClick={() => setKindFilter("all")}
          aria-pressed={kindFilter === "all"}
          className={`crystal-focus rounded-full px-3.5 py-1.5 text-[12px] font-semibold ring-1 transition ${
            kindFilter === "all"
              ? "bg-[#232136] text-white ring-[#232136]"
              : "bg-white/50 text-[#44435e] ring-white/70 hover:bg-white/75"
          }`}
        >
          Everything
        </button>
        {(Object.keys(KIND_META) as ConstellationKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => setKindFilter(kind)}
            aria-pressed={kindFilter === kind}
            className={`crystal-focus flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold ring-1 transition ${
              kindFilter === kind
                ? "bg-[#232136] text-white ring-[#232136]"
                : "bg-white/50 text-[#44435e] ring-white/70 hover:bg-white/75"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: KIND_META[kind].tone }} aria-hidden />
            {KIND_META[kind].label}
          </button>
        ))}
      </div>

      {/* ── The sky ── */}
      <CrystalSurface level="soft" depth="high" sheen className="mt-5 overflow-hidden rounded-[28px]">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
          {/* Ambient depth behind the sky */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 300px at 30% 20%, rgba(124,108,224,0.14), transparent 60%), radial-gradient(500px 280px at 75% 70%, rgba(74,168,201,0.12), transparent 55%)",
            }}
          />

          {/* Edges — soft lines, honest relationships */}
          <svg aria-hidden className="absolute inset-0 h-full w-full">
            {visibleEdges.map((edge) => {
              const a = visibleNodes.find((n) => n.id === edge.from);
              const b = visibleNodes.find((n) => n.id === edge.to);
              if (!a || !b) return null;
              const highlighted =
                focus && (edge.from === focus.center.id || edge.to === focus.center.id);
              return (
                <line
                  key={`${edge.from}-${edge.to}-${edge.relation}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={highlighted ? "rgba(124,108,224,0.55)" : "rgba(91,75,196,0.16)"}
                  strokeWidth={highlighted ? 1.6 : 1}
                  strokeDasharray={edge.relation === "KIN" ? "3 3" : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* Nodes — floating crystal points */}
          <AnimatePresence>
            {visibleNodes.map((node, index) => {
              const isFocus = focus?.center.id === node.id;
              const dimmed = focus !== null && !isFocus && !focus.edges.some(
                (e) => e.from === node.id || e.to === node.id
              );
              return (
                <motion.button
                  key={node.id}
                  type="button"
                  onClick={() => setFocusId(isFocus ? null : node.id)}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: dimmed ? 0.25 : 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                  }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.45, delay: index * 0.015, ease: [0.16, 1, 0.3, 1] }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  aria-label={`${node.title} — ${node.subtitle}. Show connections.`}
                  aria-pressed={isFocus}
                >
                  <span
                    className={`flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:-translate-y-0.5 ${
                      isFocus ? "h-14 w-14 text-2xl" : "h-10 w-10 text-lg"
                    }`}
                    style={{
                      background: "rgba(255,255,255,0.62)",
                      boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.85), 0 3px 10px rgba(91,75,196,${isFocus ? 0.28 : 0.12})`,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span aria-hidden>{node.emoji}</span>
                  </span>
                  <span
                    className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/80 px-2 py-0.5 text-[10.5px] font-semibold text-[#232136] opacity-0 ring-1 ring-white/70 backdrop-blur transition-opacity group-hover:opacity-100 ${
                      isFocus ? "opacity-100" : ""
                    }`}
                  >
                    {node.title}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {/* Focus ribbon — where am I */}
          <AnimatePresence>
            {focus && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                className="absolute left-4 top-4 max-w-[280px]"
              >
                <div className="rounded-2xl bg-white/75 px-4 py-3 ring-1 ring-white/80 backdrop-blur">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8b8aa0]">
                    <Icon name="discover" size={11} className="text-[#7c6ce0]" />
                    Focused on
                  </p>
                  <p className="mt-1 truncate font-display text-[15px] font-medium text-[#232136]">
                    {focus.center.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFocusId(null)}
                    className="crystal-focus mt-1.5 text-[11px] font-medium text-[#5b4bc4] underline-offset-2 hover:underline"
                  >
                    Back to the whole sky
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scale note — the sky is curated, not a popularity map */}
          <p className="absolute bottom-3 right-4 text-[10px] font-medium text-[#8b8aa0]">
            A curated landscape, not a popularity map.
          </p>
        </div>
      </CrystalSurface>

      {/* ── Focus details — the neighborhood, in words ── */}
      <AnimatePresence>
        {focus && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4"
          >
            <CrystalSurface level="soft" depth="medium" className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
                {KIND_META[focus.center.kind].label} · connections
              </p>
              <p className="mt-1 font-display text-lg font-medium text-[#232136]">
                {focus.center.title}
              </p>
              <p className="mt-0.5 text-[12.5px] text-[#6f6e88]">{focus.center.subtitle}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {focus.relationships.map(({ relation, other }) => (
                  <li key={`${relation}-${other.id}`}>
                    <Link
                      href={other.href}
                      onClick={() => setFocusId(other.id)}
                      className="group flex items-center gap-3 rounded-2xl bg-white/45 px-3 py-2.5 ring-1 ring-white/60 transition hover:bg-white/70"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/80 text-base ring-1 ring-white">
                        <span aria-hidden>{other.emoji}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px] font-semibold text-[#232136]">
                          {other.title}
                        </span>
                        <span className="block truncate text-[10.5px] text-[#8b8aa0]">
                          {relationLabel(relation, "out")}
                        </span>
                      </span>
                      <Icon
                        name="forward"
                        size={12}
                        className="ml-auto shrink-0 text-[#c0bfd4] transition group-hover:translate-x-0.5 group-hover:text-[#7c6ce0]"
                      />
                    </Link>
                  </li>
                ))}
                {focus.relationships.length === 0 && (
                  <li className="text-[12px] text-[#8b8aa0]">
                    No mapped connections yet — a quiet corner of the sky.
                  </li>
                )}
              </ul>
            </CrystalSurface>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── The structured mirror — non-visual equivalent ── */}
      <details className="mt-4 rounded-3xl bg-white/40 ring-1 ring-white/60">
        <summary className="cursor-pointer px-5 py-3.5 text-[12.5px] font-semibold text-[#44435e]">
          Browse the constellation as a list — every node and relationship, in words
        </summary>
        <div className="max-h-[420px] overflow-y-auto px-5 pb-5">
          {constellation.nodes.map((node) => (
            <ListNode key={node.id} node={node} onFocus={setFocusId} />
          ))}
        </div>
      </details>
    </div>
  );
}

/* ── One node in the structured list ────────────────────────────────── */
function ListNode({ node, onFocus }: { node: ConstellationNode; onFocus: (id: string) => void }) {
  const relationships = useMemo(() => {
    const focus = focusConstellationNode(node.id);
    return focus?.relationships ?? [];
  }, [node.id]);

  return (
    <div className="border-t border-white/60 py-3 first:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <Link href={node.href} className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[#232136] hover:text-[#5b4bc4]">
            <span aria-hidden>{node.emoji}</span>
            <span className="truncate">{node.title}</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8b8aa0]">
              {node.kind}
            </span>
          </span>
          <span className="mt-0.5 block truncate pl-6 text-[11.5px] text-[#8b8aa0]">
            {node.subtitle}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => onFocus(node.id)}
          className="crystal-focus shrink-0 rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-[#44435e] ring-1 ring-white/70 transition hover:bg-white/90"
        >
          Show in sky
        </button>
      </div>
      {relationships.length > 0 && (
        <p className="mt-1.5 pl-6 text-[11px] leading-relaxed text-[#6f6e88]">
          {relationships
            .map((r) => `${relationLabel(r.relation, "out")} ${r.other.title}`)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
