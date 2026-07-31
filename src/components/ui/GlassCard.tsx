type GlassTone = "default" | "soft" | "strong";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  /** Glass density — soft is quieter, strong is more opaque */
  tone?: GlassTone;
  style?: React.CSSProperties;
};

const tones: Record<GlassTone, string> = {
  soft: "border-white/5 bg-white/[0.03] backdrop-blur-md",
  default: "border-white/10 bg-white/5 backdrop-blur-xl",
  strong: "border-white/15 bg-white/[0.08] backdrop-blur-2xl"
};

/**
 * The base surface of the WithIn universe.
 * One border + blur + hover language (from the design tokens) so every card
 * feels part of the same world.
 */
export default function GlassCard({
  children,
  className = "",
  hoverLift = false,
  tone = "default",
  style
}: GlassCardProps) {
  return (
    <div
      style={style}
      className={`rounded-card border ${tones[tone]} ${
        hoverLift
          ? "transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-card-hover"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
