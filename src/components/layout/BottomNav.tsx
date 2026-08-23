"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/home", icon: "home" },
  { label: "Explore", href: "/explore", icon: "discover" },
  { label: "Within", href: "/within", icon: "sparkles" },
  { label: "Journey", href: "/journey", icon: "heart" },
];

/**
 * The mobile bottom navigation — WithIn's spatial dock.
 *
 * Not a generic iOS tab bar. A floating glass ribbon that responds to the
 * live mood, with an active indicator that illuminates rather than highlights.
 * Safe-area insets respected. Touch targets generous. Identity maintained.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
    >
      {/* The glass ribbon */}
      <div className="relative mx-3 mb-3 overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-black/70 backdrop-blur-2xl shadow-dock"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Subtle ambient glow behind active indicator */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            background: "radial-gradient(ellipse 60% 120% at 50% 0%, rgba(var(--mood-rgb), 0.4), transparent 70%)",
          }}
        />

        <div className="relative flex items-stretch">
          {PRIMARY_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-1 flex-col items-center gap-1 py-3 px-2"
              >
                {/* Active indicator — subtle illumination, not a loud pill */}
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-[rgba(var(--mood-rgb),0.6)]"
                    style={{
                      boxShadow: "0 0 12px rgba(var(--mood-rgb), 0.4), 0 0 4px rgba(var(--mood-rgb), 0.2)",
                    }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}

                {/* Icon */}
                <span
                  className={`relative transition-all duration-300 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                  style={
                    isActive
                      ? { filter: "drop-shadow(0 0 6px rgba(var(--mood-rgb), 0.3))" }
                      : undefined
                  }
                >
                  <Icon name={item.icon} size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                </span>

                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-all duration-300 ${
                    isActive ? "text-white/90" : "text-gray-500/70"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
