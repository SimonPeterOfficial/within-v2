"use client";

import { motion } from "framer-motion";
import { ambientBreathe } from "@/lib/animations";
import StatePanel from "@/components/ui/states/StatePanel";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

/**
 * Cinematic loading — a breathing mood orb instead of a spinner.
 * Announces its label to screen readers via the status role.
 */
export default function LoadingState({ label = "Loading…", className = "" }: LoadingStateProps) {
  return (
    <div role="status" className={className}>
      <StatePanel
        title={label}
        icon={
          <motion.div
            variants={ambientBreathe(1.4, 1.8)}
            initial="hidden"
            animate="show"
            className="h-9 w-9 rounded-full bg-[rgba(var(--mood-rgb),0.85)] blur-soft"
          />
        }
      />
    </div>
  );
}
