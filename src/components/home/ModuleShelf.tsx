"use client";

import Link from "next/link";
import { useState, useRef, useEffect, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { clsx } from "clsx";
import Icon from "@/components/ui/Icon";
import type { SidebarItem } from "@/components/layout/Sidebar";

type ModuleShelfProps = {
  items: SidebarItem[];
  available?: string[];
};

export default function ModuleShelf({ items, available = [] }: ModuleShelfProps) {
  const tiles = items.filter((item) => item.route);
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, tiles.length);
  }, [tiles.length]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const nextIndex = Math.min(focusIndex + 1, tiles.length - 1);
    const prevIndex = Math.max(focusIndex - 1, 0);

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex(nextIndex);
      refs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setFocusIndex(prevIndex);
      refs.current[prevIndex]?.focus();
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/60">Universe</h3>
      <div role="list" onKeyDown={onKeyDown} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((item, index) => {
          const isAvailable = available.length === 0 || available.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex h-28 flex-col justify-between rounded-2xl border p-4 transition focus:outline-none",
                isAvailable
                  ? "border-white/8 bg-[#0a0b11] hover:border-white/15"
                  : "pointer-events-none border-white/5 bg-[#050507] opacity-60"
              )}
              ref={(element) => {
                refs.current[index] = element;
              }}
              aria-disabled={!isAvailable}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/6 text-white/90">
                    <Icon name={item.icon} size={16} />
                  </span>
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                </div>
                <div className="text-sm text-white/40">{isAvailable ? "Open" : "Unavailable"}</div>
              </div>
              <div className="mt-2 text-xs text-white/50">{item.group}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
