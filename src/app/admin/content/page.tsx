"use client";

import { useState } from "react";
import { MOCK_CONTENT } from "@/lib/admin/data";

const TYPE_FILTERS = ["All", "Original", "Book", "Album", "Photo", "Story"] as const;
const STATUS_FILTERS = ["All", "Published", "Pending", "Draft", "Flagged", "Archived"] as const;

const STATUS_STYLES: Record<string, string> = {
  published: "text-emerald-400 bg-emerald-400/10",
  pending: "text-amber-400 bg-amber-400/10",
  draft: "text-gray-400 bg-gray-400/10",
  flagged: "text-rose-400 bg-rose-400/10",
  archived: "text-gray-500 bg-gray-500/10",
};

export default function ContentPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = MOCK_CONTENT.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.creator.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Content
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-6">
        Content Management
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-white/[0.15] focus:bg-white/[0.05]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300 outline-none transition focus:border-white/[0.15]"
        >
          {TYPE_FILTERS.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300 outline-none transition focus:border-white/[0.15]"
        >
          {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
        </select>
      </div>

      {/* Content list */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-medium text-gray-400">{item.type}</span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[11px] text-gray-500">{item.category}</span>
              </div>
              <p className="text-sm font-medium text-white truncate">{item.title}</p>
              <p className="text-[11px] text-gray-500">by {item.creator}</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-gray-500">
              <span>{item.views.toLocaleString()} views</span>
              <span>{item.likes.toLocaleString()} likes</span>
              {item.reports > 0 && <span className="text-rose-400">{item.reports} reports</span>}
            </div>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[item.status]}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
