"use client";

import { motion } from "framer-motion";
import { revealVariant } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds */
  delay?: number;
  /** Rise distance in pixels */
  distance?: number;
  once?: boolean;
};

/** Fades and rises children into view, with an optional stagger delay. */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  distance = 24,
  once = true
}: RevealProps) {
  return (
    <motion.div
      variants={revealVariant(distance)}
      initial="hidden"
      whileInView="show"
      custom={delay}
      viewport={{ once, amount: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
