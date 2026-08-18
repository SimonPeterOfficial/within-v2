"use client";

import { useState } from "react";
import { MOCK_CREATORS } from "@/lib/admin/data";

const STATUS_STYLES: Record<string, string> = {
  verified: "text-emerald-400 bg-emerald-400/10",
  pending: "text-amber-400 bg-amber-400/10",
  suspended: "text-rose-400 bg-rose-400/10",
};

export default function CreatorsPage() {
  const [tab, setTab] = useState<"all" | "verified" | "pending">("all");
  const filtered = MOCK_CREATORS.filter((c) => tab === "all" || c.status === tab);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Creators
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-6">
        Creator Management
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/[0.06]">
        {(["all", "verified", "pending"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px capitalize ${
              tab === t ? "text-white border-emerald-400" : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {t} ({MOCK_CREATORS.filter((c) => t === "all" || c.status === t).length})
          </button>
        ))}
      </div>

      {/* Creator cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((creator) => (
          <div
            key={creator.id}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white">{creator.name}</p>
                <p className="text-[11px] text-gray-500">{creator.handle}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[creator.status]}`}>
                {creator.status}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-3">{creator.category}</p>
            <div className="flex gap-4 text-[11px] text-gray-500 mb-4">
              <span>{creator.contentCount} items</span>
              <span>{(creator.totalEngagement / 1000).toFixed(1)}K engagement</span>
              <span>{(creator.followers / 1000).toFixed(1)}K followers</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white">
                Review
              </button>
              {creator.status === "pending" && (
                <button className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-1.5 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-500/10">
                  Verify
                </button>
              )}
              {creator.status === "verified" && (
                <button className="rounded-lg border border-rose-500/20 bg-rose-500/[0.05] px-3 py-1.5 text-[11px] font-medium text-rose-400 transition hover:bg-rose-500/10">
                  Suspend
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
