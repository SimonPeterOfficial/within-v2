"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";

const stories = [
  {
    title: "The Lighthouse Keeper",
    genre: "Drama",
    excerpt:
      "Every night she lit the lamp for ships that never came — until one night, a ship arrived.",
    readTime: "8 min read",
    gradient: "from-purple-600 to-indigo-600"
  },
  {
    title: "Echoes of Tomorrow",
    genre: "Sci-Fi",
    excerpt:
      "In a city that replays yesterday, June finds a message written to her from the future.",
    readTime: "12 min read",
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    title: "Letters to the Moon",
    genre: "Romance",
    excerpt:
      "Two strangers, one mailbox, and a decade of letters that were never meant to cross paths.",
    readTime: "6 min read",
    gradient: "from-pink-600 to-rose-500"
  },
  {
    title: "The Silent Garden",
    genre: "Mystery",
    excerpt:
      "Behind the overgrown gate lay a garden that remembered everything — and forgave nothing.",
    readTime: "10 min read",
    gradient: "from-emerald-500 to-teal-600"
  }
];

export default function StoriesShowcase() {
  return (
    <section id="stories" className="scroll-mt-24 bg-black px-6 py-24 text-white">
      <SectionHeader
        eyebrow="Stories"
        title="Stories that stay with you"
        subtitle="Hand-picked tales across every emotion. Find one that mirrors how you feel right now."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stories.map((story, index) => (
          <motion.article
            key={story.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
          >
            <div
              className={`h-36 bg-linear-to-br ${story.gradient} transition-transform duration-500 group-hover:scale-105`}
            >
              <span className="ml-4 mt-4 inline-block rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {story.genre}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold">{story.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{story.excerpt}</p>
              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="text-gray-500">{story.readTime}</span>
                <span className="font-medium text-emerald-400 opacity-0 transition group-hover:opacity-100">
                  Read →
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
