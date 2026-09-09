"use client";

/**
 * CrystalKit — the expanded Crystal World primitives.
 *
 * Every component here is behaviorally distinct (not a styled alias):
 * overlays trap focus, sheets adapt to mobile, toggles are real switches,
 * states carry honest semantics, and media frames frame media. All speak
 * the crystal material: transparency hierarchy, edge-light, sheen, depth.
 */

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Icon, { type IconName } from "@/components/ui/Icon";

/* ── CrystalIconButton — compact luminous control ───────────────────── */
export function CrystalIconButton({
  icon,
  label,
  onClick,
  href,
  size = 36,
  active = false,
  className = "",
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  href?: string;
  size?: number;
  active?: boolean;
  className?: string;
}) {
  const cls = [
    "crystal-press crystal-focus relative inline-flex items-center justify-center rounded-full",
    active ? "text-[#232136]" : "text-[#6f6e88] hover:text-[#232136]",
    className,
  ].join(" ");
  const style: CSSProperties = {
    width: size,
    height: size,
    background: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.75), var(--depth-low)",
  };
  if (href) {
    return (
      <a href={href} aria-label={label} className={cls} style={style}>
        <Icon name={icon} size={Math.round(size * 0.42)} />
      </a>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cls} style={style}>
      <Icon name={icon} size={Math.round(size * 0.42)} />
    </button>
  );
}

/* ── CrystalTextarea — reflective multi-line crystal surface ────────── */
export const CrystalTextarea = forwardRef<HTMLTextAreaElement, {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  id?: string;
  "aria-label"?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}>(function CrystalTextarea({ className = "", ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={`crystal-focus w-full resize-none rounded-2xl bg-white/[0.55] px-4 py-3 text-sm leading-relaxed text-[#232136] outline-none backdrop-blur transition placeholder:text-[#8b8aa0] ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.9), var(--depth-low)" }}
    />
  );
});

/* ── CrystalSelect — native select, crystal-clad ────────────────────── */
export function CrystalSelect({
  value,
  onChange,
  options,
  label,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`crystal-focus w-full appearance-none rounded-2xl bg-white/[0.55] px-4 py-3 text-sm text-[#232136] outline-none backdrop-blur ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7), var(--depth-low)" }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/* ── CrystalPill / CrystalBadge ─────────────────────────────────────── */
export function CrystalPill({
  children,
  active = false,
  onClick,
  className = "",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`crystal-press crystal-focus relative rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
        active ? "text-white" : "text-[#5f5e74] hover:text-[#232136]"
      } ${className}`}
      style={
        active
          ? {
              background: "linear-gradient(135deg, rgba(var(--mood-rgb),0.92), rgba(var(--mood-rgb),0.7))",
              boxShadow: "0 3px 12px rgba(var(--mood-rgb),0.28), inset 0 1px 0 rgba(255,255,255,0.35)",
            }
          : { background: "rgba(255,255,255,0.42)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7)" }
      }
    >
      {children}
    </button>
  );
}

export function CrystalBadge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "mood" | "warm" | "alert";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "text-[#5f5e74]",
    mood: "text-white",
    warm: "text-amber-700",
    alert: "text-rose-600",
  };
  const bg: Record<string, string> = {
    neutral: "rgba(255,255,255,0.55)",
    mood: "linear-gradient(135deg, rgba(var(--mood-rgb),0.92), rgba(var(--mood-rgb),0.72))",
    warm: "rgba(251,191,36,0.25)",
    alert: "rgba(244,63,94,0.14)",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${tones[tone]} ${className}`}
      style={{ background: bg[tone], boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)" }}
    >
      {children}
    </span>
  );
}

/* ── CrystalAvatar / CrystalAvatarStack ─────────────────────────────── */
export function CrystalAvatar({
  children,
  gradient = "from-violet-400 to-sky-300",
  size = 40,
  ring = true,
}: {
  children: ReactNode;
  gradient?: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br ${gradient} font-bold text-[#232136] ${
        ring ? "ring-2 ring-white/80" : ""
      }`}
      style={{ width: size, height: size, fontSize: size * 0.36, boxShadow: "var(--depth-low)" }}
    >
      {children}
    </span>
  );
}

export function CrystalAvatarStack({ items, max = 4 }: { items: ReactNode[]; max?: number }) {
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <span className="flex items-center">
      {shown.map((item, i) => (
        <span key={i} style={{ marginLeft: i === 0 ? 0 : -10 }}>
          {item}
        </span>
      ))}
      {rest > 0 && (
        <CrystalAvatar size={32}>
          <span className="text-[10px]">+{rest}</span>
        </CrystalAvatar>
      )}
    </span>
  );
}

