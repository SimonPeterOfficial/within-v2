"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import AtlasHeading from "@/components/atlas/AtlasHeading";
import { useAtlasTime } from "@/lib/atlas/useAtlasTime";
import { dreamSeed } from "@/lib/atlas/oracle";
import { moonPhase } from "@/lib/atlas/cosmos";

/**
 * DreamOracle — tonight's dream seed. One image, one feeling, one line —
 * deterministic per day, and aware of the moon: full moons shout, new
 * moons whisper seeds.
 */
export default function DreamOracle() {
  const now = useAtlasTime();
  const seed = dreamSeed(now);
  const moon = moonPhase(now);

  return (
    <GlassCard tone="soft" hoverLift className="relative flex h-full flex-col overflow-hidden p-6">
      {/* Dream fog */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 78% 22%, rgba(139,92,246,0.14), transparent 55%), radial-gradient(circle at 12% 82%, rgba(34,211,238,0.08), transparent 50%)",
        }}
      />

      <div className="relative">
        <AtlasHeading
          icon="moon"
          title="Dream Oracle"
          line="What tonight's sky suggests to the sleeping."
        />

        <motion.div
          key={seed.image}
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7"
        >
          <p className="font-display text-2xl font-medium leading-snug text-white">
            You may dream of{" "}
            <span className="bg-linear-to-r from-violet-300 to-cyan-200 bg-clip-text text-transparent">
              {seed.image}
            </span>
            .
          </p>
          <p className="mt-3 text-[13px] text-gray-400/85">
            The feeling will be{" "}
            <span className="font-medium text-[rgba(var(--mood-rgb),0.95)]">{seed.feeling}</span>.
          </p>
          <p className="mt-4 border-l-2 border-[rgba(var(--mood-rgb),0.4)] pl-3 text-[13px] italic leading-relaxed text-gray-300/90">
            {seed.line}
          </p>
        </motion.div>
      </div>

      <div className="relative mt-auto flex items-center justify-between pt-6 text-[11px] text-gray-500">
        <span>
          {moon.glyph} {moon.name}
        </span>
        <span>Seed refreshed at midnight — write it down when you wake.</span>
      </div>
    </GlassCard>
  );
}
