"use client";

import { motion } from "framer-motion";
import WorldPortal, { type WorldPortalData } from "./WorldPortal";
import { staggerContainer } from "@/lib/animations";

/**
 * WorldPortals — the destinations of WithIn.
 *
 * Each portal is a crystal window into another place. They are not
 * cards or tiles — they are windows into worlds. Each has its own
 * scene, personality, and emotional atmosphere. The grid is
 * intentionally irregular — some worlds are larger, some smaller,
 * creating a sense of organic exploration rather than a dashboard.
 */

const PORTALS: WorldPortalData[] = [
  {
    name: "Originals",
    icon: "originals",
    line: "Films, series, docs & more",
    action: "Explore",
    href: "/originals",
    scene:
      "radial-gradient(circle at 30% 55%, rgba(255,220,180,0.5) 0%, transparent 40%), linear-gradient(180deg, #8fb0d8 0%, #b8a8c8 55%, #5a4a78 100%)",
    glyph: "🏝️",
    worldClass: "world-originals",
    accent: "rgba(255, 200, 150, 0.15)",
  },
  {
    name: "Books",
    icon: "book",
    line: "Stories for every mood",
    action: "Browse",
    href: "/books",
    scene:
      "radial-gradient(circle at 65% 30%, rgba(255,235,200,0.55) 0%, transparent 45%), linear-gradient(180deg, #a8bce0 0%, #c8b8d8 60%, #6a5a88 100%)",
    glyph: "📚",
    worldClass: "world-books",
    accent: "rgba(255, 235, 200, 0.12)",
  },
  {
    name: "Music",
    icon: "music",
    line: "Sounds that move you",
    action: "Listen",
    href: "/music",
    scene:
      "radial-gradient(circle at 40% 40%, rgba(255,200,170,0.5) 0%, transparent 42%), linear-gradient(180deg, #e8a888 0%, #b87888 55%, #5a4a68 100%)",
    glyph: "🎧",
    worldClass: "world-music",
    accent: "rgba(255, 180, 150, 0.12)",
  },
  {
    name: "Photography",
    icon: "camera",
    line: "Moments that matter",
    action: "View",
    href: "/photography",
    scene:
      "radial-gradient(circle at 60% 35%, rgba(255,230,190,0.55) 0%, transparent 40%), linear-gradient(180deg, #98b0d0 0%, #88a0c8 55%, #4a5a78 100%)",
    glyph: "📷",
    worldClass: "world-photography",
    accent: "rgba(255, 230, 190, 0.1)",
  },
  {
    name: "Communities",
    icon: "users",
    line: "Find your people",
    action: "Join",
    href: "/communities",
    scene:
      "radial-gradient(circle at 45% 40%, rgba(255,190,130,0.6) 0%, transparent 45%), linear-gradient(180deg, #d89878 0%, #a86858 55%, #58405a 100%)",
    glyph: "🔥",
    worldClass: "world-connections",
    accent: "rgba(255, 190, 130, 0.15)",
  },
  {
    name: "Creators",
    icon: "star",
    line: "Real people. Real stories.",
    action: "Explore",
    href: "/creators",
    scene:
      "radial-gradient(circle at 55% 30%, rgba(255,220,190,0.5) 0%, transparent 42%), linear-gradient(180deg, #b8c8e8 0%, #98a8d0 55%, #585a88 100%)",
    glyph: "🎨",
    worldClass: "world-creators",
    accent: "rgba(255, 220, 190, 0.1)",
  },
  {
    name: "Sanctuary",
    icon: "heart",
    line: "A calmer you.",
    action: "Enter",
    href: "/sanctuary",
    scene:
      "radial-gradient(circle at 50% 35%, rgba(255,235,200,0.55) 0%, transparent 44%), linear-gradient(180deg, #a8c0a8 0%, #88a890 55%, #4a6058 100%)",
    glyph: "🌿",
    worldClass: "world-sanctuary",
    accent: "rgba(200, 230, 210, 0.12)",
  },
  {
    name: "Discover",
    icon: "sparkles",
    line: "What's new for you",
    action: "Explore",
    href: "/discover",
    scene:
      "radial-gradient(circle at 42% 38%, rgba(255,225,190,0.5) 0%, transparent 42%), linear-gradient(180deg, #c8a8c0 0%, #a088b8 55%, #585078 100%)",
    glyph: "✨",
    worldClass: "world-worlds",
    accent: "rgba(255, 225, 190, 0.12)",
  },
];

export default function WorldPortals() {
  return (
    <section id="worlds" aria-label="The worlds of WithIn" className="relative z-10 scroll-mt-24">
      <motion.div
        variants={staggerContainer(0.04, 0.04)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4"
      >
        {PORTALS.map((portal, i) => (
          <WorldPortal key={portal.name} portal={portal} index={i} />
        ))}
      </motion.div>
    </section>
  );
}
