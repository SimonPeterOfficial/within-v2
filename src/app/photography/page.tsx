import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import PageHero from "@/components/ui/PageHero";
import PhotographySection from "@/components/sanctuary/PhotographySection";
import PhotographyEditorial from "@/components/photography/PhotographyEditorial";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Photography — WithIn",
  description: "Stillness, captured — frames from people who wait for the light.",
};

export default function PhotographyPage() {
  return (
    <UniverseShell preset="sanctuary">
      <PageHero
        eyebrow={copy.photography.eyebrow}
        title={copy.photography.title}
        subtitle={copy.photography.subtitle}
      />
      <PhotographySection actionHref="/creators" />
      <PhotographyEditorial />
    </UniverseShell>
  );
}
