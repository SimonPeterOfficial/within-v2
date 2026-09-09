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
  /** Small numeric badge rendered beside the label */
  badge?: number;
  /** Group divider above this item */
  divider?: boolean;
};

type SidebarProps = {
  items: SidebarItem[];
};

/**
 * The labeled rail — the navigation shell of the authenticated universe.
 *
 * Desktop: a fixed 60px labeled rail exactly like the reference — the
 * "WithIn" serif wordmark on top, always-visible labels, a glowing pill on
 * the active item, and a vertical "Scroll" spine at the bottom. It never
 * collapses; the content column is offset to clear it.
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

  const railItem = (item: SidebarItem) => {
    const isActive = active === item.href;
    return (
      <span className="relative flex w-full items-center gap-3.5 px-4 py-2.5">
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            transition={spring}
            className="absolute inset-x-2 inset-y-0.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.18), rgba(var(--mood-rgb),0.09))",
              boxShadow: "inset 0 0 0 1px rgba(var(--mood-rgb),0.32), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <span
              aria-hidden
              className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[rgba(var(--mood-rgb),1)]"
              style={{ boxShadow: "0 0 8px rgba(var(--mood-rgb),0.55)" }}
            />
          </motion.span>
        )}
        <span
          aria-hidden
          className={`relative shrink-0 transition-colors ${
            isActive ? "text-[#5b4bc4]" : "text-[#6f6e88] group-hover/item:text-[#232136]"
          }`}
        >
          <Icon name={item.icon} size={17} strokeWidth={1.9} />
        </span>
        <span
          className={`relative hidden whitespace-nowrap text-[13.5px] font-medium lg:inline ${
            isActive ? "text-[#232136]" : "text-[#6f6e88] group-hover/item:text-[#232136]"
          }`}
        >
          {item.label}
        </span>
        {typeof item.badge === "number" && item.badge > 0 && (
          <span className="relative ml-auto hidden h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(var(--mood-rgb),0.92)] px-1 text-[10px] font-bold text-white lg:flex">
            {item.badge}
          </span>
        )}
      </span>
    );
  };

  const itemClasses = () =>
    "group/item block w-full transition-colors";

  return (
    <>
      {/* ── Desktop: the floating labeled crystal rail ────────── */}
      <nav
        aria-label="Primary"
        className="crystal-elevated crystal-edge depth-medium fixed inset-y-3 left-3 z-50 hidden w-[200px] flex-col rounded-[26px] lg:flex"
      >
        {/* Wordmark */}
        <Link
          href="/home"
          aria-label="WithIn home"
          className="flex h-16 shrink-0 items-center pl-6"
        >
          <span className="font-display text-[21px] font-semibold tracking-[-0.01em] text-[#232136]">
            With<span className="text-[#7c6ce0]">In</span>
          </span>
        </Link>

        {/* Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <span
              key={item.label}
              className={`relative block w-full ${item.divider ? "before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-white/[0.06]" : ""}`}
            >
              {item.route ? (
                <Link href={item.href} className={itemClasses()}>
                  {railItem(item)}
                </Link>
              ) : (
                <a href={item.href} className={itemClasses()}>
                  {railItem(item)}
                </a>
              )}
            </span>
          ))}
        </div>

        {/* User card — expands with the rail; opens the profile popover */}
        <div className="group/usercard relative shrink-0 border-t border-white/40 p-2">
          <button
            type="button"
            onClick={() => setUserCardOpen((openState) => !openState)}
            aria-expanded={userCardOpen}
            aria-label="Your account"
            className="crystal-focus flex w-full items-center gap-3 rounded-2xl px-1.5 py-1.5 text-left transition hover:bg-white/50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-200 to-rose-400 text-[12px] font-bold text-[#232136] ring-2 ring-white/70">
              {initial}
            </span>
            <span className="relative hidden min-w-0 flex-1 lg:block">
              <span className="block truncate text-[12.5px] font-semibold text-[#2c2a48]">
                {user?.name ?? "Explorer"}
              </span>
              <span className="block truncate text-[10.5px] text-[#8b8aa0]">Explorer</span>
            </span>
            <Icon
              name="chevronRight"
              size={12}
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
                className="crystal-foreground crystal-edge depth-high absolute bottom-full left-0 z-10 mb-2 w-[208px] rounded-2xl p-2"
              >
                <Link
                  href="/profile"
                  onClick={() => setUserCardOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-[#44435e] transition hover:bg-white/60 hover:text-[#232136]"
                >
                  <Icon name="profile" size={14} /> Your profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserCardOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-[#44435e] transition hover:bg-white/60 hover:text-[#232136]"
                >
                  <Icon name="settings" size={14} /> Settings
                </Link>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-[#44435e] transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Icon name="logout" size={14} /> Sign out
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ── Mobile: floating menu trigger ───────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="crystal-elevated crystal-edge depth-medium fixed bottom-24 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full text-[#5f5e74] transition hover:text-[#232136] lg:hidden"
      >
        <Icon name="menu" size={16} />
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
              className="fixed inset-0 z-[45] cursor-default bg-black/60 backdrop-blur-sm lg:hidden"
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
              className="fixed inset-y-0 left-0 z-[55] flex w-72 flex-col border-r border-white/10 bg-black/85 p-6 backdrop-blur-xl outline-none lg:hidden"
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
                    <Link key={item.label} href={item.href} onClick={close} className={classes}>
                      <Icon name={item.icon} size={18} />
                      {item.label}
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(var(--mood-rgb),0.9)] px-1 text-[10px] font-bold text-black">
                          {item.badge}
                        </span>
                      )}
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
