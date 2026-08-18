"use client";

import { useState } from "react";
import { MOCK_REPORTS, type AdminReport } from "@/lib/admin/data";

const TABS = ["Needs Review", "Reported", "Escalated", "Resolved"] as const;

const STATUS_MAP: Record<string, AdminReport["status"]> = {
  "Needs Review": "pending",
  Reported: "pending",
  Escalated: "escalated",
  Resolved: "resolved",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function ModerationQueue() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Needs Review");
  const statusFilter = STATUS_MAP[activeTab];

  const filtered =
    activeTab === "Reported"
      ? MOCK_REPORTS.filter((r) => r.status === "pending" || r.status === "reviewing")
      : MOCK_REPORTS.filter((r) => r.status === statusFilter);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/[0.06]">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab
                ? "text-white border-emerald-400"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab}
            <span className="ml-2 text-[10px] text-gray-600">
              {tab === "Needs Review"
                ? MOCK_REPORTS.filter((r) => r.status === "pending").length
                : tab === "Reported"
                ? MOCK_REPORTS.filter((r) => r.status === "pending" || r.status === "reviewing").length
                : tab === "Escalated"
                ? MOCK_REPORTS.filter((r) => r.status === "escalated").length
                : MOCK_REPORTS.filter((r) => r.status === "resolved").length}
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-8 text-center text-sm text-gray-500">
            No items in this queue.
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report.id}
              className="group flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-medium text-gray-400">{report.contentType}</span>
                  <span className="text-[10px] text-gray-600">·</span>
                  <span className="text-[11px] text-gray-500">{report.creator}</span>
                </div>
                <p className="text-sm font-medium text-white">{report.contentTitle}</p>
                <p className="mt-1 text-[13px] text-gray-400">{report.reason}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${SEVERITY_COLORS[report.severity]}`}>
                    {report.severity}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white">
                  Review
                </button>
                <button className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-1.5 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-500/10">
                  Approve
                </button>
                <button className="rounded-lg border border-rose-500/20 bg-rose-500/[0.05] px-3 py-1.5 text-[11px] font-medium text-rose-400 transition hover:bg-rose-500/10">
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
