"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { applyMood, getMood, moods, onMoodChange, type Mood } from "@/lib/mood";
import { gradients, moodGlow } from "@/lib/design";

/** Dispatched when anything in the universe asks Auri to appear (e.g. QuickActions). */
export const AURI_OPEN_EVENT = "within:auri-open";

/** Gentle nudges that cycle while Auri is resting, so the presence feels alive. */
const whispers = ["tap to talk ✨", "Auri is listening…", "your mood shapes the light"];

type AuriBubbleProps = {
  mood: Mood | undefined;
  onSelect: (id: string | null) => void;
};

/** Auri's reply bubble — mounts fresh each time, "thinks" before answering. */
function AuriBubble({ mood, onSelect }: AuriBubbleProps) {
  const [thinking, setThinking] = useState(true);
  const prefersReducedMotion = useReducedMotionSafe();

  useEffect(() => {
    const timer = setTimeout(() => setThinking(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  const message = mood
    ? `Auri noticed your world feels ${mood.label.toLowerCase()} today. ${mood.line}`
    : "I'm always here. Tell me how you feel and I'll shape your sanctuary around it.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-72 rounded-3xl border border-white/10 bg-black/70 p-5 backdrop-blur-sm"
    >
      <p className="text-sm leading-relaxed text-gray-300">
        <span className="font-semibold text-emerald-300">Auri:</span>{" "}
        {thinking ? (
          <span className="inline-flex items-center gap-1" aria-hidden>
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }
                }
                transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                className="h-1.5 w-1.5 rounded-full bg-emerald-300"
              />
            ))}
          </span>
        ) : (
          <AnimatePresence mode="wait">
            <motion.span
              key={message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.span>
          </AnimatePresence>
        )}
      </p>
      <div className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-500">
        Type a feeling…
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {moods.map((item) => {
          const active = mood?.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(active ? null : item.id)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-[rgba(var(--mood-rgb),0.6)] bg-[rgba(var(--mood-rgb),0.15)] text-white"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-emerald-400/40 hover:text-white"
              }`}
            >
              {item.emoji} {item.label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Living presence — a breathing orb with a particle aura that speaks your mood. */
export default function AuriOrb() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const prefersReducedMotion = useReducedMotionSafe();

  // Stay in sync with moods chosen anywhere (e.g. the MoodOrbit)
  useEffect(() => onMoodChange((id) => setSelected(id)), []);

  // Anywhere in the app can ask Auri to appear (e.g. QuickActions "Talk to Auri")
  useEffect(() => {
    const open = () => setOpen(true);
    window.addEventListener(AURI_OPEN_EVENT, open);
    return () => window.removeEventListener(AURI_OPEN_EVENT, open);
  }, []);

  // Cycle the resting whispers so Auri feels present rather than decorative
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(
      () => setWhisperIndex((index) => (index + 1) % whispers.length),
      4200
    );
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  const selectedMood = getMood(selected);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Soft light emission pool — follows the mood */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-6 h-40 w-40 rounded-full blur-3xl"
        style={{ background: moodGlow(0.25) }}
      />

      <AnimatePresence>
        {open && (
          <AuriBubble
            key="auri-bubble"
            mood={selectedMood}
            onSelect={(id) => applyMood(id)}
          />
        )}
      </AnimatePresence>

      {/* Whisper prompt — cycles through gentle nudges so Auri feels present */}
      {!open && (
        <AnimatePresence mode="wait">
          <motion.span
            key={whisperIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium tracking-wide text-emerald-300 backdrop-blur"
          >
            {whispers[whisperIndex]}
          </motion.span>
        </AnimatePresence>
      )}

      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close Auri" : "Open Auri"}
        animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="group relative flex h-16 w-16 items-center justify-center"
      >
        {!prefersReducedMotion && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(var(--mood-rgb),0.3)]" />
        )}

        {/* Rotating aura ring */}
        {!prefersReducedMotion && (
          <motion.span
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-full border border-purple-400/25"
          />
        )}

        {/* Orbiting particle aura */}
        {!prefersReducedMotion && (
          <motion.span
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4"
          >
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <span
                key={angle}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-[rgba(var(--mood-rgb),0.7)]"
                style={{
                  transform: `rotate(${angle}deg) translateX(36px)`,
                  marginLeft: -2,
                  marginTop: -2
                }}
              />
            ))}
          </motion.span>
        )}

        {/* Breathing core — glows in the current mood color */}
        <motion.span
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundImage: gradients.orb }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full shadow-orb"
        >
          <span className="text-2xl" aria-hidden>
            ✦
          </span>
        </motion.span>

        <span className="absolute right-full mr-3 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-medium text-emerald-300 opacity-0 backdrop-blur transition group-hover:opacity-100">
          Auri
        </span>
      </motion.button>
    </div>
  );
}
