"use client";

import { clsx } from "clsx";
import Link from "next/link";
import TiltCard from "@/components/ui/TiltCard";
import GlowBorder from "@/components/ui/GlowBorder";
import GlassCard from "@/components/ui/GlassCard";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import CoverArt, { type CoverArtProps } from "@/components/ui/cards/CoverArt";

/** A single badge — label plus optional tone */
type CardBadge = { label: string; tone?: "mood" | "emerald" | "neutral" | "warm" };
import ProgressBar from "@/components/ui/cards/ProgressBar";
import Badge from "@/components/ui/cards/Badge";

type ContentCardProps = {
  title: string;
  description?: string;
  /** Small uppercase kicker above the title (creator, artist, author) */
  creator?: string;
  cover: CoverArtProps;
  badges?: CardBadge[];
  /** Completion 0–1 — renders a progress line + meta in the footer */
  progress?: number;
  /** Label for the progress bar (accessibility) */
  progressLabel?: string;
  meta?: string;
  /** Internal route/anchor — the whole card becomes a link */
  href?: string;
  /** Rendered in the footer instead of the hover arrow (e.g. a play button) */
  action?: React.ReactNode;
  /** Surface material — dreamscape tones (tactile/paper/cinematic/clay…) */
  tone?: "default" | "soft" | "strong" | "aurora" | "tactile" | "clay" | "paper" | "cinematic" | "dark";
  /** Layout variant — one card anatomy, many compositions */
  variant?: "poster" | "landscape" | "square" | "wide" | "featured" | "compact";
  /** Stagger delay for the reveal */
  delay?: number;
  className?: string;
};

/** Cover heights per layout variant (default poster = current look). */
const COVER_HEIGHTS: Record<NonNullable<ContentCardProps["variant"]>, string> = {
  poster: "h-40",
  landscape: "aspect-video h-auto",
  square: "aspect-square h-auto",
  wide: "h-full min-h-[9rem]",
  featured: "h-64",
  compact: "h-24 w-20"
};

/** Padding per variant — wide/compact arrange content beside the cover. */
const BODY_PADDING: Record<NonNullable<ContentCardProps["variant"]>, string> = {
  poster: "p-6",
  landscape: "p-6",
  square: "p-6",
  wide: "p-5",
  featured: "p-7",
  compact: "p-4"
};

/**
 * The flagship premium card of the home experience — glass surface, tilt,
 * glow border, soft lighting, cover zoom and shimmer. Supports every anatomy
 * the home needs: creator, badges, progress, meta, and an optional trailing
 * action (used by the music rail, where the whole card must stay a surface
 * and only the play button is interactive).
 */
export default function ContentCard({
  title,
  description,
  creator,
  cover,
  badges,
  progress,
  progressLabel,
  meta,
  href,
  action,
  tone = "default",
  variant = "poster",
  delay = 0,
  className = ""
}: ContentCardProps) {
  const { className: coverClassName, ...coverRest } = cover;
  // A card with an `action` stays a surface — its interactive control renders
  // inside, so it must never also become a link (no nested interactives).
  const isLink = Boolean(href) && !action;

  // Wide/compact place the cover beside the body; the rest stack vertically.
  const sideBySide = variant === "wide" || variant === "compact";
  const coverClass = coverClassName ?? COVER_HEIGHTS[variant];

  // The hover "enter" arrow appears when the whole card is a link
  const enter = isLink ? (
    <span
      aria-hidden
      className="flex items-center gap-1 text-xs font-semibold text-emerald-400 opacity-0 transition group-hover:opacity-100"
    >
      Enter
      <Icon name="forward" size={13} />
    </span>
  ) : null;

  const footer = () => {
    if (action) {
      return (
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          {meta && <p className="text-xs text-gray-500">{meta}</p>}
          <div className="shrink-0">{action}</div>
        </div>
      );
    }
    if (progress !== undefined) {
      return (
        <div className="mt-auto pt-5">
          <ProgressBar value={progress} label={progressLabel ?? `Progress for ${title}`} />
          <div className="mt-2 flex items-center justify-between gap-4">
            {meta && <p className="text-xs text-gray-500">{meta}</p>}
            {enter}
          </div>
        </div>
      );
    }
    if (meta || enter) {
      return (
        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          {meta && <p className="text-xs text-gray-500">{meta}</p>}
          {enter}
        </div>
      );
    }
    return <span aria-hidden className="mt-auto pt-5" />;
  };

  const body = sideBySide ? (
    <div className="flex flex-1">
      <div className={clsx("shrink-0", coverClass)}>
        <CoverArt {...coverRest} className="h-full w-full" />
      </div>
      <div className={`flex min-w-0 flex-1 flex-col ${BODY_PADDING[variant]}`}>
        {creator && (
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
            {creator}
          </p>
        )}
        <h3
          className={clsx(
            "font-bold leading-snug text-white transition-colors duration-300 group-hover:text-emerald-100",
            variant === "compact" ? "mt-1 truncate text-sm" : "mt-2 truncate text-base"
          )}
        >
          {title}
        </h3>
        {description && variant !== "compact" && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-400">
            {description}
          </p>
        )}
        {footer()}
      </div>
    </div>
  ) : (
    <>
      <CoverArt {...coverRest} className={coverClass} />

      <div className={`flex flex-1 flex-col ${BODY_PADDING[variant]}`}>
        {creator && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
            {creator}
          </p>
        )}
        <h3
          className={clsx(
            "font-bold leading-snug text-white transition-colors duration-300 group-hover:text-emerald-100",
            variant === "featured" ? "mt-3 text-2xl" : "mt-2 text-lg"
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={clsx(
              "mt-2 leading-relaxed text-gray-400",
              variant === "featured" ? "line-clamp-3 text-base" : "line-clamp-2 text-sm"
            )}
          >
            {description}
          </p>
        )}

        {badges && badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone ?? "neutral"}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        {footer()}
      </div>
    </>
  );

  const surface = (
    <GlowBorder className="h-full">
      <GlassCard hoverLift tone={tone} className="flex h-full flex-col overflow-hidden">
        {body}
      </GlassCard>
    </GlowBorder>
  );

  return (
    <Reveal delay={delay} className={clsx("group h-full", className)}>
      <TiltCard maxTilt={6} className="h-full">
        {isLink ? (
          <Link
            href={href!}
            aria-label={title}
            className="flex h-full flex-col rounded-[calc(1.5rem-1px)] outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--mood-rgb),0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {surface}
          </Link>
        ) : (
          <div className="flex h-full flex-col">{surface}</div>
        )}
      </TiltCard>
    </Reveal>
  );
}
