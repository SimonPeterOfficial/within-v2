import type { Metadata } from "next";
import DepthLayers from "@/components/effects/DepthLayers";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import ConnectionsExperience from "@/components/connections/ConnectionsExperience";

export const metadata: Metadata = {
  title: "WithIn — Connections",
  description: "Your people — friends, requests, conversations, communities.",
};

const shellItems: SidebarItem[] = [
  { label: "Home", href: "/home", icon: "home", route: true },
  { label: "Discover", href: "/discover", icon: "discover", route: true },
  { label: "Connections", href: "/connections", icon: "users", route: true },
  { label: "Conversations", href: "/conversations", icon: "send", route: true },
  { label: "Communities", href: "/communities", icon: "users", route: true },
  { label: "Mirror", href: "/mirror", icon: "eye", route: true },
  { label: "Profile", href: "/profile", icon: "profile", route: true },
  { label: "Settings", href: "/settings", icon: "settings", route: true },
];

export default function ConnectionsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <DepthLayers preset="sanctuary" particles={5} stars={14} fog={0.5} />
      <AppShell items={shellItems}>
        <ConnectionsExperience />
      </AppShell>
    </div>
  );
}
