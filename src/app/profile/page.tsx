import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import RequireAuth from "@/components/auth/RequireAuth";
import ProfileView from "@/components/profile/ProfileView";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Profile — WithIn",
  description: "Your corner of WithIn — saved content, likes, and your journey.",
};

export default function ProfilePage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-connections">
      <RequireAuth>
        <WorldHero
          eyebrow={copy.profile.eyebrow}
          title={copy.profile.title}
          subtitle={copy.profile.subtitle}
          worldClass="world-connections"
        />
        <div className="relative z-10 px-4 pb-28 md:px-6">
          <ProfileView />
          <div className="mt-6">
            <ContextualRail
              title="Your universe"
              destinations={[
                { label: "Journey", href: "/journey", icon: "globe", line: "Your constellation" },
                { label: "Settings", href: "/settings", icon: "settings", line: "Make it yours" },
                { label: "Connections", href: "/connections", icon: "users", line: "Your people" },
              ]}
            />
          </div>
        </div>
      </RequireAuth>
    </UniverseShell>
  );
}
