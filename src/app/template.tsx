"use client";

import { MotionConfig, motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div variants={fadeIn} initial="hidden" animate="show">
        {children}
      </motion.div>
    </MotionConfig>
  );
}
