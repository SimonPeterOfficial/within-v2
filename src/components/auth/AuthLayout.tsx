"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import GlowBackground from "@/components/effects/GlowBackground";
import GlassCard from "@/components/ui/GlassCard";
import Logo from "@/components/ui/Logo";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <GlowBackground variant="hero" />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur transition hover:border-white/20 hover:text-white"
      >
        ← Back to WithIn
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Logo size="sm" />
        </div>
        <GlassCard className="p-8 sm:p-10">{children}</GlassCard>
      </motion.div>
    </section>
  );
}
