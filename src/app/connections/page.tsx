import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import { CREATORS } from "@/lib/creators";
import { COMMUNITIES } from "@/lib/content";
import CreatorCard from "@/components/ui/cards/CreatorCard";
import CommunityCard from "@/components/ui/cards/CommunityCard";
import { MotionContainer, FadeItem } from "@/components/motion/MotionStagger";

export const metadata: Metadata = {
  title: "Connections — WithIn",
  description: "Your people — the WithIn connections.",
};

/**
 * Connections — the people of WithIn.
 *
 * Shows creators and communities that the user can connect with.
 * Uses real data from lib/creators and lib/content.
 */
export default function ConnectionsPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-connections">
      <WorldHero
        eyebrow={copy.connections.eyebrow}
        title={copy.connections.title}
        subtitle={copy.connections.subtitle}
        worldClass="world-connections"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        {/* People — creators to discover */}
        <div className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            People
          </p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
            Creators to discover
          </h2>
          <MotionContainer className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CREATORS.slice(0, 3).map((creator, index) => (
              <FadeItem key={creator.id}>
                <CreatorCard creator={creator} delay={index * 0.06} />
              </FadeItem>
            ))}
          </MotionContainer>
        </div>

        {/* Communities — spaces to join */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            Communities
          </p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
            Spaces to belong
          </h2>
          <MotionContainer className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COMMUNITIES.slice(0, 3).map((community, index) => (
              <FadeItem key={community.id}>
                <CommunityCard
                  name={community.name}
                  tagline={community.tagline}
                  avatars={community.avatars}
                  gradient={community.gradient}
                  members={community.members}
                  delay={index * 0.06}
                />
              </FadeItem>
            ))}
          </MotionContainer>
        </div>

        <div className="mt-6">
          <ContextualRail
            title="Your universe"
            destinations={[
              { label: "Messages", href: "/conversations", icon: "message", line: "Conversations" },
              { label: "Communities", href: "/communities", icon: "users", line: "Find your people" },
              { label: "Creators", href: "/creators", icon: "star", line: "Real people. Real stories." },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
