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
  { label: "Discover", href: "/discover", icon: "discover" },
  { label: "Within", href: "/within", icon: "sparkles" },
  { label: "People", href: "/connections", icon: "users" },
  { label: "Profile", href: "/profile", icon: "profile" },
];

/**
 * The mobile bottom navigation — WithIn's spatial dock.
 *
 * GEN 21: the dock is no longer a boxed ribbon — it is a layer of the
 * atmosphere itself. No border, no card: just icons floating on the dark,
 * a soft light-well rising from below, and a luminous orb that blooms
 * under the place you are. The center (Within) is deliberately closest
 * to the thumb — the door to Auri is always under the hand.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
    >
      {/* The dock — a floating crystal surface rising from the light */}
      <div
        className="crystal-elevated crystal-edge depth-high relative mx-3 mb-3 rounded-[26px] pt-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.9rem)" }}
      >
        {/* The light-well — soft mood light blooming from below */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 50% 100%, rgba(var(--mood-rgb), 0.1), transparent 70%)",
          }}
        />

        <div className="relative flex items-end justify-around px-4">
          {PRIMARY_NAV.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));
            const isCenter = index === Math.floor(PRIMARY_NAV.length / 2);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-1 flex-col items-center gap-1.5 px-1 py-2"
              >
                {/* The bloom — light under the active place */}
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-bloom"
                    aria-hidden
                    className="absolute -bottom-1 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(var(--mood-rgb), 0.22), transparent 70%)",
                    }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 320, damping: 26 }
                    }
                  />
                )}

                {/* Icon — the center item rides slightly higher, like a key */}
                <span
                  className={`relative transition-all duration-300 ${
                    isActive ? "text-[#5b4bc4]" : "text-[#6f6e88]"
                  } ${isCenter ? "-translate-y-1" : ""}`}
                  style={
                    isActive
                      ? { filter: "drop-shadow(0 0 8px rgba(var(--mood-rgb), 0.45))" }
                      : undefined
                  }
                >
                  <Icon name={item.icon} size={isCenter ? 22 : 20} strokeWidth={isActive ? 2.2 : 1.6} />
                </span>

                {/* Label — quiet, only the active place speaks in ink */}
                <span
                  className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${
                    isCenter ? "-translate-y-0.5" : ""
                  } ${isActive ? "text-[#3d3a5e]" : "text-[#8b8aa0]/80"}`}
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
