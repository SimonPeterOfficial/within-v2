"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useEnvironment } from "@/lib/environment";
import { synaesthesia, moodColorHex } from "@/lib/atlas/aura";
import { moods } from "@/lib/mood";

/**
 * SynaesthesiaBoard — moods you can almost hear. Each mood chip maps to a
 * hue, a musical note, and a texture; selecting one plays its tone (via the
 * Web Audio API, user-initiated only) and shows its full signature.
 */
export default function SynaesthesiaBoard() {
  const { moodId } = useEnvironment();
  const [selected, setSelected] = useState<string>(moodId ?? "inspired");
  const audioRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const signature = synaesthesia([selected]);
  const hex = moodColorHex(selected);

  // Stop any playing tone when unmounting or switching.
  useEffect(() => {
    return () => {
      try {
        oscRef.current?.stop();
        void audioRef.current?.close();
      } catch {
        /* audio not initialized — nothing to clean */
      }
    };
  }, []);

  const playTone = () => {
    try {
      void audioRef.current?.close();
    } catch {
      /* previous context already closed */
    }
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = signature.frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.5);
    audioRef.current = ctx;
    oscRef.current = osc;
  };

  return (
    <GlassCard tone="soft" hoverLift className="flex h-full flex-col p-6">
      <AtlasHeading
        icon="music"
        title="Synaesthesia Board"
        line="Every mood has a color, a note, and a texture. Hear yours."
      />

      {/* Mood chips */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {moods.map((mood) => {
          const isActive = selected === mood.id;
          const color = moodColorHex(mood.id);
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelected(mood.id)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
                isActive ? "text-white" : "border-white/[0.08] bg-white/[0.02] text-gray-400 hover:text-gray-200"
              }`}
              style={
                isActive
                  ? { borderColor: `${color}88`, background: `${color}1f`, boxShadow: `0 0 16px ${color}33` }
                  : undefined
              }
            >
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* The signature */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6 flex items-center gap-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5"
      >
        {/* The hue */}
        <div
          className="relative h-16 w-16 shrink-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${hex}, hsl(${signature.hue} 70% 55%))`,
            boxShadow: `0 0 24px ${hex}55`,
          }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-2xl"
            style={{ boxShadow: `0 0 30px ${hex}44` }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-white">
            Note {signature.note}
            <span className="ml-2 text-[12px] font-normal text-gray-500">
              {signature.frequency} Hz
            </span>
          </p>
          <p className="mt-1 text-[13px] text-gray-400/85">
            Feels like <span className="italic text-gray-200">{signature.texture}</span>
          </p>
          <p className="mt-0.5 text-[12px] text-gray-600">
            Hue {signature.hue}° on the wheel
          </p>
        </div>

        <button
          type="button"
          onClick={playTone}
          className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-[12px] font-semibold text-white transition hover:border-[rgba(var(--mood-rgb),0.45)] hover:bg-[rgba(var(--mood-rgb),0.12)]"
        >
          Play tone
        </button>
      </motion.div>
    </GlassCard>
  );
}
