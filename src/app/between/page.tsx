import type { Metadata } from "next";
import BetweenExperience from "@/components/between/BetweenExperience";

export const metadata: Metadata = {
  title: "The Between — WithIn",
  description: "The space between things. Not everything needs a destination.",
};

/**
 * The Between — a hidden spatial layer between WithIn's worlds.
 *
 * No conventional card grid. No navigation chrome.
 * Dark water, distant stars, slow-moving light, floating fragments.
 *
 * The user enters through rare discoveries.
 * There is a way back. But it feels outside normal navigation.
 */
export default function BetweenPage() {
  return <BetweenExperience />;
}
