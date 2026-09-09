import type { Metadata } from "next";
import AtlasExperience from "@/components/atlas/AtlasExperience";

export const metadata: Metadata = {
  title: "The Atlas — WithIn",
  description:
    "WithIn's observatory: live sky instruments, emotional weather, and the mystic wing.",
};

export default function AtlasPage() {
  return <AtlasExperience />;
}
