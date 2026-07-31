/** Glass skeleton loader used while memory cards are loading. */
export default function MemoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="h-40 animate-pulse bg-white/10" />
      <div className="space-y-3 p-6">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/5" />
      </div>
    </div>
  );
}
