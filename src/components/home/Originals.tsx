"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";

const originals = [
  {
    title: "Horizon",
    type: "Film",
    status: "Now streaming",
    description: "A sweeping tale of first light, last chances, and the horizon we all chase.",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    title: "Drift",
    type: "Series",
    status: "Season 2 in production",
    description: "Six strangers wash ashore with no memories — and one of them knows why.",
    gradient: "from-fuchsia-500 to-purple-700"
  },
  {
    title: "Salt & Stars",
    type: "Book",
    status: "Now reading",
    description: "A memoir of grief written in kitchen salt and constellations.",
    gradient: "from-sky-500 to-cyan-600"
  },
  {
    title: "The Longest Goodbye",
    type: "Film",
    status: "In post-production",
    description: "Two friends, one last summer, and a goodbye they keep postponing.",
    gradient: "from-rose-500 to-red-600"
  },
  {
    title: "Midnight Frequency",
    type: "Podcast",
    status: "New episodes weekly",
    description: "Late-night conversations with people who feel a little too much.",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    title: "Paper Lanterns",
    type: "Series",
    status: "Coming 2027",
    description: "Every year a family floats its secrets skyward — this year one comes back.",
    gradient: "from-indigo-500 to-violet-700"
  }
];

export default function Originals() {
  return (
    <section id="originals" className="scroll-mt-24 bg-black px-6 py-24 text-white">
      <SectionHeader
        eyebrow="Originals"
        title="Created only for WithIn"
        subtitle="Films, series, books, and podcasts you won't find anywhere else."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {originals.map((original, index) => (
          <motion.article
            key={original.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20"
          >
            <div className={`relative h-44 bg-linear-to-br ${original.gradient}`}>
              <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                {original.type}
              </span>
              <span className="absolute bottom-4 left-4 text-sm font-medium text-white/90">
                {original.status}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold">{original.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{original.description}</p>
              <p className="mt-5 text-sm font-medium text-emerald-400 opacity-0 transition group-hover:opacity-100">
                Watch on WithIn →
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
