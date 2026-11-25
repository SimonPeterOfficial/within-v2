import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import ContextualRail from "@/components/home/ContextualRail";
import ConnectionsExperience from "@/components/connections/ConnectionsExperience";

export const metadata: Metadata = {
  title: "Connections — WithIn",
  description: "Your people — the WithIn connections.",
};

/**
 * Connections — the user's real social home.
 *
 * Backed by /api/social: friendships, explicit requests, mutuals and blocks.
 * No static placeholder cards, no invented people.
 */
export default function ConnectionsPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-connections">
      <ConnectionsExperience />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        <ContextualRail
          title="Your universe"
          destinations={[
            { label: "Messages", href: "/conversations", icon: "message", line: "Conversations" },
            { label: "Communities", href: "/communities", icon: "users", line: "Find your people" },
            { label: "Creators", href: "/creators", icon: "star", line: "Real people. Real stories." },
          ]}
        />
      </div>
    </UniverseShell>
  );
}
