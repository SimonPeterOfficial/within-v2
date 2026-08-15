import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UniverseShell from "@/components/layout/UniverseShell";
import ContentDetail from "@/components/sanctuary/ContentDetail";
import { ORIGINALS } from "@/lib/content";

export function generateStaticParams() {
  return ORIGINALS.map((original) => ({ id: original.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const original = ORIGINALS.find((item) => item.id === id);
  if (!original) return { title: "Not found — WithIn" };
  return {
    title: `${original.title} — WithIn Originals`,
    description: original.description
  };
}

export default async function OriginalDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const original = ORIGINALS.find((item) => item.id === id);
  if (!original) notFound();

  const related = ORIGINALS.filter((item) => item.id !== original.id)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      creator: item.creator ?? "WithIn Originals",
      description: item.description,
      meta: `${item.type} · ${item.duration}`,
      gradient: item.cover.gradient,
      emoji: item.cover.emoji,
      href: `/originals/${item.id}`
    }));

  return (
    <UniverseShell preset="originals">
      <ContentDetail
        kind={original.type}
        title={original.title}
        creator={original.creator ?? "WithIn Originals"}
        description={original.description ?? ""}
        meta={`${original.duration} · ${original.type}`}
        gradient={original.cover.gradient}
        emoji={original.cover.emoji}
        badges={[
          { label: "WithIn Original", tone: "emerald" as const },
          ...(original.status
            ? [{ label: original.status.toUpperCase().replace("-", " "), tone: "mood" as const }]
            : [])
        ]}
        related={related}
      />
    </UniverseShell>
  );
}
