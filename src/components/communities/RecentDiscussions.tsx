"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";
import { COMMUNITIES } from "@/lib/content";
import { staggerContainer, slideUp } from "@/lib/animations";

/** Mock discussions — clearly labeled, no real messaging backend exists. */
const discussions = [
  {
    id: "d1",
    room: "Moonwater",
    title: "What do you do with the heavy nights?",
    author: "a quiet member",
    when: "2h ago",
  },
  {
    id: "d2",
    room: "Dawn Chorus",
    title: "The first line of your morning page, today",
    author: "a morning person",
    when: "5h ago",
  },
  {
    id: "d3",
    room: "Letters We Never Sent",
    title: "A letter to the person I used to be",
    author: "an unsent word",
    when: "yesterday",
  },
  {
    id: "d4",
    room: "Ember Club",
    title: "Small fires: what are you holding space for?",
    author: "an ember keeper",
    when: "yesterday",
  },
];

/**
 * Recent discussions — warm, human, and honestly mock.
 *
 * Each card shows the community room, the conversation topic, and the
 * author's anonymous handle. The feel should be like walking into a
 * room where people are already talking quietly.
 */
export default function RecentDiscussions({ id }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 pb-28 text-white">
      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      <Container>
        {/* Header — editorial */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/50">
            Recent discussions
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.02em] md:text-3xl">
            What the rooms are saying
          </h2>
          <p className="mt-2 text-[13px] text-gray-500/60">
            Mock conversations — real discussion arrives with the community backend.
          </p>
        </div>

        <motion.div
          variants={staggerContainer(0.06, 0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {discussions.map((discussion) => {
            const room = COMMUNITIES.find((community) => community.name === discussion.room);
            return (
              <motion.div key={discussion.id} variants={slideUp}>
                <GlassCard hoverLift tone="soft" className="p-5">
                  {/* Clay-like depth highlight */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
                  />
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br ${room?.gradient ?? "from-indigo-500 to-slate-700"} text-xs`}
                    >
                      {room?.avatars[0] ?? "✦"}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-300">{discussion.room}</span>
                    <span className="ml-auto text-[10px] text-gray-600">{discussion.when}</span>
                  </div>
                  <p className="mt-3 text-[13px] font-medium leading-relaxed text-white/90">
                    {discussion.title}
                  </p>
                  <p className="mt-1.5 text-[11px] text-gray-500/70">by {discussion.author}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
