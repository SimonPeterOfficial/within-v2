"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import CommunityCard from "@/components/ui/cards/CommunityCard";
import MeshGradient from "@/components/effects/MeshGradient";
import { COMMUNITIES } from "@/lib/content";

type CommunitiesSectionProps = {
  /** Where the header action leads (sanctuary: #discover, landing: #join) */
  actionHref?: string;
};

/** Communities — quiet rooms full of kindred souls. */
export default function CommunitiesSection({ actionHref = "#discover" }: CommunitiesSectionProps) {
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COMMUNITIES.map((community, index) => (
            <CommunityCard
              key={community.id}
              delay={index * 0.08}
              name={community.name}
              tagline={community.tagline}
              members={community.members}
              avatars={community.avatars}
              gradient={community.gradient}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
