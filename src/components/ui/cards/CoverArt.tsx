import Image from "next/image";
import React from "react";

export type CoverArtProps = {
  /** Tailwind gradient stops, e.g. "from-purple-600 to-indigo-600" */
  gradient: string;
  /** Optional source image URL (cover art, photography, book cover…) */
  src?: string;
  /** Alt text for the image — required for accessibility when src is present */
  alt?: string;
  /** Decorative glyph for the cover art (used when no image is available) */
  emoji: string;
  /** Small glass chip in the top-left corner */
  tag?: string;
  /** Mood-tinted bloom that wakes on hover */
  glow?: string;
  /** Height/aspect control — default is the standard card cover */
  className?: string;
};

/**
 * The cover face of every premium card.
 *
 * When a real `src` is available it renders an optimised Next.js image with
 * a graceful fallback to the brand gradient + emoji when the image is
 * missing, fails to load, or is not provided. There is never a layout shift:
 * the cover keeps its fixed height whether it shows an image or a gradient.
 *
 * `group-hover` drives the zoom/shimmer so it works inside any card wrapper
 * that carries the `group` class.
 */
export default function CoverArt({
  gradient,
  src,
  alt,
  emoji = "✦",
  tag,
  glow = "rgba(var(--mood-rgb), 0.35)",
  className = "h-40",
}: CoverArtProps) {
  return (
    <div
      className={`relative overflow-hidden bg-linear-to-br ${gradient} ${className}`}
    >
      {src ? (
        <ImageWithFallback
          src={src}
          alt={alt ?? "Cover art"}
          className="h-full w-full object-cover object-center"
          gradient={gradient}
        />
      ) : (
        <GradientCover
          gradient={gradient}
          emoji={emoji}
          glow={glow}
          className="h-full w-full"
        />
      )}

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
      {/* Glass shimmer sweep */}
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
    </div>
  );
}

/**
 * Renders a real image with an error fallback to the gradient cover.
 * Uses a wrapper so the fallback renders in the same space — no layout shift.
 */
function ImageWithFallback({
  src,
  alt,
  className,
  gradient,
}: {
  src: string;
  alt: string;
  className: string;
  gradient: string;
}) {
  const [error, setError] = React.useState(false);

  if (error) {
    return <GradientCover gradient={gradient} className={className} />;
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className={className}
        onError={() => setError(true)}
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
    </div>
  );
}

/**
 * Gradient + emoji fallback cover. Matches the exact footprint of the image
 * variant so swapping between them never shifts layout.
 */
function GradientCover({
  gradient,
  emoji,
  glow = "rgba(var(--mood-rgb), 0.35)",
  className = "h-40",
}: {
  gradient: string;
  emoji?: string;
  glow?: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-linear-to-br ${gradient} ${className}`}>
      {/* Soft lighting — a blurred bloom wakes behind the cover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glow }}
      />
      {/* Decorative emoji glyph */}
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
