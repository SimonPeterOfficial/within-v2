"use client";

import DepthLayers from "@/components/effects/DepthLayers";
import MeshGradient, { type MeshPreset } from "@/components/effects/MeshGradient";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { useEnvironment } from "@/lib/environment";
import { applyMood, moods } from "@/lib/mood";
import { setTimeOverride, setWeather } from "@/lib/atmosphere";
import { auriBehaviorFor, auriStateLabel, type AuriState, type TimePeriod } from "@/lib/auri";
import { typography } from "@/lib/design";
import { WEATHER_STATES, type WeatherState } from "@/lib/atmosphere";

/**
 * DEV-ONLY visual review — the design language in one room.
 * Reach it at /qa. Lists every material tone, mesh preset, Auri state and
 * type recipe, and lets you drive time/weather/mood by hand to eyeball the
 * atmosphere engine. Not linked from navigation on purpose.
 */

const TONES = ["default", "soft", "strong", "aurora", "tactile", "clay", "paper", "cinematic", "dark"] as const;

const PRESETS: MeshPreset[] = ["home", "sanctuary", "music", "books", "communities", "originals"];

const AURI_STATES: AuriState[] = [
  "idle",
  "observing",
  "curious",
  "greeting",
  "thinking",
  "listening",
  "responding",
  "sleeping"
];

const TIME_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night"
};

