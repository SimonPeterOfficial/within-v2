import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import MusicSection from "@/components/sanctuary/MusicSection";
import MusicArtists from "@/components/music/MusicArtists";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Music — WithIn",
  description: "Soundscapes for the way you feel — albums, artists and slow tides.",
};

export default function MusicPage() {
  return (
    <UniverseShell preset="music">
      <PageHero
        eyebrow={copy.music.eyebrow}
        title={copy.music.title}
        subtitle={copy.music.subtitle}
      />
      <MusicSection actionHref="/discover" />
      <MusicArtists />
    </UniverseShell>
  );
}
