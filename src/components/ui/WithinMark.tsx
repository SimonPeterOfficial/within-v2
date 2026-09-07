import { clsx } from "clsx";

/**
 * The WithIn mark — one symbol, many sizes.
 *
 * THE IDEA: an aperture ring (the boundary of your inner world) holding an
 * inner light that refuses to go out. Nested containment + light + presence.
 * It must read at 16px (favicon), 24px (nav), and 512px (watermark) without
 * redrawing — so it is one geometric construction, not an illustration:
 *
 *   • an outer ring, drawn as a stroke (scales cleanly)
 *   • an opening in the ring at 45° (the aperture — the world is not closed)
 *   • an inner core with a soft bloom (the light within)
 *   • a single accent spark riding the aperture opening
 *
 * The gradient is the brand sweep (violet → emerald) used everywhere else,
 * so the mark and the interface are made of the same light.
 *
 * Variants:
 *   `mark`        — the symbol alone (nav, favicon-scale, badges)
 *   `wordmark`    — symbol + "WithIn" (headers, auth)
 *   `stacked`     — symbol above the wordmark (loaders, splash)
 *   `mono`        — single-color (print, watermarks, notification trays)
 */

type WithinMarkProps = {
  variant?: "mark" | "wordmark" | "stacked" | "mono";
  /** Pixel size of the symbol itself */
  size?: number;
  className?: string;
};

/** The brand sweep as SVG stops — same violet→emerald as --mood-rgb defaults. */
const GRADIENT_ID = "within-mark-sweep";

function MarkGlyph({ size, mono }: { size: number; mono: boolean }) {
  // Geometry is expressed in a 100-unit viewbox and scaled by size.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {!mono && (
        <defs>
          <linearGradient id={GRADIENT_ID} x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
          <radialGradient id="within-mark-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#a78bfa" stopOpacity="0.55" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}

      {/* The aperture ring — a gap at 45° upper-right: the world is open.
          Stroke-based so it stays crisp at every size. */}
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke={mono ? "currentColor" : `url(#${GRADIENT_ID})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="188 26"
        strokeDashoffset="-13"
        transform="rotate(-45 50 50)"
      />

      {/* The light within — a soft core bloom (drops to flat color in mono) */}
      {mono ? (
        <circle cx="50" cy="50" r="10" fill="currentColor" />
      ) : (
        <>
          <circle cx="50" cy="50" r="17" fill="url(#within-mark-core)" />
          <circle cx="50" cy="50" r="7.5" fill="#ffffff" opacity="0.92" />
        </>
      )}

      {/* The spark on the aperture — the presence at the opening */}
      {!mono && (
        <circle cx="74.5" cy="24.5" r="4" fill="#34d399" opacity="0.95" />
      )}
    </svg>
  );
}

export default function WithinMark({
  variant = "mark",
  size = 28,
  className = "",
}: WithinMarkProps) {
  if (variant === "mark") {
    return (
      <span className={clsx("inline-flex", className)}>
        <MarkGlyph size={size} mono={false} />
      </span>
    );
  }

  if (variant === "mono") {
    return (
      <span className={clsx("inline-flex", className)}>
        <MarkGlyph size={size} mono />
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span className={clsx("inline-flex flex-col items-center gap-3", className)}>
        <MarkGlyph size={size} mono={false} />
        <span className="text-sm font-semibold uppercase tracking-[0.5em] text-white/85">
          WithIn
        </span>
      </span>
    );
  }

  // wordmark — the default nav identity
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <MarkGlyph size={size} mono={false} />
      <span className="text-xl font-extrabold tracking-tight text-white">
        WithIn
      </span>
    </span>
  );
}
