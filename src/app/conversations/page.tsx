import type { Metadata } from "next";
import { Suspense } from "react";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import MessagingExperience from "@/components/messaging/MessagingExperience";

export const metadata: Metadata = {
  title: "WithIn — Conversations",
  description: "Quiet, direct conversations with your people.",
};

const shellItems: SidebarItem[] = [
  { label: "Home", href: "/home", icon: "home", route: true },
  { label: "Discover", href: "/discover", icon: "discover", route: true },
  { label: "Connections", href: "/connections", icon: "users", route: true },
  { label: "Conversations", href: "/conversations", icon: "send", route: true },
  { label: "Mirror", href: "/mirror", icon: "eye", route: true },
  { label: "Profile", href: "/profile", icon: "profile", route: true },
  { label: "Settings", href: "/settings", icon: "settings", route: true },
];

export default function ConversationsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <AppShell items={shellItems} atmosphere="world">
        {/* Suspense boundary — the messaging experience reads ?with= from the URL. */}
        <Suspense>
          <MessagingExperience />
        </Suspense>
      </AppShell>
    </div>
  );
}
