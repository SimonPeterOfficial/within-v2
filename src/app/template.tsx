"use client";

import { MotionConfig } from "framer-motion";
import PageTransition from "@/components/ui/PageTransition";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <PageTransition>{children}</PageTransition>
    </MotionConfig>
  );
}
