"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Compass, Film, Home, LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Logo from "@/components/ui/Logo";
import { spring } from "@/lib/animations";

const links = [
  { label: "Home", href: "#sanctuary", icon: Home, route: false },
  { label: "Discover", href: "#mood", icon: Compass, route: false },
  { label: "Stories", href: "#memories", icon: BookOpen, route: false },
  { label: "Originals", href: "#originals", icon: Film, route: false },
  { label: "Profile", href: "/login", icon: User, route: true }
];

export default function DashboardNav() {
  const [active, setActive] = useState("#sanctuary");
  const [isOpen, setIsOpen] = useState(false);
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

  // Scroll-spy: highlight the section currently in view (hash links only)
  useEffect(() => {
    const sections = links
      .filter((link) => !link.route)
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full px-4 py-6 sm:px-8">
      {/* Invisible overlay that closes the mobile menu */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="fixed inset-0 cursor-default md:hidden"
        />
      )}

      {/* Floating glass dock */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-2.5 shadow-dock backdrop-blur-sm sm:px-5">
        <Link href="/home" className="shrink-0" onClick={closeMenu}>
          <Logo />
        </Link>

        {/* Desktop dock links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const isActive = active === link.href;
            const inner = (
              <>
                {isActive && (
                  <motion.span
                    layoutId="dock-active"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={spring}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <motion.span
                    aria-hidden
                    whileHover={
                      prefersReducedMotion ? undefined : { y: -2, scale: 1.2 }
                    }
                    transition={spring}
                    className="inline-flex"
                  >
                    <link.icon className="h-4 w-4" />
                  </motion.span>
                  {link.label}
                </span>
              </>
            );
            const classes = `relative rounded-full px-4 py-2 text-sm transition-colors ${
              isActive ? "text-white" : "text-gray-300 hover:text-white"
            }`;
            return link.route ? (
              <Link key={link.label} href={link.href} className={classes}>
                {inner}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={classes}>
                {inner}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Avatar chip */}
          <Link
            href="/login"
            aria-label="Your profile"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 text-xs font-bold text-black ring-2 ring-white/20 transition hover:ring-emerald-300/50 md:flex"
          >
            S
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Exit
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="dashboard-mobile-menu"
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
            id="dashboard-mobile-menu"
            key="dashboard-mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 mx-auto mt-2 max-w-6xl md:hidden"
          >
            <div className="rounded-3xl border border-white/10 bg-black/70 p-4 backdrop-blur-sm">
              {links.map((link) => {
                const isActive = active === link.href;
                const classes = `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`;
                return link.route ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeMenu}
                    className={classes}
                  >
                    <span aria-hidden className="inline-flex">
                      <link.icon className="h-4 w-4" />
                    </span>
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMenu}
                    className={classes}
                  >
                    <span aria-hidden className="inline-flex">
                      <link.icon className="h-4 w-4" />
                    </span>
                    {link.label}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
