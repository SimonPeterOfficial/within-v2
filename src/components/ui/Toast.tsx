"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

export type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  /** Show a quiet, self-dismissing confirmation. */
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLE: Record<ToastTone, { icon: IconName; className: string }> = {
  success: {
    icon: "check",
    className: "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200",
  },
  error: {
    icon: "alert",
    className: "border-rose-400/25 bg-rose-400/[0.08] text-rose-200",
  },
  info: {
    icon: "sparkles",
    className: "border-white/10 bg-white/[0.06] text-gray-200",
  },
};

const TOAST_MS = 2600;
const MAX_TOASTS = 3;

/**
 * The global feedback layer — one quiet voice for the whole universe.
 *
 * Success should feel like a soft confirmation, never a celebration; errors
 * name what happened and imply the retry. Toasts never steal focus, never
 * stack into a wall, and dissolve on their own. Screen readers hear them
 * via the status/alert roles; reduced motion swaps slides for fades.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, TOAST_MS);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* The toast stage — bottom center on mobile, bottom right on desktop,
          always above content but below modals. Pointer-events only on the
          toasts themselves so the page never loses its click-through. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-24 left-1/2 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0 sm:items-end"
      >
        <AnimatePresence>
          {toasts.map((item) => {
            const tone = TONE_STYLE[item.tone];
            return (
              <motion.div
                key={item.id}
                role={item.tone === "error" ? "alert" : "status"}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: prefersReducedMotion ? 0.15 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[13px] font-medium shadow-dock backdrop-blur-xl ${tone.className}`}
              >
                <Icon name={tone.icon} size={14} className="shrink-0" />
                <span className="min-w-0">{item.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** Access the global toast function. Must be used under <ToastProvider>. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}
