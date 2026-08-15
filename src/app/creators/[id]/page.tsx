import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UniverseShell from "@/components/layout/UniverseShell";
import CreatorProfile from "@/components/creators/CreatorProfile";
import { CREATORS } from "@/lib/creators";

export function generateStaticParams() {
  return CREATORS.map((creator) => ({ id: creator.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const creator = CREATORS.find((item) => item.id === id);
  if (!creator) return { title: "Not found — WithIn" };
  return {
    title: `${creator.name} — Creators on WithIn`,
    description: creator.bio
  };
}

export default async function CreatorProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = CREATORS.find((item) => item.id === id);
  if (!creator) notFound();

  return (
    <UniverseShell preset="communities">
      <CreatorProfile creator={creator} />
    </UniverseShell>
  );
}
