import { getRealAuditLog } from "@/lib/admin/real-data";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  let entries: Awaited<ReturnType<typeof getRealAuditLog>> = [];
  let error: string | null = null;

  try {
    entries = await getRealAuditLog(200);
  } catch {
    error = "Couldn't load the audit log. Try again shortly.";
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70">
        Audit
      </p>
      <h2 className="mb-2 font-display text-2xl font-medium tracking-[-0.02em] text-white">
        Audit Log
      </h2>
      <p className="mb-8 text-sm text-gray-500">
        Administrative actions recorded by the system, newest first.
      </p>

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-6 text-sm text-rose-300">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                    No administrative actions recorded yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm text-white">{entry.actorName ?? "System"}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{entry.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {entry.targetType ? `${entry.targetType} · ${entry.targetId?.slice(0, 8)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">
                      {entry.createdAt.slice(0, 10)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
