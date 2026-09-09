"use client";

import { motion } from "framer-motion";
import { BookOpen, Film, Moon, Plus, Sparkles } from "lucide-react";
import Hoverable from "@/components/ui/Hoverable";
import { slideUp, staggerContainer } from "@/lib/animations";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";

const actions = [
  { id: "create", label: "Create", icon: Plus, href: "/studio" },
  { id: "continue", label: "Continue story", icon: BookOpen, href: "#memories" },
  { id: "auri", label: "Talk to Auri", icon: Sparkles, action: "auri" },
  { id: "mood", label: "Shift mood", icon: Moon, href: "#mood" },
  { id: "originals", label: "Explore originals", icon: Film, href: "#originals" }
] as const;

const openAuri = () => window.dispatchEvent(new Event(AURI_OPEN_EVENT));

const quietPill =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium text-gray-400/80 transition-colors duration-300 hover:text-white";

/** The luminous center node — the door into Auri, felt before it is read. */
const auriNode =
  "relative inline-flex items-center gap-2 rounded-full border border-[rgba(var(--mood-rgb),0.18)] bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-white/90 transition-all duration-300 hover:border-[rgba(var(--mood-rgb),0.4)] hover:bg-white/[0.04]";

/**
 * Quick actions — a quiet dock of shortcuts into the sanctuary.
 *
 * GEN 21: no more pill boxes. Five small doors in a row — the outer four
 * are quiet text lanes, and the center (Auri) is a luminous node on the
 * spine, so the way into the intelligence is felt before it is read.
 */
export default function QuickActions() {
  return (
    <section aria-label="Quick actions" className="relative z-10 mx-auto max-w-3xl px-6 py-8">
      <motion.div
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-x-1 gap-y-3"
      >
        {actions.map((action) => {
          const isAuri = action.id === "auri";
          const inner = (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(var(--mood-rgb),0.16),transparent_65%)]"
              />
              <action.icon
                className={`relative h-4 w-4 aria-hidden ${isAuri ? "text-[rgba(var(--mood-rgb),0.9)]" : "text-emerald-300/70"}`}
                aria-hidden
              />
              <span className="relative">{action.label}</span>
            </>
          );

          return (
            <motion.div key={action.id} variants={slideUp}>
              <Hoverable>
                {"href" in action ? (
                  <a href={action.href} className={isAuri ? auriNode : quietPill}>
                    {inner}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={openAuri}
                    aria-label={`${action.label} — Auri`}
                    className={isAuri ? auriNode : quietPill}
                  >
                    {inner}
                  </button>
                )}
              </Hoverable>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}