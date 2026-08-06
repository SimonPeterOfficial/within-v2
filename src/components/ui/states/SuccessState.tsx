"use client";

import { motion } from "framer-motion";
import { iconPop } from "@/lib/animations";
import Icon from "@/components/ui/Icon";
import StatePanel from "@/components/ui/states/StatePanel";

type SuccessStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/** The moment it worked — a checkmark blooms in on a spring. */
export default function SuccessState({
  title,
  description,
  action,
  className = ""
}: SuccessStateProps) {
  return (
    <div role="status">
      <StatePanel
        className={className}
        icon={
          <motion.span
            variants={iconPop}
            initial="hidden"
            animate="show"
            className="flex"
          >
            <Icon name="check" size={26} className="text-emerald-400" />
          </motion.span>
        }
        title={title}
        description={description}
        action={action}
      />
    </div>
  );
}
