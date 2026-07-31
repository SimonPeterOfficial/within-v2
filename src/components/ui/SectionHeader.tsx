import { typography } from "@/lib/design";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export default function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={typography.eyebrow}>{eyebrow}</p>
      <h2 className={`mt-4 ${typography.sectionTitle}`}>{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-gray-400">{subtitle}</p>}
    </div>
  );
}
