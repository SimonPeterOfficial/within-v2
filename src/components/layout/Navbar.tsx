"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { spring } from "@/lib/animations";

const navLinks = [
  { label: "Continue", href: "#continue" },
  { label: "Originals", href: "#originals" },
  { label: "Music", href: "#music" },
  { label: "Communities", href: "#communities" }
];

/** Section ids the scroll-spy watches — mirrors navLinks hrefs without the #. */
const sectionIds = navLinks.map((link) => link.href.slice(1));

/**
 * Premium floating navigation — a rounded glass pill with an animated active
 * pill that glides between links as you scroll (scroll-spy over the section
 * anchors), plus an "Enter WithIn" CTA that opens the door.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotionSafe();

  const closeMenu = () => setIsOpen(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Scroll-spy — the active pill glides to whichever section is in view.
  // Some sections render inside code-split Suspense chunks, so discovery
  // retries via a MutationObserver until every id exists, then connects the
  // spy once. setState only runs inside observer callbacks (async), keeping
  // the set-state-in-effect rule satisfied.
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

    return () => {
      watcher.disconnect();
      spy?.disconnect();
    };
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full px-4 py-5 sm:px-8">
      {/* Invisible overlay that closes the menu when clicking outside */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="fixed inset-0 cursor-default md:hidden"
        />
      )}

      {/* Glass pill */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/15 bg-white/5 px-3 py-3 shadow-soft backdrop-blur-md sm:px-6">
        <a href="#top" className="shrink-0" onClick={closeMenu}>
          <Logo />
        </a>

        {/* Desktop links — active pill glides between sections */}
        <div className="relative hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = active === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full border border-white/10 bg-white/10 shadow-[0_0_18px_rgba(var(--mood-rgb),0.28)]"
                    transition={spring}
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button href="/signup" variant="gradient" size="sm" className="shadow-brand">
            Enter WithIn
          </Button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
          >
            <span className="relative block h-3.5 w-5" aria-hidden>
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

      {/* Mobile menu panel */}
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
            <div className="rounded-3xl border border-white/10 bg-black/70 p-4 shadow-soft backdrop-blur-md">
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
