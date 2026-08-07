import { typography } from "@/lib/design";
import Text from "@/components/ui/Text";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** center is the established sanctuary rhythm; left suits content sections */
  align?: "center" | "left";
  /** Optional trailing control (e.g. a "View all" link) — right-aligned */
  action?: React.ReactNode;
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  action
}: SectionHeaderProps) {
  // Centered is the original sanctuary rhythm — untouched.
  if (align === "center") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className={typography.eyebrow}>{eyebrow}</p>
        <h2 className={`mt-4 ${typography.sectionTitle}`}>{title}</h2>
        {subtitle && (
          <Text as="p" variant="subtitle" className="mt-4">
            {subtitle}
          </Text>
        )}
      </div>
    );
  }

  // Left-aligned: the text block keeps its readable measure while the action
  // rides the full section width so it lines up with the grid below.
  return (
    <div className="text-left">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl">
          <p className={typography.eyebrow}>{eyebrow}</p>
          <h2 className={`mt-4 ${typography.sectionTitle}`}>{title}</h2>
          {subtitle && (
            <Text as="p" variant="subtitle" className="mt-4">
              {subtitle}
            </Text>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
