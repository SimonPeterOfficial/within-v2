"use client";

import { motion } from "framer-motion";
import { staggerContainer, blurUp } from "@/lib/animations";

type MotionProps = {
  children: React.ReactNode;
  className?: string;
};

/** Client-only boundary for the server pages' staggered reveal group. */
export function MotionContainer({ children, className }: MotionProps) {
  return (
    <motion.div
      variants={staggerContainer(0.05, 0.05)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Item-level blur-up inside a MotionContainer. */
export function FadeItem({ children, className }: MotionProps) {
  return (
    <motion.div variants={blurUp} className={className}>
      {children}
    </motion.div>
  );
}
