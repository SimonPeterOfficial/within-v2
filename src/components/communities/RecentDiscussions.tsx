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
    when: "2h ago"
  },
  {
    id: "d2",
    room: "Dawn Chorus",
    title: "The first line of your morning page, today",
    author: "a morning person",
    when: "5h ago"
  },
  {
    id: "d3",
    room: "Letters We Never Sent",
    title: "A letter to the person I used to be",
    author: "an unsent word",
    when: "yesterday"
  },
  {
    id: "d4",
    room: "Ember Club",
    title: "Small fires: what are you holding space for?",
    author: "an ember keeper",
    when: "yesterday"
  }
];

/** Recent discussions — warm, human, and honestly mock. */
export default function RecentDiscussions() {
  return (
    <section className="scroll-mt-24 pb-28 text-white">
      <Container>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
              Recent discussions
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.02em]">
              What the rooms are saying
            </h2>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Mock conversations — real discussion arrives with the community backend.
        </p>

        <motion.div
          variants={staggerContainer(0.06, 0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          {discussions.map((discussion) => {
            const room = COMMUNITIES.find((community) => community.name === discussion.room);
            return (
              <motion.div key={discussion.id} variants={slideUp}>
                <GlassCard hoverLift tone="soft" className="p-5">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br ${room?.gradient ?? "from-indigo-500 to-slate-700"} text-sm`}
                    >
                      {room?.avatars[0] ?? "✦"}
                    </span>
                    <span className="text-xs font-semibold text-gray-300">{discussion.room}</span>
                    <span className="ml-auto text-[11px] text-gray-600">{discussion.when}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-white">
                    {discussion.title}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">by {discussion.author}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
