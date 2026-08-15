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
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white"
    >
      <GlowBackground variant="hero" />
      {/* Drifting dust keeps the auth surfaces alive, never static */}
      <ParticleField count={14} seed={9} />

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
            <AuriOwl size={30} particles={false} state="observing" />
          </span>
        </div>
        <GlassCard className="p-8 sm:p-10">{children}</GlassCard>
        <p className="mt-6 text-center text-xs text-gray-600">
          Auri is keeping the light ready — nothing you write here leaves this device.
        </p>
      </motion.div>
    </section>
  );
}
