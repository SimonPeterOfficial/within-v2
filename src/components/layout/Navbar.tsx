"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { spring } from "@/lib/animations";

const navLinks = [
  { label: "Home", href: "#top" },
  { label: "Explore", href: "/explore" },
  { label: "Within", href: "/within" },
  { label: "Journey", href: "/journey" },
];

/** Section links for the landing page scroll-spy (only active on /) */
const sectionLinks = [
  { label: "Discover", href: "#feel" },
  { label: "Originals", href: "#originals" },
  { label: "Sanctuary", href: "#sanctuary" },
  { label: "Auri", href: "#auri" },
  { label: "Universe", href: "#universe" },
  { label: "Creators", href: "#creators" },
];

const sectionIds = sectionLinks
  .filter((l) => l.href.startsWith("#"))
  .map((link) => link.href.slice(1));

/**
 * Premium floating navigation — almost invisible until interacted with.
 *
 * DESIGN: A minimal glass pill that tightens on scroll. The active pill
 * glides between sections via scroll-spy. Navigation should feel like
 * it belongs to the atmosphere, not on top of it.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
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

  useEffect(() => {
    let spy: IntersectionObserver | null = null;
    const connectSpy = () => {
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => Boolean(section));
      if (sections.length !== sectionIds.length) return false;
      spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(`#${entry.target.id}`);
          });
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      sections.forEach((section) => spy?.observe(section));
      return true;
    };
    if (connectSpy()) return;
    const watcher = new MutationObserver(() => {
      if (connectSpy()) watcher.disconnect();
    });
    watcher.observe(document.body, { childList: true, subtree: true });
    return () => { watcher.disconnect(); spy?.disconnect(); };
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full px-3 py-3 sm:px-6">
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="fixed inset-0 cursor-default md:hidden"
        />
      )}

      {/* Glass pill — almost invisible at top, tightens on scroll */}
      <div
        className={`relative z-10 mx-auto flex max-w-6xl items-center justify-between rounded-full border px-3 py-2.5 backdrop-blur-md sm:px-5 transition-all duration-700 ease-out ${
          scrolled
            ? "border-white/[0.07] bg-[rgba(8,8,16,0.75)] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            : "border-transparent bg-transparent"
        }`}
      >
        <a href="#top" className="shrink-0" onClick={closeMenu}>
          <Logo />
        </a>

        {/* Desktop links — quiet, minimal */}
        <div className="relative hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const isActive = active === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                className={`relative rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-300 ${
                  isActive ? "text-white" : "text-gray-500 hover:text-gray-200"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full border border-white/[0.06] bg-white/[0.06] shadow-[0_0_12px_rgba(var(--mood-rgb),0.15)]"
                    transition={spring}
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button href="/signup" variant="gradient" size="sm" className="shadow-brand">
            Enter WithIn
          </Button>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white transition hover:bg-white/[0.08] md:hidden"
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

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, ...(prefersReducedMotion ? {} : { y: -8, scale: 0.98 }) }}
            animate={{ opacity: 1, ...(prefersReducedMotion ? {} : { y: 0, scale: 1 }) }}
            exit={{ opacity: 0, ...(prefersReducedMotion ? {} : { y: -8, scale: 0.98 }) }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 mx-auto mt-2 max-w-6xl md:hidden"
          >
            <div className="glass-level-4 rounded-3xl p-4 backdrop-blur-xl">
              {/* Primary navigation */}
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
              {/* Section links for landing page */}
              <div className="mt-1 border-t border-white/[0.06] pt-2">
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500/50">
                  Sections
                </p>
                {sectionLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMenu}
                    className="block rounded-2xl px-4 py-2 text-[13px] text-gray-400/60 transition hover:bg-white/5 hover:text-gray-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-2 border-t border-white/10 pt-3">
                <Button
                  href="/signup"
                  variant="gradient"
                  size="md"
                  onClick={closeMenu}
                  className="w-full"
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
