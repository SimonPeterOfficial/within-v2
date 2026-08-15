import { clsx } from "clsx";
import { CREATOR_BADGES, type CreatorBadgeType } from "@/lib/creators";

type CreatorBadgeProps = {
  badge: CreatorBadgeType;
  className?: string;
};

/**
 * A creator label — subtle chips that say what a creator is. Kept honest:
 * only "within-original" and "featured" claim special standing; "creator",
 * "rising" and "studio" describe what they are, never verifying anything.
 */
export default function CreatorBadge({ badge, className = "" }: CreatorBadgeProps) {
  const { label, tone } = CREATOR_BADGES[badge];
  const tones = {
    mood: "border-[rgba(var(--mood-rgb),0.45)] bg-[rgba(var(--mood-rgb),0.14)] text-white",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    warm: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    neutral: "border-white/15 bg-white/10 text-gray-200"
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur",
        tones[tone],
        className
      )}
    >
      {badge === "within-original" && <span aria-hidden>✦</span>}
      {label}
    </span>
  );
}
