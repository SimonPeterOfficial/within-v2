"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import CommunityCard from "@/components/ui/cards/CommunityCard";

const communities = [
  {
    id: "moonwater",
    name: "Moonwater",
    tagline: "For those who feel too much, too quietly.",
    members: 1284,
    avatars: ["🌙", "🌊", "✨"],
    gradient: "from-indigo-500 to-slate-700"
  },
  {
    id: "dawn-chorus",
    name: "Dawn Chorus",
    tagline: "Morning people writing their way into the light.",
    members: 2319,
    avatars: ["🌅", "🕊", "☕"],
    gradient: "from-amber-500 to-orange-600"
  },
  {
    id: "unsent",
    name: "Letters We Never Sent",
    tagline: "Unsent words, beautifully kept.",
    members: 875,
    avatars: ["💌", "🕯", "📮"],
    gradient: "from-rose-500 to-pink-700"
  },
  {
    id: "ember-club",
    name: "Ember Club",
    tagline: "Small fires, slow conversations.",
    members: 1560,
    avatars: ["🔥", "🪵", "🌌"],
    gradient: "from-orange-500 to-red-700"
  }
];

type CommunitiesSectionProps = {
  /** Where the header action leads (sanctuary: #discover, landing: #join) */
  actionHref?: string;
};

/** Communities — quiet rooms full of kindred souls. */
export default function CommunitiesSection({ actionHref = "#discover" }: CommunitiesSectionProps) {
  return (
    <section id="communities" className="scroll-mt-24 py-24 text-white">
      <Container>
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
          {communities.map((community, index) => (
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
