"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { COMMUNITIES } from "@/lib/content";
import { staggerContainer, slideUp } from "@/lib/animations";

const categories = [
  { label: "Feeling", emoji: "🌙", blurb: "Rooms for people who feel too much." },
  { label: "Writing", emoji: "✍️", blurb: "Letters, pages, and morning pages." },
  { label: "Conversation", emoji: "🔥", blurb: "Slow talks that never hurry." }
];

/** Category browse — how the rooms group, without any fake messaging. */
export default function CommunitiesCategories() {
  return (
    <section className="scroll-mt-24 pb-28 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Browse by kind"
          title="A room for every way of feeling"
          subtitle="Conversation happens here eventually — for now, join a room and know it's yours."
        />

        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 grid gap-4 sm:grid-cols-3"
        >
          {categories.map((category) => {
            const count = COMMUNITIES.filter((community) => community.category === category.label).length;
            return (
              <motion.div
                key={category.label}
                variants={slideUp}
                className="rounded-card border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(var(--mood-rgb),0.4)] hover:bg-white/10"
              >
                <span aria-hidden className="text-2xl">{category.emoji}</span>
                <h3 className="mt-3 text-lg font-bold">{category.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{category.blurb}</p>
                <p className="mt-4 text-xs text-gray-500">
                  {count} {count === 1 ? "room" : "rooms"}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="mt-8 text-center text-xs text-gray-600">
          Rooms are local today — joining keeps them in this browser. Real communities arrive
          with the account system.
        </p>
      </Container>
    </section>
  );
}
