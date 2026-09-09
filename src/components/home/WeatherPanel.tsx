"use client";

import { useSyncExternalStore } from "react";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import {
  sunPosition,
  climateEstimate,
  forecastEstimate,
  PHASE_LABEL,
  dayCharacter,
} from "@/lib/atlas/sky";

const subscribeAlways = () => () => {};
const getClientLocale = () => Intl.DateTimeFormat().resolvedOptions().locale;
const getServerLocale = () => "en-US";

/**
 * WeatherPanel — the reference's top-right glass forecast.
 *
 * DATA HONESTY: WithIn has no weather API. The panel shows what an
 * on-device climate ESTIMATE can truthfully say — the seasonal band for
 * temperate latitudes (labeled as an estimate), the real sky phase, and
 * the next four days' plausible ranges. Never presented as a live reading.
 */
export default function WeatherPanel() {
  const now = useAtlasTime();
  const locale = useSyncExternalStore(subscribeAlways, getClientLocale, getServerLocale);

  const sun = sunPosition(now);
  const climate = climateEstimate(now);
  const forecast = forecastEstimate(now);
  const clouds = dayCharacter(now); // deterministic per day

  const condition = sun.phase === "night" ? "Clear night" : clouds > 0.66 ? "Partly cloudy" : clouds > 0.33 ? "Soft clouds" : "Clear sky";
  // The temperature follows the day's actual curve — the honest estimate.
  const currentC = Math.round(climate.lowC + (climate.highC - climate.lowC) * climate.daytime01);

  const dayLabels = ["Today", "Thu", "Fri", "Sat", "Sun"];
  const startIndex = 0;

  return (
    <aside
      aria-label="Weather"
      className="crystal-elevated crystal-edge depth-medium crystal-sheen relative overflow-hidden rounded-[26px] p-5"
    >
      {/* The sky's live tint passes through the glass */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            sun.phase === "night"
              ? "linear-gradient(180deg, rgba(70,75,130,0.5), rgba(110,115,180,0.3))"
              : sun.phase === "golden" || sun.phase === "dawn" || sun.phase === "dusk"
                ? "linear-gradient(180deg, rgba(250,215,170,0.5), rgba(255,235,210,0.25))"
                : "linear-gradient(180deg, rgba(180,215,250,0.55), rgba(220,235,252,0.3))",
        }}
      />

      <div className="relative">
        {/* Current conditions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* The sun/cloud glyph — its color follows the real phase */}
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-full text-2xl"
              style={{
                background:
                  sun.phase === "night"
                    ? "radial-gradient(circle, rgba(220,225,255,0.9), rgba(150,160,220,0.4))"
                    : "radial-gradient(circle, rgba(255,240,200,0.95), rgba(255,210,140,0.5))",
                boxShadow: "0 3px 12px rgba(255,220,160,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              {sun.phase === "night" ? "🌙" : "☀️"}
            </span>
            <div>
              <p className="font-display text-[26px] font-medium leading-none text-[#2c2a48]">
                {currentC}°C
              </p>
              <p className="mt-1 text-[11.5px] font-medium text-[#5f5e74]">{condition}</p>
            </div>
          </div>
        </div>

        {/* Location — WithIn's home shore */}
        <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#5f5e74]">
          <span aria-hidden>📍</span>
          Moonlight Bay
        </p>

        {/* The 4-day estimate strip */}
        <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/50 pt-3.5">
          {forecast.slice(0, 4).map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-[10.5px] font-semibold text-[#44435e]">
                {dayLabels[startIndex + index + 1] ?? new Date(now.getTime() + (index + 1) * 86400000).toLocaleDateString(locale, { weekday: "short" })}
              </p>
              <p aria-hidden className="mt-1 text-base">
                {clouds > 0.5 ? "⛅" : "☀️"}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-[#2c2a48]">
                {day.highC}°
              </p>
              <p className="text-[10px] tabular-nums text-[#8b8aa0]">{day.lowC}°</p>
            </div>
          ))}
        </div>

        {/* The honesty line — small but unmissable */}
        <p className="mt-3.5 text-[9.5px] leading-relaxed text-[#8b8aa0]">
          {PHASE_LABEL[sun.phase]} · {climate.label.toLowerCase()} climate estimate — not a live forecast.
        </p>
      </div>
    </aside>
  );
}
