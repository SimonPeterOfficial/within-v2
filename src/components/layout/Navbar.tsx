"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

const navLinks = [
  { label: "Stories", href: "#stories" },
  { label: "Originals", href: "#originals" },
  { label: "Community", href: "#community" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

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

  return (
    <nav className="fixed top-0 z-50 w-full px-4 py-6 sm:px-8">
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
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-xl sm:px-6">
        <a href="#top" className="shrink-0" onClick={closeMenu}>
          <Logo />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button href="#join" variant="light" size="sm">
            Enter
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
            <div className="rounded-3xl border border-white/10 bg-black/70 p-4 backdrop-blur-xl">
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
                  href="#join"
                  variant="light"
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
