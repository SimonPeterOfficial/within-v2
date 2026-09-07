/**
 * Within Time — the platform's sense of real time.
 *
 * Within Time follows the REAL world: real date, real time, the user's
 * timezone and locale. It is the foundation the whole atmosphere engine
 * already breathes with (time-of-day mesh, greetings, weather hooks) —
 * this module names that concept and gives it one canonical API so future
 * systems (holidays, seasons, creator events, WithIn events, regional
 * experiences) can be layered on without inventing a fictional clock.
 *
 * Principles:
 *   • Real time only — never a disconnected in-world calendar.
 *   • Locale-aware formatting through Intl (no hand-rolled date math).
 *   • Extensible hooks: seasonal context and named events are declared
 *     here, computed from the real date, and default to "nothing special".
 */

export type WithinSeason = "winter" | "spring" | "summer" | "autumn";

/** A named moment on the real calendar — the hook for future events. */
export type WithinEvent = {
  id: string;
  label: string;
  /** Short atmospheric line, shown only where the UI chooses to. */
  line: string;
};

export type WithinTimeContext = {
  /** The real moment, resolved client-side (null during SSR). */
  now: Date | null;
  /** IANA timezone, e.g. "Europe/Paris" (null during SSR). */
  timeZone: string | null;
  /** BCP-47 locale for formatting, e.g. "en-US". */
  locale: string;
  /** Morning / afternoon / evening / night in the user's day. */
  period: "morning" | "afternoon" | "evening" | "night" | null;
  /** Meteorological season in the user's hemisphere (approximate, real). */
  season: WithinSeason | null;
  /** A named real-calendar event, when one is defined. Empty by default. */
  event: WithinEvent | null;
};

/**
 * Meteorological season from a real date (Northern Hemisphere reference;
 * a regional pass may refine this later — the hook stays the same).
 */
export function seasonFor(date: Date): WithinSeason {
  const month = date.getMonth();
  if (month <= 1 || month === 11) return "winter";
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "autumn";
}

/**
 * Named real-calendar events — deliberately near-empty. Adding one is a
 * one-line declaration with a date test; nothing else changes. No invented
 * holidays, no forced celebrations.
 */
const EVENTS: Array<{ id: string; label: string; line: string; matches: (d: Date) => boolean }> = [
  {
    id: "new-year",
    label: "The turning of the year",
    line: "A new year is a door everyone walks through together.",
    matches: (d) => d.getMonth() === 0 && d.getDate() === 1,
  },
];

function eventFor(date: Date): WithinEvent | null {
  const found = EVENTS.find((entry) => entry.matches(date));
  return found ? { id: found.id, label: found.label, line: found.line } : null;
}

/**
 * The canonical Within Time context. `now` is null during SSR and resolves
 * on the client — consumers render the neutral state until hydration,
 * exactly like the rest of the environment engine.
 */
export function getWithinTime(now: Date = new Date()): WithinTimeContext {
  if (typeof window === "undefined") {
    return {
      now: null,
      timeZone: null,
      locale: "en-US",
      period: null,
      season: null,
      event: null,
    };
  }
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  const locale = navigator.language || "en-US";
  const hour = now.getHours();
  return {
    now,
    timeZone,
    locale,
    period:
      hour >= 5 && hour < 12
        ? "morning"
        : hour >= 12 && hour < 17
          ? "afternoon"
          : hour >= 17 && hour < 22
            ? "evening"
            : "night",
    season: seasonFor(now),
    event: eventFor(now),
  };
}

/** Human formatting in the user's own locale and timezone. */
export function formatWithinTime(
  date: Date,
  options?: { locale?: string; timeZone?: string | null; style?: "short" | "long" }
): string {
  const locale = options?.locale ?? "en-US";
  try {
    return new Intl.DateTimeFormat(locale, {
      ...(options?.timeZone ? { timeZone: options.timeZone } : {}),
      ...(options?.style === "long"
        ? { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }
        : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}
