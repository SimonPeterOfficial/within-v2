"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { drawLightCards, castRunes } from "@/lib/atlas/oracle";

/**
 * OraclePanel — the deck of mirrors. A question goes in, three light cards
 * (past / present / becoming) come out, and a rune cast rides beneath.
 * The draw is day-stable: the same question on the same day deals the
 * same cards — reflections, not fortunes.
 */
export default function OraclePanel() {
  const now = useAtlasTime();
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState<string | null>(null);

  const cards = asked ? drawLightCards(asked, now) : [];
  const runes = asked ? castRunes(3, now) : [];

  const ask = () => {
    const trimmed = question.trim();
    setAsked(trimmed || "what should I sit with");
  };

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="eye"
        title="The Light Oracle"
        line="Every card is a mirror, not a verdict. Ask gently."
      />

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="What should I sit with?"
          aria-label="Your question for the oracle"
          className="min-w-0 flex-1 rounded-full border border-white/[0.08] bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[rgba(var(--mood-rgb),0.45)]"
        />
        <button
          type="button"
          onClick={ask}
          className="shrink-0 rounded-full bg-linear-to-br from-violet-500 to-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition hover:brightness-110"
        >
          Draw
        </button>
      </div>

      {asked && (
        <>
          {/* The three cards */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {cards.map((card, i) => (
              <motion.div
                key={`${asked}-${card.id}`}
                initial={{ opacity: 0, y: 18, rotateY: 40 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-2xl border p-3.5"
                style={{
                  borderColor: `${card.hue}40`,
                  background: `linear-gradient(160deg, ${card.hue}14, rgba(6,5,14,0.9))`,
                }}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  {card.position}
                </p>
                <span aria-hidden className="mt-2 block text-2xl">{card.glyph}</span>
                <p className="mt-2 text-[12px] font-semibold leading-tight text-white">
                  {card.name}
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400/85">
                  {card.reflection}
                </p>
              </motion.div>
            ))}
          </div>

          {/* The rune cast */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {runes.map((rune) => (
              <span
                key={rune.id}
                title={`${rune.name} — ${rune.meaning}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.03] text-lg text-[rgba(var(--mood-rgb),0.9)]"
                style={{ transform: rune.reversed ? "rotate(180deg)" : undefined }}
              >
                {rune.glyph}
              </span>
            ))}
            <p className="text-[11px] leading-snug text-gray-500">
              {runes.map((r) => r.name).join(" · ")}
            </p>
          </div>
        </>
      )}

      <p className="mt-auto pt-5 text-[11px] text-gray-600">
        Day-stable draws — the same question, the same day, the same mirror.
      </p>
    </GlassCard>
  );
}
