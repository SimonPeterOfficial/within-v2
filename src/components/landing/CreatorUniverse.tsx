"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CreatorCard from "@/components/ui/cards/CreatorCard";
import { CREATORS } from "@/lib/creators";
import { staggerContainer, slideUp } from "@/lib/animations";

/** The first faces of the universe — writers, filmmakers, musicians, photographers. */
const FEATURED_CREATORS = CREATORS.filter((creator) =>
  creator.badges.includes("within-original") || creator.badges.includes("featured")
).slice(0, 4);

/**
 * The creator universe — the people who make WithIn feel the way it does.
 *
 * EDITORIAL PRESENTATION: First creator gets more visual weight,
 * remaining three form a supporting row. Section divider and ambient
 * glow provide visual rhythm.
 */
export default function CreatorUniverse() {
  const lead = FEATURED_CREATORS[0];
  const supporting = FEATURED_CREATORS.slice(1);

  return (
    <section id="creators" className="scroll-mt-24 py-28 text-white">
      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      <Container>
        {/* Header — editorial */}
        <motion.div
          variants={staggerContainer(0.2, 0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/50">
            The creator universe
          </p>
          <h2 className="mt-5 font-display text-3xl font-medium leading-[1.08] tracking-[-0.02em] md:text-5xl">
            Made by people who feel deeply
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-400/70 md:text-base">
            Filmmakers, writers, musicians and photographers build the world you wander.
          </p>
        </motion.div>

        {/* Lead creator — larger visual weight */}
        {lead && (
          <motion.div
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-6"
          >
            <motion.div variants={slideUp}>
              <CreatorCard creator={lead} />
            </motion.div>
          </motion.div>
        )}

        {/* Supporting creators — editorial row */}
        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {supporting.map((creator, index) => (
            <motion.div key={creator.id} variants={slideUp} className="h-full">
              <CreatorCard creator={creator} delay={index * 0.05} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Button href="/creators" variant="outline" size="lg">
            Meet everyone
          </Button>
        </div>
      </Container>
    </section>
  );
}
