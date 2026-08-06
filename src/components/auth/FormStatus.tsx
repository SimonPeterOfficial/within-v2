"use client";

import { motion } from "framer-motion";
import Icon from "@/components/ui/Icon";

type FormStatusProps = {
  variant: "error" | "success";
  children: React.ReactNode;
};

/**
 * Form-level feedback — one quiet banner for auth errors and successes.
 * Wrap in <AnimatePresence> at the call site; announces itself to screen
 * readers via the alert/status role.
 */
export default function FormStatus({ variant, children }: FormStatusProps) {
  const isError = variant === "error";
  return (
    <motion.div
      role={isError ? "alert" : "status"}
      initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-center text-sm ${
        isError
          ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      }`}
    >
      <Icon name={isError ? "alert" : "check"} size={15} />
      <span>{children}</span>
    </motion.div>
  );
}
