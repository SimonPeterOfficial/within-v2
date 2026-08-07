import { clsx } from "clsx";

type BadgeTone = "mood" | "emerald" | "neutral" | "warm";

type BadgeProps = {
  children: React.ReactNode;
  /** mood tints with the live emotion; emerald is the brand accent */
  tone?: BadgeTone;
  className?: string;
};

const tones: Record<BadgeTone, string> = {
  mood: "border-[rgba(var(--mood-rgb),0.45)] bg-[rgba(var(--mood-rgb),0.14)] text-white",
  emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warm: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  neutral: "border-white/15 bg-white/10 text-gray-200"
};

/** Small glass pill for card metadata — one badge language across the home. */
export default function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
