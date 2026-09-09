"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { fireRipple } from "@/lib/ripple";
import { staggerContainer, blurUp } from "@/lib/animations";

/**
 * UniverseDoors — the reference's strip of eight image-backed glass tiles.
 *
 * Each door has its own scene (layered gradients drawn in CSS — the
 * floating islands, the reading room, the sunset stage…), its icon, its
 * line, and its own ACTION VERB ("Explore", "Browse", "Listen", "Join"…)
 * exactly like the reference. One material language, eight personalities.
 */

type Door = {
  name: string;
  icon: IconName;
  line: string;
  action: string;
  href: string;
  /** The scene — layered CSS gradients, one per world */
  scene: string;
  /** Scene glyph, drawn where an image would sit */
  glyph: string;
};

const DOORS: Door[] = [
  {
    name: "Originals",
    icon: "originals",
    line: "Films, series, docs & more",
    action: "Explore",
    href: "/originals",
    scene:
      "radial-gradient(circle at 30% 55%, rgba(255,220,180,0.5) 0%, transparent 40%), linear-gradient(180deg, #8fb0d8 0%, #b8a8c8 55%, #5a4a78 100%)",
    glyph: "🏝️",
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
  },
];

export default function UniverseDoors() {
  return (
    <section id="universe" aria-label="The worlds of WithIn" className="relative z-10 scroll-mt-24 px-5 md:px-8">
      <motion.div
        variants={staggerContainer(0.05, 0.05)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 xl:grid-cols-8"
      >
        {DOORS.map((door) => (
          <motion.div key={door.name} variants={blurUp}>
            <Link
              href={door.href}
              onClick={(e) => fireRipple(e)}
              className="group crystal-elevated crystal-edge depth-low crystal-press relative flex h-[150px] flex-col overflow-hidden rounded-[22px] transition-all duration-500 hover:-translate-y-1 hover:depth-medium"
              aria-label={`${door.name} — ${door.line}`}
            >
              {/* The scene */}
              <div
                aria-hidden
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]"
                style={{ background: door.scene }}
              />
              {/* Painterly star dust — the mock's luminous air */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "radial-gradient(1px 1px at 22% 28%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 68% 18%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 46% 48%, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 82% 52%, rgba(255,255,255,0.4), transparent)",
                }}
              />
              {/* The scene's subject — drawn glyph, image-like */}
              <span
                aria-hidden
                className="absolute right-2.5 top-2.5 text-3xl opacity-90 transition-transform duration-500 group-hover:scale-110"
                style={{ filter: "drop-shadow(0 2px 6px rgba(40,40,80,0.3))" }}
              >
                {door.glyph}
              </span>
              {/* The glass fade — legibility into the light */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-3/5"
                style={{
                  background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.82) 78%)",
                  backdropFilter: "blur(2px)",
                }}
              />

              {/* Content */}
              <div className="relative mt-auto p-3.5">
                <div className="flex items-center gap-1.5">
                  <Icon name={door.icon} size={14} className="text-[#5b5f9e]" strokeWidth={1.9} />
                  <span className="text-[13px] font-semibold text-[#2c2a48]">{door.name}</span>
                </div>
                <p className="mt-0.5 text-[10.5px] leading-snug text-[#5f5e74]">{door.line}</p>
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#5b4bc4]">
                  {door.action}
                  <Icon
                    name="forward"
                    size={10}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
