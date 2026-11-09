"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useSession } from "@/lib/auth/session";
import Icon, { type IconName } from "@/components/ui/Icon";
import WithinMark from "@/components/ui/WithinMark";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { spring } from "@/lib/animations";
import { recordVisit } from "@/lib/light-memory";
import NavGlow from "@/components/layout/NavGlow";

export type SidebarItem = {
  label: string;
  href: string;
  icon: IconName;
  /** True when href is a real route rather than an in-page anchor */
  route?: boolean;
  /** Small numeric badge rendered beside the label */
  badge?: number;
  /** Group divider above this item */
  divider?: boolean;
  /** Section label; when it changes, a tiny divider label is rendered in the rail */
  group?: string;
};

type SidebarProps = {
  items: SidebarItem[];
};

/**
 * The navigation rail — floating liquid glass, per the illustrated world.
 *
 * Desktop: a pane of frosted glass drifting over the world. The diamond
 * wordmark and the universe tagline at the top; nav rows as glass coin
 * icons beside labels; the active room marked by a pill of light; a
 * "You · Online" bubble at the bottom; the worlds' promise beneath it:
 * Explore · Connect · Grow.
 *
 * Mobile: a full glass drawer with overlay, Escape-to-close, and scroll lock.
 */
export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, signOut } = useSession();
  const prefersReducedMotion = useReducedMotionSafe();
  const panelRef = useRef<HTMLElement>(null);

  const [open, setOpen] = useState(false);
  const [userCardOpen, setUserCardOpen] = useState(false);
  const [active, setActive] = useState(items[0]?.href ?? "");

  const close = () => setOpen(false);
  const isAuthenticated = status === "authenticated";
  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "G";

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

  /**
   * A nav row — glass coin icon, label, badge. The active room wears
   * a pill of light beneath the row; the glow never blocks the hit area.
   */
  const railItem = (item: SidebarItem) => {
    const isActive = active === item.href;
    return (
      <span className="relative flex w-full items-center gap-3 px-2.5 py-[7px]">
        <NavGlow href={item.href} />
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            transition={spring}
            aria-hidden
            className="absolute inset-0 rounded-[14px] pill-glow"
          />
        )}
        <span
          aria-hidden
          className={`chip-glass chip-glass-hover relative h-[30px] w-[30px] shrink-0 ${
            isActive ? "" : "opacity-90"
          }`}
        >
          <Icon name={item.icon} size={15} strokeWidth={1.9} />
        </span>
        <span
          className={`relative hidden truncate text-[13.5px] font-medium lg:inline ${
            isActive ? "ink-title" : "ink-body group-hover/item:ink-title"
          }`}
        >
          {item.label}
        </span>
        {typeof item.badge === "number" && item.badge > 0 && (
          <span className="chip-glass relative ml-auto hidden h-[19px] min-w-[19px] items-center justify-center px-1 text-[10px] font-bold lg:flex">
            {item.badge}
          </span>
        )}
      </span>
    );
  };

  const itemClasses = () =>
    "group/item block w-full rounded-[14px] transition-colors";

  const brand = (onClose?: () => void) => (
    <Link
      href="/home"
      onClick={onClose}
      aria-label="WithIn — home"
      className="flex shrink-0 flex-col gap-1.5 px-5 pb-3 pt-5"
    >
      <WithinMark variant="diamond" size={27} tone="gold" />
      <span className="tagline-caps text-[8.5px]">A universe that feels you</span>
    </Link>
  );

  return (
    <>
      {/* ── Desktop: the floating glass rail ───────────────────────── */}
      <nav
        aria-label="Primary"
        className="pane edge-glass fixed inset-y-3 left-3 z-navigation hidden w-[212px] flex-col rounded-[26px] lg:flex"
      >
        {brand()}

        {/* Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => (
            <span
              key={item.label}
              className={`relative block w-full ${
                item.divider ? "before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-white/[0.1]" : ""
              }`}
            >
              {item.group && items[index - 1]?.group !== item.group && (
                <p className="px-3 pb-1 pt-3 text-[9px] font-semibold uppercase tracking-[0.34em] text-[#8b8aa0]/80">
                  {item.group}
                </p>
              )}
              {item.route ? (
                <Link
                  href={item.href}
                  className={itemClasses()}
                  onClick={() => recordVisit(item.href)}
                >
                  {railItem(item)}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className={itemClasses()}
                  onClick={() => recordVisit(item.href)}
                >
                  {railItem(item)}
                </a>
              )}
            </span>
          ))}
        </div>

        {/* ── You — the presence bubble ─────────────────────────────── */}
        <div className="group/usercard relative shrink-0 border-t border-white/40 p-2">
          <p className="px-2.5 pb-1 pt-1 text-[8px] font-semibold uppercase tracking-[0.34em] text-[#8b8aa0]/75">
            Your world
          </p>
          <button
            type="button"
            onClick={() => setUserCardOpen((openState) => !openState)}
            aria-expanded={userCardOpen}
            aria-label="Your account"
            className="crystal-focus flex w-full items-center gap-2.5 rounded-2xl px-1 py-1.5 text-left transition hover:bg-white/45"
          >
            <span className="relative shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-[#e9c9a8] to-[#cfa8e2] text-[12px] font-bold text-[#3a3160] ring-2 ring-white/80">
                {initial}
              </span>
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white/85"
              />
            </span>
            <span className="relative hidden min-w-0 flex-1 lg:block">
              <span className="block truncate text-[12.5px] font-semibold ink-title">
                {user?.name ?? "You"}
              </span>
              <span className="block truncate text-[10.5px] text-[#8b8aa0]">
                Online
              </span>
            </span>
            <Icon
              name="dots"
              size={14}
              className={`hidden shrink-0 text-[#8b8aa0] transition-transform lg:block ${userCardOpen ? "rotate-90" : ""}`}
            />
          </button>

          {/* The popover — account doors, anchored above the card */}
          <AnimatePresence>
            {userCardOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="pane edge-glass absolute bottom-full left-0 z-10 mb-2 w-[196px] rounded-2xl p-1.5"
              >
                <Link
                  href="/profile"
                  onClick={() => setUserCardOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium ink-body transition hover:bg-white/55 hover:ink-title"
                >
                  <Icon name="profile" size={14} /> Your profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserCardOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium ink-body transition hover:bg-white/55 hover:ink-title"
                >
                  <Icon name="settings" size={14} /> Settings
                </Link>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-[#514b76] transition hover:bg-rose-50/80 hover:text-rose-700"
                  >
                    <Icon name="logout" size={14} /> Sign out
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The worlds' promise */}
          <p className="pb-1.5 pt-1 text-center text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8b8aa0]/80">
            Explore · Connect · Grow
          </p>
        </div>
      </nav>

      {/* ── Mobile: floating menu trigger ───────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="pane chip-glass-hover fixed bottom-24 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full ink-body lg:hidden"
      >
        <Icon name="menu" size={17} />
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
              className="fixed inset-0 z-[45] cursor-default bg-[#1f1940]/30 backdrop-blur-sm lg:hidden"
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
              className="pane edge-glass fixed inset-y-0 left-0 z-[55] flex w-[300px] max-w-[86vw] flex-col rounded-r-[30px] outline-none lg:hidden"
            >
              <div className="flex items-start justify-between">
                {brand(close)}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="chip-glass chip-glass-hover mt-4 mr-3 flex h-10 w-10 items-center justify-center ink-body"
                >
                  <Icon name="close" size={17} />
                </button>
              </div>

              <nav className="mt-6 flex max-h-full flex-1 flex-col overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((item, index) => {
                  const isActive = active === item.href;
                  const classes = `group/item relative flex w-full items-center gap-3 rounded-[14px] px-2.5 py-2 text-sm font-medium transition ${
                    isActive ? "pill-glow ink-title" : "ink-body hover:bg-white/40"
                  }`;
                  return (
                    <span
                      key={item.label}
                      className="relative block w-full"
                    >
                      {item.group && items[index - 1]?.group !== item.group && (
                        <p className="px-3 pb-1 pt-3 text-[9px] font-semibold uppercase tracking-[0.34em] text-[#8b8aa0]/80">
                          {item.group}
                        </p>
                      )}
                      {item.route ? (
                        <Link href={item.href} onClick={close} className={classes}>
                          <span className="chip-glass h-[30px] w-[30px] shrink-0">
                            <Icon name={item.icon} size={15} strokeWidth={1.9} />
                          </span>
                          {item.label}
                          {typeof item.badge === "number" && item.badge > 0 && (
                            <span className="chip-glass ml-auto flex h-[19px] min-w-[19px] items-center justify-center px-1 text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <a href={item.href} onClick={close} className={classes}>
                          <span className="chip-glass h-[30px] w-[30px] shrink-0">
                            <Icon name={item.icon} size={15} strokeWidth={1.9} />
                          </span>
                          {item.label}
                        </a>
                      )}
                    </span>
                  );
                })}
              </nav>

              <div className="mt-6 border-t border-white/50 p-3">
                <p className="px-2.5 pb-1.5 text-[8px] font-semibold uppercase tracking-[0.34em] text-[#8b8aa0]/75">
                  Your world
                </p>
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="relative shrink-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#e9c9a8] to-[#cfa8e2] text-[12px] font-bold text-[#3a3160] ring-2 ring-white/80">
                          {initial}
                        </span>
                        <span
                          aria-hidden
                          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white/85"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold ink-title">{user?.name}</p>
                        <p className="truncate text-xs text-[#8b8aa0]">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      aria-label="Sign out"
                      className="chip-glass chip-glass-hover flex h-10 w-10 shrink-0 items-center justify-center ink-body"
                    >
                      <Icon name="logout" size={16} />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={close}
                    className="pill-lit py-3 px-4 w-full text-sm font-semibold"
                  >
                    <Icon name="profile" size={16} />
                    Enter your universe
                  </Link>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8b8aa0]/80">
                    Explore · Connect · Grow
                  </p>
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
