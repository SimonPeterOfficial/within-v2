import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import LiveCommunities from "@/components/communities/LiveCommunities";
import HumanDiscovery from "@/components/people/HumanDiscovery";
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
      {/* Gen 13 — who is here with you, honestly explained */}
      <div className="mx-auto max-w-3xl pb-4">
        <HumanDiscovery />
      </div>
      <LiveCommunities />
    </UniverseShell>
  );
}
