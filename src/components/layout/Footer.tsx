import Link from "next/link";
import Logo from "@/components/ui/Logo";

const exploreLinks = [
  { label: "Discover", href: "/discover" },
  { label: "Originals", href: "/originals" },
  { label: "Sanctuary", href: "/sanctuary" },
  { label: "Music", href: "/music" },
  { label: "Books", href: "/books" },
  { label: "Photography", href: "/photography" },
  { label: "Communities", href: "/communities" },
  { label: "Creators", href: "/creators" },
];

const universeLinks = [
  { label: "Home", href: "/home" },
  { label: "Mirror", href: "/mirror" },
  { label: "Connections", href: "/connections" },
  { label: "Atlas", href: "/atlas" },
  { label: "Weather", href: "/weather" },
  { label: "Settings", href: "/settings" },
];

/**
 * Footer — the closing line of the world.
 *
 * Only real destinations are linked. There is no newsletter form because
 * there is no letter yet: a button that claims success without delivering
 * anything is a lie, and silence is preferable to filler (Product Laws 1, 16).
 */
export default function Footer() {
  return (
    <footer className="relative overflow-hidden px-6 pb-10 pt-20 text-white">
      <div
        id="join"
        className="relative mx-auto max-w-5xl overflow-hidden rounded-card border border-white/[0.06] bg-white/[0.02] px-8 py-14 text-center backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-[rgba(var(--mood-rgb),0.06)] blur-smoke" />
        <div className="pointer-events-none absolute -bottom-32 right-1/5 h-64 w-64 rounded-full bg-emerald-600/[0.04] blur-smoke" />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[var(--elysian-ink-soft)]">
            Stay close
          </p>
          <h2 className="mx-auto mt-5 max-w-xl font-display text-3xl font-medium leading-[1.06] tracking-[-0.02em] text-[var(--elysian-ink)] md:text-4xl">
            A quiet letter, when there&apos;s something to say.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-[1.7] text-[var(--elysian-ink-faint)]">
            The letter isn&apos;t open yet. We&apos;d rather send nothing than filler —
            when the first issue exists, it will live here.
          </p>
        </div>
      </div>

      <div
        aria-hidden
        className="animate-glow pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[50rem] max-w-full -translate-x-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.03)] blur-glow"
      />

      <div className="relative mx-auto mt-20 max-w-6xl">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-[1.7] text-[var(--elysian-ink-faint)]">
              A universe where stories, emotions, and people connect.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--elysian-ink-faint)]">
              Explore
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-[var(--elysian-ink-faint)]">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors duration-300 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--elysian-ink-faint)]">
              Your universe
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-[var(--elysian-ink-faint)]">
              {universeLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors duration-300 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.05)] pt-8 text-sm text-[var(--elysian-ink-faint)]/80 sm:flex-row">
          <p>&copy; 2026 WithIn. All rights reserved.</p>
          <p className="text-[12px] text-[var(--elysian-ink-faint)]/60">
            Built quietly. Nothing here is for sale.
          </p>
        </div>
      </div>
    </footer>
  );
}
