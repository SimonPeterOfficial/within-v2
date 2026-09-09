import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import ConstellationExperience from "@/components/people/ConstellationExperience";
import HumanDiscovery from "@/components/people/HumanDiscovery";
import CommunityEntrance from "@/components/people/CommunityEntrance";
import { COMMUNITIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Human Constellation — WithIn",
  description:
    "The people of WithIn: creators, their works, the rooms gathered around them — an explorable constellation of everyone here.",
};

/**
 * The Human Constellation — Gen 13.
 *
 * One room where the people of WithIn become visible: the explorable sky,
 * contextual human discovery with its reasons shown, and community
 * entrances. A landscape over public creative work — never a popularity
 * map, never a follower leaderboard.
 */
export default function ConstellationPage() {
  return (
    <div className="crystal-world relative min-h-screen overflow-hidden text-[#232136]">
      {/* Soft environmental light — same world as /home */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 560px at 20% -8%, rgba(124,108,224,0.16), transparent 60%), radial-gradient(800px 460px at 85% 12%, rgba(74,168,201,0.13), transparent 55%), radial-gradient(700px 420px at 50% 105%, rgba(212,132,196,0.1), transparent 60%)",
        }}
      />

      <div className="relative z-10 pb-28 pt-14">
        <Container>
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
              The human constellation
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.02em] text-[#232136] md:text-5xl">
              There are{" "}
              <span
                className="bg-clip-text italic text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, #5b4bc4, #7c6ce0 45%, #d484c4)",
                }}
              >
                people
              </span>{" "}
              here.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6f6e88]">
              Every point of light is a person, a work, a room, a world.
              Tap one and its connections unfold — all of them real, none of
              them a ranking.
            </p>
          </header>

          {/* The explorable sky */}
          <div className="mt-10">
            <ConstellationExperience />
          </div>

          {/* Contextual human discovery — explained, on-device signals only */}
          <div className="mx-auto mt-8 max-w-3xl">
            <HumanDiscovery />
          </div>

          {/* Community entrances — threshold experiences, not profile cards */}
          <section aria-label="Step inside a room" className="mt-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
                Community entrances
              </p>
              <h2 className="mt-2 font-display text-2xl font-medium text-[#232136]">
                Some doors, gently open
              </h2>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {COMMUNITIES.slice(0, 2).map((community) => (
                <CommunityEntrance key={community.id} community={community} />
              ))}
            </div>
          </section>
        </Container>
      </div>
    </div>
  );
}
