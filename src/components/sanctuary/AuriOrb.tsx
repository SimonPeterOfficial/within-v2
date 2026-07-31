"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function AuriOrb() {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
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
              {"I'm always here. Tell me how you feel and I'll shape your sanctuary around it. ✨"}
            </p>
            <div className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-500">
              Type a feeling…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <span className="absolute inset-0 animate-ping rounded-full bg-purple-500/30" />
        )}
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 shadow-[0_0_40px_rgba(168,85,247,0.45)] transition hover:scale-105">
          <span className="text-2xl" aria-hidden>
            ✦
          </span>
        </span>
        <span className="absolute right-full mr-3 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-medium text-emerald-300 opacity-0 backdrop-blur transition group-hover:opacity-100">
          Auri
        </span>
      </motion.button>
    </div>
  );
}
