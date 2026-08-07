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
  /** Stagger delay for the reveal */
  delay?: number;
  className?: string;
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
  delay = 0,
  className = ""
}: ContentCardProps) {
  const { className: coverClassName = "h-40", ...coverRest } = cover;
  // A card with an `action` stays a surface — its interactive control renders
  // inside, so it must never also become a link (no nested interactives).
  const isLink = Boolean(href) && !action;

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

  const body = (
    <>
      <CoverArt {...coverRest} className={coverClassName} />

      <div className="flex flex-1 flex-col p-6">
        {creator && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
            {creator}
          </p>
        )}
        <h3 className="mt-2 text-lg font-bold leading-snug text-white transition-colors duration-300 group-hover:text-emerald-100">
          {title}
        </h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">
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
      <GlassCard hoverLift className="flex h-full flex-col overflow-hidden">
        {body}
      </GlassCard>
    </GlowBorder>
  );

  return (
    <Reveal delay={delay} className={clsx("group h-full", className)}>
      <TiltCard maxTilt={6} className="h-full">
        {isLink ? (
          <Link href={href!} className="flex h-full flex-col" aria-label={title}>
            {surface}
          </Link>
        ) : (
          <div className="flex h-full flex-col">{surface}</div>
        )}
      </TiltCard>
    </Reveal>
  );
}
