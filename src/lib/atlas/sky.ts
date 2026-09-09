/**
 * The sky engine — everything WithIn can truthfully know about the sky
 * without a weather API, computed on-device.
 *
 *   - the sun's real position (NOAA-style short formula)
 *   - daylight phase + golden hour
 *   - a seasonal climate ESTIMATE (day-of-year curve + diurnal cycle)
 *
 * The temperature is honest about being an estimate: it is the plausible
 * band for the season at temperate latitudes, not a live reading. Every
 * consumer must carry the "climate estimate" label — data honesty is part
 * of the contract of this module.
 */

/* ── Sun position ────────────────────────────────────────────────────── */

export type SunPosition = {
  /** 0 = below horizon, 1 = zenith-ish at solar noon */
  elevation01: number;
  /** -1 (east) … 0 (south) … 1 (west) sky traversal */
  azimuth01: number;
  daylight: boolean;
  goldenHour: boolean;
  phase: "night" | "dawn" | "morning" | "midday" | "golden" | "dusk";
};

export function sunPosition(date: Date): SunPosition {
  const rad = Math.PI / 180;
  const dayMs = 86400000;
  const J2000 = Date.UTC(2000, 0, 1, 12) / dayMs;
  const n = date.getTime() / dayMs - J2000 + 0.0008;

  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const ecliptic = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  const declination = Math.asin(Math.sin(23.44 * rad) * Math.sin(ecliptic * rad));

  const eqTime =
    (4 * (L - 0.0057183 - Math.atan2(Math.cos(g), Math.cos(ecliptic * rad) * 0.9175) / rad)) % 720;
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarNoonUTC = 12 - eqTime / 60;
  const hourAngle = (utcHours - solarNoonUTC) * 15;

  const elevationDeg =
    Math.asin(
      Math.sin(declination) * Math.sin(0) + Math.cos(declination) * Math.cos(hourAngle * rad) * Math.cos(0)
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

/* ── Sky palette per phase — the shared atmosphere language ──────────── */

export const SKY_GRADIENTS: Record<SunPosition["phase"], string> = {
  night: "linear-gradient(180deg, #2a2d52 0%, #454a7d 55%, #6a6fa5 100%)",
  dawn: "linear-gradient(180deg, #8ea6d8 0%, #d9a8a0 55%, #f2cdb0 100%)",
  morning: "linear-gradient(180deg, #8fb5e8 0%, #b8d4f0 45%, #e8dcf0 100%)",
  midday: "linear-gradient(180deg, #6fa8e0 0%, #a8c8ec 50%, #d8e8f6 100%)",
  golden: "linear-gradient(180deg, #8fa5d8 0%, #eec9a2 55%, #f7dfb8 100%)",
  dusk: "linear-gradient(180deg, #5f63a8 0%, #a98fc4 55%, #e8b8a8 100%)",
};

export const PHASE_LABEL: Record<SunPosition["phase"], string> = {
  night: "Night sky",
  dawn: "Dawn light",
  morning: "Morning light",
  midday: "Partly cloudy",
  golden: "Golden hour",
  dusk: "Dusk light",
};

/* ── Climate estimate — seasonal curve + diurnal cycle ──────────────── */

export type ClimateEstimate = {
  /** Plausible daytime high for the season, °C */
  highC: number;
  /** Plausible overnight low, °C */
  lowC: number;
  /** Where in the diurnal cycle we are (0 = low, 1 = high) */
  daytime01: number;
  label: string;
};

/**
 * The honest temperature: a seasonal estimate for temperate latitudes.
 * Day-of-year drives a smooth sinusoid (peak late July); the diurnal
 * cycle adds the day's swing. Never presented as a live reading.
 */
export function climateEstimate(date: Date): ClimateEstimate {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const seasonal = Math.cos(((dayOfYear - 205) / 365) * 2 * Math.PI); // peak ~Jul 24
  const hour = date.getHours() + date.getMinutes() / 60;
  const diurnal = Math.cos(((hour - 15) / 24) * 2 * Math.PI); // peak ~15:00

  const meanHigh = 22 + seasonal * 9; // 13°C winter — 31°C summer highs
  const meanLow = meanHigh - 8;
  const daytime01 = Math.max(0, Math.min(1, (diurnal + 1) / 2));

  const highC = Math.round(meanHigh + diurnal * 2);
  const lowC = Math.round(meanLow - (1 - diurnal) * 1.5);
  const label =
    seasonal > 0.5 ? "Warm season" : seasonal < -0.5 ? "Cool season" : "Mild season";

  return { highC, lowC, daytime01, label };
}

/** The next four days' estimate columns (labels computed per locale). */
export function forecastEstimate(date: Date): { highC: number; lowC: number }[] {
  return [1, 2, 3, 4].map((offset) => {
    const future = new Date(date.getTime() + offset * 86400000);
    return climateEstimate(future);
  });
}

/** 0–1 hash of the date — deterministic "cloud character" per day. */
export function dayCharacter(date: Date): number {
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
