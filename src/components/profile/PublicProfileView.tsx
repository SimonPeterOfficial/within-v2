import Link from "next/link";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";
import ContentCard from "@/components/ui/cards/ContentCard";
import Badge from "@/components/ui/cards/Badge";
import AuriEmptyState from "@/components/ui/states/AuriEmptyState";
import FollowButton from "@/components/profile/FollowButton";
import { getPublicProfile } from "@/lib/profiles";
import { listPublishedByCreator, toUniverseEntry } from "@/lib/content-service";
import { isFollowing } from "@/lib/follows";

const ROLE_LABEL: Record<string, string> = {
  user: "Member",
  creator: "Creator",
  moderator: "Moderator",
  admin: "Admin",
  super_admin: "Super Admin",
};

type PublicProfileViewProps = {
  username: string;
  viewerId: string | null;
};

/**
 * The public profile — real records from Postgres, rendered in the WithIn
 * visual language. Followers, following, and published content counts are
 * live queries; the follow button writes through /api/follows.
 */
export default async function PublicProfileView({ username, viewerId }: PublicProfileViewProps) {
  const profile = await getPublicProfile(username);
  if (!profile) return null;

  const isOwner = viewerId !== null && viewerId === profile.userId;
  const [published, alreadyFollowing] = await Promise.all([
    listPublishedByCreator(profile.userId),
    viewerId ? isFollowing(viewerId, profile.userId) : Promise.resolve(false),
  ]);

  const gradient = profile.gradient ?? "from-purple-500 to-emerald-400";

  return (
    <Container className="pb-28">
      {/* Identity */}
      {/* Identity — editorial crystal surface */}
      <GlassCard tone="strong" className="crystal-elevated crystal-edge depth-medium p-7 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-6">
            <span
              className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${gradient} text-3xl shadow-orb`}
            >
              {profile.avatar ?? "✦"}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-medium tracking-[-0.02em]">
                  {profile.displayName}
                </h1>
                <Badge tone="mood">{ROLE_LABEL[profile.role] ?? "Member"}</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">@{profile.username}</p>
              {profile.bio && <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-300">{profile.bio}</p>}
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-400">
                <span>
                  <strong className="font-semibold text-white">{profile.followers.toLocaleString()}</strong>{" "}
                  followers
                </span>
                <span>
                  <strong className="font-semibold text-white">{profile.following.toLocaleString()}</strong>{" "}
                  following
                </span>
                <span>
                  <strong className="font-semibold text-white">{profile.contentCount}</strong> published
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {isOwner ? (
              <Link
                href="/profile"
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
              >
                Your corner
              </Link>
            ) : viewerId ? (
              <FollowButton
                followeeId={profile.userId}
                initialFollowing={alreadyFollowing}
                followerCount={profile.followers}
              />
            ) : null}
            {isOwner && (
              <Link
                href="/settings"
                className="text-xs text-gray-500 underline-offset-2 hover:text-gray-300 hover:underline"
              >
                Edit profile
              </Link>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Content */}
      <div className="mt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">Published</p>
        <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
          {profile.displayName}&apos;s universe
        </h2>
        {published.length === 0 ? (
          <AuriEmptyState
            className="mt-8"
            message={
              isOwner
                ? "Nothing published yet — your corner is waiting."
                : `${profile.displayName} hasn't published anything yet.`
            }
            detail="When content is published here, it will gather in this shelf."
          />
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((item, index) => {
              const entry = toUniverseEntry(item, profile.displayName, profile.username);
              return (
                <ContentCard
                  key={item.id}
                  title={entry.title}
                  creator={entry.by}
                  description={entry.description}
                  meta={entry.meta}
                  href={entry.href}
                  cover={{ gradient: entry.gradient, emoji: entry.emoji }}
                  delay={index * 0.06}
                />
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}