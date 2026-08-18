"use client";

import { COMMUNITIES } from "@/lib/content";

export default function CommunitiesPage() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Communities
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-6">
        Community Management
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {COMMUNITIES.map((community) => (
          <div
            key={community.id}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white">{community.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{community.tagline}</p>
              </div>
              <span className="text-[11px] text-gray-500">{community.members.toLocaleString()} members</span>
            </div>
            <div className="flex gap-1">
              {community.avatars.map((emoji, i) => (
                <span key={i} className="text-sm">{emoji}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
