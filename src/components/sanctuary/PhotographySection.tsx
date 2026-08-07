"use client";

import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ContentCard from "@/components/ui/cards/ContentCard";

const photos = [
  {
    id: "salt-flats",
    title: "Salt flats at dusk",
    by: "Lena Vos",
    caption: "The sky folded into the ground and forgot which one it was.",
    place: "Salar de Uyuni",
    gradient: "from-purple-600 via-indigo-600 to-slate-800",
    emoji: "🌅",
    tall: true
  },
  {
    id: "quiet-tide",
    title: "The quiet tide",
    by: "Omar Hale",
    caption: "It came in the way patience does — without being asked.",
    place: "Pacific coast",
    gradient: "from-cyan-600 to-blue-800",
    emoji: "🌊"
  },
  {
    id: "first-light",
    title: "First light",
    by: "Priya Nair",
    caption: "Morning arrived as a rumor, then proved itself.",
    place: "High atlas",
    gradient: "from-amber-500 to-orange-700",
    emoji: "🏔"
  },
  {
    id: "lonely-star",
    title: "A lonely star",
    by: "Jonas Wu",
    caption: "One point of light, keeping its whole desert company.",
    place: "Namib desert",
    gradient: "from-slate-700 to-slate-900",
    emoji: "⭐"
  },
  {
    id: "rain-on-glass",
    title: "Rain on glass",
    by: "Mira Chen",
    caption: "The city blurred itself kindly for one night.",
    place: "Old town, 3 a.m.",
    gradient: "from-slate-500 to-slate-800",
    emoji: "🌧"
  },
  {
    id: "last-ferry",
    title: "The last ferry",
    by: "Lena Vos",
    caption: "Every light here is a person going home.",
    place: "Harbor at night",
    gradient: "from-teal-600 to-emerald-800",
    emoji: "⛴"
  }
];

/** Photography — stillness, captured. One tall frame anchors a balanced wall. */
export default function PhotographySection() {
  return (
    <section id="photography" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Photography"
          title="Stillness, captured"
          subtitle="Frames from people who wait for the light to lean a certain way."
          action={
            <Button href="#communities" variant="ghost" size="md">
              Meet the photographers
            </Button>
          }
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {photos.map((photo, index) => (
            <ContentCard
              key={photo.id}
              delay={index * 0.08}
              title={photo.title}
              creator={`By ${photo.by}`}
              description={photo.caption}
              meta={photo.place}
              badges={index === 0 ? [{ label: "Featured", tone: "mood" as const }] : undefined}
              cover={{
                gradient: photo.gradient,
                emoji: photo.emoji,
                className: photo.tall ? "h-72 md:h-full md:min-h-[24rem]" : "h-48"
              }}
              className={photo.tall ? "md:col-span-2 md:row-span-2" : ""}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-gray-600">
          A new frame every night, hung by the community
        </p>
      </Container>
    </section>
  );
}
