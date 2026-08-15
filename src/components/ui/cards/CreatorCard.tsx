"use client";

import { clsx } from "clsx";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import GlowBorder from "@/components/ui/GlowBorder";
import TiltCard from "@/components/ui/TiltCard";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import CreatorBadge from "@/components/ui/cards/CreatorBadge";
import { formatFollowers } from "@/lib/format";
import type { Creator, CreatorBadgeType } from "@/lib/creators";

type CreatorCardProps = {
  creator: Creator;
  /** Stagger delay for the reveal */
  delay?: number;
};

/** The face of the creator ecosystem — who they are, what they make, follow. */
export default function CreatorCard({ creator, delay = 0 }: CreatorCardProps) {
  const firstBadges = creator.badges.slice(0, 3) as CreatorBadgeType[];
  return (
    <Reveal delay={delay} className="group h-full">
      <TiltCard maxTilt={5} className="h-full">
        <GlowBorder className="h-full">
          <GlassCard hoverLift className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Avatar with gradient halo */}
              <Link
                href={`/creators/${creator.id}`}
                className="relative block shrink-0"
                aria-label={`${creator.name} profile`}
              >
                <span
                  aria-hidden
                  className={`absolute -inset-1.5 rounded-full bg-linear-to-br ${creator.gradient} opacity-40 blur-md transition-opacity duration-500 group-hover:opacity-70`}
                />
                <span
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br ${creator.gradient} text-2xl shadow-soft`}
                >
                  <span aria-hidden>{creator.avatar}</span>
                </span>
              </Link>
              <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                <Icon name="users" size={13} />
                {formatFollowers(creator.followers)}
              </span>
            </div>

            <Link href={`/creators/${creator.id}`} className="mt-5 block">
              <h3 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-emerald-100">
                {creator.name}
              </h3>
              <p className="text-xs text-gray-500">{creator.handle}</p>
            </Link>

            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-400">{creator.bio}</p>

            {firstBadges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {firstBadges.map((badge) => (
                  <CreatorBadge key={badge} badge={badge} />
                ))}
              </div>
            )}

            <div className="mt-auto pt-5">
              <Link
                href={`/creators/${creator.id}`}
                className={clsx(
                  "inline-flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-semibold transition duration-300",
                  "border-[rgba(var(--mood-rgb),0.45)] bg-[rgba(var(--mood-rgb),0.12)] text-white hover:bg-[rgba(var(--mood-rgb),0.22)]"
                )}
              >
                Visit profile
                <Icon name="forward" size={14} />
              </Link>
            </div>
          </GlassCard>
        </GlowBorder>
      </TiltCard>
    </Reveal>
  );
}
