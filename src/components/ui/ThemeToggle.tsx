"use client";

import { AnimatePresence, motion } from "framer-motion";
import { spring } from "@/lib/animations";
import Icon from "@/components/ui/Icon";
import { useTheme } from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
};

/** Glass pill that flips between the dark and light universes. */
export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:bg-surface hover:brightness-125 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
          transition={spring}
          className="flex"
        >
          <Icon name={isDark ? "moon" : "sun"} size={16} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
