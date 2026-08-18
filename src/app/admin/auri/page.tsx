"use client";

import { useState } from "react";

const CONTROL_SECTIONS = [
  {
    title: "Availability",
    icon: "◉",
    controls: [
      { key: "auri_enabled", label: "Auri availability", type: "toggle" as const, default: true, description: "Enable or disable Auri across the platform" },
      { key: "auri_greeting", label: "Greeting mode", type: "select" as const, default: "subtle", options: ["subtle", "warm", "minimal"], description: "How Auri greets new visitors" },
    ],
  },
  {
    title: "Tone",
    icon: "◎",
    controls: [
      { key: "tone_preset", label: "Tone preset", type: "select" as const, default: "gentle", options: ["gentle", "neutral", "warm", "minimal"], description: "Overall personality tone" },
      { key: "suggestion_freq", label: "Suggestion frequency", type: "select" as const, default: "balanced", options: ["minimal", "balanced", "active"], description: "How often Auri offers suggestions" },
    ],
  },
  {
    title: "Safety",
    icon: "◈",
    controls: [
      { key: "crisis_detection", label: "Crisis detection", type: "toggle" as const, default: true, description: "Detect and respond to crisis-level emotional states" },
      { key: "content_filter", label: "Content safety filter", type: "toggle" as const, default: true, description: "Filter potentially harmful Auri responses" },
    ],
  },
  {
    title: "Privacy",
    icon: "◇",
    controls: [
      { key: "local_only", label: "Browser-only mode", type: "toggle" as const, default: true, description: "Keep all conversations local to the browser" },
      { key: "analytics", label: "Usage analytics", type: "toggle" as const, default: false, description: "Anonymous usage data for improvement" },
    ],
  },
];

export default function AuriPage() {
  const [settings, setSettings] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {};
    CONTROL_SECTIONS.forEach((section) =>
      section.controls.forEach((ctrl) => {
        initial[ctrl.key] = ctrl.default;
      })
    );
    return initial;
  });

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Auri
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-2">
        Auri Control Center
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        Conceptual controls for Auri&apos;s behavior. These are UI controls only — no backend integration yet.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {CONTROL_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-emerald-400/70">{section.icon}</span>
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.controls.map((ctrl) => (
                <div key={ctrl.key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-300">{ctrl.label}</p>
                    <p className="text-[11px] text-gray-500">{ctrl.description}</p>
                  </div>
                  {ctrl.type === "toggle" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({ ...s, [ctrl.key]: !s[ctrl.key] }))
                      }
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                        settings[ctrl.key] ? "bg-emerald-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          settings[ctrl.key] ? "translate-x-[22px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  ) : (
                    <select
                      value={settings[ctrl.key] as string}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, [ctrl.key]: e.target.value }))
                      }
                      className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-gray-300 outline-none"
                    >
                      {ctrl.options?.map((opt) => (
                        <option key={opt} value={opt} className="capitalize">{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
