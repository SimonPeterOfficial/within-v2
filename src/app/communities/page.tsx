import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import CommunitiesSection from "@/components/sanctuary/CommunitiesSection";
import CommunitiesCategories from "@/components/communities/CommunitiesCategories";
import RecentDiscussions from "@/components/communities/RecentDiscussions";
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
      <CommunitiesSection actionHref="/discover" />
      <CommunitiesCategories />
      <RecentDiscussions />
    </UniverseShell>
  );
}
