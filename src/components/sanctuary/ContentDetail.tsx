"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/cards/Badge";
import ContentCard from "@/components/ui/cards/ContentCard";
import MeshGradient from "@/components/effects/MeshGradient";
import StarField from "@/components/sanctuary/StarField";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { addToShelf, isOnShelf, removeFromShelf } from "@/lib/library";
import { useSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";

type ContentDetailBadge = { label: string; tone?: "mood" | "emerald" | "neutral" | "warm" };

type RelatedItem = {
  id: string;
  title: string;
  creator: string;
  description?: string;
  meta?: string;
  gradient: string;
  emoji: string;
  href: string;
};

type ContentDetailProps = {
  kind: string;
  title: string;
  creator: string;
  description: string;
  meta: string;
  gradient: string;
  emoji: string;
  badges?: ContentDetailBadge[];
  /** Related content shown at the foot of the page */
  related?: RelatedItem[];
};

/** The primary action label changes with the kind of content. */
function actionLabelFor(kind: string): string {
  const kindName = kind.toLowerCase();
  if (kindName.includes("film") || kindName.includes("series")) return "Watch";
  if (kindName.includes("book")) return "Read";
  if (kindName.includes("album")) return "Listen";
  if (kindName.includes("photo")) return "Explore";
  return "Explore";
}

/**
 * The reusable content-detail foundation — hero artwork, title, creator,
 * description, metadata, a trailer placeholder, and a related-content rail.
 * The trailer button is a UI foundation only: it routes to the sanctuary
 * story experience instead of pretending streaming exists.
 */
export default function ContentDetail({
  kind,
  title,
  creator,
  description,
  meta,
  gradient,
  emoji,
  badges,
  related = []
}: ContentDetailProps) {
  const [saved, setSaved] = useState(() => isOnShelf("saved", title.toLowerCase()));
  const prefersReducedMotion = useReducedMotionSafe();
  const { status } = useSession();
  const router = useRouter();
  const primaryAction = actionLabelFor(kind);

  const toggleSave = () => {
    const id = title.toLowerCase();
    if (isOnShelf("saved", id)) {
      removeFromShelf("saved", id);
      setSaved(false);
    } else {
      addToShelf("saved", id);
      setSaved(true);
    }
  };

  const handleTrailer = () => {
    if (status === "authenticated") router.push("/home#memories");
    else router.push("/signup");
  };

  return (
    <Container className="pb-28 pt-10">
      {/* Hero — the artwork IS the poster */}
      <div className="relative overflow-hidden rounded-modal">
        <div className={`relative h-[26rem] bg-linear-to-br ${gradient} sm:h-[30rem]`}>
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/20" />
          <MeshGradient preset="originals" />
          <StarField count={20} seed={9} />
          <span aria-hidden className="absolute bottom-8 right-8 text-7xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:text-8xl">
            {emoji}
          </span>
        </div>

        {/* Floating meta panel over the hero foot */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {badges?.map((badge) => (
              <Badge key={badge.label} tone={badge.tone ?? "neutral"}>
                {badge.label}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 font-display text-4xl font-medium leading-none tracking-[-0.02em] md:text-6xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-white/70">
            {kind} by {creator} · {meta}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="text-sm leading-relaxed text-gray-300 md:text-base">{description}</p>
          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            A {kind.toLowerCase()} within the WithIn universe. This is a mock catalogue entry —
            the full experience (trailer, episodes, reading room) arrives when the real
            catalogue connects.
          </p>

          {/* Trailer placeholder — UI foundation only, no pretend streaming */}
          <div className="mt-8 flex items-center gap-4">
            <motion.button
              type="button"
              onClick={handleTrailer}
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--mood-rgb),1)] px-7 py-3 text-sm font-bold text-black transition hover:shadow-mood-lg"
            >
              <Icon name="play" size={16} className="ml-0.5" />
              {status === "authenticated"
                ? `Continue in the sanctuary`
                : `Sign in to ${primaryAction.toLowerCase()}`}
            </motion.button>
            <Button variant="outline" size="md" onClick={toggleSave} aria-pressed={saved}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={saved ? "saved" : "save"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-2"
                >
                  <Icon name={saved ? "check" : "bookmark"} size={15} />
                  {saved ? "Saved" : "Save"}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>

          <p className="mt-6 text-xs text-gray-600">
            {status === "authenticated"
              ? saved
                ? "Kept — it's waiting in your library (in this browser for now)."
                : "Save it and it will wait in your library — nothing leaves your device yet."
              : "Sign in to keep this in your library."}
          </p>
        </div>

        {/* Metadata panel */}
        <div className="space-y-4">
          {[
            ["Type", kind],
            ["Creator", creator],
            ["Length", meta],
            ["Mood-matched", "Curated for how you feel"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-card border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">{label}</p>
              <p className="mt-1.5 text-sm text-gray-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related rail */}
      {related.length > 0 && (
        <div className="mt-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400">
            More from the studio
          </p>
          <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.02em]">Keep exploring</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <ContentCard
                key={item.id}
                title={item.title}
                creator={item.creator}
                description={item.description}
                meta={item.meta}
                href={item.href}
                cover={{ gradient: item.gradient, emoji: item.emoji }}
                delay={index * 0.08}
              />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
