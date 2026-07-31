"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { applyMood, moods } from "@/lib/mood";

/** Living presence — a breathing orb whose light follows your mood. */
export default function AuriOrb() {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Soft light emission pool — follows the mood */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-6 h-40 w-40 rounded-full blur-3xl"
        style={{ background: "rgba(var(--mood-rgb),0.25)" }}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            key="auri-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-72 rounded-3xl border border-white/10 bg-black/70 p-5 backdrop-blur-xl"
          >
            <p className="text-sm leading-relaxed text-gray-300">
              <span className="font-semibold text-emerald-300">Auri:</span>{" "}
              {"I'm always here. Tell me how you feel and I'll shape your sanctuary around it."}
            </p>
            <div className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-500">
              Type a feeling…
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {moods.slice(0, 3).map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => applyMood(mood.id)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition hover:border-emerald-400/40 hover:text-white"
                >
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Whisper prompt */}
      {!open && (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={
            prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: [0, 1, 1, 0], y: 0 }
          }
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, times: [0, 0.2, 0.8, 1] }}
          className="rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium tracking-wide text-emerald-300 backdrop-blur"
        >
          tap to talk ✨
        </motion.span>
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

        {/* Breathing core — glows in the current mood color */}
        <motion.span
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 40px rgba(var(--mood-rgb),0.5)" }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400"
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
