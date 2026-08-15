/**
 * Atmosphere engine — weather & special days, made ready but not active.
 *
 * WithIn does NOT claim live weather or force holiday themes today. This
 * module is the clean abstraction point: the moment a real source exists
 * (a weather API, a calendar), call the setters below and the CSS hooks in
 * globals.css (html[data-weather], html[data-theme-day]) answer — the room
 * reshapes itself without any component changes.
 *
 * ── INTEGRATION POINT ──────────────────────────────────────────────────
 * const weather = await fetchWeather(city);
 * setWeather(weather.state);      // "clear" | "cloudy" | "rain" | "storm" | "snow"
 * setSpecialTheme(day.name);      // "birthday" | "holiday" | "originals-event" | null
 * ───────────────────────────────────────────────────────────────────────
 */

import type { TimePeriod } from "./auri";

export type WeatherState = "clear" | "cloudy" | "rain" | "storm" | "snow";

export const WEATHER_STATES: readonly WeatherState[] = [
  "clear",
  "cloudy",
  "rain",
  "storm",
  "snow"
];

export type SpecialTheme = "birthday" | "holiday" | "originals-event";

export const SPECIAL_THEMES: readonly SpecialTheme[] = [
  "birthday",
  "holiday",
  "originals-event"
];

/** Hand-sets the time-of-day atmosphere (dev/QA use). Null returns to auto. */
export function setTimeOverride(time: TimePeriod | null) {
  if (typeof document === "undefined") return;
  if (time) {
    document.documentElement.dataset.time = time;
  } else {
    delete document.documentElement.dataset.time;
  }
}

/** Applies a weather state to the whole atmosphere (null clears it). */
export function setWeather(state: WeatherState | null) {
  if (typeof document === "undefined") return;
  if (state) {
    document.documentElement.dataset.weather = state;
  } else {
    delete document.documentElement.dataset.weather;
  }
}

/** Activates a temporary visual theme (birthdays, holidays, Originals events). */
export function setSpecialTheme(theme: SpecialTheme | null) {
  if (typeof document === "undefined") return;
  if (theme) {
    document.documentElement.dataset.themeDay = theme;
  } else {
    delete document.documentElement.dataset.themeDay;
  }
}

/** Resolves a raw source value (API response, calendar entry) into states. */
export function mapWeatherSource(value: string): WeatherState | null {
  const normalized = value.trim().toLowerCase();
  return WEATHER_STATES.includes(normalized as WeatherState) ? (normalized as WeatherState) : null;
}
