import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DepthLayers from "@/components/effects/DepthLayers";
import AppShell, { type SidebarItem } from "@/components/layout/AppShell";
import StudioWorkspace from "@/components/studio/StudioWorkspace";
import { getSessionUser, touchUserActivity } from "@/lib/auth/server";
import { processDuePublications } from "@/lib/studio";

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
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <DepthLayers preset="sanctuary" particles={5} stars={14} fog={0.5} />
      <AppShell items={shellItems}>
        <StudioWorkspace creatorName={user.name} />
      </AppShell>
    </div>
  );
}
