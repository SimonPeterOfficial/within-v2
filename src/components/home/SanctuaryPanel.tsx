"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * SanctuaryPanel — "Sanctuary — A space for your inner world."
 *
 * The reference's right-side Sanctuary glass: five calm rooms, each a
 * real door into the quiet spaces. Private Auri opens her presence
 * directly. The UI almost disappears — soft rows, generous light.
 */

type Room = {
  icon: IconName;
  title: string;
  sub: string;
  href: string;
  /** Private Auri opens her presence, not a page */
  auri?: boolean;
  accent?: boolean;
};

const ROOMS: Room[] = [
  { icon: "book", title: "Journal", sub: "Write your thoughts", href: "/mirror" },
  { icon: "camera", title: "Memories", sub: "Relive your moments", href: "/photography" },
  { icon: "sun", title: "Mood", sub: "Check in with yourself", href: "/mirror#mood" },
  { icon: "mic", title: "Voice Notes", sub: "Capture your voice", href: "/sanctuary" },
  { icon: "sparkles", title: "Private Auri", sub: "Just for you", href: "/within", auri: true, accent: true },
];

export default function SanctuaryPanel() {
  const openAuri = () => window.dispatchEvent(new Event(AURI_OPEN_EVENT));

  return (
    <section
      aria-label="Sanctuary"
      className="crystal-elevated crystal-edge depth-medium crystal-sheen relative overflow-hidden rounded-[26px] p-5"
    >
      {/* The garden light — sanctuary's own soft green through glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 80% 0%, rgba(180,220,190,0.35), transparent 65%)",
        }}
      />

      <div className="relative">
        <h2 className="font-display text-[17px] font-medium text-[#2c2a48]">Sanctuary</h2>
        <p className="mt-0.5 text-[12px] text-[#6f6e88]">A space for your inner world.</p>

        <motion.ul
          variants={staggerContainer(0.06, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-4 flex flex-col gap-2"
        >
          {ROOMS.map((room) => {
            const inner = (
              <>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 transition ${
                    room.accent
                      ? "text-white ring-white/40"
                      : "bg-white/55 text-[#5b5f9e] ring-white/70 group-hover:bg-white/85"
                  }`}
                  style={
                    room.accent
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(139,125,235,0.95), rgba(108,92,220,0.85))",
                          boxShadow: "0 3px 12px rgba(120,100,230,0.4)",
                        }
                      : undefined
                  }
                >
                  <Icon name={room.icon} size={15} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-[#2c2a48]">
                    {room.title}
                  </span>
                  <span className="block truncate text-[11px] text-[#8b8aa0]">{room.sub}</span>
                </span>
                <Icon
                  name="chevronRight"
                  size={13}
                  className="shrink-0 text-[#8b8aa0] transition-transform group-hover:translate-x-0.5"
                />
              </>
            );

            return (
              <motion.li key={room.title} variants={blurUp}>
                {room.auri ? (
                  <button
                    type="button"
                    onClick={openAuri}
                    className="group flex w-full items-center gap-3 rounded-[18px] bg-white/45 px-3 py-2.5 text-left ring-1 ring-white/60 transition hover:bg-white/75"
                  >
                    {inner}
                  </button>
                ) : (
                  <Link
                    href={room.href}
                    className="group flex items-center gap-3 rounded-[18px] bg-white/45 px-3 py-2.5 ring-1 ring-white/60 transition hover:bg-white/75"
                  >
                    {inner}
                  </Link>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
