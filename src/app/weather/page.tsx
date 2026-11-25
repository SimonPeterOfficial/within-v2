import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import WeatherPanel from "@/components/home/WeatherPanel";

export const metadata: Metadata = {
  title: "Weather — WithIn",
  description:
    "The room around you — live conditions where you are, or an honest seasonal estimate when your location is unavailable.",
};

/**
 * Weather — the real sky room.
 *
 * The panel reads live conditions from Open-Meteo when the browser grants
 * location (never nagging after a denial). Otherwise it shows a labeled
 * seasonal climate estimate. No invented forecasts, no invented place names.
 */
export default function WeatherPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-within-time">
      <WorldHero
        eyebrow="Weather"
        title="The room around you"
        subtitle="Live conditions where you are — or a seasonal estimate, clearly labeled, when location isn't available."
        worldClass="world-within-time"
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <WeatherPanel />
          <ContextualRail
            title="Nearby in the universe"
            destinations={[
              { label: "Atlas", href: "/atlas", icon: "globe", line: "The sky, instrumented" },
              { label: "Time", href: "/time", icon: "clock", line: "The present moment" },
              { label: "Sanctuary", href: "/sanctuary", icon: "heart", line: "A calmer you" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
