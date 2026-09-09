import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import JourneyExperience from "@/components/journey/JourneyExperience";
import PersonalAtlas from "@/components/universe/PersonalAtlas";

export const metadata: Metadata = {
  title: "Your Journey — WithIn",
  description:
    "Your personal exploration atlas — the threads you've followed, the worlds you've visited, and the constellation they form.",
};

/**
 * The Journey room — Gen 12's Personal Exploration Atlas.
 *
 * The room is crystal: the atlas (threads, steps, worlds) lives in the
 * light. Below it, the constellation — the older sky instrument — hangs
 * as a deliberate night window: a view of the same journey seen from
 * the dark. Both are private, on-device, user-controlled.
 */
export default function JourneyPage() {
  return (
    <div className="crystal-world relative min-h-screen overflow-hidden text-[#232136]">
      {/* Soft environmental light — same world as /home */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 15% -10%, rgba(var(--mood-rgb),0.16), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(124,108,224,0.12), transparent 55%)",
        }}
      />

      <div className="relative z-10 pb-28 pt-14">
        <Container>
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
              The exploration atlas
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.02em] text-[#232136] md:text-5xl">
              Everything you&apos;ve wandered{" "}
              <span
                className="bg-clip-text italic text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, #5b4bc4, #7c6ce0 45%, #4aa8c9)",
                }}
              >
                through
              </span>
              .
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6f6e88]">
              Every thread you follow leaves a path. This is your map of
              them — private, kept on your device, yours to clear.
            </p>
          </header>

          {/* The atlas — threads, steps, worlds, bookmarks */}
          <div className="mx-auto mt-10 max-w-3xl">
            <PersonalAtlas />
          </div>

          {/* The night window — the constellation view of the same journey */}
          <section aria-label="Your constellation" className="mt-14">
            <div className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-[28px] shadow-[var(--depth-high)] ring-1 ring-white/50">
                <JourneyExperience />
              </div>
              <p className="mt-4 text-center text-[12px] text-[#8b8aa0]">
                The same journey, seen from the night side — every discovery
                a star in your constellation.
              </p>
            </div>
          </section>
        </Container>
      </div>
    </div>
  );
}