function Chip({ children, onClick, active = false }: { children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition duration-300 ${
        active
          ? "border-[rgba(var(--mood-rgb),0.6)] bg-[rgba(var(--mood-rgb),0.15)] text-white"
          : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function QASection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 py-10 first:border-t-0">
      <p className={typography.eyebrow}>QA</p>
      <h2 className={`mt-2 ${typography.sectionTitle}`}>{title}</h2>
      {hint && <p className={`mt-2 ${typography.caption}`}>{hint}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function QAPage() {
  const { period, moodId, atmosphere, visits, weather } = useEnvironment();

  const setTime = (time: string | null) => setTimeOverride(time as TimePeriod | null);

  const setWeatherState = (state: WeatherState | null) => setWeather(state);

  const setMood = (id: string | null) => applyMood(id);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <DepthLayers preset="home" particles={4} stars={10} rays={false} />

      <Container className="relative py-20">
        <p className={typography.eyebrow}>Dev-only</p>
        <h1 className={`mt-4 ${typography.display}`}>
          WithIn <GradientText>QA</GradientText>
        </h1>
        <p className={`mt-4 max-w-2xl ${typography.subtitle}`}>
          The living world, in one room — materials, presets, states and the environment engine.
        </p>

        {/* ── Environment readout ── */}
        <QASection title="Environment" hint="Live values from the EnvironmentProvider — the world responds to these.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard tone="dark" className="p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Period</p>
              <p className="mt-2 text-lg font-semibold">{TIME_LABELS[period] ?? period}</p>
            </GlassCard>
            <GlassCard tone="dark" className="p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Atmosphere</p>
              <p className="mt-2 text-lg font-semibold">{atmosphere.label}</p>
              <p className="text-xs text-gray-500">depth {atmosphere.depth}</p>
            </GlassCard>
            <GlassCard tone="dark" className="p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Visit</p>
              <p className="mt-2 text-lg font-semibold">
                {visits.isFirstVisit ? "First visit" : visits.isReturningUser ? "Returning" : "…"}
              </p>
              <p className="text-xs text-gray-500">count {visits.count}</p>
            </GlassCard>
            <GlassCard tone="dark" className="p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Weather</p>
              <p className="mt-2 text-lg font-semibold">{weather ? weather.label : "Default light"}</p>
              {weather?.tempC != null && <p className="text-xs text-gray-500">{weather.tempC}°C</p>}
            </GlassCard>
          </div>
        </QASection>

        {/* ── Environment controls ── */}
        <QASection title="Drive the world" hint="Hand-set the atmosphere to eyeball transitions (the environment re-applies the real hour on its next tick).">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Time of day</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TIME_LABELS).map(([value, label]) => (
                  <Chip key={value} active={period === value} onClick={() => setTime(value)}>
                    {label}
                  </Chip>
                ))}
                <Chip onClick={() => setTime(null)}>Auto (hour)</Chip>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Weather</p>
              <div className="flex flex-wrap gap-2">
                {WEATHER_STATES.map((state) => (
                  <Chip key={state} active={weather?.state === state} onClick={() => setWeatherState(state)}>
                    {state}
                  </Chip>
                ))}
                <Chip onClick={() => setWeatherState(null)}>Auto (live)</Chip>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Mood</p>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <Chip key={mood.id} active={moodId === mood.id} onClick={() => setMood(mood.id)}>
                    {mood.emoji} {mood.label}
                  </Chip>
                ))}
                <Chip active={moodId === null} onClick={() => setMood(null)}>
                  ✦ Brand purple
                </Chip>
              </div>
            </div>
          </div>
        </QASection>

        {/* ── Materials ── */}
        <QASection title="Materials" hint="The tactile language — each tone says what its surface is for.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TONES.map((tone) => (
              <GlassCard key={tone} tone={tone} hoverLift className="p-6">
                <p className="text-sm font-semibold text-white">{tone}</p>
                <p className="mt-1 text-xs text-gray-500">A surface that says what it is.</p>
              </GlassCard>
            ))}
            <div className="flex items-center justify-center rounded-card border border-white/10 p-6">
              <span className="neo-chip rounded-full px-4 py-2 text-xs text-white">neo-chip accent</span>
            </div>
          </div>
        </QASection>

        {/* ── Mesh presets ── */}
        <QASection title="Mesh presets" hint="Each room's drifting light — same engine, different lights.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRESETS.map((preset) => (
              <div key={preset} className="relative h-36 overflow-hidden rounded-card border border-white/10 bg-black/40">
                <MeshGradient preset={preset} />
                <span className="absolute bottom-3 left-4 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                  {preset}
                </span>
              </div>
            ))}
          </div>
        </QASection>

        {/* ── Auri states ── */}
        <QASection title="Auri states" hint="Eight quiet presences — the differences are meant to be felt, not seen.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AURI_STATES.map((state) => {
              const behavior = auriBehaviorFor(state);
              return (
                <GlassCard key={state} tone="clay" className="flex flex-col items-center gap-3 p-6 text-center">
                  <AuriOwl size={64} state={state} followCursor />
                  <div>
                    <p className="text-sm font-semibold text-white">{auriStateLabel(state)}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                      {behavior.sleeping
                        ? "eyes closed, light dimmed"
                        : `breathes ${behavior.breathe.seconds}s${behavior.tilt ? ` · tilt ${behavior.tilt}°` : ""} · glow ${behavior.glow}×`}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </QASection>

        {/* ── Typography ── */}
        <QASection title="Typography" hint="Headlines speak in Fraunces; body copy in Geist. Every recipe lives in lib/design.ts.">
          <div className="space-y-5">
            <div>
              <p className={`${typography.eyebrow} mb-2`}>display</p>
              <p className={typography.display}>Feel Seen.</p>
            </div>
            <div>
              <p className={`${typography.eyebrow} mb-2`}>hero</p>
              <p className={typography.hero}>Your sanctuary is waiting.</p>
            </div>
            <div>
              <p className={`${typography.eyebrow} mb-2`}>sectionTitle</p>
              <p className={typography.sectionTitle}>Find the center of your universe</p>
            </div>
            <div>
              <p className={`${typography.eyebrow} mb-2`}>subtitle</p>
              <p className={typography.subtitle}>The interface should feel like a living environment.</p>
            </div>
            <div>
              <p className={`${typography.eyebrow} mb-2`}>body · caption · label</p>
              <p className={typography.body}>Body copy in Geist, quiet and legible.</p>
              <p className={`mt-1 ${typography.caption}`}>A caption, softer still.</p>
              <p className={`mt-2 ${typography.label}`}>A compact label</p>
            </div>
          </div>
        </QASection>
      </Container>
    </div>
  );
}
