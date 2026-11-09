"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useEnvironment } from "@/lib/environment";

/**
 * AuriRail — the right-rail presence of Auri.
 *
 * The owl of the Household rendered as a small, calm code illustration
 * (aria-hidden decoration) above *universal* words: Auri's presence is
 * described truthfully — what she is always ready for, never what she
 * claims to have observed. The door leads to /within, where the real
 * Auri hub lives; appearance and settings live in /settings.
 */
export default function AuriRail() {
  const { greeting } = useEnvironment();
  return (
    <section
      aria-label="Auri"
      className="pane edge-glass relative overflow-hidden rounded-[28px]"
    >
      {/* the owl — drawn, decorative */}
      <div aria-hidden className="relative flex justify-center pt-5">
        <svg width="168" height="150" viewBox="0 0 120 108" fill="none" role="presentation">
          <defs>
            <linearGradient id="auri-body" x1="30" y1="18" x2="92" y2="100">
              <stop offset="0" stopColor="#fbfbfe" />
              <stop offset="0.55" stopColor="#e4e6f6" />
              <stop offset="1" stopColor="#c3c9e8" />
            </linearGradient>
            <radialGradient id="auri-halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff6df" stopOpacity="0.75" />
              <stop offset="1" stopColor="#fff6df" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="auri-wing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d7dcf2" />
              <stop offset="1" stopColor="#b3bae2" />
            </linearGradient>
          </defs>

          {/* halo + perch shadow */}
          <circle cx="60" cy="66" r="52" fill="url(#auri-halo)" />
          <ellipse cx="60" cy="103" rx="30" ry="4.5" fill="#6a5f9c" opacity="0.28" />

          {/* tail feathers */}
          <path d="M76 88 Q88 96 92 104 Q82 100 74 96 Z" fill="url(#auri-wing)" />
          <path d="M82 90 Q94 94 100 100 Q90 98 82 96 Z" fill="#dfe3f6" opacity="0.9" />

          {/* body */}
          <ellipse cx="60" cy="64" rx="35" ry="40" fill="url(#auri-body)" />
          {/* wing shading */}
          <path d="M28 58 Q22 76 34 92 Q40 80 40 62 Q36 56 28 58 Z" fill="url(#auri-wing)" opacity="0.9" />
          <path d="M92 58 Q98 76 86 92 Q80 80 80 62 Q84 56 92 58 Z" fill="url(#auri-wing)" opacity="0.9" />
          {/* breast feather arcs */}
          <g stroke="#c4cbe8" strokeWidth="1.4" fill="none" opacity="0.8">
            <path d="M48 78 Q54 84 60 78 Q66 84 72 78" />
            <path d="M48 88 Q54 94 60 88 Q66 94 72 88" />
          </g>
          {/* head feathers */}
          <g stroke="#cdd3ee" strokeWidth="1.6" fill="none" opacity="0.9">
            <path d="M40 24 Q44 18 48 22" />
            <path d="M50 20 Q56 12 62 18" />
            <path d="M64 18 Q72 14 74 22" />
          </g>
          {/* brow tufts */}
          <path d="M38 34 Q40 28 46 30 L44 38 Z" fill="#dfe3f6" />
          <path d="M82 34 Q80 28 74 30 L76 38 Z" fill="#dfe3f6" />
          {/* face discs */}
          <circle cx="46" cy="52" r="14" fill="#f6f7fc" />
          <circle cx="74" cy="52" r="14" fill="#f6f7fc" />
          {/* eyes — the glow within */}
          <circle cx="46" cy="52" r="7.5" fill="#2b2550" />
          <circle cx="74" cy="52" r="7.5" fill="#2b2550" />
          <circle cx="48" cy="50" r="2.6" fill="#ffffff" opacity="0.95" />
          <circle cx="76" cy="50" r="2.6" fill="#ffffff" opacity="0.95" />
          <circle cx="46" cy="52" r="3" fill="#8a7bd6" opacity="0.35" />
          <circle cx="74" cy="52" r="3" fill="#8a7bd6" opacity="0.35" />
          {/* beak */}
          <path d="M57 58 L60 64 L63 58 Q60 55 57 58 Z" fill="#e6c9a2" />
          {/* feet */}
          <path d="M48 102 Q52 106 58 103" stroke="#c4b0d8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M66 103 Q72 106 76 101" stroke="#c4b0d8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {/* presence — honest, universal words */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2">
          <span aria-hidden className="chip-glass h-7 w-7">
            <Icon name="sparkles" size={13} strokeWidth={2} />
          </span>
          <h2 className="font-display text-[19px] font-semibold ink-title">Auri</h2>
        </div>
        <p className="mt-2.5 text-[13px] leading-relaxed ink-body">
          {greeting} moves quietly with you. She is here for the light hours
          and the heavy ones alike — no feed, no noise, just presence.
        </p>

        <div className="mt-4 rounded-2xl bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <p className="font-display text-[15px] italic leading-snug text-[#3a3462]">
            “You are not alone. There is always a place within you.”
          </p>
          <p className="mt-1 text-right text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8b8aa0]">
            The Household
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/within" className="pill-lit px-4 py-2.5 text-[12.5px] font-semibold">
            <Icon name="sparkles" size={14} strokeWidth={2} />
            Visit Auri
          </Link>
          <Link href="/settings" className="pill-glass px-4 py-2.5 text-[12.5px] font-medium">
            <Icon name="sliders" size={14} strokeWidth={2} />
            Voice &amp; appearance
          </Link>
        </div>
      </div>
    </section>
  );
}
