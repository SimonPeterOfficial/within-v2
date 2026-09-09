"use client";

import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useEnvironment } from "@/lib/environment";
import { applyMood, getMood, rgbString } from "@/lib/mood";
import { fireRipple } from "@/lib/ripple";

/**
 * Emotional entry — "How are you feeling WithIn?"
 *
 * Not a form: a field of atmospheric liquid pills. Selecting one retunes
 * the whole room's light (--mood-rgb) — an honest preference, stored and
 * restored, never a claim about understanding anyone.
 */

type PillMood = {
  id: string;
  label: string;
  icon: IconName;
  /** Tailwind-ready tint for the idle chip look */
  tint: string;
};

const PILL_MOODS: PillMood[] = [
  { id: "inspired", label: "Inspired", icon: "sparkles", tint: "#a78bfa" },
  { id: "reflective", label: "Reflective", icon: "moon", tint: "#94a3b8" },
  { id: "peaceful", label: "Peaceful", icon: "heart", tint: "#6ee7b7" },
  { id: "lost", label: "Lost", icon: "search", tint: "#8b5cf6" },
  { id: "motivated", label: "Motivated", icon: "sun", tint: "#fb923c" },
  { id: "curious", label: "Curious", icon: "eye", tint: "#22d3ee" },
  { id: "nostalgic", label: "Nostalgic", icon: "clock", tint: "#ec4899" },
  { id: "overwhelmed", label: "Overwhelmed", icon: "users", tint: "#6366f1" },
];

export default function MoodPillBar() {
  const { moodId } = useEnvironment();

  return (
    <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="crystal-elevated crystal-edge crystal-sheen depth-medium rounded-3xl p-5"
      >
        <p className="relative z-[2] mb-4 px-1 text-[13px] font-medium text-[#44435e]">
          How are you feeling WithIn?
        </p>

        <div className="relative z-[2] flex flex-wrap gap-2.5">
          {PILL_MOODS.map((mood) => {
            const active = moodId === mood.id;
            // The active chip wears the exact light the room becomes.
            const color = getMood(mood.id)?.rgb ?? [167, 139, 250];
            const hex = `#${color.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
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
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
                className={`group relative flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors duration-400 crystal-focus ${
                  active ? "text-white" : "text-[#5f5e74] hover:text-[#232136]"
                }`}
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${hex} 0%, rgba(99,80,190,0.85) 100%)`,
                        boxShadow: `0 4px 24px ${rgbString(color, 0.4)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                      }
                    : {
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.9)",
                        background: "rgba(255,255,255,0.42)",
                      }
                }
              >
                {!active && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(ellipse at 30% 50%, ${mood.tint}18, transparent 70%)` }}
                  />
                )}
                <Icon name={mood.icon} size={15} className={active ? "text-white" : ""} strokeWidth={1.8} />
                <span className="relative">{mood.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
