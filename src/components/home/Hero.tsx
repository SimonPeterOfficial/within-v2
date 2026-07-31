"use client";

import { motion } from "framer-motion";
import GlowBackground from "@/components/effects/GlowBackground";
import Navbar from "@/components/layout/Navbar";
import Logo from "@/components/ui/Logo";

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-black text-white">

      <GlowBackground />

      <Navbar />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >

          <Logo />

          <h1 className="mt-8 text-6xl font-bold md:text-8xl">
            WithIn
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-400">
            A universe where stories, emotions, and people connect.
          </p>

        </motion.div>

      </div>

    </section>
  );
}