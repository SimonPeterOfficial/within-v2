import type { Metadata } from "next";
import WithinExperience from "@/components/within/WithinExperience";

export const metadata: Metadata = {
  title: "Within — WithIn",
  description: "Talk. Wonder. Wander. A quiet room where conversation leads to discovery.",
};

export default function WithinPage() {
  return <WithinExperience />;
}
