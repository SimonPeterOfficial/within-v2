type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export default function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-bold md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-gray-400">{subtitle}</p>}
    </div>
  );
}
