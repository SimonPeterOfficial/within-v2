"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

const exploreLinks = [
  { label: "Discover", href: "/discover" },
  { label: "Originals", href: "/originals" },
  { label: "Sanctuary", href: "/home" },
  { label: "Music", href: "/music" },
  { label: "Books", href: "/books" },
  { label: "Photography", href: "/photography" },
  { label: "Communities", href: "/communities" },
  { label: "Creators", href: "/creators" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Press", href: "#" },
  { label: "Contact", href: "#" },
];

const socialLinks = ["Instagram", "X", "TikTok", "YouTube"];

/**
 * Footer — premium closing.
 *
 * The newsletter CTA should feel editorial, not generic SaaS.
 * The footer body should be minimal and confident.
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="relative overflow-hidden px-6 pb-10 pt-20 text-white">
      {/* Newsletter CTA — editorial, premium */}
      <div
        id="join"
        className="relative mx-auto max-w-5xl scroll-mt-24 overflow-hidden rounded-card border border-white/[0.06] bg-white/[0.02] px-8 py-14 text-center backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-[rgba(var(--mood-rgb),0.06)] blur-smoke" />
        <div className="pointer-events-none absolute -bottom-32 right-1/5 h-64 w-64 rounded-full bg-emerald-600/[0.04] blur-smoke" />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-400/45">
            Stay close
          </p>
          <h2 className="mx-auto mt-5 max-w-xl font-display text-3xl font-medium leading-[1.06] tracking-[-0.02em] md:text-4xl">
            A quiet letter, once a week.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-[1.7] text-gray-400/60">
            Stories, originals, and community moments — delivered gently, never often enough to feel loud.
          </p>

          {subscribed ? (
            <p className="mx-auto mt-8 max-w-md rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-6 py-3 text-sm text-emerald-300/90">
              {"You're in. Welcome to the world within."}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                aria-label="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-full border border-white/[0.07] bg-black/40 px-6 py-3 text-sm text-white placeholder-gray-500 outline-none backdrop-blur transition-all duration-300 focus:border-emerald-400/35 focus:bg-black/50 focus:shadow-[0_0_16px_rgba(52,211,153,0.08)]"
              />
              <Button type="submit" variant="gradient" size="md">
                Join
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Footer body */}
      <div
        aria-hidden
        className="animate-glow pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[50rem] max-w-full -translate-x-1/2 rounded-full bg-[rgba(var(--mood-rgb),0.03)] blur-glow"
      />

      <div className="relative mx-auto mt-20 max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-[1.7] text-gray-500/60">
              A universe where stories, emotions, and people connect.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social}
                  href="#"
                  className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-gray-400 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400/70">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-500/70">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors duration-300 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400/70">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-500/70">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors duration-300 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400/70">Get the app</h4>
            <div className="mt-4 space-y-2">
              <button className="w-full rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-left text-sm text-gray-400/70 backdrop-blur transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white">
                <span className="block text-[10px] uppercase tracking-wider text-gray-500/60">
                  Download on the
                </span>
                App Store
              </button>
              <button className="w-full rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-left text-sm text-gray-400/70 backdrop-blur transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white">
                <span className="block text-[10px] uppercase tracking-wider text-gray-500/60">Get it on</span>
                Google Play
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 text-sm text-gray-500/60 sm:flex-row">
          <p>&copy; 2026 WithIn. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors duration-300 hover:text-white">Privacy</a>
            <a href="#" className="transition-colors duration-300 hover:text-white">Terms</a>
            <a href="#" className="transition-colors duration-300 hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
