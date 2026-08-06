import { clsx } from "clsx";
import GlassCard from "@/components/ui/GlassCard";

type StatePanelProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * The shared frame for Empty / Loading / Error / Success states — one quiet
 * glass panel with an icon well, a title, optional description and action.
 * The tone/colors of the icon and copy are chosen by each concrete state.
 */
export default function StatePanel({
  icon,
  title,
  description,
  action,
  className = ""
}: StatePanelProps) {
  return (
    <GlassCard tone="soft" className={clsx("mx-auto w-full max-w-sm px-8 py-12 text-center", className)}>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </GlassCard>
  );
}
