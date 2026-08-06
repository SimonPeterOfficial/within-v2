import { clsx } from "clsx";

type DividerProps = {
  className?: string;
};

/**
 * A quiet moment between sections — twin gradient hairlines that fade at the
 * edges, holding a small glowing spark at center. Decorative, never announced
 * to screen readers.
 */
export default function Divider({ className = "" }: DividerProps) {
  return (
    <div
      aria-hidden
      className={clsx("flex items-center gap-5 px-10", className)}
    >
      <span className="h-px flex-1 bg-linear-to-r from-transparent via-white/15 to-white/40" />
      <span className="h-1.5 w-1.5 rounded-full bg-linear-to-br from-purple-400 to-emerald-300 shadow-[0_0_12px_rgba(var(--mood-rgb),0.6)]" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent via-white/15 to-white/40" />
    </div>
  );
}
