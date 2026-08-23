"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  getJourney,
  getJourneyStats,
  clearJourney,
  type JourneyNode,
} from "@/lib/explore";
import DepthLayers from "@/components/effects/DepthLayers";
import StarField from "@/components/sanctuary/StarField";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import Icon from "@/components/ui/Icon";
import { blurUp, staggerContainer } from "@/lib/animations";

/* ── Type colors ─────────────────────────────────────────────────────── */

const TYPE_COLORS: Record<string, string> = {
  original: "rgba(139, 92, 246, 0.8)",
  book: "rgba(212, 176, 120, 0.8)",
  music: "rgba(34, 211, 238, 0.8)",
  photo: "rgba(251, 146, 60, 0.8)",
  creator: "rgba(52, 211, 153, 0.8)",
  community: "rgba(236, 72, 153, 0.8)",
  reflection: "rgba(99, 102, 241, 0.8)",
  "auri-moment": "rgba(168, 85, 247, 0.8)",
};

/* Rarity modifiers — how the constellation distinguishes node types */

const RARITY_GLOW: Record<string, { r: number; opacity: number; color: string }> = {
  discovered: { r: 2.5, opacity: 0.15, color: "" }, // default — uses TYPE_COLORS
  unexpected: { r: 3.5, opacity: 0.25, color: "rgba(168, 130, 255, 0.3)" },
  rare: { r: 4.5, opacity: 0.35, color: "rgba(52, 211, 153, 0.35)" },
  between: { r: 3, opacity: 0.12, color: "rgba(100, 100, 160, 0.2)" }, // dimmer, obscured
};

function getNodeRarity(node: JourneyNode): "discovered" | "unexpected" | "rare" | "between" {
  // Infer rarity from metadata tags if available
  const tags = (node as JourneyNode & { rarity?: string }).rarity;
  if (tags === "between") return "between";
  if (tags === "rare") return "rare";
  if (tags === "unexpected") return "unexpected";
  // Heuristic: if reason contains unusual words, it's likely unexpected
  if (node.reason.includes("unexpected") || node.reason.includes("strange")) return "unexpected";
  if (node.reason.includes("hidden") || node.reason.includes("between")) return "between";
  return "discovered";
}

const TYPE_EMOJIS: Record<string, string> = {
  original: "🎬",
  book: "📚",
  music: "🎧",
  photo: "📷",
  creator: "✨",
  community: "🤝",
  reflection: "🪞",
  "auri-moment": "🦉",
};

/* ── Constellation node positions (deterministic) ────────────────────── */

function computeNodePositions(nodes: JourneyNode[]): { x: number; y: number }[] {
  if (nodes.length === 0) return [];

  const positions: { x: number; y: number }[] = [];
  const centerX = 50;
  const centerY = 50;

  if (nodes.length === 1) {
    positions.push({ x: centerX, y: centerY });
    return positions;
  }

  // Spiral layout — each node spirals outward
  for (let i = 0; i < nodes.length; i++) {
    const angle = i * 2.399; // golden angle
    const radius = Math.sqrt(i) * 12;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    positions.push({
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y)),
    });
  }

  return positions;
}

/* ── Constellation SVG ───────────────────────────────────────────────── */

