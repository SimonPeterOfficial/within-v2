"use client";

import { AnimatePresence, motion } from "framer-motion";
import GradientText from "@/components/ui/GradientText";
import { letterReveal, letterStagger } from "@/lib/animations";

const LETTERS = ["W", "i", "t", "h", "I", "n"];

type LoaderWordmarkProps = {
  showLetters?: boolean;
  creditStage?: number;
  reduced?: boolean;
};

/**
 * The loader's title card — the wordmark letters blur sharp into focus.
 *
 * For reduced motion: letters appear instantly (no stagger animation).
 */
export default function LoaderWordmark({ showLetters = false, creditStage = 0, reduced = false }: LoaderWordmarkProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Wordmark — tracking refines as letters form */}
      <motion.div
        variants={letterStagger(reduced ? 0 : 0.07)}
        initial="hidden"
        animate={showLetters ? "show" : "hidden"}
        aria-hidden
        className="flex"
        style={{
          letterSpacing: showLetters ? "0.02em" : "0.08em",
          transition: "letter-spacing 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {LETTERS.map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            variants={letterReveal}
            className="text-6xl font-black leading-none tracking-tight md:text-7xl"
          >
            <GradientText>{letter}</GradientText>
          </motion.span>
        ))}
      </motion.div>

      {/* Credit lines */}
      <div className="relative mt-7 flex h-12 flex-col items-center gap-2">
        <AnimatePresence>
          {creditStage >= 1 && (
            <motion.p
              key="credit-a"
              initial={{ opacity: 0, y: reduced ? 0 : 8, filter: reduced ? "blur(0px)" : "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] font-medium uppercase tracking-[0.55em] text-white/50 md:text-[11px]"
            >
              A WithIn Original
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {creditStage >= 1 && (
            <motion.p
              key="credit-b"
              initial={{ opacity: 0, y: reduced ? 0 : 8, filter: reduced ? "blur(0px)" : "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ delay: reduced ? 0.1 : 0.35, duration: reduced ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] font-medium uppercase tracking-[0.55em] text-white/30"
            >
              From Cymon Studios
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
