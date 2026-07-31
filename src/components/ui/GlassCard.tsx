type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  style?: React.CSSProperties;
};

export default function GlassCard({
  children,
  className = "",
  hoverLift = false,
  style,
}: GlassCardProps) {
  return (
    <div
      style={style}
      className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl ${
        hoverLift
          ? "transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
