"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import DepthLayers from "@/components/effects/DepthLayers";
import StarField from "@/components/sanctuary/StarField";
import AtlasHero from "@/components/atlas/AtlasHero";
import AtlasRail from "@/components/atlas/AtlasRail";
import AtlasFooter from "@/components/atlas/AtlasFooter";
import MoonDial from "@/components/atlas/MoonDial";
import StarClock from "@/components/atlas/StarClock";
import AuroraForecastPanel from "@/components/atlas/AuroraForecastPanel";
import ConstellationMap from "@/components/atlas/ConstellationMap";
import CometTracker from "@/components/atlas/CometTracker";
import CosmicPulse from "@/components/atlas/CosmicPulse";
import NebulaWeave from "@/components/atlas/NebulaWeave";
import GravityPool from "@/components/atlas/GravityPool";
import TimeRift from "@/components/atlas/TimeRift";
import MoodWeather from "@/components/atlas/MoodWeather";
import MoodLab from "@/components/atlas/MoodLab";
import SynaesthesiaBoard from "@/components/atlas/SynaesthesiaBoard";
import OraclePanel from "@/components/atlas/OraclePanel";
import DreamOracle from "@/components/atlas/DreamOracle";
import WishingWell from "@/components/atlas/WishingWell";
import StarNamer from "@/components/atlas/StarNamer";
import { blurUp, staggerContainer } from "@/lib/animations";

/**
 * The Atlas — WithIn's out-of-the-world observatory.
 *
 * One scrollable room of instruments: sky (moon, stars, aurora, comets),
 * aura (emotional weather, blends, synaesthesia), and the mystic wing
 * (oracle, dreams, wishes, star naming). Every instrument is live —
 * computed from the shared Atlas clock, never decorative.
 */

function SectionShell({
  id,
  eyebrow,
  title,
  line,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  line: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="section-ambient relative scroll-mt-24 py-20 text-white">
      <div aria-hidden className="section-divider absolute left-0 right-0 top-0" />
      <Container className="relative">
        <motion.div
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.p variants={blurUp} className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(var(--mood-rgb),0.75)]">
            {eyebrow}
          </motion.p>
          <motion.h2 variants={blurUp} className="mt-4 font-display text-3xl font-medium leading-[1.08] tracking-[-0.02em] md:text-4xl">
            {title}
          </motion.h2>
          <motion.p variants={blurUp} className="mt-3 max-w-xl text-[15px] leading-relaxed text-gray-400/75">
            {line}
          </motion.p>
          <div className="mt-10">{children}</div>
        </motion.div>
      </Container>
    </section>
  );
}

export default function AtlasExperience() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030a] text-white">
      <DepthLayers preset="home" particles={5} stars={20} fog={0.4} />

      {/* The room's own star layer — denser than anywhere else in WithIn */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
        <StarField count={70} seed={77} />
      </div>

      <AtlasRail />

      <main id="main" className="relative z-10 lg:pl-[4.5rem]">
        <AtlasHero />

        {/* ── The sky wing ── */}
        <SectionShell
          id="sky"
          eyebrow="The sky wing"
          title="Instruments that read the night"
          line="Real approximations, honest math, rendered as light. The moon, the hours, the curtains — all computed live from the Atlas clock."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <MoonDial />
            <StarClock />
            <AuroraForecastPanel />
          </div>
          <div className="mt-4">
            <ConstellationMap />
          </div>
        </SectionShell>

        {/* ── The aura wing ── */}
        <SectionShell
          id="aura"
          eyebrow="The aura wing"
          title="Weather for the inner rooms"
          line="The mood system, extended until it becomes a climate. Blends, textures, frequencies — the room as a weather report."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <MoodWeather />
            <SynaesthesiaBoard />
          </div>
          <div className="mt-4">
            <MoodLab />
          </div>
        </SectionShell>

        {/* ── The cosmic wing ── */}
        <SectionShell
          id="cosmic"
          eyebrow="The cosmic wing"
          title="Engines of the far field"
          line="Comets with schedules, a pulse of the whole universe, weaves of nebula, gravity you can stir, and a rift that keeps yesterday."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <CometTracker />
            <CosmicPulse />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <NebulaWeave />
            <GravityPool />
            <TimeRift />
          </div>
        </SectionShell>

        {/* ── The mystic wing ── */}
        <SectionShell
          id="mystic"
          eyebrow="The mystic wing"
          title="Mirrors, not verdicts"
          line="An oracle that deals reflections, dreams with seeds, a well for wishes, and a pen for naming stars. Deterministic magic — same day, same draw."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <OraclePanel />
            <DreamOracle />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <WishingWell />
            <StarNamer />
          </div>
        </SectionShell>

        {/* Closing line */}
        <div className="relative z-10 px-6 pb-24 text-center">
          <p className="text-sm text-gray-500/70">
            The Atlas is computed from the sky, the hour, and the light you chose.
          </p>
          <div className="mt-6 flex justify-center">
            <Button href="/home" variant="ghost" size="md">
              Return to the sanctuary
            </Button>
          </div>
        </div>
      </main>

      <AtlasFooter />
    </div>
  );
}
