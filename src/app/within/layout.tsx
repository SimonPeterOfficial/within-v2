import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Within — WithIn",
  description: "The heart of WithIn — where the world comes alive.",
};

export default function WithinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
