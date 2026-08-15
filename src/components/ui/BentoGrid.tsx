import { clsx } from "clsx";

/** Bento card sizes — how much room a card claims in the grid. */
export type BentoCardSize = "sm" | "md" | "lg" | "wide" | "tall" | "featured";

const spans: Record<BentoCardSize, string> = {
  sm: "sm:col-span-1 sm:row-span-1",
  md: "sm:col-span-1 sm:row-span-1",
  lg: "md:col-span-2 md:row-span-2",
  wide: "md:col-span-2 md:row-span-1",
  tall: "md:col-span-1 md:row-span-2",
  featured: "md:col-span-2 md:row-span-2"
};

const minHeights: Record<BentoCardSize, string> = {
  sm: "min-h-40",
  md: "min-h-52",
  lg: "min-h-[24rem]",
  wide: "min-h-52",
  tall: "min-h-[24rem]",
  featured: "min-h-[24rem]"
};

type BentoCardProps = {
  children: React.ReactNode;
  size?: BentoCardSize;
  className?: string;
};

/**
 * BentoCard — one cell of the bento composition. Claimed size is a hint:
 * the grid stays responsive, collapsing gracefully on small screens where
 * every card becomes a full column.
 */
export function BentoCard({ children, size = "md", className = "" }: BentoCardProps) {
  return (
    <div className={clsx("flex flex-col", spans[size], minHeights[size], className)}>
      {children}
    </div>
  );
}

type BentoGridProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * BentoGrid — the editorial grid of the dream. Mobile: single column.
 * Small screens: two columns. Desktop: a four-column field where cards
 * claim larger footprints to build hierarchy.
 */
export default function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div
      className={clsx(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 md:auto-rows-[minmax(13rem,auto)] md:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
