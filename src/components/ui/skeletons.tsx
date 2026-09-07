import { clsx } from "clsx";

/**
 * The skeleton system — loading that preserves the shape of what's coming.
 *
 * Every skeleton mirrors the real layout it stands in for, so the page never
 * jumps when data arrives. The shimmer is a slow opacity pulse (cheaper than
 * a moving gradient and calmer in a dark universe); under reduced motion it
 * holds a single quiet tone.
 */

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={clsx("animate-pulse rounded-full bg-white/[0.07]", className)}
    />
  );
}

/** Announces the loading region to screen readers without visual noise. */
export function SkeletonRegion({
  label,
  children,
  className = "",
}: SkeletonProps & { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-label={label} className={className}>
      {children}
    </div>
  );
}

/** Mirrors ContentCard (poster variant) — cover, kicker, title, meta line. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-white/[0.06] bg-white/[0.03]">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

/** A grid of card skeletons — the discover/profile shelf loading state. */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

/** A horizontal rail of compact cards — the "fresh" / recent rows. */
export function RailSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="w-64 shrink-0">
          <div className="flex overflow-hidden rounded-card border border-white/[0.06] bg-white/[0.03]">
            <Skeleton className="h-24 w-20 shrink-0 rounded-none" />
            <div className="flex-1 space-y-2.5 p-4">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mirrors the profile identity card — avatar, name, handle, bio, stats. */
export function ProfileSkeleton() {
  return (
    <div className="rounded-card border border-white/[0.12] bg-white/[0.07] p-7 sm:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3.5 w-full max-w-md" />
          <div className="flex gap-6 pt-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-28 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

/** Mirrors the content detail page — hero title, meta, description, cover. */
export function ContentPageSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <div className="space-y-5">
        <div className="flex gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full max-w-lg" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-3/4 max-w-lg" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
