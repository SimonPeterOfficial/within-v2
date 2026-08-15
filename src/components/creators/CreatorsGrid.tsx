"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import CreatorCard from "@/components/ui/cards/CreatorCard";
import CreatorBadge from "@/components/ui/cards/CreatorBadge";
import { CREATORS, CREATOR_BADGES } from "@/lib/creators";
import { staggerContainer, slideUp } from "@/lib/animations";

const featured = CREATORS.filter((creator) => creator.badges.includes("featured"));
const rising = CREATORS.filter((creator) => creator.badges.includes("rising"));
const roster = CREATORS.filter(
  (creator) => !creator.badges.includes("featured") && !creator.badges.includes("rising")
);

function Shelf({ title, creators }: { title: string; creators: typeof CREATORS }) {
  if (creators.length === 0) return null;
  return (
    <>
      <div className="mt-14 flex items-end justify-between">
        <h3 className="font-display text-xl font-medium tracking-[-0.02em]">{title}</h3>
        <span className="text-xs text-gray-600">{creators.length}</span>
      </div>
      <motion.div
        variants={staggerContainer(0.05, 0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {creators.map((creator, index) => (
          <motion.div key={creator.id} variants={slideUp} className="h-full">
            <CreatorCard creator={creator} delay={index * 0.05} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

/** The creator roster — Featured, Rising, then everyone else. */
export default function CreatorsGrid() {
  return (
    <section className="scroll-mt-24 pb-28 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="The roster"
          title="The people who make it"
          subtitle="Each badge says something true: Featured and WithIn Original mark special standing — the rest just describe who they are."
        />

        {/* Badge legend */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <p className="text-xs text-gray-500">Badges:</p>
          {Object.keys(CREATOR_BADGES).map((key) => (
            <CreatorBadge key={key} badge={key as keyof typeof CREATOR_BADGES} />
          ))}
        </div>

        <Shelf title="Featured" creators={featured} />
        <Shelf title="Rising" creators={rising} />
        <Shelf title="Everyone else" creators={roster} />

        {/* The future of the ecosystem — honest, no fake payments */}
        <div className="mt-16 rounded-card border border-white/10 bg-white/[0.04] px-8 py-10 text-center backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
            The creator ecosystem
          </p>
          <h3 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
            Room to grow into something more
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
            Publishing, selling, scheduling releases and earning are on the roadmap — none of it
            is live or claimed today. What exists now is the profile, the work, and the badge
            that says who&apos;s who.
          </p>
        </div>
      </Container>
    </section>
  );
}
