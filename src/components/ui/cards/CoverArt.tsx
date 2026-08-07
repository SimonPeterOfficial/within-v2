export type CoverArtProps = {
  /** Tailwind gradient stops, e.g. "from-purple-600 to-indigo-600" */
  gradient: string;
  /** Decorative glyph for the cover art (no real image assets yet) */
  emoji?: string;
  /** Small glass chip in the top-left corner */
  tag?: string;
  /** Mood-tinted bloom that wakes on hover */
  glow?: string;
  /** Height/aspect control — default is the standard card cover */
  className?: string;
};

/**
 * The cover face of every premium card — a gradient canvas with soft lighting
 * that wakes on hover, a depth underglow, and a light sweep that glides across
 * the glass. `group-hover` drives the zoom/shimmer so it works inside any
 * card wrapper that carries the `group` class.
 */
export default function CoverArt({
  gradient,
  emoji,
  tag,
  glow = "rgba(var(--mood-rgb), 0.35)",
  className = "h-40"
}: CoverArtProps) {
  return (
    <div className={`relative overflow-hidden bg-linear-to-br ${gradient} ${className}`}>
      {/* Soft lighting — a blurred bloom wakes behind the cover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glow }}
      />
      {/* Cinematic depth underglow */}
      <span
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent"
      />
      {tag && (
        <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {tag}
        </span>
      )}
      {emoji && (
        <span
          aria-hidden
          className="absolute bottom-4 right-4 text-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-110"
        >
          {emoji}
        </span>
      )}
      {/* Glass shimmer sweep */}
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
    </div>
  );
}
