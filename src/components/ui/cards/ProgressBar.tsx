import { clsx } from "clsx";

type ProgressBarProps = {
  /** Completion 0–1 */
  value: number;
  /** Accessible name, e.g. "Reading progress" */
  label?: string;
  className?: string;
};

/** Thin mood-tinted progress line — the quiet way to show how far you've come. */
export default function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx("h-1 overflow-hidden rounded-full bg-white/10", className)}
    >
      <div
        className="h-full rounded-full bg-linear-to-r from-purple-400 to-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
