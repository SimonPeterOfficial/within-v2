"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { getTimePeriod, TIME_GREETINGS, type TimePeriod } from "@/lib/auri";
import {
  applyMood,
  getMood,
  onMoodChange,
  restorePersistedMood,
  type Mood,
  type MoodId
} from "@/lib/mood";
import { memory } from "@/lib/memory";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { startWeatherWatch, type WeatherReport } from "@/lib/weather";

const PERIOD_REFRESH_MS = 10 * 60 * 1000;

/** How many times this browser has entered WithIn — first vs. returning. */
export type VisitInfo = {
  count: number;
  isFirstVisit: boolean;
  isReturningUser: boolean;
};

/** The derived "feel" of the room — label + depth for the current hour/mood. */
export type Atmosphere = {
  label: string;
  depth: number;
};

type EnvironmentValue = {
  /** Current time-of-day period (morning / afternoon / evening / night). */
  period: TimePeriod;
  /** Short greeting for the period — "Good evening". */
  greeting: string;
  /** The user-selected mood id (or null for the brand default). */
  moodId: MoodId | null;
  /** The selected mood definition, if any. */
  mood: Mood | undefined;
  /** Select (or clear) a mood — routes through the global mood engine. */
  setMood: (id: MoodId | null) => void;
  /** Derived atmosphere — how deep/dark the room reads right now. */
  atmosphere: Atmosphere;
  /** True when the browser reports Reduced Motion. */
  reducedMotion: boolean;
  /** First-visit vs. returning-user state (session-less, per browser). */
  visits: VisitInfo;
  /** Live weather state (null = no location / default light). */
  weather: WeatherReport | null;
};

const EnvironmentContext = createContext<EnvironmentValue | null>(null);

/**
 * The environment — WithIn's single sense of the present moment.
 *
 * Everything the living world responds to (time of day, mood, reduced
 * motion, first/returning visit, live weather) flows from one provider, so
 * no component re-implements the plumbing. It owns `html[data-time]` (the
 * CSS atmosphere hooks), restores the persisted mood once, counts visits,
 * and starts the weather watch. Hydration-safe: server state is stable and
 * every live value resolves inside deferred effects.
 */
export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<TimePeriod>("evening");
  const [moodId, setMoodId] = useState<MoodId | null>(null);
  const [visits, setVisits] = useState<VisitInfo>({
    count: 1,
    isFirstVisit: true,
    isReturningUser: false
  });
  const [weather, setWeather] = useState<WeatherReport | null>(null);
  const reducedMotion = useReducedMotionSafe();

  // Time of day — the room answers the hour, kept fresh as it turns.
  useEffect(() => {
    const apply = () => {
      const next = getTimePeriod();
      document.documentElement.dataset.time = next;
      setPeriod(next);
    };
    const frame = requestAnimationFrame(apply);
    const interval = window.setInterval(apply, PERIOD_REFRESH_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, []);

  // Mood — one channel: everything routes through applyMood + its event bus,
  // so the context stays in sync with moods chosen anywhere (orbit, Auri).
  // The persisted mood wakes the room in the light the user left it in.
  useEffect(() => {
    const unsubscribe = onMoodChange((id) => setMoodId(id));
    const frame = requestAnimationFrame(restorePersistedMood);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  // Visits — first visit vs. returning user (session-less, per browser).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const count = memory.getVisitCount() + 1;
      memory.setVisitCount(count);
      setVisits({
        count,
        isFirstVisit: count === 1,
        isReturningUser: count > 1
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Live weather — the room answers the sky. Fails silently to default light.
  useEffect(() => {
    const stop = startWeatherWatch((report) => setWeather(report));
    return stop;
  }, []);

  const setMood = useCallback((id: MoodId | null) => applyMood(id), []);

  const mood = useMemo(() => getMood(moodId), [moodId]);

  const atmosphere = useMemo<Atmosphere>(() => {
    const base = {
      morning: { label: "Morning silver", depth: 0.85 },
      afternoon: { label: "Balanced light", depth: 1 },
      evening: { label: "Evening violet", depth: 1.15 },
      night: { label: "Midnight depth", depth: 1.3 }
    }[period];
    return {
      label: mood ? `${base.label} · ${mood.label}` : base.label,
      depth: base.depth
    };
  }, [period, mood]);

  const value = useMemo<EnvironmentValue>(
    () => ({
      period,
      greeting: TIME_GREETINGS[period],
      moodId,
      mood,
      setMood,
      atmosphere,
      reducedMotion,
      visits,
      weather
    }),
    [period, moodId, mood, setMood, atmosphere, reducedMotion, visits, weather]
  );

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

/** Reads the living environment. Must be used under <EnvironmentProvider>. */
export function useEnvironment(): EnvironmentValue {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error("useEnvironment must be used within an EnvironmentProvider.");
  }
  return context;
}
