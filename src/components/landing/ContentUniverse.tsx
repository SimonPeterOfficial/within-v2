"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * The content universe — one universe, six worlds.
 *
 * EDITORIAL BENTO: Not a flat grid. Cards have different visual weights —
 * one large cinematic, two medium, one tall, one wide, one small. Each
 * world feels like a portal into its corner of WithIn.
 */
const WORLDS = [
  {
    name: "Originals",
    emoji: "🎬",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    line: "Films and series crafted for the way you feel",
    href: "/originals",
    size: "featured" as const,
  },
  {
    name: "Books",
    emoji: "📚",
    gradient: "from-emerald-500 to-teal-700",
    line: "Stories that sit with you for days",
    href: "/books",
    size: "medium" as const,
  },
  {
    name: "Music",
    emoji: "🎧",
    gradient: "from-cyan-500 to-blue-700",
    line: "Soundscapes for the way you feel",
    href: "/music",
    size: "medium" as const,
  },
  {
    name: "Photography",
    emoji: "📷",
    gradient: "from-amber-500 to-orange-600",
    line: "Stillness, captured by people who wait for the light",
    href: "/photography",
    size: "tall" as const,
  },
  {
    name: "Communities",
    emoji: "🤝",
    gradient: "from-rose-500 to-pink-700",
    line: "Rooms full of kindred souls",
    href: "/communities",
    size: "wide" as const,
  },
  {
    name: "Creators",
    emoji: "✨",
    gradient: "from-fuchsia-500 to-purple-700",
    line: "The people who make the universe",
    href: "/creators",
    size: "small" as const,
  },
];

export default function ContentUniverse() {
  return (
    <section id="universe" className="relative scroll-mt-24 overflow-hidden py-28 text-white">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.03),transparent_55%)]"
      />

      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      <Container className="relative">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/50">
            The content universe
          </p>
          <h2 className="mt-5 font-display text-3xl font-medium leading-[1.08] tracking-[-0.02em] md:text-5xl">
            One universe, six worlds
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-400/70 md:text-base">
            Different worlds, connected by the same light.
          </p>
        </div>

        {/* ── Editorial Bento Layout ── */}
        <motion.div
          variants={staggerContainer(0.06, 0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(12rem,auto)]"
        >
          {WORLDS.map((world) => {
            // Determine grid span based on size
            const spanClass =
              world.size === "featured"
                ? "md:col-span-2 lg:row-span-2"
                : world.size === "tall"
                ? "lg:row-span-2"
                : world.size === "wide"
                ? "md:col-span-2"
                : "";

            const minHeight =
              world.size === "featured"
                ? "min-h-[22rem]"
                : world.size === "tall"
                ? "min-h-[16rem]"
                : world.size === "wide"
                ? "min-h-[12rem]"
                : "min-h-[14rem]";

            return (
              <motion.div
                key={world.name}
                variants={blurUp}
                className={spanClass}
              >
                <Link
                  href={world.href}
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 ${minHeight} ${
                    world.size === "featured"
                      ? `border-white/[0.1] bg-linear-to-br ${world.gradient} shadow-[0_20px_60px_rgba(0,0,0,0.45)]`
                      : "border-white/[0.05] bg-white/[0.015] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  {/* Hover glow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/[0.05] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Top row — icon + arrow */}
                  <div className="relative flex items-start justify-between">
                    <span
                      aria-hidden
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${world.gradient} text-lg shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${
                        world.size !== "featured" ? "ring-1 ring-white/[0.08]" : ""
                      }`}
                    >
                      {world.emoji}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/20 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
                      <Icon name="forward" size={12} />
                    </span>
                  </div>

                  {/* Title + description */}
                  <div className="relative mt-auto">
                    <h3
                      className={`font-display font-medium tracking-[-0.015em] text-white ${
                        world.size === "featured" ? "text-2xl md:text-3xl" : "text-lg"
                      }`}
                    >
                      {world.name}
                    </h3>
                    <p
                      className={`mt-1.5 leading-relaxed ${
                        world.size === "featured"
                          ? "text-sm text-white/70"
                          : "text-[13px] text-gray-500"
                      }`}
                    >
                      {world.line}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
