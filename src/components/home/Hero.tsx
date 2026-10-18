"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import GlowBackground from "@/components/effects/GlowBackground";
import StarField from "@/components/sanctuary/StarField";
import PresenceMemory from "@/components/effects/PresenceMemory";
import WithinMark from "@/components/ui/WithinMark";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { blurUp, staggerContainer } from "@/lib/animations";
import { fireRipple } from "@/lib/ripple";
import { recordVisit } from "@/lib/light-memory";
import { useEntrance } from "@/components/entrance/EntranceProvider";

/**
 * The WithIn landing hero — the threshold into a living world.
 *
 * Composition: one focal point (the aperture mark holding light),
 * the wordmark beneath it, a concise editorial statement, and two
 * tactile entry actions. Everything else recedes into atmosphere.
 *
 * The hero waits for the cinematic loader to signal readiness before
 * beginning its staggered reveal — loader + hero play as one coherent
 * entrance system, not two competing animations.
 *
 * Auri is deliberately absent here — she lives in the corner orb
 * (AuriOrb) and appears only as a presence, never as a permanent
 * mascot pasted onto the hero (BRAND.md).
 */
export default function Hero() {
  const prefersReducedMotion = useReducedMotionSafe();
  const { ready } = useEntrance();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });
  const markX = useTransform(smx, [-0.5, 0.5], [6, -6]);
  const markY = useTransform(smy, [-0.5, 0.5], [4, -4]);
  const nebulaX = useTransform(smx, [-0.5, 0.5], [20, -20]);
  const nebulaY = useTransform(smy, [-0.5, 0.5], [14, -14]);
  const starsX = useTransform(smx, [-0.5, 0.5], [10, -10]);
  const starsY = useTransform(smy, [-0.5, 0.5], [6, -6]);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    mx.set(event.clientX / window.innerWidth - 0.5);
    my.set(event.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      id="top"
      onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
      className="relative overflow-hidden bg-[#02030a] text-white"
    >
      {/* ── Deep background: atmospheric glow + painted arrival ── */}
      <GlowBackground variant="hero" />

      <div aria-hidden className="absolute inset-0">
        <Image
          src="/within-home.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.55]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#02030a]/30 via-[#02030a]/55 to-[#02030a]" />
      </div>

      {/* ── Nebula fields — deepest parallax ── */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : nebulaX, y: prefersReducedMotion ? 0 : nebulaY }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute right-[8%] top-[10%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.10)_0%,rgba(76,29,149,0.04)_45%,transparent_70%)] blur-veil" />
        <div className="absolute left-[10%] top-[45%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.06),transparent_65%)] blur-haze" />
        <div className="absolute bottom-[8%] left-[8%] h-64 w-64 rounded-full bg-teal-500/[0.025] blur-smoke" />
      </motion.div>

      {/* ── Starfield — mid parallax ── */}
      <motion.div
        aria-hidden
        style={{ x: prefersReducedMotion ? 0 : starsX, y: prefersReducedMotion ? 0 : starsY }}
        className="pointer-events-none absolute inset-0"
      >
        <StarField count={48} seed={3} />
      </motion.div>

      <PresenceMemory />

      {/* ── Ivory horizon band — soft light at the base, like dawn over
           the deep. Grounds the composition without competing with the
           aperture focal point. ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[12rem] bg-gradient-to-t from-[var(--elysian-horizon)] via-[var(--elysian-horizon)] to-transparent"
      />

      {/* ── Hero stage: centered composition ── */}
      <div className="relative mx-auto flex min-h-[calc(100svh-1rem)] w-full max-w-[1400px] flex-col items-center px-6 pt-20 sm:pt-24 lg:pt-32 pb-32">
        <motion.div
          variants={staggerContainer(0.14, 0.25)}
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="relative z-10 flex flex-col items-center gap-6 text-center max-w-2xl"
        >
          {/* Eyebrow — the central idea, quiet */}
          <motion.p
            variants={blurUp}
            className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[rgba(var(--mood-rgb),0.75)]"
          >
            A light that refuses to go out.
          </motion.p>

          {/* The aperture mark — single focal point, brand light */}
          <motion.div
            variants={blurUp}
            style={{ x: prefersReducedMotion ? 0 : markX, y: prefersReducedMotion ? 0 : markY }}
            className="relative"
          >
            {/* Aperture response — signature interaction. The threshold ring
                 widens and brightens as the pointer approaches the mark,
                 reinforcing "the world is open." Throttled, transform-only,
                 off under Reduced Motion and on touch devices. */}
            <ApertureRing prefersReducedMotion={prefersReducedMotion} />
            <WithinMark variant="mark" size={112} className="drop-shadow-[0_0_40px_rgba(139,92,246,0.35)]" />
            {/* Soft bloom behind the mark */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.18),transparent_75%)] blur-[140px]"
            />
          </motion.div>

          {/* Wordmark — WithIn as an insignia */}
          <motion.h1
            variants={blurUp}
            className="select-none mt-2 bg-[linear-gradient(92deg,#ffffff_0%,#f1ecff_30%,#a78bfa_55%,#67e8f9_85%,#5eead4_100%)] bg-clip-text font-display text-[clamp(3rem,9vw,5.5rem)] font-medium leading-[0.96] tracking-[-0.035em] text-transparent"
          >
            WithIn
          </motion.h1>

          {/* Supporting statement — deliberate line break */}
          <motion.p
            variants={blurUp}
            className="mt-6 max-w-md text-[15px] leading-[1.75] text-[var(--elysian-ink-soft)] md:text-base"
          >
            Stories. Emotions. People.
            <br />
            A universe built around how you feel.
          </motion.p>

          {/* Entry actions — liquid glass, tactile, clear hierarchy */}
          <motion.div
            variants={blurUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              href="/signup"
              variant="gradient"
              size="lg"
              data-cta-entrance
              onClick={(e) => {
                fireRipple(e);
                recordVisit("/signup");
              }}
              className="shadow-[0_0_36px_rgba(var(--mood-rgb),0.45)] hover:shadow-[0_0_52px_rgba(var(--mood-rgb),0.6)]"
            >
              Enter WithIn
              <Icon name="forward" size={13} className="ml-1" />
            </Button>
            <Button
              href="/discover"
              variant="outline"
              size="lg"
              onClick={(e) => {
                fireRipple(e);
                recordVisit("/discover");
              }}
              className="hover:border-white/[0.2]"
            >
              Explore
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Light on Water — signature motif, below the wordmark ──
             A single gentle breath, not a habitual pulse. Motion with purpose,
             never decoration for its own sake (BRAND.md §5). */}
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.35, 0.6, 0.35], scale: [1, 1.15, 1] }
          }
          transition={{ duration: 6, repeat: 1, ease: "easeInOut" }}
          className="pointer-events-none mt-12 relative h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(167,139,250,0.6)]"
        />
      </div>

      {/* Deep vignette — cinematic framing */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.80)_100%)]" />

      {/* Bottom fade into the mood bar */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#02030a] via-[#02030a]/60 to-transparent" />
    </section>
  );
}

