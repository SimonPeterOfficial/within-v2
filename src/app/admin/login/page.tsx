import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Control — WithIn",
  description: "Private access to the WithIn administrative dashboard.",
};

/**
 * Admin login — the control room behind WithIn.
 *
 * Design: dark, minimal, precise, premium, quiet, slightly mysterious.
 * NOT: neon overload, hacker aesthetic, or generic SaaS login.
 */
export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030308] px-6">
      {/* Subtle atmospheric background — barely visible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 30%, rgba(88,60,160,0.04), transparent 60%),
            radial-gradient(ellipse 60% 40% at 30% 70%, rgba(52,211,153,0.02), transparent 50%)
          `,
        }}
      />

      {/* Grid lines — subtle architectural feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 w-full max-w-xs">
        {/* Logo / wordmark */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-xl font-medium tracking-[0.15em] text-white/70">
            WITHIN
          </h1>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.5em] text-white/20">
            Control
          </div>
        </div>

        <AdminLoginForm />

        {/* Security indicator */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
          <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/15">
            Secure connection
          </span>
        </div>
      </div>
    </main>
  );
}
