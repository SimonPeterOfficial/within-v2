"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import ContentCard from "@/components/ui/cards/ContentCard";
import { ORIGINALS } from "@/lib/content";
import { staggerContainer, slideUp } from "@/lib/animations";

/** Status chip tone per label — keeps the catalogue quiet but legible. */
const statusTone = (status: string): "mood" | "emerald" | "warm" => {
  if (status === "Featured") return "mood";
  if (status === "New") return "emerald";
  return "warm";
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  "coming-soon": "Coming soon",
  featured: "Featured"
};

/** The full Originals shelf — every title in the studio catalogue. */
export default function OriginalsGrid() {
  return (
    <section className="scroll-mt-24 pb-28 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="The full catalogue"
          title="Every WithIn Original"
          subtitle="Artwork, creators, genres — nothing claims a release date that isn't mock."
        />

        <motion.div
          variants={staggerContainer(0.05, 0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ORIGINALS.map((original, index) => (
            <motion.div key={original.id} variants={slideUp} className="h-full">
              <ContentCard
                title={original.title}
                creator={original.creator}
                description={original.description}
                meta={`${original.type} · ${original.duration}`}
                href={`/originals/${original.id}`}
                tone="cinematic"
                cover={{ gradient: original.cover.gradient, emoji: original.cover.emoji }}
                badges={
                  original.status
                    ? [
                        {
                          label: STATUS_LABEL[original.status],
                          tone: statusTone(STATUS_LABEL[original.status])
                        }
                      ]
                    : undefined
                }
                delay={index * 0.05}
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
