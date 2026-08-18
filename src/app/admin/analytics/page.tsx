"use client";

import {
  MOCK_USER_GROWTH,
  MOCK_CONTENT_ENGAGEMENT,
  MOCK_CREATOR_ACTIVITY,
  MOCK_COMMUNITY_ACTIVITY,
} from "@/lib/admin/data";

function BarChart({
  data,
  title,
  color = "rgba(168, 85, 247, 0.5)",
  height = 160,
}: {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((point, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
            <div
              className="w-full rounded-t-sm transition-all duration-700 ease-out"
              style={{
                height: `${(point.value / max) * 100}%`,
                background: color,
                minHeight: 2,
              }}
            />
            <span className="text-[9px] text-gray-600 mt-1">{point.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-gray-500">Total: {data.reduce((a, b) => a + b.value, 0).toLocaleString()}</span>
        <span className="text-emerald-400">↑ {Math.round(((data[data.length - 1].value - data[0].value) / data[0].value) * 100)}%</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-[11px] text-emerald-400">{change}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Analytics
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-2">
        Platform Analytics
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        All data is mock — structured for future API integration.
      </p>

      {/* Summary stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Sessions" value="28.4K" change="↑ 24% vs last month" />
        <StatCard label="Avg. Session" value="8m 42s" change="↑ 12% vs last month" />
        <StatCard label="Content Views" value="124.5K" change="↑ 38% vs last month" />
        <StatCard label="Completion Rate" value="67%" change="↑ 5% vs last month" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart data={MOCK_USER_GROWTH} title="User Growth" color="rgba(52, 211, 153, 0.5)" />
        <BarChart data={MOCK_CONTENT_ENGAGEMENT} title="Content Engagement" color="rgba(168, 85, 247, 0.5)" />
        <BarChart data={MOCK_CREATOR_ACTIVITY} title="Creator Activity" color="rgba(34, 211, 238, 0.5)" />
        <BarChart data={MOCK_COMMUNITY_ACTIVITY} title="Community Activity" color="rgba(245, 158, 11, 0.5)" />
      </div>
    </div>
  );
}