/**
 * ApertureRing — the signature interaction of the living threshold.
 *
 * A soft luminous ring around the aperture mark. Under normal motion it
 * breathes slowly; when the pointer approaches, the breathing origin shifts
 * toward the pointer, as if the aperture is responding to the visitor's
 * presence. Transform-origin + pointer tracking only; off under Reduced
 * Motion and on touch devices.
 *
 * Pointer response uses CSS variables updated via direct DOM manipulation
 * (zero React re-renders), matching the PresenceField pattern. Breathing is
 * handled by a CSS keyframe so it never fights the pointer response.
 */
function ApertureRing({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  const applyResponse = useCallback(
    (container: HTMLDivElement, ox: number, oy: number) => {
      container.style.setProperty("--aperture-ox", `${ox}%`);
      container.style.setProperty("--aperture-oy", `${oy}%`);
    },
    []
  );

  const resetResponse = useCallback((container: HTMLDivElement) => {
    applyResponse(container, 50, 50);
  }, [applyResponse]);

  const handleMove = useCallback(
    (event: MouseEvent) => {
      if (prefersReducedMotion) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const distance = Math.hypot(dx, dy);
      const radius = Math.max(rect.width, rect.height) * 1.6;

      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const current = containerRef.current;
        if (!current) return;
        if (distance < radius) {
          applyResponse(current, 50 + (dx / rect.width) * 100, 50 + (dy / rect.height) * 100);
        } else {
          resetResponse(current);
        }
      });
    },
    [prefersReducedMotion, applyResponse, resetResponse]
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    resetResponse(container);

    container.addEventListener("mousemove", handleMove, { passive: true });
    container.addEventListener("mouseleave", () => resetResponse(container), { passive: true });

    return () => {
      cancelAnimationFrame(frameRef.current);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", () => resetResponse(container));
    };
  }, [prefersReducedMotion, handleMove, resetResponse]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-[-28%] rounded-full border border-[rgba(var(--mood-rgb),0.25)] blur-[40px] ${prefersReducedMotion ? "" : "aperture-breathe"}`}
      style={{
        ...(prefersReducedMotion
          ? { opacity: 0.45, transformOrigin: "center center" }
          : { transformOrigin: "var(--aperture-ox, 50%) var(--aperture-oy, 50%)" }),
      }}
    />
  );
}
