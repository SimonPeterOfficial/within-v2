"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { blurUp, staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";

/**
 * Auri — the presence that listens.
 *
 * This section should feel intimate, mysterious, and warm.
 * Not a product pitch. Not a chatbot advertisement.
 * More like: "Somewhere Within, something is listening."
 *
 * Composition: large atmospheric space + small luminous Auri +
 * poetic statement + subtle interaction. Mystery is part of the product.
 */
export default function AuriMoment() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [hovering, setHovering] = useState(false);

  const sayHello = () => {
    window.dispatchEvent(new Event(AURI_OPEN_EVENT));
  };

  return (
    <section id="auri" className="relative scroll-mt-24 overflow-hidden py-36 text-white">
      {/* Deep atmospheric room — warmer, more intimate */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-all duration-[2000ms]"
        style={{
          background: hovering
            ? "radial-gradient(ellipse at 50% 42%, rgba(var(--mood-rgb),0.08), transparent 52%)"
            : "radial-gradient(ellipse at 50% 42%, rgba(var(--mood-rgb),0.035), transparent 52%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_55%,rgba(139,92,246,0.025),transparent_48%)]"
      />

      {/* Section divider */}
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#02030a] to-transparent"
      />

      <Container className="relative">
        {/* The Portal — centered luminous environment */}
        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center cursor-default"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* Outermost glow — the room answering */}
          <motion.div
            initial={{ opacity: 0.15, scale: 0.95 }}
            whileInView={{ opacity: hovering ? 0.45 : 0.25, scale: hovering ? 1.02 : 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.07)_0%,transparent_62%)] blur-3xl"
          />

          {/* Orbital ring 1 — slow rotation */}
          <div
            className="pointer-events-none absolute inset-[5%] rounded-full border border-white/[0.035]"
            style={{
              opacity: hovering ? 0.75 : 0.35,
              transition: "opacity 2s ease",
              animation: prefersReducedMotion ? "none" : "spin 65s linear infinite"
            }}
          >
            <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-300/45 shadow-[0_0_10px_rgba(52,211,153,0.45)]" />
          </div>

          {/* Orbital ring 2 — counter-rotation, fainter */}
          <div
            className="pointer-events-none absolute inset-[13%] rounded-full border border-white/[0.02]"
            style={{
              opacity: hovering ? 0.55 : 0.2,
              transition: "opacity 2s ease",
              animation: prefersReducedMotion ? "none" : "spin 95s linear infinite reverse"
            }}
          >
            <span className="absolute -bottom-0.5 left-1/3 h-1 w-1 rounded-full bg-[rgba(var(--mood-rgb),0.55)] shadow-[0_0_8px_rgba(var(--mood-rgb),0.65)]" />
          </div>

          {/* Orbital ring 3 — outermost, barely visible */}
          <div
            className="pointer-events-none absolute inset-[22%] rounded-full border border-dashed border-white/[0.012]"
            style={{
              opacity: hovering ? 0.35 : 0.12,
              transition: "opacity 2s ease",
              animation: prefersReducedMotion ? "none" : "spin 130s linear infinite"
            }}
          />

          {/* Inner light pool */}
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.06, 1], opacity: [0.25, 0.45, 0.25] }
            }
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[28%] rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.08)_0%,transparent_68%)] blur-xl"
          />

          {/* The owl — the presence at the center */}
          <motion.div
            variants={blurUp}
            className="relative"
            animate={{
              opacity: hovering ? 1 : 0.75,
              scale: hovering ? 1.08 : 1
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <AuriOwl size={110} state={hovering ? "greeting" : "curious"} followCursor />
          </motion.div>

          {/* Tiny greeting on hover */}
          <AnimatePresence>
            {hovering && !prefersReducedMotion && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -bottom-4 text-[12px] italic text-white/45"
              >
                You&apos;re here.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Poetic statement + CTA — the promise */}
        <motion.div
          variants={staggerContainer(0.15, 0.18)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className="mt-20 text-center"
        >
          <motion.p variants={blurUp} className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/50">
            Auri
          </motion.p>
          <motion.h2 variants={blurUp} className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.02em] md:text-6xl">
            You don&apos;t always have to
            <br className="hidden sm:block" />
            {" "}know what to say.
          </motion.h2>
          <motion.p variants={blurUp} className="mt-5 mx-auto max-w-md text-[15px] leading-[1.7] text-gray-400/65 md:text-base">
            Somewhere Within, something is listening.
            Not to fix. Not to judge. Just to hold the light.
          </motion.p>

          {/* Preview bubbles — whispered, not a chat UI */}
          <motion.div variants={blurUp} className="mx-auto mt-12 mb-10 max-w-xs space-y-2">
            {[
              { role: "auri" as const, text: "How are you feeling today?" },
              { role: "user" as const, text: "Quiet. Lighter than yesterday." },
              { role: "auri" as const, text: "I'll hold the light steady for you." }
            ].map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.25 }}
                className={
                  message.role === "auri"
                    ? "w-fit max-w-[85%] mx-auto rounded-2xl rounded-tl-md border border-white/[0.04] bg-white/[0.025] px-4 py-2 text-[13px] leading-relaxed text-gray-300/70 backdrop-blur"
                    : "w-fit max-w-[85%] ml-auto rounded-2xl rounded-tr-md border border-[rgba(var(--mood-rgb),0.12)] bg-[rgba(var(--mood-rgb),0.05)] px-4 py-2 text-[13px] leading-relaxed text-white/70 backdrop-blur"
                }
              >
                {message.text}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={blurUp} className="flex flex-wrap items-center justify-center gap-5">
            <Button onClick={(e) => { sayHello(); fireRipple(e); }} variant="primary" size="lg">
              Meet Auri
            </Button>
            <p className="text-[11px] text-gray-500/50">
              Everything Auri says stays in this browser.
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
