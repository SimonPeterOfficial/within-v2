"use client";

import { motion } from "framer-motion";
import GlowBackground from "@/components/effects/GlowBackground";
import ParticleField from "@/components/effects/ParticleField";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Logo from "@/components/ui/Logo";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { slideUp } from "@/lib/animations";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section
      id="main"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02030a] px-6 py-16 text-white"
    >
      <GlowBackground variant="hero" />
      <ParticleField count={12} seed={9} />

      {/* Deep vignette — cinematic framing */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

      <Button
        href="/"
        variant="outline"
        size="sm"
        ariaLabel="Back to WithIn home"
        className="absolute left-6 top-6 z-10"
      >
        ← Back to WithIn
      </Button>

      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 flex items-center justify-center gap-3">
          <Logo />
          <span aria-hidden className="ml-2">
            <AuriOwl size={28} particles={false} state="observing" />
          </span>
        </div>
        <GlassCard tone="strong" className="p-8 sm:p-10">{children}</GlassCard>
        <p className="mt-5 text-center text-[11px] text-gray-500/50">
          Auri is keeping the light ready — nothing you write here leaves this device.
        </p>
      </motion.div>
    </section>
  );
}
