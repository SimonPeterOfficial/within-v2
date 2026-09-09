"use client";

import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { siderealTime, culminatingConstellation } from "@/lib/atlas/cosmos";

/**
 * StarClock — the hours told by stars instead of the sun. Shows true local
 * sidereal time (approximately), the constellation currently culminating,
 * and how far star-time has drifted from clock-time.
 */
export default function StarClock() {
  const now = useAtlasTime();
  const lst = siderealTime(now);
  const culminating = culminatingConstellation(now);

  const lstHours = Math.floor(lst / 15);
  const lstMinutes = Math.floor(((lst / 15) % 1) * 60);
  const lstSeconds = Math.floor((((lst / 15) % 1) * 3600) % 60);

  const localTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="clock"
        title="Star Clock"
        line="Sidereal time — the hours the stars keep."
      />

      {/* The sidereal readout — the big instrument number */}
      <div className="mt-6 tabular-nums">
        <p className="font-display text-4xl font-medium tracking-tight text-white">
          {String(lstHours).padStart(2, "0")}
          <span className="text-white/40">:</span>
          {String(lstMinutes).padStart(2, "0")}
          <span className="text-white/40">:</span>
          <span className="text-[rgba(var(--mood-rgb),0.9)]">{String(lstSeconds).padStart(2, "0")}</span>
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-gray-600">
          Local sidereal time
        </p>
      </div>

      {/* Clock vs stars */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
        <span className="text-[12px] text-gray-500">Your clock</span>
        <span className="text-[13px] tabular-nums text-gray-300">{localTime}</span>
      </div>

      {/* Culminating constellation */}
      <div className="mt-4 rounded-2xl border border-[rgba(var(--mood-rgb),0.12)] bg-[rgba(var(--mood-rgb),0.05)] px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Highest in the sky</p>
        <p className="mt-1 font-display text-lg text-white">{culminating.name}</p>
        <p className="mt-0.5 text-[12px] italic leading-snug text-gray-400/85">
          {culminating.story}
        </p>
      </div>
    </GlassCard>
  );
}
