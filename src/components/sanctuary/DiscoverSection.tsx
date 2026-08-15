"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import { slideUp, staggerContainer } from "@/lib/animations";
import { AURI_OPEN_EVENT } from "@/components/sanctuary/AuriOrb";

type World = {
  label: string;
  icon: IconName;
  href: string;
  count: number;
};

const worlds: World[] = [
  { label: "Discover", icon: "discover", href: "/discover", count: 41 },
  { label: "Stories", icon: "stories", href: "/home#memories", count: 48 },
  { label: "Films", icon: "originals", href: "/originals", count: 21 },
  { label: "Music", icon: "headphones", href: "/music", count: 32 },
  { label: "Books", icon: "book", href: "/books", count: 27 },
  { label: "Photography", icon: "camera", href: "/photography", count: 40 },
  { label: "Communities", icon: "users", href: "/communities", count: 18 },
  { label: "Creators", icon: "sparkles", href: "/creators", count: 14 }
];

const openAuri = () => window.dispatchEvent(new Event(AURI_OPEN_EVENT));

/** Discover — a map of the universe, and a guide who knows the shortcuts. */
export default function DiscoverSection() {
  return (
    <section id="discover" className="scroll-mt-24 py-24 text-white">
      <Container>
        <SectionHeader
          align="left"
          eyebrow="Discover"
          title="Where do you want to wander tonight?"
          subtitle="Eight doors, each one leading somewhere the way you feel is welcome."
        />

        <motion.div
          variants={staggerContainer(0.06, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {worlds.map((world) => (
            <motion.div key={world.label} variants={slideUp}>
              <a
                href={world.href}
                className="group flex items-center justify-between rounded-card border border-white/10 bg-white/5 px-5 py-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[rgba(var(--mood-rgb),0.4)] hover:bg-white/10 hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-[rgba(var(--mood-rgb),0.6)] focus-visible:outline-none"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-emerald-300 transition group-hover:border-[rgba(var(--mood-rgb),0.4)]">
                    <Icon name={world.icon} size={16} />
                  </span>
                  <span className="text-sm font-medium text-gray-200 transition group-hover:text-white">
                    {world.label}
                  </span>
                </span>
                <span className="text-xs text-gray-500">{world.count} worlds</span>
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Guide call-to-action — the door Auri keeps open */}
        <motion.div
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 rounded-modal border border-white/10 bg-white/[0.04] px-8 py-12 text-center backdrop-blur sm:flex-row sm:justify-between sm:text-left"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Not sure where to start?
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              Let Auri choose the corner for you
            </h3>
          </div>
          <motion.div variants={slideUp} className="shrink-0">
            <Button variant="gradient" size="lg" onClick={openAuri} className="shadow-brand-cta">
              <span className="mr-2" aria-hidden>
                ✦
              </span>
              Ask Auri
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
