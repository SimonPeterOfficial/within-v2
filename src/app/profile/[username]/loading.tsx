import Container from "@/components/ui/Container";
import {
  Skeleton,
  SkeletonRegion,
  ProfileSkeleton,
  CardGridSkeleton,
} from "@/components/ui/skeletons";

/** The public profile's loading state — identity card and shelf in place. */
export default function ProfileLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <Container className="pb-28 pt-12">
        <SkeletonRegion label="Loading profile">
          <ProfileSkeleton />
          <div className="mt-16">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-64" />
            <div className="mt-8">
              <CardGridSkeleton count={6} />
            </div>
          </div>
        </SkeletonRegion>
      </Container>
    </div>
  );
}
