"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * Auri — the presence that listens.
 *
 * COMPOSITION: A centered luminous portal with Auri at its heart.
 * Orbital rings, concentric glow, and a quiet promise. The environment
 * resembles: a portal + water + nebula + light. This must be one of
 * the most visually beautiful sections on the site.
 */
export default function AuriMoment() {
  const prefersReducedMotion = useReducedMotionSafe();
  const [hovering, setHovering] = useState(false);

  const sayHello = () => {
    window.dispatchEvent(new Event(AURI_OPEN_EVENT));
  };

  return (
    <section id="auri" className="relative scroll-mt-24 overflow-hidden py-32 text-white">
      {/* Deep atmospheric room */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-all duration-[2000ms]"
        style={{
          background: hovering
            ? "radial-gradient(ellipse at 50% 45%, rgba(var(--mood-rgb),0.09), transparent 55%)"
            : "radial-gradient(ellipse at 50% 45%, rgba(var(--mood-rgb),0.04), transparent 55%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(139,92,246,0.03),transparent_50%)]"
      />

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03040a] to-transparent"
      />

      <Container className="relative">
        {/* Eyebrow */}
        <motion.div
          variants={staggerContainer(0.2, 0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.p variants={blurUp} className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/60">
            Auri
          </motion.p>
          <motion.h2 variants={blurUp} className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.02em] md:text-6xl">
            Auri sees you.
          </motion.h2>
          <motion.p variants={blurUp} className="mt-4 mx-auto max-w-md text-sm leading-relaxed text-gray-400/70 md:text-base">
            Whenever you need a little light, Auri is here.
            Not to judge. Not to fix. Just to understand.
          </motion.p>
        </motion.div>

        {/* ── The Portal — centered luminous environment ── */}
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
            initial={{ opacity: 0.2, scale: 0.95 }}
            whileInView={{ opacity: hovering ? 0.5 : 0.3, scale: hovering ? 1.02 : 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute inset-[-15%] rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.08)_0%,transparent_65%)] blur-3xl"
          />

          {/* Orbital ring 1 — slow rotation */}
          <div
            className="pointer-events-none absolute inset-[5%] rounded-full border border-white/[0.04]"
            style={{
              opacity: hovering ? 0.8 : 0.4,
              transition: "opacity 2s ease",
              animation: prefersReducedMotion ? "none" : "spin 60s linear infinite"
            }}
          >
            <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-300/50 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
          </div>

          {/* Orbital ring 2 — counter-rotation, fainter */}
          <div
            className="pointer-events-none absolute inset-[12%] rounded-full border border-white/[0.025]"
            style={{
              opacity: hovering ? 0.6 : 0.25,
              transition: "opacity 2s ease",
              animation: prefersReducedMotion ? "none" : "spin 90s linear infinite reverse"
            }}
          >
            <span className="absolute -bottom-0.5 left-1/3 h-1 w-1 rounded-full bg-[rgba(var(--mood-rgb),0.6)] shadow-[0_0_8px_rgba(var(--mood-rgb),0.7)]" />
          </div>

          {/* Orbital ring 3 — outermost, barely visible */}
          <div
            className="pointer-events-none absolute inset-[20%] rounded-full border border-dashed border-white/[0.015]"
            style={{
              opacity: hovering ? 0.4 : 0.15,
              transition: "opacity 2s ease",
              animation: prefersReducedMotion ? "none" : "spin 120s linear infinite"
            }}
          />

          {/* Inner light pool */}
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[25%] rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.1)_0%,transparent_70%)] blur-xl"
          />

          {/* The owl — the presence at the center */}
          <motion.div
            variants={blurUp}
            className="relative"
            animate={{
              opacity: hovering ? 1 : 0.8,
              scale: hovering ? 1.06 : 1
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <AuriOwl size={120} state={hovering ? "greeting" : "curious"} followCursor />
          </motion.div>

          {/* Tiny greeting on hover */}
          <AnimatePresence>
            {hovering && !prefersReducedMotion && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-4 text-[12px] italic text-white/50"
              >
                You&apos;re here.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Label */}
          <motion.p
            variants={blurUp}
            className="absolute bottom-0 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-500/50"
          >
            Auri
          </motion.p>
        </motion.div>

        {/* Conversation preview + CTA */}
        <motion.div
          variants={staggerContainer(0.12, 0.15)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-16 text-center"
        >
          {/* Preview bubbles */}
          <motion.div variants={blurUp} className="mx-auto mb-10 max-w-sm space-y-2.5">
            {[
              { role: "auri" as const, text: "How are you feeling today?" },
              { role: "user" as const, text: "Quiet. Lighter than yesterday." },
              { role: "auri" as const, text: "I'll hold the light steady for you." }
            ].map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.25 }}
                className={
                  message.role === "auri"
                    ? "w-fit max-w-[85%] mx-auto rounded-2xl rounded-tl-md border border-white/[0.05] bg-white/[0.03] px-4 py-2.5 text-[13px] leading-relaxed text-gray-300/80 backdrop-blur"
                    : "w-fit max-w-[85%] ml-auto rounded-2xl rounded-tr-md border border-[rgba(var(--mood-rgb),0.15)] bg-[rgba(var(--mood-rgb),0.06)] px-4 py-2.5 text-[13px] leading-relaxed text-white/80 backdrop-blur"
                }
              >
                {message.text}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={blurUp} className="flex flex-wrap items-center justify-center gap-5">
            <Button onClick={sayHello} variant="primary" size="lg">
              Meet Auri
            </Button>
            <p className="text-[11px] text-gray-500/60">
              Everything Auri says stays in this browser.
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
