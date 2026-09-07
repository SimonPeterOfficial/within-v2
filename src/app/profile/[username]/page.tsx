import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UniverseShell from "@/components/layout/UniverseShell";
import PublicProfileView from "@/components/profile/PublicProfileView";
import { getPublicProfile } from "@/lib/profiles";
import { getSessionUser } from "@/lib/auth/server";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Profile — WithIn" };
  return {
    title: `${profile.displayName} — WithIn`,
    description: profile.bio ?? `The universe of ${profile.displayName} on WithIn.`,
  };
}

/**
 * Public profile — /profile/[username]
 * Server-rendered from real records. Anyone (signed in or not) can view a
 * public profile; the follow button appears for signed-in visitors.
 */
export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const viewer = await getSessionUser();

  const exists = await getPublicProfile(username);
  if (!exists) notFound();

  return (
    <UniverseShell preset="sanctuary">
      <div className="pt-12">
        <PublicProfileView username={username} viewerId={viewer?.id ?? null} />
      </div>
    </UniverseShell>
  );
}