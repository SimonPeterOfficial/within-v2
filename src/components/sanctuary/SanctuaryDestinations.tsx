"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { blurUp, staggerContainer } from "@/lib/animations";

type Destination = {
  number: string;
  title: string;
  line: string;
  icon: IconName;
  /**
   * Open rooms navigate for real — every href verified against an existing
   * route or functioning feature (docs/vision/sanctuary-implementation-plan.md
   * §2.6). Rooms still being written have no href: they are named, never faked.
   */
  href?: string;
  /** Per-room light, drawn from the founder palette (sanctuary-spec.md §2). */
  wash: string;
  /** The last room breathes wider on desktop — the day's gentle close. */
  wide?: boolean;
};

const WASH_TOP_LEFT = (rgbVar: string, alpha: string) =>
  `radial-gradient(ellipse 130% 100% at 22% 0%, rgba(var(${rgbVar}),${alpha}) 0%, transparent 62%)`;
const WASH_TOP_RIGHT = (rgbVar: string, alpha: string) =>
  `radial-gradient(ellipse 130% 100% at 78% 0%, rgba(var(${rgbVar}),${alpha}) 0%, transparent 62%)`;
const WASH_BOTTOM = (rgbVar: string, alpha: string) =>
  `radial-gradient(ellipse 130% 110% at 50% 108%, rgba(var(${rgbVar}),${alpha}) 0%, transparent 60%)`;

/** The founder's exact sequence and copy — docs/vision/sanctuary-spec.md §3.E. */
const DESTINATIONS: Destination[] = [
  {
    number: "01",
    title: "Reflection",
    line: "Pause. Think. Gain clarity.",
    icon: "sun",
    href: "/mirror",
    wash: WASH_TOP_LEFT("--within-violet-rgb", "0.16"),
  },
  {
    number: "02",
    title: "Journal",
    line: "Write your story, one thought at a time.",
    icon: "book",
    href: "/mirror",
    wash: WASH_TOP_RIGHT("--within-gold-rgb", "0.12"),
  },
  {
    number: "03",
    title: "Emotional Space",
    line: "Feel. Express. Understand.",
    icon: "heart",
    wash: WASH_BOTTOM("--within-violet-rgb", "0.12"),
  },
  {
    number: "04",
    title: "Meditation",
    line: "Find peace in the present moment.",
    icon: "moon",
    wash: WASH_BOTTOM("--within-lavender-rgb", "0.14"),
  },
  {
    number: "05",
    title: "Personal Growth",
    line: "Dream. Plan. Evolve.",
    icon: "star",
    href: "/journey",
    wash: WASH_TOP_LEFT("--within-sage-rgb", "0.16"),
  },
  {
    number: "06",
    title: "Memories",
    line: "Keep what matters.",
    icon: "camera",
    href: "/profile",
    wash: WASH_BOTTOM("--within-gold-rgb", "0.14"),
  },
  {
    number: "07",
    title: "Daily Check-in",
    line: "Reconnect with yourself.",
    icon: "sparkles",
    wide: true,
    wash: "linear-gradient(100deg, rgba(var(--within-violet-rgb),0.12) 0%, rgba(var(--within-gold-rgb),0.1) 100%)",
  },
];

function DestinationCard({ destination: d }: { destination: Destination }) {
  const open = Boolean(d.href);

  const body = (
    <>
      {/* The room's light */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: d.wash }}
      />
      {/* A gold crest of light along the pane's top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-7 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--within-gold-rgb),0.3),transparent)]"
      />

      <span
        aria-hidden
        className="absolute right-5 top-4 text-[11px] font-semibold tracking-[0.3em] text-ui-faint"
      >
        {d.number}
      </span>

      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-ui-raised ring-1 ring-ui-line">
        <Icon
          name={d.icon}
          size={17}
          strokeWidth={1.6}
          className="text-[rgba(var(--within-gold-rgb),0.9)]"
        />
      </span>

      <h3 className="relative mt-5 font-display text-[19px] leading-snug text-ui-ink sm:text-[21px]">
        {d.title}
      </h3>
      <p className="relative mt-1.5 max-w-[36ch] text-[13px] leading-relaxed text-ui-soft sm:text-[13.5px]">
        {d.line}
      </p>

      <div className="relative mt-auto flex items-center justify-between pt-5">
        {open ? (
          <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full border border-ui-line text-[rgba(var(--within-gold-rgb),0.85)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
            <Icon name="chevronRight" size={13} />
          </span>
        ) : (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-ui-faint">
            Quiet for now
          </span>
        )}
      </div>
    </>
  );

  if (!open) {
    // A named, unlit door — truthful about what is not yet built.
    return (
      <div className="relative flex min-h-[215px] flex-col overflow-hidden rounded-[26px] border border-ui-line bg-ui-surface p-6 backdrop-blur-md opacity-90 sm:min-h-[240px]">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={d.href as string}
      className="group relative flex min-h-[215px] flex-col overflow-hidden rounded-[26px] border border-ui-line bg-ui-surface p-6 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:border-[rgba(var(--within-gold-rgb),0.35)] hover:bg-ui-raised hover:shadow-[0_20px_50px_-20px_rgba(112,72,190,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--within-gold-rgb),0.55)] sm:min-h-[240px]"
    >
      {body}
    </Link>
  );
}

/**
 * The seven doors of Sanctuary — the founder's exact order preserved.
 *
 * Open rooms carry honest destinations; the rooms still being written
 * (Emotional Space, Meditation, Daily Check-in) hold their place with the
 * words "Quiet for now" instead of pretending (Law 16 — no fake success).
 * Their experiences arrive in Phase B/C per the implementation plan.
 */
export default function SanctuaryDestinations() {
  const prefersReducedMotion = useReducedMotionSafe();

  return (
    <section id="rooms" aria-label="The rooms of Sanctuary" className="scroll-mt-20 pb-24 pt-4">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6">
        <motion.div
          variants={staggerContainer(0.07, 0.05)}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.p
            variants={prefersReducedMotion ? undefined : blurUp}
            className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[rgba(var(--within-gold-rgb),0.7)]"
          >
            The rooms
          </motion.p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {DESTINATIONS.map((destination) => (
              <motion.div
                key={destination.number}
                variants={prefersReducedMotion ? undefined : blurUp}
                className={destination.wide ? "xl:col-span-2" : undefined}
              >
                <DestinationCard destination={destination} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="mt-12 text-center text-xs leading-relaxed text-ui-faint">
          Everything here stays yours — private to your account.
        </p>
      </div>
    </section>
  );
}
