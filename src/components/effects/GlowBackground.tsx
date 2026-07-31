type GlowBackgroundProps = {
  variant?: "hero" | "ambient";
};

export default function GlowBackground({ variant = "hero" }: GlowBackgroundProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-glow absolute -top-24 left-[15%] h-96 w-96 rounded-full bg-purple-700/30 blur-3xl" />
      <div
        className="animate-glow absolute right-[5%] top-1/3 h-80 w-80 rounded-full bg-pink-600/25 blur-3xl"
        style={{ animationDelay: "2.5s" }}
      />
      <div
        className="animate-glow absolute bottom-0 left-[10%] h-72 w-72 rounded-full bg-emerald-600/20 blur-3xl"
        style={{ animationDelay: "5s" }}
      />

      {/* Emerald horizon glow for depth */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-emerald-500/10 to-transparent" />

      {variant === "hero" && <div className="vignette absolute inset-0" />}
    </div>
  );
}
