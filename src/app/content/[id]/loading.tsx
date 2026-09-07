import Container from "@/components/ui/Container";
import { SkeletonRegion, ContentPageSkeleton } from "@/components/ui/skeletons";

/** The content page's loading state — hero, meta, body, and cover in place. */
export default function ContentLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <Container className="pb-28 pt-28 sm:pt-32">
        <SkeletonRegion label="Loading content">
          <ContentPageSkeleton />
        </SkeletonRegion>
      </Container>
    </div>
  );
}
