"use client";

import { motion } from "framer-motion";
import GlowBackground from "@/components/effects/GlowBackground";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Logo from "@/components/ui/Logo";
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
        <div className="mb-8 text-center">
          <Logo />
        </div>
        <GlassCard className="p-8 sm:p-10">{children}</GlassCard>
      </motion.div>
    </section>
  );
}
