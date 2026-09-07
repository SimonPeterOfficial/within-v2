import Container from "@/components/ui/Container";
import {
  Skeleton,
  SkeletonRegion,
  CardGridSkeleton,
} from "@/components/ui/skeletons";

/**
 * Discover's loading state — the hero, search well, filter rail, and grid
 * hold their real positions so the page never jumps when data arrives.
 */
export default function DiscoverLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <Container className="pb-28 pt-28 sm:pt-32">
        <SkeletonRegion label="Loading discover">
          {/* Hero */}
          <div className="max-w-2xl">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-12 w-full max-w-md" />
            <Skeleton className="mt-4 h-4 w-full max-w-xl" />
          </div>

          {/* Search well */}
          <div className="mx-auto mt-10 max-w-2xl">
            <Skeleton className="h-14 w-full rounded-full" />
          </div>

          {/* Filter rail */}
          <div className="mt-8 flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-full" />
            ))}
          </div>

          {/* Grid */}
          <div className="mt-14">
            <CardGridSkeleton count={8} />
          </div>
        </SkeletonRegion>
      </Container>
    </div>
  );
}
