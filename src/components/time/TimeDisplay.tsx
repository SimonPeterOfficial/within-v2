"use client";

import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import {
  getWithinTime,
  formatWithinTime,
} from "@/lib/within-time";
import { useEnvironment } from "@/lib/environment";

/**
 * TimeDisplay — the current local time, rendered in the user's own locale
 * and timezone. Hydration-safe: the server renders a neutral state and the
 * client resolves the real moment on first paint.
 *
 * Never fabricates a time. Always reads the real clock through
 * useAtlasTime (a shared, hydration-safe heartbeat) and formats through
 * Intl.DateTimeFormat so the user's locale and timezone are respected.
 */
export default function TimeDisplay() {
  const now = useAtlasTime();
  const { moodId } = useEnvironment();

  const context = getWithinTime(now);

  const periodLabel = context.period
    ? context.period.charAt(0).toUpperCase() + context.period.slice(1)
    : null;

  const timeString = formatWithinTime(now, {
    locale: context.locale,
    timeZone: context.timeZone,
    style: "long",
  });

  const dateString = formatWithinTime(now, {
    locale: context.locale,
    timeZone: context.timeZone,
    style: "short",
  });

  return (
    <div className="flex flex-col items-center gap-1">
      <time dateTime={now.toISOString()} className="font-mono tabular-nums text-[56px] font-medium leading-none text-white drop-shadow-[0_0_24px_rgba(0,0,0,0.5)]">
        {timeString}
      </time>
      <p className="text-[13px] font-medium tracking-wider uppercase text-[rgba(var(--mood-rgb),0.75)]">
        {periodLabel}
      </p>
      <p className="text-[12px] text-[rgba(255,255,255,0.55)]">
        {dateString}
      </p>
      {context.timeZone && (
        <p className="text-[10px] text-[rgba(255,255,255,0.4)]">
          {context.timeZone}
        </p>
      )}
      {moodId && (
        <p className="mt-1 text-[10px] italic text-[rgba(255,255,255,0.45)]">
          The room is tuned to your {moodId} mood.
        </p>
      )}
    </div>
  );
}
