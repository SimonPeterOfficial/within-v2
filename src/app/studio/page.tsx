import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import StudioWorkspace from "@/components/studio/StudioWorkspace";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { getSessionUser, touchUserActivity } from "@/lib/auth/server";
import { processDuePublications } from "@/lib/studio";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Studio — WithIn",
  description: "Your creative workspace: drafts, publishing, and honest numbers.",
};

export const dynamic = "force-dynamic";

const shellItems: SidebarItem[] = [
  { label: "Home", href: "/home", icon: "home", route: true },
  { label: "Studio", href: "/studio", icon: "dashboard", route: true },
  { label: "Discover", href: "/discover", icon: "discover", route: true },
  { label: "Creators", href: "/creators", icon: "star", route: true },
  { label: "Profile", href: "/profile", icon: "profile", route: true },
  { label: "Settings", href: "/settings", icon: "settings", route: true },
];

/**
 * Studio — the creator's workspace. Everything renders from the caller's
 * real rows; an unauthenticated visitor is simply sent to sign in.
 */
export default async function StudioPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Due scheduled publications go live opportunistically, server-side.
  await processDuePublications().catch(() => undefined);
  await touchUserActivity(user.id);

  return (
    <div className="crystal-world relative min-h-screen overflow-hidden text-[#232136]">
      <AppShell items={shellItems}>
        <WorldHero
          eyebrow="Studio"
          title="Your creative workspace"
          subtitle="Drafts, publishing, and honest numbers — a quiet, focused place to create."
          worldClass="world-studio"
        />
        <div className="relative z-10 px-4 pb-28 md:px-6">
          <StudioWorkspace creatorName={user.name} />
          <div className="mt-6">
            <ContextualRail
              title="Your creative universe"
              destinations={[
                { label: "Creators", href: "/creators", icon: "star", line: "Real people. Real stories." },
                { label: "Originals", href: "/originals", icon: "originals", line: "Films, series & more" },
                { label: "Communities", href: "/communities", icon: "users", line: "Find your people" },
              ]}
            />
          </div>
        </div>
      </AppShell>
    </div>
  );
}
