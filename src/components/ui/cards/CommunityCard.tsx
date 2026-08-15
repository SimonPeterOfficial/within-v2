"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import GlowBorder from "@/components/ui/GlowBorder";
import TiltCard from "@/components/ui/TiltCard";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import { spring } from "@/lib/animations";

type CommunityCardProps = {
  name: string;
  tagline: string;
  members: number;
  /** Emoji avatars shown as an overlapping cluster */
  avatars: string[];
  /** Tailwind gradient stops for the avatar cluster halo */
  gradient: string;
  /** Stagger delay for the reveal */
  delay?: number;
};

/** Quiet rooms for kindred souls — join with a single breath. */
export default function CommunityCard({
  name,
  tagline,
  members,
  avatars,
  gradient,
  delay = 0
}: CommunityCardProps) {
  const [joined, setJoined] = useState(false);
  const count = members + (joined ? 1 : 0);

  return (
    <Reveal delay={delay} className="group h-full">
      <TiltCard maxTilt={5} className="h-full">
        <GlowBorder className="h-full">
          <GlassCard hoverLift className="flex h-full flex-col p-6">
            {/* Avatar cluster with a soft gradient halo */}
            <div className="flex items-center justify-between">
              <div className="flex -space-x-3">
                {avatars.map((avatar, index) => (
                  <span
                    key={index}
                    className={clsx(
                      "flex h-11 w-11 items-center justify-center rounded-full border border-black/40 text-lg shadow-soft",
                      index === 0 ? `bg-linear-to-br ${gradient}` : "bg-white/10 backdrop-blur"
                    )}
                  >
                    <span aria-hidden>{avatar}</span>
                  </span>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={joined ? "joined" : "join"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={spring}
                  className="neo-chip rounded-full px-3 py-1.5 text-[11px] text-white"
                >
                  {count.toLocaleString()} souls
                </motion.span>
              </AnimatePresence>
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">{name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{tagline}</p>

            <button
              type="button"
              onClick={() => setJoined((current) => !current)}
              aria-pressed={joined}
              className={clsx(
                "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-semibold transition duration-300",
                joined
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                  : "border-[rgba(var(--mood-rgb),0.45)] bg-[rgba(var(--mood-rgb),0.12)] text-white hover:bg-[rgba(var(--mood-rgb),0.22)]"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={joined ? "check" : "plus"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex items-center gap-2"
                >
                  {joined ? (
                    <>
                      <Icon name="check" size={15} />
                      Joined
                    </>
                  ) : (
                    <>
                      <Icon name="plus" size={15} />
                      Join
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </GlassCard>
        </GlowBorder>
      </TiltCard>
    </Reveal>
  );
}
