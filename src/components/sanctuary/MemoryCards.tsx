"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import GlassCard from "@/components/ui/GlassCard";
import GlowBorder from "@/components/ui/GlowBorder";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import MemoryCardSkeleton from "@/components/dashboard/MemoryCardSkeleton";
import { shadows } from "@/lib/design";

const memories = [
  {
    id: "lighthouse",
    title: "The Lighthouse Keeper",
    tag: "Saved story",
    meta: "Kept 2 days ago · 8 min",
    emoji: "🌊",
    gradient: "from-purple-600 to-indigo-600",
    glow: "rgba(139, 92, 246, 0.35)",
    synopsis:
      "On the edge of a black sea, a lonely keeper tends a light that only shines for ships that no longer exist — until one night, a letter arrives from the water."
  },
  {
    id: "horizon",
    title: "Horizon",
    tag: "Original",
    meta: "Now streaming · Film",
    emoji: "🌅",
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(245, 158, 11, 0.35)",
    synopsis:
      "Two strangers cross a desert toward a horizon that keeps moving. An original film about leaving everything to find anyone."
  },
  {
    id: "letters",
    title: "Letters to the Moon",
    tag: "Saved story",
    meta: "Kept last week · 6 min",
    emoji: "💌",
    gradient: "from-pink-600 to-rose-500",
    glow: "rgba(236, 72, 153, 0.35)",
    synopsis:
      "Every night, a girl writes a letter to the moon and leaves it on the windowsill. Tonight, the moon writes back."
  }
];

/** Story portals — tilt cards that open into an immersive dialog overlay. */
export default function MemoryCards() {
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const active = memories.find((memory) => memory.id === openId) ?? null;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const restoreFocus = (id: string | null) => {
    if (!id) return;
    document.querySelector<HTMLElement>(`[data-portal-trigger="${id}"]`)?.focus();
  };

  const closePortal = () => {
    restoreFocus(openId);
    setOpenId(null);
  };

  // Scroll lock + Escape close + Tab trap while a portal is open
  useEffect(() => {
    if (!openId) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePortal();
        return;
      }
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeElement = document.activeElement;
        if (event.shiftKey && activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  return (
    <section id="memories" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader
        eyebrow="Your universe"
        title="Memories, kept safe"
        subtitle="Your most-visited worlds. Open one and step inside."
      />

      {loading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <MemoryCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {memories.map((memory, index) => (
            <Reveal key={memory.id} delay={index * 0.1} className="group h-full">
              <TiltCard
                className="h-full"
                onClick={() => setOpenId(memory.id)}
                ariaLabel={`Open ${memory.title}`}
                dataPortalTrigger={memory.id}
              >
                <GlowBorder className="h-full">
                  <GlassCard
                    hoverLift
                    style={{ "--glow-hover": shadows.cardHover } as React.CSSProperties}
                    className="relative h-full overflow-hidden group-hover:shadow-[var(--glow-hover)]"
                  >
                    {/* Ambient portal glow */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: memory.glow }}
                    />

                    {/* Cover */}
                    <div
                      className={`relative h-40 overflow-hidden bg-linear-to-br ${memory.gradient} transition-transform duration-500 group-hover:scale-105`}
                    >
                      <motion.div
                        layoutId={`memory-cover-${memory.id}`}
                        className="absolute inset-0"
                      >
                        <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                          {memory.tag}
                        </span>
                        <span className="absolute bottom-4 right-4 text-2xl" aria-hidden>
                          {memory.emoji}
                        </span>
                      </motion.div>
                      {/* Shimmer sweep */}
                      <span
                        aria-hidden
                        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-emerald-200">
                        {memory.title}
                      </h3>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500">{memory.meta}</p>
                        <span className="text-xs font-semibold text-emerald-400 opacity-0 transition group-hover:opacity-100">
                          Enter →
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </GlowBorder>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      {/* Story portal overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="portal"
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              aria-label="Close story"
              onClick={closePortal}
              className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-md"
            />

            <motion.div
              ref={(element) => {
                dialogRef.current = element;
                element?.focus();
              }}
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              tabIndex={-1}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c] shadow-2xl outline-none"
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={`relative h-52 overflow-hidden bg-linear-to-br ${active.gradient}`}>
                <motion.div
                  layoutId={`memory-cover-${active.id}`}
                  className="absolute inset-0"
                >
                  <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {active.tag}
                  </span>
                  <span className="absolute bottom-4 right-4 text-4xl" aria-hidden>
                    {active.emoji}
                  </span>
                </motion.div>
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0c] to-transparent" />
              </div>

              <div className="p-7">
                <h3 className="text-2xl font-bold">{active.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
                  {active.meta}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-400">{active.synopsis}</p>
                <div className="mt-7 flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-[rgba(var(--mood-rgb),1)] px-7 py-3 text-sm font-bold text-black transition hover:scale-105"
                    style={{ boxShadow: "0 0 35px rgba(var(--mood-rgb),0.5)" }}
                  >
                    Begin story
                  </button>
                  <button
                    type="button"
                    onClick={closePortal}
                    className="rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
