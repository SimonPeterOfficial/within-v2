type GlowBackgroundProps = {
  variant?: "hero" | "ambient";
  className?: string;
};

export default function GlowBackground({
  variant = "hero",
  className = ""
}: GlowBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Restrained mood glow — deep and quiet */}
      <div className="animate-glow absolute -top-28 left-[12%] h-80 w-80 rounded-full bg-[rgba(var(--mood-rgb),0.08)] blur-3xl" />
      <div
        className="animate-glow absolute right-[8%] top-1/3 h-64 w-64 rounded-full bg-pink-600/[0.06] blur-3xl"
        style={{ animationDelay: "2.5s" }}
      />
      <div
        className="animate-glow absolute bottom-[5%] left-[8%] h-60 w-60 rounded-full bg-emerald-600/[0.05] blur-3xl"
        style={{ animationDelay: "5s" }}
      />

      {/* Warm horizon glow — a thin band of light at the bottom for depth */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-[rgba(var(--mood-rgb),0.04)] via-[rgba(var(--mood-rgb),0.01)] to-transparent" />

      {variant === "hero" && <div className="vignette absolute inset-0" />}
    </div>
  );
}
