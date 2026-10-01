import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import RequireAuth from "@/components/auth/RequireAuth";
import SettingsView from "@/components/settings/SettingsView";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Settings — WithIn",
  description: "Make it yours — tune the world to how you feel.",
};

export default function SettingsPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-mirror">
      <RequireAuth>
        <WorldHero
          eyebrow={copy.settings.eyebrow}
          title={copy.settings.title}
          subtitle={copy.settings.subtitle}
          worldClass="world-mirror"
        />
        <div className="relative z-10 px-4 pb-28 md:px-6">
          <SettingsView />
          <div className="mt-6">
            <ContextualRail
              title="Your universe"
              destinations={[
                { label: "Profile", href: "/profile", icon: "profile", line: "Your corner of WithIn" },
                { label: "Journey", href: "/journey", icon: "globe", line: "Your constellation" },
                { label: "Connections", href: "/connections", icon: "users", line: "Your people" },
              ]}
            />
          </div>
        </div>
      </RequireAuth>
    </UniverseShell>
  );
}
