"use client";

import { motion } from "framer-motion";
import { BookOpen, Film, Moon, Plus, Sparkles } from "lucide-react";
import Hoverable from "@/components/ui/Hoverable";
import { slideUp, staggerContainer } from "@/lib/animations";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";

const actions = [
  { id: "create", label: "Create", icon: Plus, href: "/studio" },
  { id: "continue", label: "Continue story", icon: BookOpen, href: "#memories" },
  { id: "mood", label: "Shift mood", icon: Moon, href: "#mood" },
  { id: "auri", label: "Talk to Auri", icon: Sparkles, action: "auri" },
  { id: "originals", label: "Explore originals", icon: Film, href: "#originals" }
] as const;

const openAuri = () => window.dispatchEvent(new Event(AURI_OPEN_EVENT));

const pillClasses =
  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 backdrop-blur transition-colors duration-300 hover:border-white/25 hover:text-white";

/** Quick actions — a quiet dock of shortcuts into the sanctuary. */
export default function QuickActions() {
  return (
    <section aria-label="Quick actions" className="relative z-10 mx-auto max-w-3xl px-6 py-6">
      <motion.div
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {actions.map((action) => (
          <motion.div key={action.id} variants={slideUp}>
            <Hoverable>
              {"href" in action ? (
                <a href={action.href} className={pillClasses}>
                  <action.icon className="h-4 w-4 text-emerald-300" aria-hidden />
                  {action.label}
                </a>
              ) : (
                <button type="button" onClick={openAuri} className={pillClasses}>
                  <action.icon className="h-4 w-4 text-emerald-300" aria-hidden />
                  {action.label}
                </button>
              )}
            </Hoverable>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
