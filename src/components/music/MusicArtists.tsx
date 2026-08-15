"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { CREATORS } from "@/lib/creators";
import { staggerContainer, slideUp } from "@/lib/animations";

const artists = CREATORS.filter((creator) => creator.categories.includes("Music"));

/** Artists behind the albums — a quiet row of faces above the shelf. */
export default function MusicArtists() {
  if (artists.length === 0) return null;

  return (
    <section className="scroll-mt-24 pb-28 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="The artists"
          title="Who's making the sound"
          subtitle="Music on WithIn is made by creators you can follow."
        />

        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 flex flex-wrap gap-4"
        >
          {artists.map((artist) => (
            <motion.div key={artist.id} variants={slideUp}>
              <Link
                href={`/creators/${artist.id}`}
                className="group flex items-center gap-4 rounded-full border border-white/10 bg-white/5 py-2 pl-2 pr-6 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(var(--mood-rgb),0.4)] hover:bg-white/10"
              >
                <span
                  aria-hidden
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${artist.gradient} text-xl`}
                >
                  {artist.avatar}
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-white">{artist.name}</span>
                  <span className="block text-xs text-gray-500">
                    {artist.followers.toLocaleString()} followers
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
