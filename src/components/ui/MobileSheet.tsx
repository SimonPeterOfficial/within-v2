"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Icon from "@/components/ui/Icon";

/**
 * MobileSheet — bottom sheet for mobile interactions.
 *
 * Sheets should:
 * - respect safe areas
 * - support scrolling
 * - have clear dismissal
 * - have keyboard handling
 * - have accessible focus
 * - feel physically connected to the surface that opened them
 *
 * On mobile, prefer sheets over desktop-style modals.
 * On desktop, use contextual panels instead.
 */

type MobileSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function MobileSheet({ open, onClose, title, children }: MobileSheetProps) {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-[70] cursor-default bg-[#2c2a48]/20 backdrop-blur-sm lg:hidden"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "tween",
              duration: prefersReducedMotion ? 0 : 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="crystal-foreground crystal-edge depth-high fixed inset-x-0 bottom-0 z-[75] max-h-[85vh] overflow-y-auto rounded-t-[28px] p-6 lg:hidden"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/30" />
            {/* Header */}
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-[18px] font-medium text-[#232136]">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="crystal-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/50 text-[#5f5e74] transition hover:bg-white/75 hover:text-[#232136]"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            )}
            {/* Content */}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
