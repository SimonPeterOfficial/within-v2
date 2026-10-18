"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { UNIVERSE_NAV } from "@/lib/navigation";
import type { SidebarItem } from "@/components/layout/Sidebar";
import Icon from "@/components/ui/Icon";
import { clsx } from "clsx";

type ModuleShelfProps = {
  items: SidebarItem[];
  available?: string[];
};

export default function ModuleShelf({ items, available = [] }: ModuleShelfProps) {
  const tiles = items.filter((i) => i.route);
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, tiles.length);
  }, [tiles.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((s) => Math.min(s + 1, tiles.length - 1));
      refs.current[Math.min(focusIndex + 1, tiles.length - 1)]?.focus();
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((s) => Math.max(s - 1, 0));
      refs.current[Math.max(focusIndex - 1, 0)]?.focus();
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/60">Universe</h3>
      <div
        role="list"
        onKeyDown={onKeyDown}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tiles.map((item, idx) => {
          const isAvailable = available.length === 0 || available.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex h-28 flex-col justify-between rounded-2xl border p-4 transition focus:outline-none",
                isAvailable
                  ? "bg-[#0a0b11] border-white/8 hover:border-white/15"
                  : "bg-[#050507] border-white/5 opacity-60 pointer-events-none"
              )}
              ref={(el) => (refs.current[idx] = el)}
              aria-disabled={!isAvailable}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/6 text-white/90">
                    <Icon name={item.icon as any} size={16} />
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
