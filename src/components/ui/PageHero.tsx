import { typography } from "@/lib/design";
import Container from "@/components/ui/Container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Optional trailing control (right-aligned on wide screens) */
  action?: React.ReactNode;
  /** Size tier — default is the page hero; "compact" suits sub-pages */
  compact?: boolean;
};

/**
 * Page hero — the entrance to a corner of the universe. One editorial
 * headline, a line of context, and room for an action. Kept quiet on
 * purpose: the living atmosphere behind it does the cinematic work.
 */
export default function PageHero({ eyebrow, title, subtitle, action, compact = false }: PageHeroProps) {
  return (
    <Container className="pt-28 pb-10 sm:pt-32">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
        <div className="max-w-2xl">
          <p className={typography.eyebrow}>{eyebrow}</p>
          <h1 className={`mt-4 ${compact ? "font-display font-medium text-3xl tracking-[-0.02em] md:text-5xl" : typography.hero}`}>
            {title}
          </h1>
          {subtitle && <p className={`mt-4 ${typography.subtitle}`}>{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Container>
  );
}
