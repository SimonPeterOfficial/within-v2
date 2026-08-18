"use client";

import { MOCK_AUDIT } from "@/lib/admin/data";

const RESULT_STYLES: Record<string, string> = {
  success: "text-emerald-400 bg-emerald-400/10",
  denied: "text-rose-400 bg-rose-400/10",
  pending: "text-amber-400 bg-amber-400/10",
};

export default function AuditPage() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Audit
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-2">
        Audit Log
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Administrative actions and their outcomes. Critical for production architecture.
      </p>

      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Admin</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Action</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Target</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Timestamp</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Result</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_AUDIT.map((entry) => (
              <tr key={entry.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm text-white">{entry.admin}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{entry.action}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{entry.target}</td>
                <td className="px-4 py-3 text-[13px] text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${RESULT_STYLES[entry.result]}`}>
                    {entry.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
