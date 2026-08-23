"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  OVERVIEW_METRICS,
  MOCK_ACTIVITY,
  MOCK_USER_GROWTH,
  MOCK_CONTENT_ENGAGEMENT,
} from "@/lib/admin/data";
import { getUniverseState, getUniverseDepth, getDominantInterest } from "@/lib/universe/state";
import { getGraphStats } from "@/lib/explore/graph";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

/**
 * Mini bar chart — pure CSS, no chart library.
 * Lightweight, editorial, premium.
 */
function MiniChart({
  data,
  color = "rgba(168, 85, 247, 0.6)",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((point, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{
              height: `${(point.value / max) * 100}%`,
              background: color,
              minHeight: 2,
            }}
          />
          <span className="text-[9px] text-gray-600">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * The first screen — answers: "How is WithIn doing?"
 *
 * Top: greeting + status.
 * Then: 8 key metrics.
 * Then: activity + mini charts.
 * Then: moderation queue summary.
 */
export default function OverviewDashboard() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header greeting */}
      <motion.div variants={fadeUp} className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70">
          Command Center
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-white md:text-4xl">
          WithIn is alive.
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Real-time overview of the platform. All data is mock — ready for API integration.
        </p>
      </motion.div>

      {/* Metric cards */}
      <motion.div
        variants={stagger}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {OVERVIEW_METRICS.map((metric) => (
          <motion.div
            key={metric.label}
            variants={fadeUp}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {metric.value}
                </p>
              </div>
              <span className="text-xl opacity-60">{metric.icon}</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={`text-[11px] font-medium ${
                  metric.changeType === "up"
                    ? "text-emerald-400"
                    : metric.changeType === "down"
                    ? "text-rose-400"
                    : "text-gray-400"
                }`}
              >
                {metric.changeType === "up" ? "↑" : metric.changeType === "down" ? "↓" : "→"}{" "}
                {metric.change}
              </span>
              <span className="text-[10px] text-gray-600">vs last month</span>
            </div>
            {/* Subtle glow on hover */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.02] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
          </motion.div>
        ))}
      </motion.div>

      {/* Activity + Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Activity feed */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            <Link href="/admin/audit" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_ACTIVITY.slice(0, 6).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-white/[0.02]"
              >
                <span className="mt-0.5 text-sm">{event.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/90">{event.title}</p>
                  <p className="text-[11px] text-gray-500 truncate">{event.entity}</p>
                </div>
                <span className="text-[10px] text-gray-600 whitespace-nowrap">{event.timestamp}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Analytics preview */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Analytics</h3>
            <Link href="/admin/analytics" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
              Full report →
            </Link>
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-[11px] text-gray-500 mb-2">User Growth</p>
              <MiniChart data={MOCK_USER_GROWTH} color="rgba(52, 211, 153, 0.5)" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 mb-2">Content Engagement</p>
              <MiniChart data={MOCK_CONTENT_ENGAGEMENT} color="rgba(168, 85, 247, 0.5)" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Universe State — dev observability */}
      <UniverseStatePanel />

      {/* Moderation queue summary */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Moderation Queue</h3>
          <Link href="/admin/moderation" className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
            Manage →
          </Link>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-4 text-center">
            <p className="text-2xl font-semibold text-amber-400">3</p>
            <p className="mt-1 text-[11px] text-gray-500">Needs Review</p>
          </div>
          <div className="flex-1 rounded-lg border border-rose-500/20 bg-rose-500/[0.05] p-4 text-center">
            <p className="text-2xl font-semibold text-rose-400">1</p>
            <p className="mt-1 text-[11px] text-gray-500">Escalated</p>
          </div>
          <div className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-4 text-center">
            <p className="text-2xl font-semibold text-emerald-400">2</p>
            <p className="mt-1 text-[11px] text-gray-500">Resolved Today</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Universe State panel — development observability.
 * Clearly marked as local/demo data. Shows how the living universe
 * system is tracking this browser's exploration.
 */
function UniverseStatePanel() {
  const result = useState(() => {
    try {
      return [getUniverseState(), getGraphStats()] as const;
    } catch {
      return null;
    }
  });

  if (!result[0]) return null;
  const [universeState, graphData] = result[0];

  const depth = getUniverseDepth(universeState);
  const dominant = getDominantInterest(universeState);
  const feel = (() => {
    if (depth === 0) return "just waking";
    if (depth <= 2) return "gently unfolding";
    if (depth <= 4) return "deeply alive";
    return "infinitely aware";
  })();

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Universe State</h3>
          <p className="text-[10px] text-gray-600">Local browser state — not production data</p>
        </div>
        <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-medium text-purple-400/70">
          {feel}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox label="Universe Depth" value={depth} icon="🌌" />
        <StatBox label="Routes Visited" value={universeState.visitedRoutes.length} icon="🗺️" />
        <StatBox label="Discoveries" value={universeState.totalDiscoveries} icon="✨" />
        <StatBox label="Auri Encounters" value={universeState.auriEncounters} icon="🦉" />
        <StatBox label="Revisits" value={universeState.revisitCount} icon="🔄" />
        <StatBox label="Time Spent" value={`${Math.floor(universeState.timeSpent / 60)}m`} icon="⏱️" />
        <StatBox label="Content Types" value={universeState.contentTypesSeen.length} icon="📦" />
        <StatBox label="Dominant" value={dominant ?? "—"} icon="🎯" isText />
      </div>

      {/* Universe flags */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Flag label="Door discovered" active={universeState.doorDiscovered} />
        <Flag label="Between visited" active={universeState.betweenVisited} />
        <Flag label="Within visited" active={universeState.withinVisited} />
        {graphData && (
          <>
            <Flag label={`${graphData.nodeCount} graph nodes`} active />
            <Flag label={`${graphData.edgeCount} graph edges`} active />
          </>
        )}
      </div>
    </motion.div>
  );
}

function StatBox({
  label,
  value,
  icon,
  isText,
}: {
  label: string;
  value: string | number;
  icon: string;
  isText?: boolean;
}) {
  const sizeClass = isText ? "text-sm" : "text-lg";
  const display = isText
    ? String(value).charAt(0).toUpperCase() + String(value).slice(1)
    : value;
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-50">{icon}</span>
        <span className="text-[10px] font-medium text-gray-500">{label}</span>
      </div>
      <p className={`mt-1.5 ${sizeClass} font-semibold text-white/85`}>
        {display}
      </p>
    </div>
  );
}

function Flag({ label, active }: { label: string; active: boolean }) {
  const spanClass = active
    ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1 text-[10px] font-medium text-emerald-400/70 transition-colors"
    : "inline-flex items-center gap-1.5 rounded-full border border-white/[0.04] bg-white/[0.01] px-2.5 py-1 text-[10px] font-medium text-gray-600 transition-colors";
  const dotClass = active ? "h-1.5 w-1.5 rounded-full bg-emerald-400/60" : "h-1.5 w-1.5 rounded-full bg-gray-700";
  return (
    <span className={spanClass}>
      <span className={dotClass} />
      {label}
    </span>
  );
}
