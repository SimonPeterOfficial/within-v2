"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { CrystalWindow } from "@/components/within/crystal/Crystal";
import { CrystalMediaFrame } from "@/components/within/crystal/CrystalKit";

/**
 * CrystalWeatherSurface — the showcase of seeing through the interface.
 *
 * DATA HONESTY: WithIn has no weather API, so this surface shows what can
 * be known truthfully on-device: the sun's actual position (computed from
 * real solar math), daylight phase, golden-hour windows, and local time.
 * It is explicitly labeled as sky conditions, never as a forecast.
 *
 * The environment behind the surface is the point: the window is nearly
 * transparent, and the atmosphere gradient shifts with the real hour.
 */

type SunPosition = {
  /** 0 = below horizon (night), 0.5 = zenith-ish at solar noon */
  elevation01: number;
  /** -1 (east) … 0 (south) … 1 (west) sky traversal */
  azimuth01: number;
  daylight: boolean;
  goldenHour: boolean;
  phase: "night" | "dawn" | "morning" | "midday" | "golden" | "dusk";
};

/** Real solar elevation approximation — NOAA-style short formula. */
function sunPosition(date: Date): SunPosition {
  const rad = Math.PI / 180;
  const dayMs = 86400000;
  const J2000 = Date.UTC(2000, 0, 1, 12) / dayMs;
  const n = date.getTime() / dayMs - J2000 + 0.0008;
  // Solar mean longitude & anomaly (deg)
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const ecliptic = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  const declination = Math.asin(Math.sin(23.44 * rad) * Math.sin(ecliptic * rad));
  // Equation of time → solar noon offset (minutes)
  const eqTime = 4 * (L - 0.0057183 - Math.atan2(Math.cos(g), Math.cos(ecliptic * rad) * 0.9175) / rad) % 720;
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarNoonUTC = 12 - eqTime / 60;
  // Hour angle relative to solar noon (deg)
  const hourAngle = (utcHours - solarNoonUTC) * 15;
  const elevationDeg =
    Math.asin(
      Math.sin(declination) * Math.sin(0) +
        Math.cos(declination) * Math.cos(hourAngle * rad) * Math.cos(0)
    ) / rad;
  const elevation01 = Math.max(0, Math.min(1, elevationDeg / 90));
  const azimuth01 = Math.max(-1, Math.min(1, hourAngle / 180));
  const daylight = elevationDeg > 0;
  const golden = daylight && elevationDeg < 12;
  const phase: SunPosition["phase"] = !daylight
    ? "night"
    : elevationDeg < 6 && azimuth01 < 0
      ? "dawn"
      : elevationDeg < 6
        ? "dusk"
        : elevationDeg < 12
          ? "golden"
          : utcHours < 12
            ? "morning"
            : "midday";
  return { elevation01, azimuth01, daylight, goldenHour: golden, phase };
}

const PHASE_META: Record<SunPosition["phase"], { label: string; light: string; line: string }> = {
  night: { label: "Night sky", light: "rgba(120,130,220,0.35)", line: "The sun is below the horizon — the world rests." },
  dawn: { label: "Dawn light", light: "rgba(255,190,150,0.5)", line: "First light bending over the edge of the day." },
  morning: { label: "Morning light", light: "rgba(255,220,170,0.5)", line: "Clean, rising light through clear crystal air." },
  midday: { label: "Daylight", light: "rgba(255,255,255,0.6)", line: "Full, even illumination — the clearest hour." },
  golden: { label: "Golden hour", light: "rgba(250,190,130,0.55)", line: "Warm pearlescent light — photographs love this hour." },
  dusk: { label: "Dusk light", light: "rgba(220,160,220,0.5)", line: "The day folds into violet and cyan." },
};

const subscribeAlways = () => () => {};
const getClientLocale = () => Intl.DateTimeFormat().resolvedOptions().locale;
const getServerLocale = () => "en-US";

