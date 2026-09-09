"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { blurUp, staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";

/**
 * The closing duo — two wide cards side by side, exactly as the reference:
 *
 *   LEFT  — "Your Sanctuary": the private room, a candlelit cover, and
 *           five tactile action tiles (Journal, Memories, Mood Tracker,
 *           Voice Notes, Private AI).
 *   RIGHT — "Auri sees you": the promise that no one is alone here, with
 *           the owl in her ring of light and the "Talk to Auri" door.
 */

const SANCTUARY_ACTIONS: { icon: IconName; label: string; href: string }[] = [
  { icon: "book", label: "Journal", href: "/mirror" },
  { icon: "camera", label: "Memories", href: "/photography" },
  { icon: "sparkles", label: "Mood Tracker", href: "/home#mood" },
  { icon: "mic", label: "Voice Notes", href: "/sanctuary" },
  { icon: "star", label: "Private AI", href: "/within" },
];

export default function SanctuaryDuo() {
  const openAuri = () => window.dispatchEvent(new Event(AURI_OPEN_EVENT));

  return (
    <section id="sanctuary" className="relative z-10 scroll-mt-28 pb-20 pt-4 text-white">
      <motion.div
        variants={staggerContainer(0.12, 0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto grid w-full max-w-[1200px] gap-4 px-6 lg:grid-cols-2"
      >
        {/* ── LEFT — Your Sanctuary ── */}
        <motion.div variants={blurUp}>
          <Link
            href="/home"
            onClick={(e) => fireRipple(e)}
            className="group crystal-soft crystal-edge depth-medium relative block overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-[3px]"
          >
            {/* Warm interior light through morning glass */}
            <div
              aria-hidden
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]"
              style={{
                background:
                  "radial-gradient(circle at 62% 38%, rgba(251,191,36,0.3) 0%, rgba(250,215,150,0.14) 30%, transparent 58%), radial-gradient(circle at 28% 72%, rgba(200,175,250,0.2), transparent 55%), linear-gradient(160deg, rgba(255,252,245,0.5), rgba(240,235,250,0.6))",
              }}
            />
            {/* Candle glow flicker */}
            <motion.div
              aria-hidden
              className="absolute right-[18%] top-[30%] h-24 w-24 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%)" }}
              animate={{ opacity: [0.5, 0.8, 0.55, 0.85, 0.5], scale: [1, 1.08, 0.96, 1.05, 1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/60 to-transparent" />

            <div className="relative p-7 md:p-9">
              <h3 className="font-display text-2xl font-medium tracking-[-0.015em] text-[#232136] md:text-[28px]">
                Your <span className="text-[#7c6ce0]">Sanctuary</span>
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-[#5f5e74]">
                A space only you can enter.
                <br />
                Journal. Memories. Mood. Voice. Auri.
              </p>

              {/* The five action tiles — tactile dark glass */}
              <div className="mt-7 flex flex-wrap gap-2.5">
                {SANCTUARY_ACTIONS.map((action) => (
                  <span
                    key={action.label}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/55 px-3.5 py-3 ring-1 ring-white/75 backdrop-blur transition-all duration-300 hover:bg-white/80 hover:ring-[rgba(var(--mood-rgb),0.4)]"
                  >
                    <Icon name={action.icon} size={16} className="text-[#6f6e88]" strokeWidth={1.7} />
                    <span className="text-[10px] font-medium text-[#5f5e74]">{action.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── RIGHT — Auri sees you ── */}
        <motion.div variants={blurUp}>
          <div className="group crystal-soft crystal-edge depth-medium relative block h-full overflow-hidden rounded-3xl">
            {/* The ring of light holding the owl — pearlescent in daylight */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-[-6%] top-1/2 h-[115%] w-[58%] -translate-y-1/2"
              style={{
                background:
                  "radial-gradient(circle at 55% 50%, rgba(190,170,252,0.28) 0%, rgba(170,200,250,0.14) 40%, transparent 68%)",
              }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute right-[4%] top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border border-[rgba(167,139,250,0.28)]"
              style={{ boxShadow: "0 0 40px rgba(139,92,246,0.2), inset 0 0 30px rgba(139,92,246,0.12)" }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute right-[8.5%] top-1/2 flex h-44 w-44 -translate-y-1/2 items-center justify-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(200,185,252,0.35) 0%, rgba(180,210,250,0.16) 50%, transparent 72%)",
              }}
            >
              <AuriOwl size={120} particles={false} state="observing" />
            </div>

            <div className="relative max-w-[62%] p-7 md:p-9">
              <p className="text-[13px] font-medium text-[#7c6ce0]">Auri sees you.</p>
              <h3 className="mt-2.5 font-display text-2xl font-medium tracking-[-0.015em] text-[#232136] md:text-[28px]">
                You&apos;re not alone WithIn.
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-[#5f5e74]">
                Whenever you need a little light,
                <br />
                Auri is here.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  openAuri();
                  fireRipple(e);
                }}
                className="crystal-press crystal-focus mt-7 inline-flex items-center gap-2.5 rounded-full bg-white/65 py-2.5 pl-3 pr-3 text-[13px] font-semibold text-[#232136] ring-1 ring-white/85 backdrop-blur transition-all duration-300 hover:bg-white/90"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))",
                    boxShadow: "0 3px 12px rgba(var(--mood-rgb),0.35)",
                  }}
                >
                  <Icon name="sparkles" size={13} className="text-white" />
                </span>
                Talk to Auri
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70">
                  <Icon name="chevronRight" size={12} className="text-[#6f6e88]" />
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
