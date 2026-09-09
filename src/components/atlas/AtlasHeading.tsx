import Icon, { type IconName } from "@/components/ui/Icon";

/**
 * AtlasHeading — the shared header atom of the observatory.
 * An icon chip, a title, and one quiet line. Every instrument uses it so
 * the whole wing reads as one instrument family.
 */
export default function AtlasHeading({
  icon,
  title,
  line,
}: {
  icon: IconName;
  title: string;
  line?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[rgba(var(--mood-rgb),0.9)]">
          <Icon name={icon} size={16} strokeWidth={1.8} />
        </span>
        <h3 className="font-display text-lg font-medium tracking-[-0.01em] text-white">
          {title}
        </h3>
      </div>
      {line && <p className="mt-2 text-[13px] leading-relaxed text-gray-500/85">{line}</p>}
    </div>
  );
}
