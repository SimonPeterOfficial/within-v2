"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import CommunityCard from "@/components/ui/cards/CommunityCard";
import MeshGradient from "@/components/effects/MeshGradient";
import { COMMUNITIES } from "@/lib/content";
import { useStoredInterests } from "@/lib/interests";

type CommunitiesSectionProps = {
  /** Where the header action leads (sanctuary: #discover, landing: #join) */
  actionHref?: string;
};

/** Communities — quiet rooms full of kindred souls.
 * When Communities aren't among the listener's interests the rooms stay
 * reachable as a quiet rail — prominence follows preference. */
export default function CommunitiesSection({ actionHref = "#discover" }: CommunitiesSectionProps) {
  const interests = useStoredInterests();
  // No interests yet (new/landing) → everything is prominent. Otherwise the
  // rooms lead only when the listener actually chose them.
  const prominent = interests.length === 0 || interests.includes("communities");

  const renderCommunity = (community: (typeof COMMUNITIES)[number], index: number) => (
    <CommunityCard
      key={community.id}
      delay={index * 0.08}
      name={community.name}
      tagline={community.tagline}
      members={community.members}
      avatars={community.avatars}
      gradient={community.gradient}
    />
  );

  return (
    <section id="communities" className="relative scroll-mt-24 py-24 text-white">
      {/* Communal room — emerald meeting violet, quietly energetic */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <MeshGradient preset="communities" />
      </div>
      <Container className="relative">
        <SectionHeader
          align="left"
          eyebrow="Communities"
          title="Quiet rooms, kindred souls"
          subtitle="No feeds, no noise — just people who feel in the same language."
          action={
            <Button href={actionHref} variant="ghost" size="md">
              Find your room
            </Button>
          }
        />

        {prominent ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNITIES.map(renderCommunity)}
          </div>
        ) : (
          <div className="mt-12 flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {COMMUNITIES.map((community, index) => (
              <div key={community.id} className="w-72 shrink-0">
                {renderCommunity(community, index)}
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
