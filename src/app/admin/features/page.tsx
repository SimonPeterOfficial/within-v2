"use client";

import { useState } from "react";
import { MOCK_FEATURES } from "@/lib/admin/data";

const CATEGORY_STYLES: Record<string, string> = {
  core: "text-purple-400 bg-purple-400/10",
  content: "text-emerald-400 bg-emerald-400/10",
  social: "text-cyan-400 bg-cyan-400/10",
  experimental: "text-amber-400 bg-amber-400/10",
};

export default function FeaturesPage() {
  const [flags, setFlags] = useState(() =>
    MOCK_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: f.enabled }), {} as Record<string, boolean>)
  );

  const toggle = (id: string) => setFlags((f) => ({ ...f, [id]: !f[id] }));

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Feature Flags
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-2">
        Feature Flags
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Control feature availability. All flags are local/mock — ready for a real feature flag service.
      </p>

      <div className="space-y-2">
        {MOCK_FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <button
              type="button"
              onClick={() => toggle(feature.id)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                flags[feature.id] ? "bg-emerald-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  flags[feature.id] ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{feature.name}</p>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${CATEGORY_STYLES[feature.category]}`}>
                  {feature.category}
                </span>
                <span className="text-[10px] text-gray-600">{feature.environment}</span>
              </div>
              <p className="text-[12px] text-gray-500 mt-0.5">{feature.description}</p>
            </div>
            <span className={`text-[11px] font-medium ${flags[feature.id] ? "text-emerald-400" : "text-gray-500"}`}>
              {flags[feature.id] ? "ON" : "OFF"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
