"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import GradientText from "@/components/ui/GradientText";
import { blurUp, staggerContainer } from "@/lib/animations";

// UniversePreview is code-split — it's only needed on desktop and adds
// a StarField + AnimatePresence that don't need to be in the initial bundle.
const UniversePreview = dynamic(() => import("@/components/auth/UniversePreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#040510]">
      <div className="h-16 w-16 rounded-full border border-white/10 bg-white/5" />
    </div>
  ),
});

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  /** Subtitle under the logo, shown above the form */
  meta?: string;
};

/**
 * AuthSplitLayout — the flagship first-arrival composition.
 *
 * Desktop: editorial split — left is the authentication form, right is a
 * living preview of the WithIn universe (slideshow).
 *
 * Mobile: form-first with a subtle atmospheric background.
 *
 * The transition between landing → login should feel like stepping into
 * a different room of the same universe, not a hard page cut.
 */
export default function AuthSplitLayout({ children, meta }: AuthSplitLayoutProps) {
  return (
    <section
      id="main"
      className="crystal-world relative flex min-h-screen overflow-hidden text-[#232136]"
    >
      {/* ── Left side — Authentication ── */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        {/* Environmental light on the entrance — morning through glass */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_0%,rgba(190,170,252,0.24),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_96%,rgba(170,215,245,0.2),transparent_55%)]"
        />

        {/* Back to home */}
        <Link
          href="/"
          className="absolute left-6 top-6 z-10 flex items-center gap-2 text-[12px] font-medium text-[#6f6e88] transition-colors hover:text-[#232136]"
          aria-label="Back to WithIn home"
        >
          <span aria-hidden className="text-lg leading-none">←</span>
          Back to WithIn
        </Link>

        {/* Form container */}
        <motion.div
          variants={staggerContainer(0.15, 0.2)}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-sm"
        >
          {/* Logo */}
          <motion.div variants={blurUp} className="mb-10 flex items-center justify-center gap-2.5">
            <Logo />
          </motion.div>

          {/* Form — a crystal-clear surface; the world shows through it */}
          <motion.div
            variants={blurUp}
            className="crystal-elevated crystal-edge crystal-sheen depth-high rounded-modal p-7 md:p-8"
          >
            <div className="relative z-[2]">{children}</div>
          </motion.div>

          {/* Footer meta */}
          <motion.p variants={blurUp} className="mt-8 text-center text-[11px] text-gray-500/45">
            {meta ?? (
              <>
                <GradientText className="font-medium">Auri</GradientText>
                {" "}is keeping the light ready — nothing you write here leaves this device.
              </>
            )}
          </motion.p>
        </motion.div>
      </div>

      {/* ── Right side — Universe Preview (desktop only) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:relative lg:inset-auto lg:pointer-events-auto lg:flex lg:w-1/2"
      >
        {/* Divider line — thin luminous seam */}
        <div className="absolute left-0 top-[15%] bottom-[15%] w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent lg:block" />

        <div className="h-full w-full">
          <UniversePreview />
        </div>
      </div>

      {/* Mobile: subtle atmospheric overlay behind the form */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#02030a]/90 lg:hidden"
      />
    </section>
  );
}
