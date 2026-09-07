"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import GlowBorder from "@/components/ui/GlowBorder";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import { CardGridSkeleton, SkeletonRegion } from "@/components/ui/skeletons";
import EmptyState from "@/components/ui/states/EmptyState";
import { getShelf } from "@/lib/library";
import { UNIVERSE } from "@/lib/search";

/** Resolves saved ids back to universe entries for display. */
function resolveEntries(ids: string[]) {
  return ids
    .map((itemId) => UNIVERSE.find((entry) => entry.id === itemId))
    .filter((entry): entry is (typeof UNIVERSE)[number] => Boolean(entry))
    .slice(0, 6);
}

/**
 * Memories, kept safe — the user's real saved shelf.
 *
 * Reads the actual "saved" library shelf from this browser. While it
 * resolves, skeletons hold the grid's shape; when it's empty, Auri explains
 * why and offers the way forward. Nothing is invented.
 */
export default function MemoryCards() {
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  // Hydration-safe: the shelf resolves after mount (it lives in this browser).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSavedIds(getShelf("saved"));
      setLoading(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const entries = useMemo(() => resolveEntries(savedIds), [savedIds]);
  const active = entries.find((memory) => memory.id === openId) ?? null;

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
        const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
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
        <SkeletonRegion label="Loading your saved memories" className="mt-12">
          <CardGridSkeleton count={3} />
        </SkeletonRegion>
      ) : entries.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon="bookmark"
          title="Nothing kept yet"
          description="Save a film, story, or album while you wander — it will wait for you here."
          action={
            <Button href="/discover" variant="outline" size="md">
              Find something to keep
            </Button>
          }
        />
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {entries.map((memory, index) => (
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
                    className="relative h-full overflow-hidden"
                  >
                    {/* Ambient portal glow */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: "rgba(var(--mood-rgb), 0.35)" }}
                    />

                    {/* Cover */}
                    <div
                      className={`relative h-40 overflow-hidden bg-linear-to-br ${memory.gradient} transition-transform duration-500 group-hover:scale-105`}
                    >
                      {/* Cinematic depth — soft underglow that follows the mood */}
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"
                      />
                      <motion.div
                        layoutId={`memory-cover-${memory.id}`}
                        className="absolute inset-0"
                      >
                        <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                          {memory.category}
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
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 opacity-0 transition group-hover:opacity-100">
                          Enter
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              tabIndex={-1}
              ref={(element) => element?.focus()}
              className="relative w-full max-w-lg overflow-hidden rounded-modal border border-white/10 bg-[#0a0a0c] shadow-2xl outline-none"
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
                    {active.category}
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
                <p className="mt-4 text-sm leading-relaxed text-gray-400">{active.description}</p>
                <div className="mt-7 flex items-center gap-3">
                  <Button href={active.href} variant="primary" size="md" className="shadow-mood">
                    Open it
                  </Button>
                  <Button variant="outline" size="md" onClick={closePortal}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
