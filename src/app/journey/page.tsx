import type { Metadata } from "next";
import JourneyExperience from "@/components/journey/JourneyExperience";

export const metadata: Metadata = {
  title: "Your Journey — WithIn",
  description: "Your universe is forming — a constellation of everything you've discovered.",
};

export default function JourneyPage() {
  return <JourneyExperience />;
}
