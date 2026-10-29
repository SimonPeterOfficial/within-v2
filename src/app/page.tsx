import type { Metadata } from "next";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import WithinMark from "@/components/ui/WithinMark";
import { UNIVERSE_NAV } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "WithIn — A place to be",
  description: "A focused, personal digital space for your world within.",
};

const primaryModules = [
  { label: "Home", href: "/home", summary: "Your universe" },
  { label: "Atlas", href: "/atlas", summary: "Temporal map" },
  { label: "Time", href: "/time", summary: "Your now" },
  { label: "Explore", href: "/explore", summary: "New rooms" },
  { label: "Profile", href: "/profile", summary: "Your presence" },
];

export default function LandingPage() {
  return (
    <AppShell items={UNIVERSE_NAV}>
      <div className="relative min-h-screen bg-[#050505] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1180px] items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
          <div className="w-full max-w-[880px]">
            <div className="mb-8 flex items-center gap-4">
              <WithinMark variant="mark" size={42} />
              <div className="text-xs font-medium uppercase tracking-[0.34em] text-white/50">WithIn</div>
            </div>

            <header className="mb-8">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-[rgba(var(--mood-rgb),0.8)]">
                Enter the room
              </p>
              <h1 className="max-w-2xl text-[clamp(2.2rem,6vw,4.4rem)] font-display font-semibold leading-[0.96] tracking-[-0.06em] text-white">
                The world is loud.
                <span className="block text-white/85">Find your WithIn.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/68">
                A quieter place for stories, focus, and the moments that matter.
              </p>
            </header>

            <div className="mb-10 flex flex-wrap gap-3">
              <Button href="/home" variant="gradient" size="lg">
                Enter WithIn
              </Button>
              <Button href="/discover" variant="outline" size="lg">
                Explore
              </Button>
            </div>

            <section aria-label="Primary WithIn modules" className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Available spaces</h2>
                <span className="text-xs text-white/40">Live routes</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {primaryModules.map((module) => (
                  <Link
                    key={module.href}
                    href={module.href}
                    className="group flex min-h-[124px] flex-col justify-between rounded-2xl border border-white/8 bg-[#0a0b11] p-4 transition-colors hover:border-white/15 hover:bg-[#10131a] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mood-rgb),0.5)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-semibold text-white">{module.label}</span>
                      <span className="text-sm text-white/35 transition-transform group-hover:translate-x-0.5">→</span>
                    </div>
                    <div className="mt-4 text-sm text-white/55">{module.summary}</div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
