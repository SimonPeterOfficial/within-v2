"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const WINGS = [
  { id: "sky", label: "Sky", icon: "moon" as const },
  { id: "aura", label: "Aura", icon: "sparkles" as const },
  { id: "cosmic", label: "Cosmic", icon: "star" as const },
  { id: "mystic", label: "Mystic", icon: "eye" as const },
];

/**
 * AtlasRail — a floating wing navigator. Scroll-spy highlights the wing in
 * view; the top node returns to the sanctuary. Purely client-side.
 */
export default function AtlasRail() {
  const [active, setActive] = useState("sky");

  useEffect(() => {
    const sections = WINGS.map((w) => document.getElementById(w.id)).filter(
      (s): s is HTMLElement => Boolean(s)
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Atlas wings"
      className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-white/[0.07] bg-black/40 p-2 backdrop-blur-xl lg:flex"
    >
      <Link
        href="/home"
        aria-label="Return to the sanctuary"
        className="mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#a78bfa,#7c3aed)] text-white shadow-[0_0_14px_rgba(139,92,246,0.5)] transition hover:scale-105"
      >
        <Icon name="back" size={14} />
      </Link>
      {WINGS.map((wing) => {
        const isActive = active === wing.id;
        return (
          <a
            key={wing.id}
            href={`#${wing.id}`}
            title={wing.label}
            aria-label={`Jump to the ${wing.label} wing`}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
              isActive
                ? "bg-[rgba(var(--mood-rgb),0.16)] text-white"
                : "text-gray-500 hover:bg-white/[0.05] hover:text-gray-200"
            }`}
          >
            <Icon name={wing.icon} size={15} />
            {isActive && (
              <span
                aria-hidden
                className="absolute -left-[5px] h-1.5 w-1.5 rounded-full bg-[rgba(var(--mood-rgb),1)] shadow-[0_0_8px_rgba(var(--mood-rgb),0.9)]"
              />
            )}
          </a>
        );
      })}
    </nav>
  );
}
