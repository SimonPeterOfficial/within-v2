import ModerationQueue from "@/components/admin/ModerationQueue";
import { getRealReports } from "@/lib/admin/real-data";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  let reports: Awaited<ReturnType<typeof getRealReports>> = [];
  let error: string | null = null;

  try {
    reports = await getRealReports(100);
  } catch {
    error = "Couldn't load the moderation queue. Try again shortly.";
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70">
        Moderation
      </p>
      <h2 className="mb-6 font-display text-2xl font-medium tracking-[-0.02em] text-white">
        Review Queue
      </h2>

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-6 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <ModerationQueue
          reports={reports.map((r) => ({
            id: r.id,
            targetType: r.targetType,
            targetId: r.targetId,
            reason: r.reason,
            severity: r.severity,
            status: r.status,
            createdAt: r.createdAt,
            reporterName: r.reporterName,
          }))}
        />
      )}
    </div>
  );
}
