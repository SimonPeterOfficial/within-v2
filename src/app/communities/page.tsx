import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import LiveCommunities from "@/components/communities/LiveCommunities";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Communities — WithIn",
  description: "Quiet rooms full of kindred souls — communities on WithIn.",
};

export default function CommunitiesPage() {
  return (
    <UniverseShell preset="communities">
      <PageHero
        eyebrow={copy.communities.eyebrow}
        title={copy.communities.title}
        subtitle={copy.communities.subtitle}
      />
      <LiveCommunities />
    </UniverseShell>
  );
}
