"use client";

import { useState, type FormEvent } from "react";
import Logo from "@/components/ui/Logo";
import GradientText from "@/components/ui/GradientText";

const exploreLinks = [
  { label: "Stories", href: "#stories" },
  { label: "Originals", href: "#originals" },
  { label: "Emotions", href: "#emotions" },
  { label: "Community", href: "#community" }
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Press", href: "#" },
  { label: "Contact", href: "#" }
];

const socialLinks = ["Instagram", "X", "TikTok", "YouTube"];

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
    <footer className="bg-black px-6 pb-10 pt-24 text-white">
      {/* Call to action */}
      <div
        id="join"
        className="relative mx-auto max-w-6xl scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-8 py-16 text-center backdrop-blur-xl"
      >
        <div className="animate-glow pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-purple-700/30 blur-3xl" />
        <div
          className="animate-glow pointer-events-none absolute -bottom-24 right-1/5 h-64 w-64 rounded-full bg-emerald-600/25 blur-3xl"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Join WithIn
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold md:text-5xl">
            Your story starts <GradientText>within</GradientText>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Get the newest stories, originals, and community news — delivered gently, once a week.
          </p>

          {subscribed ? (
            <p className="mx-auto mt-8 max-w-md rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-emerald-300">
              {"You're in. Welcome to the world within. ✨"}
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
                className="flex-1 rounded-full border border-white/10 bg-black/40 px-6 py-3 text-sm text-white placeholder-gray-500 outline-none backdrop-blur transition focus:border-emerald-400/50"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer body */}
      <div className="mx-auto mt-20 max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              A universe where stories, emotions, and people connect.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social}
                  href="#"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Explore</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Get the app</h4>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-left text-sm text-gray-300 backdrop-blur transition hover:border-white/20 hover:text-white">
                <span className="block text-[10px] uppercase tracking-wider text-gray-500">
                  Download on the
                </span>
                App Store
              </button>
              <button className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-left text-sm text-gray-300 backdrop-blur transition hover:border-white/20 hover:text-white">
                <span className="block text-[10px] uppercase tracking-wider text-gray-500">Get it on</span>
                Google Play
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-gray-500 sm:flex-row">
          <p>© 2026 WithIn. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-white">Privacy</a>
            <a href="#" className="transition hover:text-white">Terms</a>
            <a href="#" className="transition hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
