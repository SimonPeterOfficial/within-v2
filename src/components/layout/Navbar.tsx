"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { COMMAND_PALETTE_EVENT } from "@/components/layout/CommandPalette";
import { fireRipple } from "@/lib/ripple";

/** Full link set from the reference design — horizontal, quiet, hairline-separated. */
const navLinks = [
  { label: "Home", href: "#top" },
  { label: "Discover", href: "/discover" },
  { label: "Originals", href: "#originals" },
  { label: "Books", href: "#universe" },
  { label: "Music", href: "#universe" },
  { label: "Communities", href: "#community" },
  { label: "Creators", href: "/creators" },
  { label: "Sanctuary", href: "#sanctuary" },
];

/**
 * The landing navigation — a full-width, nearly transparent bar.
 *
 * Matches the reference design: serif "WithIn" wordmark on the left, the
 * complete link row across the center, and search / sign-in / the gradient
 * CTA plus an overflow menu on the right. On scroll the bar condenses into
 * its glass surface. On mobile the link row folds into a slide-down menu.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotionSafe();

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full px-4 py-3 sm:px-6">
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="fixed inset-0 cursor-default md:hidden"
        />
      )}

      {/* Full-width bar — transparent over the hero, glass once you scroll */}
      <div
        className={`relative z-10 mx-auto flex max-w-[1400px] items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-700 ease-out sm:px-6 ${
          scrolled
            ? "border border-white/[0.06] bg-[rgba(6,6,14,0.72)] shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        {/* Wordmark — the serif identity from the reference */}
        <a
          href="#top"
          className="shrink-0 font-display text-[22px] font-medium tracking-[-0.02em] text-white md:text-2xl"
          onClick={closeMenu}
        >
          With
          <span
            className="bg-[linear-gradient(180deg,#f5f3ff_0%,#c4b5fd_100%)] bg-clip-text text-transparent"
            style={{ textShadow: "none" }}
          >
            I
          </span>
          n
        </a>

        {/* Desktop links — the full row, quiet gray, active glows purple */}
        <div className="hidden items-center gap-6 lg:flex xl:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative py-1 text-[13px] font-medium text-gray-400 transition-colors duration-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right cluster — search, sign in, CTA, overflow */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            aria-label="Search the universe"
            onClick={() => window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT))}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.03] text-gray-300 backdrop-blur transition hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white sm:flex"
          >
            <Icon name="search" size={15} />
          </button>

          <Button href="/login" variant="outline" size="sm" className="hidden md:inline-flex">
            Sign In
          </Button>

          <Button href="/signup" variant="gradient" size="sm" className="shadow-brand-cta" onClick={(e) => fireRipple(e)}>
            Enter WithIn
          </Button>

          {/* Overflow — the "···" affordance from the reference */}
          <button
            type="button"
            aria-label="More options"
            onClick={() => setIsOpen((o) => !o)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.03] text-gray-300 backdrop-blur transition hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white md:flex lg:hidden xl:flex"
          >
            <Icon name="menu" size={15} />
          </button>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white transition hover:bg-white/[0.08] lg:hidden"
          >
            <span className="relative block h-3.5 w-4" aria-hidden>
              <span
                className={`absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 ${
                  isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 ${
                  isOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Slide-down menu — mobile plus the overflow "···" */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, ...(prefersReducedMotion ? {} : { y: -8, scale: 0.98 }) }}
            animate={{ opacity: 1, ...(prefersReducedMotion ? {} : { y: 0, scale: 1 }) }}
            exit={{ opacity: 0, ...(prefersReducedMotion ? {} : { y: -8, scale: 0.98 }) }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 mx-auto mt-2 max-w-[1400px]"
          >
            <div className="glass-level-4 rounded-3xl p-4 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMenu}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 border-t border-white/[0.06] pt-3">
                <Button href="/login" variant="outline" size="md" className="flex-1" onClick={closeMenu}>
                  Sign In
                </Button>
                <Button
                  href="/signup"
                  variant="gradient"
                  size="md"
                  className="flex-1"
                  onClick={closeMenu}
                >
                  Enter WithIn
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
