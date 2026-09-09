import type { Metadata } from "next";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import MirrorExperience from "@/components/mirror/MirrorExperience";

export const metadata: Metadata = {
  title: "WithIn — Mirror",
  description: "A quiet room for your own reflections. Private by default.",
};

const shellItems: SidebarItem[] = [
  { label: "Home", href: "/home", icon: "home", route: true },
  { label: "Discover", href: "/discover", icon: "discover", route: true },
  { label: "Mirror", href: "/mirror", icon: "eye", route: true },
  { label: "Profile", href: "/profile", icon: "profile", route: true },
  { label: "Settings", href: "/settings", icon: "settings", route: true },
];

export default function MirrorPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <AppShell items={shellItems} atmosphere="calm">
        <MirrorExperience />
      </AppShell>
    </div>
  );
}
