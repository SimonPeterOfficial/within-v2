"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getUniverseState, getUniverseDepth, getDominantInterest } from "@/lib/universe/state";
import { getGraphStats } from "@/lib/explore/graph";

type RealOverviewMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalCreators: number;
  publishedContent: number;
  openReports: number;
  totalSubscriptions: number;
  totalViews: number;
  totalCommunities: number;
};

type RealActivityEvent = {
  id: string;
  type: string;
  title: string;
  entity: string;
  timestamp: string;
};

type AdminDataResponse = {
  ok: boolean;
  metrics: RealOverviewMetrics;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
  recentContent: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const METRIC_DEFS: Array<{
  key: keyof RealOverviewMetrics;
  label: string;
  icon: string;
}> = [
  { key: "totalUsers", label: "Total Users", icon: "👥" },
  { key: "activeUsers", label: "Active (30d)", icon: "🟢" },
  { key: "totalCreators", label: "Creators", icon: "✨" },
  { key: "publishedContent", label: "Published Content", icon: "📚" },
  { key: "totalCommunities", label: "Communities", icon: "🤝" },
  { key: "openReports", label: "Open Reports", icon: "⚠️" },
  { key: "totalSubscriptions", label: "Subscriptions", icon: "💳" },
  { key: "totalViews", label: "Total Views", icon: "👁️" },
];

/**
 * The first screen — answers: "How is WithIn doing?"
 * Every number comes from the database via /api/admin/data.
 */
export default function OverviewDashboard() {
  const [realMetrics, setRealMetrics] = useState<RealOverviewMetrics | null>(null);
  const [realActivity, setRealActivity] = useState<RealActivityEvent[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function loadRealData() {
      try {
        const res = await fetch("/api/admin/data", { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data: AdminDataResponse = await res.json();
        setRealMetrics(data.metrics);
        const activity: RealActivityEvent[] = [
          ...data.recentUsers.map((u) => ({
            id: `user-${u.id}`,
            type: "user_joined",
            title: "New user joined",
            entity: u.name,
            timestamp: u.createdAt,
          })),
          ...data.recentContent.map((c) => ({
            id: `content-${c.id}`,
            type: "content_created",
            title: "Content created",
            entity: c.title,
            timestamp: c.createdAt,
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRealActivity(activity);
        setState("ready");
      } catch (error) {
        console.error("[ADMIN] Failed to load real data:", error);
        setState("error");
      }
    }
    loadRealData();
  }, []);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header greeting */}
      <motion.div variants={fadeUp} className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70">
          Command Center
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-white md:text-4xl">
          WithIn is alive.
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {state === "error"
            ? "Live data is unavailable right now."
            : "Live platform data from the database."}
        </p>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METRIC_DEFS.map((metric) => (
          <motion.div
            key={metric.key}
            variants={fadeUp}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {realMetrics ? realMetrics[metric.key].toLocaleString() : "—"}
                </p>
              </div>
              <span className="text-xl opacity-60">{metric.icon}</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-gray-400">
                {realMetrics ? "live" : state === "error" ? "unavailable" : "loading"}
              </span>
              <span className="text-[10px] text-gray-600">from the database</span>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.02] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
          </motion.div>
        ))}
      </motion.div>

      {/* Activity + summary row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Activity feed */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            <Link
              href="/admin/audit"
              className="text-[11px] text-gray-500 transition-colors hover:text-gray-300"
            >
              View all →
            </Link>
          </div>
          {realActivity.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-gray-500">
              {state === "error" ? "Couldn't load activity." : "No activity yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {realActivity.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-white/[0.02]"
                >
                  <span className="mt-0.5 text-sm">•</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white/90">{event.title}</p>
                    <p className="truncate text-[11px] text-gray-500">{event.entity}</p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] text-gray-600">
                    {event.timestamp.slice(0, 10)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Analytics summary */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Analytics</h3>
            <Link
              href="/admin/analytics"
              className="text-[11px] text-gray-500 transition-colors hover:text-gray-300"
            >
              Full report →
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { label: "Published content", value: realMetrics?.publishedContent },
              { label: "Creators", value: realMetrics?.totalCreators },
              { label: "Content views", value: realMetrics?.totalViews },
              { label: "Communities", value: realMetrics?.totalCommunities },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2.5"
              >
                <span className="text-[12px] text-gray-400">{row.label}</span>
                <span className="text-sm font-semibold text-white">
                  {row.value === undefined ? "—" : row.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Universe State — dev observability */}
      <UniverseStatePanel />

      {/* Moderation summary */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Moderation Queue</h3>
          <Link
            href="/admin/moderation"
            className="text-[11px] text-gray-500 transition-colors hover:text-gray-300"
          >
            Manage →
          </Link>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-4 text-center">
          <p className="text-2xl font-semibold text-amber-400">
            {realMetrics ? realMetrics.openReports : "—"}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">Open reports awaiting review</p>
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
      <div className="mb-4 flex items-center justify-between">
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
      <p className={`mt-1.5 ${sizeClass} font-semibold text-white/85`}>{display}</p>
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
