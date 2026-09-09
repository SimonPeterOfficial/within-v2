"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useEnvironment } from "@/lib/environment";
import { applyMood, getMood, moods, rgbString } from "@/lib/mood";
import { fireRipple } from "@/lib/ripple";

/**
 * MoodOrbs — "Your Mood Today", the reference's circular mood field.
 *
 * Each mood is an orb of light; selecting one retunes the world's
 * --mood-rgb everywhere. Five primary orbs + a "More" orb that expands
 * to the full set. The user chooses — never a claim about knowing them.
 */

const PRIMARY = ["calm", "curious", "creative", "focused"];

/** Orb glyph per mood id — emoji where the mood lib has one, icon otherwise. */
const ORB_GLYPH: Record<string, { emoji?: string; icon?: IconName }> = {
  calm: { emoji: "🌙" },
  curious: { icon: "discover" },
  creative: { icon: "sparkles" },
  focused: { icon: "sun" },
};

export default function MoodOrbs() {
  const { moodId } = useEnvironment();
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? moods : moods.filter((m) => PRIMARY.includes(m.id)).slice(0, 4);

  return (
    <aside
      aria-label="Your mood today"
      className="crystal-elevated crystal-edge depth-medium crystal-sheen relative overflow-hidden rounded-[26px] p-5"
    >
      <div className="relative">
        <p className="font-display text-[16px] font-medium text-[#2c2a48]">Your Mood Today</p>
        <p className="mt-0.5 text-[12px] text-[#6f6e88]">How are you feeling WithIn?</p>

        <div className={`mt-4 flex flex-wrap gap-3 ${expanded ? "max-h-[180px] overflow-y-auto pr-1" : ""}`}>
          {visible.map((mood) => {
            const active = moodId === mood.id;
            const glyph = ORB_GLYPH[mood.id];
            return (
              <motion.button
                key={mood.id}
                type="button"
                onClick={(e) => {
                  applyMood(active ? null : mood.id);
                  fireRipple(e);
                }}
                aria-pressed={active}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
                className="crystal-focus flex w-[54px] flex-col items-center gap-1.5"
                aria-label={`${mood.label}${active ? " — active" : ""}`}
              >
                <span
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-lg transition-all duration-300"
                  style={
                    active
                      ? {
                          background: `linear-gradient(135deg, ${rgbString(mood.rgb, 0.95)}, ${rgbString(mood.rgb, 0.6)})`,
                          boxShadow: `0 4px 18px ${rgbString(mood.rgb, 0.5)}, inset 0 1px 0 rgba(255,255,255,0.5)`,
                          color: "#fff",
                        }
                      : {
                          background: "rgba(255,255,255,0.5)",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.8), 0 2px 8px rgba(90,100,180,0.12)",
                          color: "#5f5e74",
                        }
                  }
                >
                  {glyph?.emoji ?? (glyph?.icon ? <Icon name={glyph.icon} size={20} /> : <span>{mood.emoji}</span>)}
                </span>
                <span
                  className={`text-[10.5px] font-semibold ${active ? "text-[#2c2a48]" : "text-[#6f6e88]"}`}
                >
                  {mood.label}
                </span>
              </motion.button>
            );
          })}

          {/* More / less — reveals the full mood field */}
          <motion.button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="crystal-focus flex w-[54px] flex-col items-center gap-1.5"
          >
            <span
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-[#5f5e74]"
              style={{
                background: "rgba(255,255,255,0.5)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.8), 0 2px 8px rgba(90,100,180,0.12)",
              }}
            >
              <Icon name={expanded ? "close" : "plus"} size={18} />
            </span>
            <span className="text-[10.5px] font-semibold text-[#6f6e88]">
              {expanded ? "Less" : "More"}
            </span>
          </motion.button>
        </div>

        {/* The honest note */}
        <p className="mt-3 text-[9.5px] text-[#8b8aa0]">
          Your choice retunes the room&apos;s light.{" "}
          <Link href="/mirror" className="underline-offset-2 hover:underline">
            Mood history lives in the Mirror
          </Link>
          .
        </p>
      </div>
    </aside>
  );
}
