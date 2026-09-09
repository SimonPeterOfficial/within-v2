"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import { blurUp, staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

/**
 * Discovery — the doors of the universe as varied liquid surfaces.
 *
 * Deliberately NOT eight identical cards: the composition mixes a cinematic
 * window, wide horizontal panels, and compact portals — different geometries
 * speaking one material language. Content is real (each door leads to its
 * living shelf).
 */

type UniverseCard = {
  name: string;
  icon: IconName;
  line: string;
  href: string;
  /** The cover scene — layered gradients, one per world */
  cover: string;
  /** Span class for the varied composition */
  span: string;
  /** Warm cards get amber light instead of violet */
  warm?: boolean;
  /** Big cinematic door gets larger type */
  cinematic?: boolean;
};

const CARDS: UniverseCard[] = [
  {
    name: "Originals",
    icon: "originals",
    line: "Films & series that speak to the soul.",
    href: "/originals",
    cover:
      "radial-gradient(circle at 30% 38%, rgba(196,181,253,0.5) 0%, rgba(124,58,237,0.35) 22%, rgba(30,20,60,0.4) 60%, rgba(8,6,20,0.9) 100%), linear-gradient(180deg, rgba(76,29,149,0.55), rgba(15,10,35,0.95))",
    span: "sm:col-span-2 sm:row-span-2",
    cinematic: true,
  },
  {
    name: "Books",
    icon: "book",
    line: "Stories to disappear into.",
    href: "/books",
    cover:
      "radial-gradient(circle at 70% 30%, rgba(251,191,36,0.28) 0%, transparent 45%), radial-gradient(circle at 25% 70%, rgba(120,80,40,0.35) 0%, transparent 55%), linear-gradient(180deg, rgba(50,32,18,0.8), rgba(12,8,6,0.95))",
    span: "sm:col-span-2",
  },
  {
    name: "Music",
    icon: "music",
    line: "Sounds that match your state.",
    href: "/music",
    cover:
      "radial-gradient(circle at 35% 40%, rgba(34,211,238,0.4) 0%, rgba(14,116,144,0.3) 30%, transparent 65%), linear-gradient(180deg, rgba(8,45,60,0.85), rgba(4,12,24,0.95))",
    span: "",
  },
  {
    name: "Photography",
    icon: "camera",
    line: "Moments worth keeping.",
    href: "/photography",
    cover:
      "radial-gradient(circle at 60% 32%, rgba(251,146,60,0.42) 0%, rgba(194,65,12,0.25) 30%, transparent 60%), radial-gradient(circle at 20% 75%, rgba(30,58,138,0.4), transparent 55%), linear-gradient(180deg, rgba(30,20,50,0.75), rgba(6,6,16,0.95))",
    span: "",
  },
  {
    name: "Communities",
    icon: "users",
    line: "Find your people. Belong WithIn.",
    href: "/communities",
    cover:
      "radial-gradient(circle at 50% 45%, rgba(251,146,60,0.4) 0%, rgba(180,83,9,0.22) 35%, transparent 62%), radial-gradient(circle at 22% 30%, rgba(52,211,153,0.16), transparent 50%), linear-gradient(180deg, rgba(45,28,14,0.85), rgba(10,8,5,0.95))",
    span: "sm:col-span-2",
  },
  {
    name: "Creators",
    icon: "star",
    line: "Creators shaping the universe.",
    href: "/creators",
    cover:
      "radial-gradient(circle at 42% 36%, rgba(167,139,250,0.5) 0%, rgba(109,40,217,0.35) 30%, transparent 62%), radial-gradient(circle at 70% 70%, rgba(88,28,135,0.4), transparent 60%), linear-gradient(180deg, rgba(60,30,110,0.8), rgba(12,8,26,0.95))",
    span: "",
  },
  {
    name: "Sanctuary",
    icon: "heart",
    line: "Your private space. Your safe place.",
    href: "/sanctuary",
    cover:
      "radial-gradient(circle at 55% 35%, rgba(251,191,36,0.45) 0%, rgba(217,119,6,0.28) 30%, transparent 58%), radial-gradient(circle at 25% 65%, rgba(120,53,15,0.4), transparent 55%), linear-gradient(180deg, rgba(55,32,14,0.85), rgba(14,9,5,0.95))",
    span: "",
    warm: true,
  },
  {
    name: "Discover",
    icon: "sparkles",
    line: "Find something that feels like you.",
    href: "/discover",
    cover:
      "radial-gradient(circle at 45% 40%, rgba(52,211,153,0.3) 0%, rgba(16,185,129,0.18) 28%, transparent 58%), radial-gradient(circle at 68% 62%, rgba(59,130,246,0.28), transparent 55%), linear-gradient(180deg, rgba(15,40,45,0.85), rgba(4,10,16,0.95))",
    span: "",
  },
];

export default function UniverseStrip() {
  return (
    <section id="universe" className="relative z-10 mx-auto w-full max-w-[1200px] scroll-mt-28 px-6 text-white">
      <motion.div
        variants={staggerContainer(0.05, 0.05)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid auto-rows-[minmax(130px,auto)] grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {CARDS.map((card) => (
          <motion.div key={card.name} variants={blurUp} className={`h-full ${card.span}`}>
            <Link
              href={card.href}
              onClick={(e) => fireRipple(e)}
              className={`group crystal-soft crystal-edge depth-medium crystal-press relative flex h-full min-h-[130px] flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-[3px] ${
                card.cinematic ? "p-5" : "p-3.5"
              }`}
            >
              {/* The atmospheric cover */}
              <div
                aria-hidden
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]"
                style={{ background: card.cover, opacity: 0.9 }}
              />
              {/* Star dust */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.35), transparent), radial-gradient(1.5px 1.5px at 55% 55%, rgba(255,255,255,0.25), transparent)",
                }}
              />
              {/* Bottom fade for legibility — into the crystal, not the dark */}
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white/85 via-white/40 to-transparent" />

              {/* Content */}
              <div className={`relative mt-auto ${card.cinematic ? "max-w-[75%]" : ""}`}>
                <div className="flex items-center gap-1.5">
                  <Icon
                    name={card.icon}
                    size={card.cinematic ? 18 : 14}
                    className={card.warm ? "text-amber-500" : "text-[#7c6ce0]"}
                    strokeWidth={1.8}
                  />
                  <span className={`font-semibold text-[#232136] ${card.cinematic ? "font-display text-2xl" : "text-[13px]"}`}>
                    {card.name}
                  </span>
                </div>
                <p className={`mt-1 leading-snug text-[#5f5e74] ${card.cinematic ? "text-sm" : "text-[11px]"}`}>
                  {card.line}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
