import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UniverseShell from "@/components/layout/UniverseShell";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { getSessionUser } from "@/lib/auth/server";
import { getCommunityBySlug } from "@/lib/communities";
import CommunityMembership from "@/components/communities/CommunityMembership";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = await getCommunityBySlug(slug, null).catch(() => null);
  if (!found) return { title: "Community — WithIn" };
  return { title: `${found.community.name} — WithIn` };
}

/**
 * A community room — real membership, real owner, honest privacy.
 * Private rooms reveal nothing to non-members: not even a preview.
 */
export default async function CommunityPage({ params }: Params) {
  const { slug } = await params;
  const user = await getSessionUser();
  const found = await getCommunityBySlug(slug, user?.id ?? null).catch(() => null);

  if (!found) notFound();
  const { community, isMember, isPrivateHidden } = found;

  if (isPrivateHidden) {
    return (
      <UniverseShell preset="communities">
        <div className="mx-auto max-w-2xl px-6 pb-28 pt-28 text-center">
          <GlassCard tone="soft" className="p-10">
            <span aria-hidden className="text-3xl">🔒</span>
            <h1 className="mt-4 font-display text-2xl font-medium">This room is private</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
              A private room only shows itself to its members. If you know
              someone inside, ask them to bring you in.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button href="/communities" variant="outline" size="sm">
                Other rooms
              </Button>
              {!user && (
                <Button href="/login" size="sm">
                  Sign in
                </Button>
              )}
            </div>
          </GlassCard>
        </div>
      </UniverseShell>
    );
  }

  return (
    <UniverseShell preset="communities">
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-24">
        <Link href="/communities" className="text-xs text-gray-500 transition hover:text-white">
          ← All rooms
        </Link>

        <header className="mt-6 flex items-start gap-4">
          <span
            aria-hidden
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-2xl ${
              community.gradient ?? "bg-linear-to-br from-purple-500 to-emerald-400"
            }`}
          >
            {community.emoji ?? "✦"}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-medium tracking-[-0.02em]">{community.name}</h1>
            <p className="mt-1 text-xs text-gray-500">
              {community.memberCount} {community.memberCount === 1 ? "member" : "members"}
              {community.visibility === "private" && " · private"}
              {community.ownerName ? ` · kept by ${community.ownerName}` : ""}
            </p>
          </div>
        </header>

        {community.description && (
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-gray-300">{community.description}</p>
        )}

        <div className="mt-6">
          <CommunityMembership
            slug={community.slug}
            initialIsMember={isMember}
            isOwner={community.ownerId === user?.id}
          />
        </div>

        {isMember && (
          <GlassCard tone="soft" className="mt-8 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
              The room
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Discussion inside rooms arrives with the community conversation
              system — the membership, ownership and privacy layer is live
              today. Your membership is real and carries into everything that
              opens here next.
            </p>
          </GlassCard>
        )}
      </div>
    </UniverseShell>
  );
}
