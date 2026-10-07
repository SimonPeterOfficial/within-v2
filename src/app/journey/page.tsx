import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import JourneyExperience from "@/components/journey/JourneyExperience";
import PersonalAtlas from "@/components/universe/PersonalAtlas";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";

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
      <Container>
        <WorldHero
          eyebrow="Your Journey"
          title="The threads you've followed"
          subtitle="Your personal exploration atlas — the worlds you've visited, and the constellation they form."
          worldClass="world-within-time"
        />
        <JourneyExperience />
        <PersonalAtlas />
        <ContextualRail
          title="Continue your journey"
          destinations={[
            { label: "Explore", href: "/explore", icon: "discover", line: "The endless universe" },
            { label: "Within Time", href: "/atlas", icon: "clock", line: "Moments, layered" },
            { label: "Mirror", href: "/mirror", icon: "eye", line: "Quiet reflection" },
          ]}
        />
      </Container>
    </div>
  );
}
