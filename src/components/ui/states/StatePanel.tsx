import { clsx } from "clsx";

type StatePanelProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Centered suits full-page emptiness; left aligns to inline lists */
  align?: "center" | "left";
};

/**
 * The shared frame for Empty / Loading / Error / Success states.
 *
 * GEN 21 — states are no longer cards floating in space. They are open
 * invitations: no box, no border, just a soft halo of light around the
 * icon, a deliberate heading, and room to breathe. The absence of chrome
 * is the point — an empty room is still part of the universe.
 */
export default function StatePanel({
  icon,
  title,
  description,
  action,
  className = "",
  align = "center"
}: StatePanelProps) {
  if (align === "left") {
    return (
      <div className={clsx("hairline relative py-10 pl-6", className)}>
        <div className="flex items-start gap-4">
          <div className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.16),transparent_70%)]"
            />
            <span className="relative">{icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-xl font-medium leading-snug tracking-[-0.01em] text-white">
              {title}
            </h3>
            {description && (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("mx-auto w-full max-w-md px-8 py-16 text-center", className)}>
      <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center">
        {/* The halo — light where the box used to be */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(var(--mood-rgb),0.14),transparent_65%)]"
        />
        <span
          aria-hidden
          className="absolute inset-2 rounded-full border border-white/[0.05]"
        />
        <span className="relative text-ink-muted">{icon}</span>
      </div>
      <h3 className="font-display text-2xl font-medium leading-snug tracking-[-0.015em] text-white">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
