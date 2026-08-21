import type { Metadata } from "next";
import ExploreExperience from "@/components/explore/ExploreExperience";

export const metadata: Metadata = {
  title: "Explore — WithIn",
  description: "The endless universe — wander through stories, music, photography, and unexpected discoveries.",
};

export default function ExplorePage() {
  return <ExploreExperience />;
}
