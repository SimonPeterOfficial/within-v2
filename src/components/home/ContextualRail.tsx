"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * ContextualRail — related destinations and contextual navigation.
 *
 * Shows the user where they can go from here. Uses only actual routes.
 * The rail is quiet — it doesn't compete with the main content.
 *
 * This is part of the WITHIN THREAD — the user should feel that
 * everything connects.
 */

type RelatedDestination = {
  label: string;
  href: string;
  icon: IconName;
  line: string;
};

export default function ContextualRail({
  title = "Continue exploring",
  destinations,
}: {
  title?: string;
  destinations: RelatedDestination[];
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  if (destinations.length === 0) return null;

  return (
    <motion.aside
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="crystal-elevated crystal-edge depth-low rounded-3xl p-5"
      aria-label={title}
    >
      <p className="text-[13px] font-semibold text-[#232136]">{title}</p>
      <ul className="mt-3 flex flex-col">
        {destinations.map((dest) => (
          <li key={dest.label}>
            <Link
              href={dest.href}
              className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/45"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/55 text-[#6f6e88] ring-1 ring-white/70 transition-colors group-hover:text-[#232136]">
                <Icon name={dest.icon} size={14} strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-[#44435e] group-hover:text-[#232136]">
                  {dest.label}
                </span>
                <span className="block truncate text-[10.5px] text-[#8b8aa0]">{dest.line}</span>
              </span>
              <Icon
                name="chevronRight"
                size={13}
                className="text-[#8b8aa0] transition-transform group-hover:translate-x-0.5 group-hover:text-[#44435e]"
              />
            </Link>
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}
