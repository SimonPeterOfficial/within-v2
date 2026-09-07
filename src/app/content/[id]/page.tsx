import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UniverseShell from "@/components/layout/UniverseShell";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/cards/Badge";
import ContentCard from "@/components/ui/cards/ContentCard";
import SaveButton from "@/components/content/SaveButton";
import ShareButton from "@/components/content/ShareButton";
import ReportButton from "@/components/content/ReportButton";
import ContentViewTracker from "@/components/content/ContentViewTracker";
import ModerationActions from "@/components/content/ModerationActions";
import { getSessionUser, touchUserActivity } from "@/lib/auth/server";
import {
  getContentForViewer,
  getContentViewCount,
  listPublishedByCreator,
  toUniverseEntry,
} from "@/lib/content-service";
import { getSaveState } from "@/lib/interactions";
import { hasRole } from "@/lib/auth/authorization";

type Props = { params: Promise<{ id: string }> };

const TYPE_LABEL: Record<string, string> = {
  film: "Film",
  video: "Video",
  book: "Book",
  story: "Story",
  post: "Post",
  audio: "Audio",
  image: "Image",
  other: "Other",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted for review",
  reviewing: "Under review",
  approved: "Approved — ready to publish",
  published: "Published",
  hidden: "Hidden",
  archived: "Archived",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const viewer = await getSessionUser();
  const item = await getContentForViewer(id, viewer?.id ?? null);
  if (!item) return { title: "Content — WithIn" };
  return {
    title: `${item.row.title} — WithIn`,
    description: item.row.description ?? undefined,
  };
}

export default async function ContentPage({ params }: Props) {
  const { id } = await params;
  const viewer = await getSessionUser();
  const item = await getContentForViewer(id, viewer?.id ?? null);
  if (!item) notFound();

  const { row: content, creatorName, username } = item;
  // Attribution fallback — the display name may be missing on legacy rows.
  const resolvedCreatorName = creatorName ?? content.attribution ?? "A WithIn creator";
  const isOwner = viewer !== null && viewer.id === content.creatorId;
  const isModerator = viewer !== null && hasRole(viewer, "moderator");
  const published = content.status === "published";

  const [viewCount, initialSaved, creatorWorks] = await Promise.all([
    getContentViewCount(id),
    viewer ? getSaveState(viewer.id, id, "saved") : Promise.resolve(false),
    listPublishedByCreator(content.creatorId),
  ]);

  // "More from this creator" — the same creator's other published work,
  // excluding the piece currently on screen.
  const related = creatorWorks
    .filter((row) => row.id !== id)
    .slice(0, 3)
    .map((row) => toUniverseEntry(row, resolvedCreatorName, username));

  const gradient = content.coverGradient ?? "from-purple-600 via-indigo-600 to-blue-600";

  return (
    <UniverseShell preset="sanctuary">
      {published && <ContentViewTracker contentId={id} />}
      <Container className="pb-28">
        <Button href="/discover" variant="ghost" size="sm" className="mb-8 -ml-3">
          <Icon name="back" size={14} className="mr-1" />
          Back to discover
        </Button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          {/* Main column */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="mood">{TYPE_LABEL[content.type] ?? content.type}</Badge>
              {content.status !== "published" && (isOwner || isModerator) && (
                <Badge tone={content.status === "approved" ? "emerald" : "warm"}>
                  {STATUS_LABEL[content.status] ?? content.status}
                </Badge>
              )}
              {content.category && <Badge tone="neutral">{content.category}</Badge>}
            </div>

            <h1 className="mt-6 font-display text-4xl font-medium tracking-[-0.02em] sm:text-5xl">
              {content.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
              <Link href={`/profile/${username}`} className="underline-offset-2 hover:text-white hover:underline">
                {resolvedCreatorName}
              </Link>
              {content.publishedAt && (
                <span>
                  {new Date(content.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span>
                {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
              </span>
            </div>

            {content.description && (
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-gray-300">{content.description}</p>
            )}

            {content.tags && content.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {!published && (isOwner || isModerator) && (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-gray-400">
                <p className="font-semibold text-white/80">{STATUS_LABEL[content.status] ?? content.status}</p>
                {content.moderationNote && (
                  <p className="mt-2">
                    Moderator note: <span className="text-gray-300">{content.moderationNote}</span>
                  </p>
                )}
                {content.status === "approved" && isOwner && (
                  <form
                    className="mt-4"
                    action={async () => {
                      "use server";
                      const session = await getSessionUser();
                      if (!session) return;
                      await (await import("@/lib/content-service")).publishContent(session.id, id);
                      await touchUserActivity(session.id);
                    }}
                  >
                    <Button type="submit" variant="primary" size="sm">
                      <Icon name="sparkles" size={14} className="mr-1" />
                      Publish now
                    </Button>
                  </form>
                )}
              </div>
            )}

            {isModerator && !published && <ModerationActions contentId={id} status={content.status} />}
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-6">
            <div
              className={`flex aspect-[4/3] items-center justify-center rounded-3xl bg-linear-to-br ${gradient} text-7xl shadow-soft`}
            >
              <span aria-hidden>{content.coverEmoji ?? "✦"}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SaveButton contentId={id} initialSaved={initialSaved} />
              <ShareButton path={`/content/${id}`} title={content.title} />
              <ReportButton targetType="content" targetId={id} />
            </div>
          </div>
        </div>

        {/* More from this creator — the shelf continues below the fold */}
        {related.length > 0 && (
          <div className="mt-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
              More from this creator
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
              Keep wandering {resolvedCreatorName}&apos;s universe
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((entry, index) => (
                <ContentCard
                  key={entry.id}
                  title={entry.title}
                  creator={entry.by}
                  description={entry.description}
                  meta={entry.meta}
                  href={entry.href}
                  cover={{ gradient: entry.gradient, emoji: entry.emoji }}
                  delay={index * 0.06}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </UniverseShell>
  );
}