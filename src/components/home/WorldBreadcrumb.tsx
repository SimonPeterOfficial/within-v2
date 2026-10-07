"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";

/**
 * WorldBreadcrumb — the trail through the world.
 *
 * A subtle breadcrumb that shows where you are in the world.
 * It helps the user understand:
 * - WHERE AM I?
 * - WHERE DID I COME FROM?
 * - WHAT RELATES TO THIS?
 *
 * The breadcrumb is optional — it only appears when there's
 * a meaningful path to show. It's always quiet, never loud.
 */
export default function WorldBreadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#8b8aa0]">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <Icon name="chevronRight" size={10} className="text-[#b0b0c0]" />}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-[#5b4bc4]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#5f5e74]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
