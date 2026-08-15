"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { PHOTOS } from "@/lib/content";
import { staggerContainer, slideUp } from "@/lib/animations";

/** The editorial wall — asymmetric rhythm, no chrome over the image. */
export default function PhotographyEditorial() {
  return (
    <section className="scroll-mt-24 pb-28 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="The wall"
          title="Let the frames breathe"
          subtitle="No overlays, no chrome — just light, waiting to be looked at."
        />

        <motion.div
          variants={staggerContainer(0.06, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 grid auto-rows-[10rem] grid-cols-2 gap-4 md:auto-rows-[14rem] md:grid-cols-4"
        >
          {PHOTOS.map((photo, index) => (
            <motion.figure
              key={photo.id}
              variants={slideUp}
              className={`group relative overflow-hidden rounded-card ${
                index % 3 === 0 ? "row-span-2 md:col-span-2" : ""
              } ${index === 4 ? "md:col-span-2" : ""}`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${photo.cover.gradient} transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
              />
              <span aria-hidden className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-black/30" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <p className="text-sm font-semibold text-white">{photo.title}</p>
                <p className="mt-0.5 text-xs text-white/70">
                  {photo.by} · {photo.place}
                </p>
              </figcaption>
              <span aria-hidden className="absolute bottom-4 right-4 text-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {photo.cover.emoji}
              </span>
            </motion.figure>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-gray-600">
          A new frame every night, hung by the community
        </p>
      </Container>
    </section>
  );
}
