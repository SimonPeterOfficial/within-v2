import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import ContextualRail from "@/components/home/ContextualRail";
import MirrorExperience from "@/components/mirror/MirrorExperience";

export const metadata: Metadata = {
  title: "Mirror — WithIn",
  description: "Quiet reflection — the WithIn mirror.",
};

/**
 * Mirror — a real room backed by /api/mirror.
 *
 * The experience owns its own header and session gate; entries are
 * owner-scoped server rows, never local storage or invented text.
 */
export default function MirrorPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-mirror">
      <MirrorExperience />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        <ContextualRail
          title="Nearby in the universe"
          destinations={[
            { label: "Sanctuary", href: "/sanctuary", icon: "heart", line: "A calmer you" },
            { label: "Within Time", href: "/atlas", icon: "clock", line: "Moments, layered" },
            { label: "Journey", href: "/journey", icon: "globe", line: "Your constellation" },
          ]}
        />
      </div>
    </UniverseShell>
  );
}
