import type { Metadata } from "next";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import WithinMark from "@/components/ui/WithinMark";
import { UNIVERSE_NAV } from "@/lib/navigation";
import { EntranceProvider } from "@/components/entrance/EntranceProvider";
import CinematicLoaderGate from "@/components/loader/CinematicLoaderGate";
import CrystalAtmosphere from "@/components/effects/CrystalAtmosphere";
import GlassCard from "@/components/ui/GlassCard";

export const metadata: Metadata = {
  title: "WithIn — A place to be",
  description: "A focused, personal digital space for your world within.",
};

const primaryModules = [
  { label: "Home", href: "/home", summary: "Your universe" },
  { label: "Atlas", href: "/atlas", summary: "Temporal map" },
  { label: "Time", href: "/time", summary: "Your now" },
  { label: "Weather", href: "/weather", summary: "The room around you" },
  { label: "Explore", href: "/explore", summary: "New rooms" },
  { label: "Profile", href: "/profile", summary: "Your presence" },
];

export default function LandingPage() {
  return (
    <EntranceProvider immediatelyReady={false}>
      <div className="elysian-app">
        <AppShell items={UNIVERSE_NAV}>
          <div className="elysian-landing relative isolate min-h-screen overflow-hidden text-[var(--elysian-ink)]">
            <CrystalAtmosphere />
            <div className="relative z-10 mx-auto flex min-h-screen max-w-[1180px] items-center px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
              <div className="mx-auto w-full max-w-[920px]">
                <div className="mb-7 flex items-center gap-4 sm:mb-10">
                  <WithinMark variant="mark" size={42} />
                  <div className="text-[11px] font-medium uppercase tracking-[0.38em] text-[var(--elysian-ink-soft)]">
                    WithIn
                  </div>
                </div>

                <header className="mb-7 max-w-3xl sm:mb-10">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.36em] text-[rgba(var(--within-ivory-rgb),0.68)] sm:mb-5">
                    A quieter place to begin
                  </p>
                  <h1 className="font-display text-[clamp(2.7rem,7.3vw,6.25rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[var(--elysian-ink)]">
                    The world is loud.
                    <span className="mt-1 block text-[rgba(var(--within-ivory-rgb),0.76)]">
                      Find your WithIn.
                    </span>
                  </h1>
                  <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--elysian-ink-soft)] sm:mt-6 sm:text-base sm:leading-8">
                    A quieter place for stories, focus, and the moments that matter.
                  </p>
                </header>

                <div className="mb-4 flex flex-wrap gap-3 sm:mb-12">
                  <Button href="/home" variant="gradient" size="lg">
                    Enter WithIn
                  </Button>
                  <Button
                    href="/discover"
                    variant="outline"
                    size="lg"
                    className="border-white/15 bg-white/[0.035] text-[var(--elysian-ink)] hover:bg-white/[0.07]"
                  >
                    Explore
                  </Button>
                </div>

                <GlassCard tone="deep-glass" className="rounded-[28px] p-4 sm:p-5">
                  <section aria-label="Primary WithIn modules">
                    <div className="mb-4 flex items-center justify-between gap-3 px-1">
                      <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(var(--within-ivory-rgb),0.72)]">
                        Available spaces
                      </h2>
                      <span className="text-[11px] text-[rgba(var(--within-ivory-rgb),0.48)]">
                        Live routes
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
                      {primaryModules.map((module) => (
                        <Link
                          key={module.href}
                          href={module.href}
                          className="elysian-door group flex min-h-[76px] flex-col justify-between rounded-[18px] p-3 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--within-ivory-rgb),0.72)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08070d] sm:min-h-[112px] sm:p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[15px] font-medium text-[var(--elysian-ink)]">
                              {module.label}
                            </span>
                            <span
                              aria-hidden
                              className="text-sm text-[rgba(var(--within-ivory-rgb),0.42)] transition duration-300 group-hover:translate-x-1 group-hover:text-[var(--elysian-ink)]"
                            >
                              →
                            </span>
                          </div>
                          <div className="mt-2 text-[12px] text-[var(--elysian-ink-soft)] sm:mt-4 sm:text-[13px]">
                            {module.summary}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                </GlassCard>
              </div>
            </div>
          </div>
        </AppShell>
        <CinematicLoaderGate />
      </div>
    </EntranceProvider>
  );
}
