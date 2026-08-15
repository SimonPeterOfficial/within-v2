/**
 * Live weather — the room answers the sky.
 *
 * Open-Meteo (https://open-meteo.com) needs no API key and no signup. The
 * browser's location is resolved once (with consent); every failure path
 * falls back gracefully to the default atmosphere — the world simply keeps
 * its usual light and nothing breaks.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * This module is deliberately self-contained: `startWeatherWatch` is the
 * only entry the environment calls. Swap in another provider (or a
 * server-side fetch of the user's saved city) behind the same function.
 * ───────────────────────────────────────────────────────────────────────
 */

import { setWeather, type WeatherState } from "@/lib/atmosphere";

export type WeatherReport = {
  state: WeatherState;
  label: string;
  tempC: number | null;
};

const COORDS_TIMEOUT_MS = 5000;
const REFRESH_MS = 30 * 60 * 1000;

/** WMO weather codes → the atmosphere states WithIn understands. */
export function mapWeatherCode(code: number): WeatherState {
  if (code === 0) return "clear";
  if (code <= 3 || code === 45 || code === 48) return "cloudy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "clear";
}

const WMO_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Violent showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Storm with hail",
  99: "Severe storm"
};

function wmoLabel(code: number): string {
  return WMO_LABELS[code] ?? "Sky";
}

/** Resolves the browser's coordinates — with consent, short timeout, no throw. */
export async function resolveCoordinates(): Promise<{ lat: number; lon: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  // Respect an existing denial — never nag.
  try {
    const permission = await navigator.permissions?.query?.({ name: "geolocation" });
    if (permission?.state === "denied") return null;
  } catch {
    /* permission query unsupported — attempt the request anyway */
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), COORDS_TIMEOUT_MS);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timer);
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        window.clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

/** Fetches the current weather for a location. Never throws. */
export async function fetchCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherReport | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const code = data.current?.weather_code;
    if (typeof code !== "number") return null;
    const temp = data.current?.temperature_2m;
    return {
      state: mapWeatherCode(code),
      label: wmoLabel(code),
      tempC: typeof temp === "number" ? Math.round(temp) : null
    };
  } catch {
    return null;
  }
}

/**
 * Starts the live weather watch: resolves location, fetches once the page
 * has settled, refreshes every half hour, and applies the state to the whole
 * atmosphere via `atmosphere.setWeather`. Returns a stop function that also
 * clears the weather so nothing stale lingers. Location failure is silent
 * and graceful.
 */
export function startWeatherWatch(onChange?: (report: WeatherReport | null) => void): () => void {
  let stopped = false;
  let coords: { lat: number; lon: number } | null = null;

  const timers: number[] = [];

  const apply = async () => {
    if (stopped) return;
    if (!coords) {
      coords = await resolveCoordinates();
      if (!coords) {
        // No location available — the room keeps its default light.
        if (!stopped) setWeather(null);
        return;
      }
    }
    const report = await fetchCurrentWeather(coords.lat, coords.lon);
    if (stopped || !report) return;
    setWeather(report.state);
    onChange?.(report);
  };

  // Let the page settle before asking for location; retry once if it was slow.
  timers.push(window.setTimeout(apply, 1800));
  timers.push(window.setTimeout(() => apply(), 30000));
  timers.push(window.setInterval(() => apply(), REFRESH_MS));

  return () => {
    stopped = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    window.clearInterval(timers[timers.length - 1]);
    setWeather(null);
  };
}
