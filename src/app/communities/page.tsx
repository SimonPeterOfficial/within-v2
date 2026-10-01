import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import LiveCommunities from "@/components/communities/LiveCommunities";
import WorldHero from "@/components/home/WorldHero";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Communities — WithIn",
  description: "Find your people — the WithIn communities.",
};

export const dynamic = "force-dynamic";

/**
 * Communities — gathering places inside the WithIn world.
 *
 * The LiveCommunities component is fully functional:
 * - Real community listing from /api/communities
 * - Search with debounce
 * - Create community with real API
 * - Join/Leave with optimistic state
 * - Member counts
 * - Empty states
 *
 * The visual language is WithIn's crystal material system.
 */
export default function CommunitiesPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-connections">
      <WorldHero
        eyebrow={copy.communities.eyebrow}
        title={copy.communities.title}
        subtitle={copy.communities.subtitle}
        worldClass="world-connections"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        <LiveCommunities />
      </div>
    </UniverseShell>
  );
}
