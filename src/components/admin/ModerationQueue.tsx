"use client";

import { useState } from "react";
import Link from "next/link";

export type ModerationReport = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  severity: string;
  status: string;
  createdAt: string;
  reporterName: string;
};

const TABS = ["Open", "Reviewing", "Resolved", "Dismissed"] as const;
type Tab = (typeof TABS)[number];

const TAB_STATUS: Record<Tab, string> = {
  Open: "open",
  Reviewing: "reviewing",
  Resolved: "resolved",
  Dismissed: "dismissed",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  critical: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const STATUS_COLORS: Record<string, string> = {
  open: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  reviewing: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  resolved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  dismissed: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function ModerationQueue({ reports }: { reports: ModerationReport[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("Open");
  const status = TAB_STATUS[activeTab];

  const filtered = reports.filter((r) => r.status === status);
  const countFor = (s: string) => reports.filter((r) => r.status === s).length;

  return (
    <div>
      <p className="mb-6 text-[12px] leading-relaxed text-gray-500">
        Reports filed by people in the world. Content reports are actioned from the
        item itself — open the content to approve, hide, or reject it.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-white/[0.06]">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "border-emerald-400 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
            <span className="ml-2 text-[10px] text-gray-600">{countFor(TAB_STATUS[tab])}</span>
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-8 text-center text-sm text-gray-500">
            No reports in this queue.
          </div>
        ) : (
          filtered.map((report) => (
            <div
              key={report.id}
              className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[11px] font-medium capitalize text-gray-400">
                    {report.targetType}
                  </span>
                  <span className="text-[10px] text-gray-600">·</span>
                  <span className="text-[11px] text-gray-500">
                    reported by {report.reporterName}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{report.reason}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                      SEVERITY_COLORS[report.severity] ?? SEVERITY_COLORS.medium
                    }`}
                  >
                    {report.severity}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                      STATUS_COLORS[report.status] ?? STATUS_COLORS.open
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-[10px] text-gray-600">{report.createdAt.slice(0, 10)}</span>
                </div>
              </div>
              {report.targetType === "content" ? (
                <Link
                  href={`/content/${report.targetId}`}
                  className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Open content
                </Link>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
