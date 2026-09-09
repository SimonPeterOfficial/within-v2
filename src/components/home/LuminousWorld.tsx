"use client";

import { motion } from "framer-motion";

/**
 * LuminousWorld — the reference's daylight dreamscape.
 *
 * A fixed, pure-SVG/CSS environment: soft blue sky, drifting clouds,
 * floating crystal islands with waterfalls, a mirror sea with light
 * reflections, and foreground depth. NO external imagery — every shape
 * is drawn so the world stays shippable, GPU-light, and crisp at any
 * resolution. Renders behind the entire /home experience; the glass UI
 * floats above it and the world shows through every surface.
 *
 * Performance: one fixed layer, transform/opacity animations only,
 * ≤8 animated elements, all blur kept small and static.
 */

export default function LuminousWorld() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* ── The sky ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #5e93d6 0%, #8db8e8 22%, #bcd4ee 45%, #e6d9ea 68%, #f2e3d8 82%, #dcd2ec 100%)",
        }}
      />

      {/* Sun glow — upper right, like the reference's light source */}
      <div
        className="absolute right-[8%] top-[6%] h-[42vh] w-[42vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,246,220,0.9) 0%, rgba(255,224,170,0.45) 35%, transparent 70%)",
        }}
      />

      {/* Distant clouds — slow drift */}
      <motion.div
        className="absolute left-[4%] top-[10%] h-16 w-[34vw] rounded-full"
        style={{ background: "rgba(255,255,255,0.5)", filter: "blur(18px)" }}
        animate={{ x: [0, 40, 0] }}
        transition={{ duration: 90, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[18%] top-[24%] h-12 w-[26vw] rounded-full"
        style={{ background: "rgba(255,255,255,0.42)", filter: "blur(16px)" }}
        animate={{ x: [0, -34, 0] }}
        transition={{ duration: 75, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[30%] top-[38%] h-10 w-[22vw] rounded-full"
        style={{ background: "rgba(255,255,255,0.35)", filter: "blur(14px)" }}
        animate={{ x: [0, 26, 0] }}
        transition={{ duration: 65, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── The floating islands — mid-ground left ── */}
      <motion.div
        className="absolute left-[6%] top-[30%]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Island body */}
        <div
          className="h-24 w-48"
          style={{
            background:
              "radial-gradient(ellipse 120% 100% at 50% 20%, #7fb069 0%, #4a7d4e 34%, #2d5240 58%, transparent 72%)",
            borderRadius: "48% 52% 46% 54% / 68% 62% 38% 32%",
          }}
        />
        {/* Rock underside */}
        <div
          className="-mt-3 ml-8 h-16 w-32"
          style={{
            background: "linear-gradient(180deg, #6b6478 0%, #4a4358 55%, transparent 90%)",
            clipPath: "polygon(12% 0%, 88% 0%, 68% 100%, 34% 100%)",
          }}
        />
        {/* Waterfall — the reference's falling light */}
        <motion.div
          className="ml-2 h-32 w-3"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(190,220,250,0.4) 60%, transparent)",
            filter: "blur(1.5px)",
          }}
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Falls mist */}
        <div
          className="-mt-6 ml-[-6px] h-8 w-12 rounded-full"
          style={{ background: "rgba(255,255,255,0.35)", filter: "blur(8px)" }}
        />
      </motion.div>

      {/* Distant floating citadel — upper middle, small */}
      <motion.div
        className="absolute left-[42%] top-[14%]"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mx-auto h-2 w-16 rounded-full bg-white/50" style={{ filter: "blur(4px)" }} />
        <div
          className="mx-auto mt-0.5 h-8 w-10"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(190,200,240,0.4))",
            clipPath: "polygon(20% 100%, 20% 30%, 50% 0%, 80% 30%, 80% 100%)",
            filter: "blur(0.5px)",
          }}
        />
      </motion.div>

      {/* ── The sea — lower third, mirror light ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[34vh]"
        style={{
          background:
            "linear-gradient(180deg, rgba(140,190,235,0.75) 0%, rgba(170,205,240,0.85) 40%, rgba(200,220,248,0.95) 100%)",
        }}
      />
      {/* Sea glow path — the sun's reflection */}
      <div
        className="absolute bottom-0 right-[16%] h-[26vh] w-[20vw]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,240,210,0.5) 0%, rgba(255,250,240,0.25) 45%, transparent 100%)",
          filter: "blur(6px)",
        }}
      />
      {/* Sea shimmer lines */}
      <motion.div
        className="absolute bottom-[10vh] left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)" }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[16vh] left-[10%] right-[30%] h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Near island — right side, above the fold's waterline */}
      <motion.div
        className="absolute right-[4%] top-[52%]"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="h-14 w-36"
          style={{
            background:
              "radial-gradient(ellipse 120% 100% at 50% 18%, #86b877 0%, #4d7d55 40%, #33553f 62%, transparent 74%)",
            borderRadius: "52% 48% 44% 56% / 64% 70% 30% 36%",
            opacity: 0.9,
          }}
        />
        <div
          className="-mt-2 ml-6 h-10 w-24"
          style={{
            background: "linear-gradient(180deg, rgba(120,110,140,0.7), transparent)",
            clipPath: "polygon(16% 0%, 84% 0%, 62% 100%, 38% 100%)",
          }}
        />
      </motion.div>

      {/* Foreground botanicals — bottom corners, depth through silhouette */}
      <div
        className="absolute -bottom-8 -left-10 h-56 w-72"
        style={{
          background:
            "radial-gradient(ellipse 80% 90% at 30% 80%, rgba(52,96,70,0.55) 0%, rgba(38,74,56,0.35) 45%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute -bottom-10 -right-8 h-48 w-64"
        style={{
          background:
            "radial-gradient(ellipse 80% 90% at 70% 80%, rgba(58,102,76,0.5) 0%, rgba(40,78,58,0.3) 45%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />

      {/* Morning veil — the soft light that makes glass read as glass */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(255,255,255,0.16), transparent 60%)",
        }}
      />
    </div>
  );
}
