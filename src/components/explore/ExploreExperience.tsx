"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useEnvironment } from "@/lib/environment";
import {
  explore,
  takeMeSomewhere,
  unexpectedDoor,
  addToJourney,
  reasonLabel,
  createExploreContext,
  type ExploreItem,
  type ExploreContext,
  type ExploreResult,
} from "@/lib/explore";
import { fireRipple } from "@/lib/ripple";
import DepthLayers from "@/components/effects/DepthLayers";
import StarField from "@/components/sanctuary/StarField";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import GradientText from "@/components/ui/GradientText";
import { blurUp, staggerContainer } from "@/lib/animations";

/* ── Discovery card ──────────────────────────────────────────────────── */

function DiscoveryCard({
  item,
  onSelect,
}: {
  item: ExploreItem;
  onSelect: (item: ExploreItem) => void;
}) {
  return (
    <motion.div variants={blurUp} className="group">
      <button
        type="button"
        onClick={(e) => { fireRipple(e); onSelect(item); }}
        className="w-full text-left"
      >
        <GlassCard tone="soft" hoverLift sheen className="p-5 transition-all duration-300">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
          />

          {item.cover && (
            <div
              className={`mb-4 flex h-20 w-full items-center justify-center rounded-xl bg-gradient-to-br ${item.cover.gradient} text-3xl`}
            >
              {item.cover.emoji}
            </div>
          )}

          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {item.type}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              item.serendipity === "relevant"
                ? "bg-emerald-500/10 text-emerald-400/70"
                : item.serendipity === "adjacent"
                ? "bg-blue-500/10 text-blue-400/70"
                : "bg-purple-500/10 text-purple-400/70"
            }`}>
              {item.serendipity === "relevant" ? "For you" : item.serendipity === "adjacent" ? "Nearby" : "Surprise"}
            </span>
          </div>

          <h3 className="font-display text-lg font-medium leading-tight tracking-[-0.01em] text-white/90 group-hover:text-white">
            {item.title}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-400/65 line-clamp-2">
            {item.description}
          </p>
          <p className="mt-3 text-[11px] font-medium text-emerald-400/50">
            {reasonLabel(item.reason)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[12px] text-gray-500 group-hover:text-gray-300 transition-colors">
            <span>Explore</span>
            <Icon name="forward" size={10} />
          </div>
        </GlassCard>
      </button>
    </motion.div>
  );
}

/* ── Take me somewhere button ────────────────────────────────────────── */

function TakeMeSomewhere({ onDiscover }: { onDiscover: (result: ExploreResult) => void }) {
  const prefersReducedMotion = useReducedMotionSafe();
  const [loading, setLoading] = useState(false);
  const [whisper, setWhisper] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(
    (e?: React.MouseEvent) => {
      if (e) fireRipple(e);
      setLoading(true);

      const delay = prefersReducedMotion ? 200 : 600;
      timerRef.current = setTimeout(() => {
        const ctx = createExploreContext();
        const result = takeMeSomewhere(ctx);
        setWhisper(result.auriSuggestion ?? null);
        onDiscover(result);
        setLoading(false);
        setTimeout(() => setWhisper(null), 3000);
      }, delay);
    },
    [onDiscover, prefersReducedMotion]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button
          onClick={handleTap}
          variant="gradient"
          size="xl"
          disabled={loading}
          className="shadow-brand-cta"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Icon name="loader" size={16} className="animate-spin" />
              Wandering…
            </span>
          ) : (
            "Take me somewhere"
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {whisper && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 text-[13px] italic text-white/50"
          >
            {whisper}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main experience ─────────────────────────────────────────────────── */

export default function ExploreExperience() {
  const { moodId } = useEnvironment();
  const [context, setContext] = useState<ExploreContext>(() =>
    createExploreContext({ mood: moodId })
  );
  const [allItems, setAllItems] = useState<ExploreItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [doorShown, setDoorShown] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // Initial exploration — run once on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    const ctx = createExploreContext({ mood: moodId });
    const result = explore(ctx);
    setContext(ctx);
    setAllItems(result.items);
    setHasMore(result.hasMore);
  }, [moodId]);

  const loadMore = useCallback(() => {
    const seen = allItems.map((item) => item.id);
    const nextCtx = { ...context, seen, depth: context.depth + 1 };
    const result = explore(nextCtx);

    if (!doorShown) {
      const door = unexpectedDoor(nextCtx);
      if (door) {
        result.items.push(...door.items);
        result.auriSuggestion = door.auriSuggestion;
        setDoorShown(true);
      }
    }

    setContext(nextCtx);
    setAllItems((prev) => [...prev, ...result.items]);
    setHasMore(result.hasMore);
  }, [context, allItems, doorShown]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return;
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, allItems.length, loadMore]);

  const handleTakeMeSomewhere = useCallback((result: ExploreResult) => {
    if (result.items.length > 0) {
      const item = result.items[0];
      addToJourney({
        id: item.id,
        title: item.title,
        type: item.type,
        destination: item.destination,
        reason: reasonLabel(item.reason),
        parentId: null,
        cover: item.cover,
      });

      setAllItems((prev) => [item, ...prev]);
      setContext((prev) => ({
        ...prev,
        seen: [...prev.seen, item.id],
        depth: prev.depth + 1,
      }));
    }
  }, []);

  const handleSelect = useCallback((item: ExploreItem) => {
    addToJourney({
      id: item.id,
      title: item.title,
      type: item.type,
      destination: item.destination,
      reason: reasonLabel(item.reason),
      parentId: null,
      cover: item.cover,
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030a] text-white">
      <DepthLayers preset="sanctuary" particles={6} stars={14} fog={0.4} />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-24">
        <motion.div
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          animate="show"
          className="mb-16 text-center"
        >
          <motion.div variants={blurUp} className="mb-8">
            <StarField count={20} seed={42} />
          </motion.div>

          <motion.p variants={blurUp} className="text-[11px] font-semibold uppercase tracking-[0.5em] text-emerald-400/45">
            WithIn
          </motion.p>
          <motion.h1 variants={blurUp} className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.02em] md:text-5xl">
            Where do you want to{" "}
            <GradientText className="italic">go</GradientText>?
          </motion.h1>
          <motion.p variants={blurUp} className="mt-4 text-[15px] leading-relaxed text-gray-400/60">
            There&apos;s no end here. Only doors.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-16 flex justify-center"
        >
          <TakeMeSomewhere onDiscover={handleTakeMeSomewhere} />
        </motion.div>

        <motion.div
          variants={staggerContainer(0.06, 0.3)}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          {allItems.map((item) => (
            <DiscoveryCard
              key={item.id}
              item={item}
              onSelect={handleSelect}
            />
          ))}
        </motion.div>

        {hasMore && (
          <div ref={loadMoreRef} className="mt-12 flex justify-center py-8">
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[13px] text-gray-500/50"
            >
              There&apos;s more…
            </motion.div>
          </div>
        )}

        {!hasMore && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 text-center">
            <p className="text-[13px] italic text-gray-500/40">
              You&apos;ve wandered far. Take a breath.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