function Constellation({
  nodes,
  positions,
  selectedId,
  onSelect,
}: {
  nodes: JourneyNode[];
  positions: { x: number; y: number }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <div className="relative aspect-square w-full max-w-lg mx-auto">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        role="img"
        aria-label="Journey constellation — a visual map of your discoveries"
      >
        {/* Connection lines */}
        {nodes.map((node, index) => {
          if (index === 0) return null;
          const pos = positions[index];
          const parentIdx = nodes.findIndex((n) => n.id === node.parentId);
          const parentPos = parentIdx >= 0 ? positions[parentIdx] : positions[index - 1];
          if (!pos || !parentPos) return null;

          return (
            <motion.line
              key={`line-${node.id}`}
              x1={parentPos.x}
              y1={parentPos.y}
              x2={pos.x}
              y2={pos.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.15"
              initial={prefersReducedMotion ? { opacity: 1 } : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: index * 0.1 }}
            />
          );
        })}

        {/* Nodes — visually distinguished by rarity */}
        {nodes.map((node, index) => {
          const pos = positions[index];
          if (!pos) return null;
          const color = TYPE_COLORS[node.type] ?? "rgba(255,255,255,0.5)";
          const isSelected = node.id === selectedId;
          const rarity = getNodeRarity(node);
          const rarityStyle = RARITY_GLOW[rarity];
          const coreR = isSelected ? 1.8 : rarity === "rare" ? 1.6 : rarity === "unexpected" ? 1.4 : 1.2;
          const glowR = isSelected ? 4 : rarityStyle.r;
          const coreOpacity = isSelected ? 1 : rarity === "between" ? 0.4 : rarity === "rare" ? 0.95 : 0.8;
          const glowColor = rarityStyle.color || color;

          return (
            <motion.g
              key={node.id}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(node.id)}
            >
              {/* Outer glow — rarity determines size and color */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={glowR}
                fill={glowColor || color}
                opacity={isSelected ? 0.35 : rarityStyle.opacity}
                style={{ transition: "all 0.5s ease" }}
              />
              {/* Core — rare nodes pulse subtly */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={coreR}
                fill={color}
                opacity={coreOpacity}
                style={{ transition: "all 0.3s ease" }}
              />
              {/* Between nodes: subtle dashed ring to indicate obscurity */}
              {rarity === "between" && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={2.2}
                  fill="none"
                  stroke="rgba(100,100,160,0.25)"
                  strokeWidth="0.12"
                  strokeDasharray="0.5 0.3"
                  style={{ transition: "all 0.3s ease" }}
                />
              )}
              {/* Rare nodes: tiny star spikes */}
              {rarity === "rare" && !prefersReducedMotion && (
                <>
                  <line x1={pos.x - 2.5} y1={pos.y} x2={pos.x + 2.5} y2={pos.y} stroke="rgba(52,211,153,0.2)" strokeWidth="0.08" />
                  <line x1={pos.x} y1={pos.y - 2.5} x2={pos.x} y2={pos.y + 2.5} stroke="rgba(52,211,153,0.2)" strokeWidth="0.08" />
                </>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Timeline view — chronological path ──────────────────────────────── */

function Timeline({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: JourneyNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const prefersReducedMotion = useReducedMotionSafe();
  const sorted = useMemo(() => [...nodes].sort((a, b) => a.timestamp - b.timestamp), [nodes]);

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent" />

      <div className="space-y-1">
        {sorted.map((node, index) => {
          const color = TYPE_COLORS[node.type] ?? "rgba(255,255,255,0.5)";
          const isSelected = node.id === selectedId;

          return (
            <motion.button
              key={node.id}
              type="button"
              onClick={() => onSelect(node.id)}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`group relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-300 ${
                isSelected
                  ? "bg-white/[0.05]"
                  : "hover:bg-white/[0.02]"
              }`}
            >
              {/* Timeline dot */}
              <div
                className="relative mt-0.5 shrink-0"
                style={{ width: 8, height: 8 }}
              >
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: color,
                    opacity: isSelected ? 1 : 0.6,
                    boxShadow: isSelected ? `0 0 12px ${color}` : "none",
                    transition: "all 0.3s ease",
                  }}
                />
                <span
                  className="absolute -inset-1.5 rounded-full"
                  style={{
                    background: color,
                    opacity: isSelected ? 0.15 : 0,
                    transition: "all 0.3s ease",
                  }}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{TYPE_EMOJIS[node.type] ?? "✦"}</span>
                  <span className="truncate text-[12px] font-medium text-white/70 group-hover:text-white/90">
                    {node.title}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-gray-500/50">
                  {new Date(node.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Node detail panel ───────────────────────────────────────────────── */

function NodeDetail({ node, onClose }: { node: JourneyNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard tone="soft" className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{TYPE_EMOJIS[node.type] ?? "✦"}</span>
            <div>
              <h3 className="text-sm font-medium text-white/90">{node.title}</h3>
              <p className="text-[11px] text-gray-500/60">{node.type}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Close detail"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-[12px] text-gray-400/60">{node.reason}</p>

        <a
          href={node.destination}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-400/60 hover:text-emerald-300 transition-colors"
        >
          Return there <Icon name="forward" size={10} />
        </a>

        <p className="mt-2 text-[10px] text-gray-600/40">
          {new Date(node.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </GlassCard>
    </motion.div>
  );
}

/* ── View toggle ─────────────────────────────────────────────────────── */

type ViewMode = "constellation" | "timeline";

/* ── Main experience ─────────────────────────────────────────────────── */

export default function JourneyExperience() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [journey, setJourney] = useState<JourneyNode[]>(() => getJourney());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("constellation");

  const positions = computeNodePositions(journey);
  const stats = getJourneyStats();
  const selectedNode = journey.find((n) => n.id === selectedId);

  const handleClear = () => {
    clearJourney();
    setJourney([]);
    setSelectedId(null);
    setShowClearConfirm(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030a] text-white">
      <DepthLayers preset="sanctuary" particles={4} stars={16} fog={0.3} />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24">
        {/* ── Header ── */}
        <motion.div
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          animate="show"
          className="mb-12 text-center"
        >
          <motion.p
            variants={blurUp}
            className="text-[11px] font-semibold uppercase tracking-[0.5em] text-emerald-400/45"
          >
            Your journey
          </motion.p>
          <motion.h1
            variants={blurUp}
            className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.02em] md:text-5xl"
          >
            Your universe is{" "}
            <GradientText className="italic">forming</GradientText>.
          </motion.h1>
          <motion.p
            variants={blurUp}
            className="mt-4 text-[15px] leading-relaxed text-gray-400/60"
          >
            Every discovery is a star. Together they form your constellation.
          </motion.p>
        </motion.div>

        {journey.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-20"
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }
              }
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <AuriOwl size={80} state="curious" />
            </motion.div>
            <p className="mt-6 text-center text-[15px] text-gray-400/60">
              No stars yet. Your constellation begins with the first discovery.
            </p>
            <p className="mt-2 text-center text-[13px] text-gray-500/40 italic">
              &ldquo;The first step is the only one you need to decide.&rdquo;
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button href="/explore" variant="primary" size="lg">
                Start exploring
              </Button>
              <Button href="/within" variant="outline" size="lg">
                Talk to Auri
              </Button>
            </div>
            <p className="mt-8 max-w-md text-center text-[12px] italic text-gray-500/35">
              &ldquo;The first step is the only one you need to decide. The rest follows.&rdquo;
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* ── Main view ── */}
            <div>
              {/* View toggle */}
              <div className="mb-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("constellation")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
                    viewMode === "constellation"
                      ? "border border-white/[0.1] bg-white/[0.06] text-white/80"
                      : "text-gray-500/50 hover:text-gray-400/70"
                  }`}
                >
                  <Icon name="sparkles" size={12} />
                  Constellation
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
                    viewMode === "timeline"
                      ? "border border-white/[0.1] bg-white/[0.06] text-white/80"
                      : "text-gray-500/50 hover:text-gray-400/70"
                  }`}
                >
                  <Icon name="forward" size={12} />
                  Timeline
                </button>
              </div>

              {/* Constellation view */}
              {viewMode === "constellation" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <StarField count={30} seed={7} />
                  <Constellation
                    nodes={journey}
                    positions={positions}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                </motion.div>
              )}

              {/* Timeline view */}
              {viewMode === "timeline" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Timeline
                    nodes={journey}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                </motion.div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-4">
              {/* Stats */}
              <GlassCard tone="soft" className="p-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400/60">
                  Journey stats
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-bold text-white/90">{stats.totalNodes}</p>
                    <p className="text-[11px] text-gray-500/60">Discoveries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white/90">{Object.keys(stats.types).length}</p>
                    <p className="text-[11px] text-gray-500/60">Worlds visited</p>
                  </div>
                </div>

                {/* Type breakdown */}
                <div className="mt-4 space-y-1.5">
                  {Object.entries(stats.types).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-1.5">
                        <span>{TYPE_EMOJIS[type] ?? "✦"}</span>
                        <span className="text-gray-400/70 capitalize">{type}</span>
                      </span>
                      <span className="text-gray-500/50">{count}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Selected node detail */}
              <AnimatePresence>
                {selectedNode && (
                  <NodeDetail
                    node={selectedNode}
                    onClose={() => setSelectedId(null)}
                  />
                )}
              </AnimatePresence>

              {/* Recent path */}
              <GlassCard tone="soft" className="p-5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400/60">
                  Recent path
                </h3>
                <div className="mt-3 space-y-2">
                  {journey
                    .slice(-5)
                    .reverse()
                    .map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedId(node.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.03]"
                      >
                        <span className="text-sm">{TYPE_EMOJIS[node.type] ?? "✦"}</span>
                        <span className="truncate text-[12px] text-gray-400/70">{node.title}</span>
                      </button>
                    ))}
                </div>
              </GlassCard>

              {/* Clear */}
              {showClearConfirm ? (
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[12px] text-gray-400/60">Clear all stars?</p>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="ml-auto rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:bg-white/[0.08]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full rounded-xl border border-white/[0.04] bg-white/[0.01] py-2 text-[12px] text-gray-500/50 transition-colors hover:bg-white/[0.03] hover:text-gray-400/70"
                >
                  Reset journey
                </button>
              )}

              {/* Continue exploring prompt */}
              <GlassCard tone="soft" className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400/60">
                  Your constellation
                </p>
                <p className="mt-2 text-[12px] text-gray-500/50">
                  {journey.length < 5
                    ? "Every discovery adds a new star. The more you wander, the brighter it gets."
                    : journey.length < 15
                    ? "Your universe is growing. There are doors you haven't opened yet."
                    : "You've wandered far. Your constellation tells a story."
                  }
                </p>
                <div className="mt-3 flex gap-2">
                  <Button href="/explore" variant="outline" size="sm">
                    Explore more
                  </Button>
                  <Button href="/within" variant="ghost" size="sm">
                    Talk to Auri
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
