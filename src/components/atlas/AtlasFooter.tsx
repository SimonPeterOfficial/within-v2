"use client";

import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { moonPhase, siderealTime, auroraForecast } from "@/lib/atlas/cosmos";

/**
 * AtlasFooter — the closing bar: three live readings (moon, sidereal time,
 * aurora index) plus the observatory's quiet sign-off.
 */
export default function AtlasFooter() {
  const now = useAtlasTime();
  const moon = moonPhase(now);
  const lst = siderealTime(now);
  const aurora = auroraForecast(now);

  const lstHours = Math.floor(lst / 15);
  const lstMinutes = Math.floor(((lst / 15) % 1) * 60);

  return (
    <footer className="relative z-10 border-t border-white/[0.05] bg-black/40 py-10 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
        <p className="font-display text-lg text-white/90">Atlas</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] text-gray-500/85">
          <span>{moon.glyph} {moon.name}</span>
          <span>✦ LST {lstHours}h {lstMinutes}m</span>
          <span>Kp {aurora.kp.toFixed(1)} · {aurora.levelLabel}</span>
        </div>
        <p className="text-[11px] text-gray-600/80">
          Computed locally · nothing leaves this room
        </p>
      </div>
    </footer>
  );
}