/* ── CrystalProgress — a light-filled channel ───────────────────────── */
export function CrystalProgress({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className="h-2 w-full overflow-hidden rounded-full bg-white/55"
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.8), inset 0 1px 2px rgba(40,38,70,0.08)" }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${clamped}%`,
          background: "linear-gradient(90deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.7))",
          boxShadow: "0 0 8px rgba(var(--mood-rgb),0.35)",
        }}
      />
    </div>
  );
}

/* ── CrystalToggle — a real switch ──────────────────────────────────── */
export function CrystalToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="crystal-focus relative h-7 w-12 rounded-full transition-colors duration-300"
      style={{
        background: checked
          ? "linear-gradient(135deg, rgba(var(--mood-rgb),0.95), rgba(var(--mood-rgb),0.72))"
          : "rgba(255,255,255,0.55)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.8), var(--depth-low)",
      }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white"
        style={{ left: checked ? 26 : 3, boxShadow: "0 1px 4px rgba(40,38,70,0.25)" }}
      />
    </button>
  );
}

/* ── CrystalSkeleton — liquid loading placeholder ───────────────────── */
export function CrystalSkeleton({ className = "" }: { className?: string }) {
  return <div className={`liquid-shimmer rounded-2xl bg-white/55 ${className}`} />;
}

/* ── CrystalEmptyState — designed, honest emptiness ─────────────────── */
export function CrystalEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="crystal-soft crystal-edge depth-low flex flex-col items-center rounded-3xl px-8 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#7c6ce0] ring-1 ring-white/80">
        <Icon name={icon} size={20} />
      </span>
      <p className="mt-4 font-display text-lg font-medium text-[#232136]">{title}</p>
      <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-[#5f5e74]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── CrystalErrorState — calm, actionable failure ───────────────────── */
export function CrystalErrorState({
  title = "Something interrupted the light.",
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="crystal-soft crystal-edge depth-low flex flex-col items-center rounded-3xl px-8 py-10 text-center"
      style={{ boxShadow: "inset 0 0 0 1px rgba(244,63,94,0.15), var(--depth-low)" }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-500 ring-1 ring-white/80">
        <Icon name="alert" size={20} />
      </span>
      <p className="mt-4 font-display text-lg font-medium text-[#232136]">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#5f5e74]">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="crystal-press crystal-focus mt-5 rounded-full bg-white/70 px-5 py-2 text-[13px] font-semibold text-[#232136] ring-1 ring-white/85"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/* ── CrystalModal — desktop dialog with focus trap ──────────────────── */
export function CrystalModal({
  open,
  onClose,
  label,
  children,
  maxWidth = 480,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  maxWidth?: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Escape closes; Tab is trapped inside the panel; scroll locks.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label={`Close ${label}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-default bg-[#232136]/30 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="crystal-foreground crystal-edge depth-high relative w-full overflow-hidden rounded-modal outline-none"
            style={{ maxWidth }}
          >
            <p id={titleId} className="sr-only">
              {label}
            </p>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── CrystalSheet — bottom sheet on mobile, modal on desktop ────────── */
export function CrystalSheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label={`Close ${label}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-default bg-[#232136]/30 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="crystal-foreground crystal-edge depth-high relative w-full overflow-hidden rounded-t-modal sm:rounded-modal"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* The grab handle — a slim crystal ridge */}
            <div className="flex justify-center pt-3 sm:hidden">
              <span aria-hidden className="h-1.5 w-12 rounded-full bg-[#232136]/15" />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── CrystalSection — editorial section rhythm ──────────────────────── */
export function CrystalSection({
  eyebrow,
  title,
  line,
  action,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  line?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="relative z-10 scroll-mt-24 py-8 text-[#232136]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8b8aa0]">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1.5 font-display text-2xl font-medium tracking-[-0.015em] text-[#232136]">
            {title}
          </h2>
          {line && <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-[#5f5e74]">{line}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ── CrystalMediaFrame — media presented as a crystal window ────────── */
export function CrystalMediaFrame({
  children,
  ratio = "16 / 10",
  className = "",
  overlay,
}: {
  children: ReactNode;
  ratio?: string;
  className?: string;
  overlay?: ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl ${className}`}
      style={{ aspectRatio: ratio, boxShadow: "var(--depth-medium), inset 0 0 0 1px rgba(255,255,255,0.5)" }}
    >
      {children}
      {/* Edge light across the top — light bending over the frame */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
      />
      {overlay}
    </div>
  );
}

/* Re-export motion helpers used across crystal surfaces */
export { AnimatePresence, motion };
