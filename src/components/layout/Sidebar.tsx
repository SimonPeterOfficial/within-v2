"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useSession } from "@/lib/auth/session";
import Icon, { type IconName } from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { spring } from "@/lib/animations";

export type SidebarItem = {
  label: string;
  href: string;
  icon: IconName;
  /** True when href is a real route rather than an in-page anchor */
  route?: boolean;
};

type SidebarProps = {
  items: SidebarItem[];
};

/**
 * The responsive sidebar — the navigation shell of the sanctuary.
 *
 * Desktop: a floating glass rail on the left that rests as a quiet icon pill
 * and blooms open on hover, with an animated active indicator that glides
 * between items (scroll-spy on section anchors, pathname on routes).
 * Mobile: a full glass drawer with overlay, Escape-to-close, focus move on
 * open, and body scroll lock.
 *
 * The footer carries the session — avatar chip, theme toggle, and sign out.
 */
export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, signOut } = useSession();
  const prefersReducedMotion = useReducedMotionSafe();
  const panelRef = useRef<HTMLElement>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#sanctuary");

  const close = () => setOpen(false);
  const isAuthenticated = status === "authenticated";
  const initial = user?.name.trim().charAt(0).toUpperCase() ?? "G";

  // Route links: highlight the matching pathname (deferred, per the
  // set-state-in-effect rule — section scroll-spy owns the rest of the time).
  useEffect(() => {
    const routeItem = items.find((item) => item.route && item.href === pathname);
    if (!routeItem) return;
    const frame = requestAnimationFrame(() => setActive(routeItem.href));
    return () => cancelAnimationFrame(frame);
  }, [pathname, items]);

  // Section links: scroll-spy highlights the section in view.
  useEffect(() => {
    const sections = items
      .filter((item) => !item.route)
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0) return;

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
  }, [items]);

  // Drawer: Escape to close, focus the panel, lock body scroll.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const itemInner = (item: SidebarItem) => {
    const isActive = active === item.href;
    return (
      <span className="relative flex w-full items-center gap-3 rounded-full px-3 py-2.5">
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-full bg-white/10"
            transition={spring}
          />
        )}
        <span
          aria-hidden
          className={`relative shrink-0 transition-colors ${
            isActive ? "text-white" : "text-gray-400"
          }`}
        >
          <Icon name={item.icon} size={18} />
        </span>
        <span
          className={`relative hidden whitespace-nowrap text-sm font-medium transition-opacity duration-300 group-hover/rail:inline ${
            isActive ? "text-white" : "text-gray-300"
          }`}
        >
          {item.label}
        </span>
      </span>
    );
  };

  const itemClasses = (item: SidebarItem) =>
    `group/item block w-full transition-colors hover:text-white ${
      active === item.href ? "" : "hover:bg-white/5"
    }`;

  return (
    <>
      {/* ── Desktop rail ─────────────────────────────────────────────── */}
      <nav
        aria-label="Primary"
        className="fixed left-5 top-1/2 z-50 hidden -translate-y-1/2 lg:block"
      >
        <div className="group/rail max-h-[calc(100dvh-4rem)] w-16 overflow-y-auto overflow-x-hidden rounded-full border border-white/10 bg-white/5 p-3 shadow-dock backdrop-blur-sm transition-[width] duration-500 ease-out [scrollbar-width:none] hover:w-60 [&::-webkit-scrollbar]:hidden">
          <Link
            href="/"
            aria-label="WithIn home"
            className="mb-1.5 flex w-full items-center justify-center rounded-full py-1 transition hover:bg-white/5"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full bg-linear-to-br from-purple-500 to-emerald-400 shadow-brand"
            />
          </Link>

          {items.map((item) => (
            <span key={item.label} className="w-full">
              {item.route ? (
                <Link href={item.href} className={itemClasses(item)}>
                  {itemInner(item)}
                </Link>
              ) : (
                <a href={item.href} className={itemClasses(item)}>
                  {itemInner(item)}
                </a>
              )}
            </span>
          ))}
        </div>
      </nav>

      {/* ── Desktop corner cluster: session + theme ─────────────────── */}
      <div className="fixed bottom-6 left-6 z-50 hidden items-center gap-3 lg:flex">
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleSignOut}
            aria-label={`Sign out (${user?.name ?? "account"})`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 shadow-dock backdrop-blur-sm transition hover:border-rose-400/40 hover:text-rose-300"
          >
            <Icon name="logout" size={16} />
          </button>
        )}

        <Link
          href={isAuthenticated ? "/home" : "/login"}
          aria-label={isAuthenticated ? "Your profile" : "Log in"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 text-xs font-bold text-black shadow-dock ring-2 ring-white/20 transition hover:ring-emerald-300/50"
        >
          {isAuthenticated ? initial : <Icon name="profile" size={16} />}
        </Link>

        <ThemeToggle />
      </div>

      {/* ── Mobile: floating menu trigger ───────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-dock backdrop-blur-sm transition hover:bg-white/10 lg:hidden"
      >
        <Icon name="menu" size={20} />
      </button>

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              ref={panelRef}
              tabIndex={-1}
              aria-label="Menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "tween",
                duration: prefersReducedMotion ? 0 : 0.35,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-black/85 p-6 backdrop-blur-xl outline-none lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Link href="/" onClick={close}>
                  <Logo />
                </Link>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:text-white"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <nav className="mt-10 flex max-h-full flex-1 flex-col gap-1.5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((item) => {
                  const isActive = active === item.href;
                  const classes = `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`;
                  return item.route ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={close}
                      className={classes}
                    >
                      <Icon name={item.icon} size={18} />
                      {item.label}
                    </Link>
                  ) : (
                    <a key={item.label} href={item.href} onClick={close} className={classes}>
                      <Icon name={item.icon} size={18} />
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              <div className="mt-6 border-t border-white/10 pt-5">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-emerald-400 text-xs font-bold text-black">
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                        <p className="truncate text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      aria-label="Sign out"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:border-rose-400/40 hover:text-rose-300"
                    >
                      <Icon name="logout" size={16} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Icon name="profile" size={16} />
                    Log in
                  </Link>
                )}
                <div className="mt-4 flex justify-center">
                  <ThemeToggle />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
