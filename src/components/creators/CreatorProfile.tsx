"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import GlassCard from "@/components/ui/GlassCard";
import CreatorBadge from "@/components/ui/cards/CreatorBadge";
import ContentCard from "@/components/ui/cards/ContentCard";
import { useSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { formatFollowers } from "@/lib/format";
import type { Creator } from "@/lib/creators";
import CreatorConstellation from "@/components/people/CreatorConstellation";

type CreatorProfileProps = {
  creator: Creator;
};

/** Where each kind of work leads in the universe — kept simple and honest. */
const WORK_HREF: Record<string, string> = {
  Film: "/originals",
  Series: "/originals",
  Book: "/books",
  Album: "/music",
  Photography: "/photography"
};

/** Mock featured-work resolution — maps creator id to a content entry when known. */
const FEATURED_FALLBACK = {
  gradient: "from-purple-600 to-indigo-600",
  emoji: "✦",
  meta: "Featured work"
};

/**
 * Creator profile — the visual foundation of the creator ecosystem.
 * Avatar, bio, badges, categories, followers, featured work, works, and a
 * support CTA that stays honest: no payments exist, so the button routes to
 * the sanctuary instead of pretending to charge money.
 */
export default function CreatorProfile({ creator }: CreatorProfileProps) {
  const [following, setFollowing] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  const handleSupport = () => {
    router.push(status === "authenticated" ? "/home" : "/signup");
  };

  return (
    <Container className="pb-28 pt-10">
      {/* Profile head */}
      <div className="relative overflow-hidden rounded-modal border border-white/10 bg-white/[0.04] backdrop-blur">
        <div aria-hidden className={`h-36 bg-linear-to-br ${creator.gradient} opacity-60`} />
        <div className="relative px-6 pb-8 sm:px-10">
          <div className="-mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              <span
                aria-hidden
                className={`flex h-24 w-24 items-center justify-center rounded-full border-4 border-black/60 bg-linear-to-br ${creator.gradient} text-4xl shadow-orb`}
              >
                {creator.avatar}
              </span>
              <div className="pb-1">
                <h1 className="font-display text-3xl font-medium tracking-[-0.02em] md:text-4xl">
                  {creator.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {creator.handle} · {creator.studio ? "Studio" : "Creator"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pb-1">
              <Button
                variant={following ? "outline" : "primary"}
                size="md"
                onClick={() => setFollowing((current) => !current)}
                aria-pressed={following}
              >
                <Icon name={following ? "check" : "plus"} size={15} className="mr-1.5" />
                {following ? "Following" : "Follow"}
              </Button>
              <Button variant="ghost" size="md" onClick={handleSupport}>
                Support
              </Button>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-300">{creator.bio}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {creator.badges.map((badge) => (
              <CreatorBadge key={badge} badge={badge} />
            ))}
            <span className="ml-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Icon name="users" size={13} />
              {formatFollowers(creator.followers)} followers
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {creator.categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Long-form story */}
      {creator.story && (
        <div className="mx-auto mt-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            Their story
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-300">{creator.story}</p>
        </div>
      )}

      {/* Works — the shelf of what they make */}
      <div className="mt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
          Works
        </p>
        <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">
          Made by {creator.studio ? creator.name : creator.name.split(" ")[0]}
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creator.works.map((work, index) => {
            const href = WORK_HREF[work.kind] ?? "/originals";
            const featured = work.id === creator.featuredWorkId;
            return (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="h-full"
              >
                <ContentCard
                  title={work.title}
                  creator={work.kind}
                  meta={featured ? `${work.kind} · Featured` : work.kind}
                  href={href}
                  tone="tactile"
                  cover={{
                    gradient: featured ? FEATURED_FALLBACK.gradient : creator.gradient,
                    emoji: featured ? FEATURED_FALLBACK.emoji : creator.avatar
                  }}
                  badges={
                    featured
                      ? [{ label: "Featured work", tone: "mood" as const }]
                      : undefined
                  }
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Gen 13 — the constellation around this creator */}
      <CreatorConstellation creatorId={creator.id} creatorName={creator.name} />

      {/* Support panel — honest about what exists */}
      <GlassCard tone="clay" className="mt-16 px-8 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
          Support {creator.studio ? creator.name : creator.name.split(" ")[0]}
        </p>
        <h3 className="mx-auto mt-3 max-w-xl font-display text-2xl font-medium tracking-[-0.02em]">
          Their next thing is worth waiting for
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-400">
          Payments and memberships arrive with the creator ecosystem. For now, the truest
          support is following their work and letting it find you.
        </p>
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={handleSupport}>
            Follow their work
          </Button>
        </div>
      </GlassCard>
    </Container>
  );
}
