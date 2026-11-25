import {
  getRealOverviewMetrics,
  getRealUserGrowth,
  getRealContentEngagement,
} from "@/lib/admin/real-data";

export const dynamic = "force-dynamic";

function BarChart({
  data,
  title,
  emptyLabel,
  color = "rgba(168, 85, 247, 0.5)",
  height = 160,
}: {
  data: { label: string; value: number }[];
  title: string;
  emptyLabel: string;
  color?: string;
  height?: number;
}) {
  const max = data.reduce((m, d) => Math.max(m, d.value), 0);
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      {data.length === 0 ? (
        <div
          className="flex items-center justify-center text-center text-[13px] text-gray-500"
          style={{ height }}
        >
          {emptyLabel}
        </div>
      ) : (
        <div className="flex items-end gap-1.5" style={{ height }}>
          {data.map((point) => (
            <div
              key={point.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              title={`${point.label}: ${point.value}`}
            >
              <div
                className="w-full rounded-t-sm transition-all duration-700 ease-out"
                style={{
                  height: `${max > 0 ? (point.value / max) * 100 : 0}%`,
                  background: color,
                  minHeight: point.value > 0 ? 2 : 0,
                }}
              />
              <span className="mt-1 text-[9px] text-gray-600">{point.label.slice(5)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-gray-500">Total: {total}</span>
        <span className="text-gray-600">
          {data.length > 0 ? `${data[0].label} → ${data[data.length - 1].label}` : "No window"}
        </span>
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  let metrics: Awaited<ReturnType<typeof getRealOverviewMetrics>> | null = null;
  let userGrowth: Awaited<ReturnType<typeof getRealUserGrowth>> = [];
  let engagement: Awaited<ReturnType<typeof getRealContentEngagement>> = [];
  let error: string | null = null;

  try {
    [metrics, userGrowth, engagement] = await Promise.all([
      getRealOverviewMetrics(),
      getRealUserGrowth(30),
      getRealContentEngagement(30),
    ]);
  } catch {
    error = "Couldn't load analytics. Try again shortly.";
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70">
        Analytics
      </p>
      <h2 className="mb-2 font-display text-2xl font-medium tracking-[-0.02em] text-white">
        Platform Analytics
      </h2>
      <p className="mb-8 text-sm text-gray-500">
        Live counts from the database. Charts cover the last 30 days.
      </p>

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-6 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total users" value={metrics?.totalUsers ?? 0} />
            <StatCard label="Active (last 30 days)" value={metrics?.activeUsers ?? 0} />
            <StatCard label="Published content" value={metrics?.publishedContent ?? 0} />
            <StatCard label="Content views" value={metrics?.totalViews ?? 0} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BarChart
              data={userGrowth}
              title="New users"
              emptyLabel="No new users in the last 30 days."
              color="rgba(52, 211, 153, 0.5)"
            />
            <BarChart
              data={engagement}
              title="Content views"
              emptyLabel="No content views in the last 30 days."
              color="rgba(168, 85, 247, 0.5)"
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value.toLocaleString("en-US")}</p>
    </div>
  );
}