export default function WeatherSurface() {
  const now = useAtlasTime();
  const locale = useSyncExternalStore(subscribeAlways, getClientLocale, getServerLocale);

  const sun = sunPosition(now);
  const meta = PHASE_META[sun.phase];
  // Hydration-safe: the clock is minute-stable on the server, then ticks live.
  const localTime = now.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });

  // The sky gradient — honest to the phase.
  const sky: Record<SunPosition["phase"], string> = {
    night: "linear-gradient(180deg, #2a2d52 0%, #454a7d 55%, #6a6fa5 100%)",
    dawn: "linear-gradient(180deg, #7a7cc4 0%, #d9a8a0 60%, #f2cdb0 100%)",
    morning: "linear-gradient(180deg, #9db8e0 0%, #cfe0f2 55%, #f4e8d8 100%)",
    midday: "linear-gradient(180deg, #a8c6e8 0%, #d6e6f5 55%, #f6f2ea 100%)",
    golden: "linear-gradient(180deg, #8fa5d8 0%, #eec9a2 55%, #f7dfb8 100%)",
    dusk: "linear-gradient(180deg, #5f63a8 0%, #a98fc4 55%, #e8b8a8 100%)",
  };

  return (
    <CrystalMediaFrame ratio="16 / 9" className="min-h-[220px]">
      {/* The live sky — the environment IS the content */}
      <div aria-hidden className="absolute inset-0" style={{ background: sky[sun.phase] }} />
      {/* The sun's position — real azimuth/elevation mapping */}
      <motion.div
        aria-hidden
        className="absolute h-16 w-16 rounded-full"
        style={{
          left: `${50 + sun.azimuth01 * 38}%`,
          top: `${88 - sun.elevation01 * 74}%`,
          background: "radial-gradient(circle, rgba(255,250,235,0.98) 0%, rgba(255,230,180,0.75) 40%, transparent 70%)",
          filter: "blur(2px)",
        }}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Cloud drift — soft, slow, restrained */}
      <motion.div
        aria-hidden
        className="absolute left-[8%] top-[22%] h-10 w-44 rounded-full bg-white/35"
        style={{ filter: "blur(14px)" }}
        animate={{ x: [0, 30, 0], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute right-[12%] top-[38%] h-8 w-32 rounded-full bg-white/25"
        style={{ filter: "blur(12px)" }}
        animate={{ x: [0, -22, 0], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The readable crystal overlay — floating, nearly invisible */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <CrystalWindow className="rounded-2xl px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#5f5e74]">
              Sky conditions
            </p>
            <p className="font-display text-xl font-medium text-[#232136]">{meta.label}</p>
          </CrystalWindow>
          <CrystalWindow className="rounded-2xl px-4 py-2.5 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#5f5e74]">Local</p>
            <p className="font-display text-xl font-medium tabular-nums text-[#232136]">{localTime}</p>
          </CrystalWindow>
        </div>

        <div className="flex items-end justify-between gap-3">
          <CrystalWindow className="max-w-[70%] rounded-2xl px-4 py-2.5">
            <p className="text-[12px] leading-relaxed text-[#44435e]">{meta.line}</p>
            <p className="mt-1 text-[10px] text-[#8b8aa0]">
              Computed from the sun&apos;s real position — WithIn shows the sky, not a forecast.
            </p>
          </CrystalWindow>
          {/* Sun elevation meter */}
          <CrystalWindow className="rounded-2xl px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#5f5e74]">Sun</p>
            <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-white/60">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${sun.elevation01 * 100}%`,
                  background: "linear-gradient(90deg, #f7dfb8, #f0a878)",
                }}
              />
            </div>
            <p className="mt-1 text-[10px] tabular-nums text-[#8b8aa0]">
              {Math.round(sun.elevation01 * 90)}° elevation
            </p>
          </CrystalWindow>
        </div>
      </div>
    </CrystalMediaFrame>
  );
}
