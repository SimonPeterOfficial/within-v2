"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { ambientBreathe } from "@/lib/animations";

const prompts = [
  "What did today teach you, quietly?",
  "What are you holding that you were never asked to carry?",
  "Where did you feel most yourself today?",
  "What small thing are you grateful for that no one saw?",
  "What would you tell yourself one year from now?",
  "Which moment today would you keep, if you could keep one?",
  "What are you afraid to want?",
  "Who did you forgive today — including yourself?",
  "What sound did you notice today, if you stopped to listen?",
  "What did you let go of, even a little?",
  "What does rest look like to you this week?",
  "If your heart could speak one sentence right now, what would it say?"
];

const STORAGE_KEY = "within:reflection";

const dayIndex = (date: Date) =>
  Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000
  );

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);

/** Local calendar day (YYYY-MM-DD) — matches the local prompt clock. */
const isoDay = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

type Saved = { date: string; text: string };

/** Daily reflection — one prompt a day, kept in a quiet glass ritual. */
export default function DailyReflection() {
  const prefersReducedMotion = useReducedMotionSafe();

  // Date-dependent values resolve after hydration so SSR HTML never mismatches.
  const [today, setToday] = useState("Today");
  const [prompt, setPrompt] = useState("One question, waiting for you.");
  const [draft, setDraft] = useState("");
  const [kept, setKept] = useState(false);

  // Deferred into an animation frame (async) so the set-state-in-effect rule
  // stays satisfied while remaining hydration-safe.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const date = new Date();
      setToday(formatDate(date));
      setPrompt(prompts[dayIndex(date) % prompts.length]);

      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Saved | null;
        if (saved && saved.date === isoDay(date)) {
          setDraft(saved.text);
          setKept(true);
        }
      } catch {
        // Corrupt storage — start tonight fresh.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleKeep = () => {
    if (!draft.trim()) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: isoDay(new Date()), text: draft.trim() })
      );
    } catch {
      // Storage unavailable — keep the moment in memory only.
    }
    setKept(true);
  };

  const handleReset = () => {
    setKept(false);
    setDraft("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
  };

  return (
    <section id="reflection" className="scroll-mt-24 py-24 text-white">
      <Container size="md">
        {/* Breathing ritual core — the mood-tinted heart of the section */}
        <motion.div
          aria-hidden
          variants={ambientBreathe(1.06, 7)}
          initial="hidden"
          animate={prefersReducedMotion ? undefined : "show"}
          className="relative mx-auto -mb-10 h-24 w-24 rounded-full bg-[rgba(var(--mood-rgb),0.18)] blur-2xl"
        />

        <GlassCard tone="strong" className="relative overflow-hidden px-6 py-12 sm:px-12">
          {/* Soft mood lighting behind the ritual */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.12)] blur-veil"
          />

          <div className="relative">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-emerald-400">
              Daily reflection
            </p>
            <p className="mt-3 text-center text-sm text-gray-500">{today}</p>

            <AnimatePresence mode="wait">
              {kept ? (
                <motion.div
                  key="kept"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-10 text-center"
                >
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 shadow-emerald">
                    <Icon name="check" size={26} className="text-emerald-300" />
                  </span>
                  <h3 className="mt-6 text-2xl font-bold">Kept for tonight</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
                    Your thought is resting somewhere safe. Tomorrow, a new question will
                    find you.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium text-gray-300 backdrop-blur transition hover:border-white/25 hover:text-white"
                  >
                    <Icon name="refresh" size={13} />
                    Write it again
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="write"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <blockquote className="mx-auto mt-8 max-w-lg text-center">
                    <p className="text-xl font-semibold leading-relaxed text-white md:text-2xl">
                      “{prompt}”
                    </p>
                  </blockquote>

                  <label htmlFor="reflection" className="sr-only">
                    Write tonight&apos;s reflection
                  </label>
                  <textarea
                    id="reflection"
                    rows={4}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write what rises…"
                    className="mt-8 w-full resize-none rounded-card border border-white/10 bg-black/30 p-5 text-sm leading-relaxed text-gray-200 outline-none backdrop-blur transition placeholder:text-gray-600 focus:border-[rgba(var(--mood-rgb),0.5)] focus:bg-black/50"
                  />

                  <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-xs text-gray-600">
                      Kept only on this device — the universe is a good listener.
                    </p>
                    <button
                      type="button"
                      onClick={handleKeep}
                      disabled={!draft.trim()}
                      className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--mood-rgb),1)] px-7 py-3 text-sm font-bold text-black transition duration-300 hover:scale-[1.03] hover:shadow-mood-lg disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Icon name="heart" size={15} />
                      Keep tonight&apos;s thought
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </Container>
    </section>
  );
}
