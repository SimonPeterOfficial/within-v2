type GlassTone =
  | "default"
  | "soft"
  | "strong"
  | "aurora"
  | "tactile"
  | "clay"
  | "paper"
  | "cinematic"
  | "dark";

export type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  /**
   * Surface material. The dreamscape tones (aurora/tactile/clay/paper/
   * cinematic/dark) carry the tactile language of the visual engine;
   * default/soft/strong are the original quiet glass.
   */
  tone?: GlassTone;
  /** A soft diagonal light reflection across the surface — reserve for premium moments */
  sheen?: boolean;
  style?: React.CSSProperties;
};

const tones: Record<GlassTone, string> = {
  soft: "border-white/5 bg-white/[0.03] backdrop-blur-sm",
  default: "border-white/10 bg-white/5 backdrop-blur-sm",
  strong: "border-white/15 bg-white/[0.08] backdrop-blur",
  aurora: "material-aurora-glass",
  tactile: "material-tactile-glass",
  clay: "material-soft-clay",
  paper: "material-paper",
  cinematic: "material-cinematic",
  dark: "material-dark-tactile"
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
  sheen = false,
  style
}: GlassCardProps) {
  return (
    <div
      style={style}
      className={`relative rounded-card border ${tones[tone]} ${
        hoverLift
          ? "transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-card-hover active:scale-[0.99]"
          : ""
      } ${sheen ? "overflow-hidden" : ""} ${className}`}
    >
      {sheen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_32%,rgba(255,255,255,0.07)_46%,transparent_60%)]"
        />
      )}
      {children}
    </div>
  );
}
