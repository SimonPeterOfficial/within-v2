"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

/**
 * Admin password reset request page.
 * In development, the token is displayed directly. In production,
 * an email would be sent with a reset link.
 */
export default function AdminResetRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDevToken(null);
    setDevResetUrl(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "An error occurred.");
        return;
      }

      // Development: show the token directly
      if (data.devToken && data.devResetUrl) {
        setDevToken(data.devToken);
        setDevResetUrl(data.devResetUrl);
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030308] px-6">
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

      <div className="relative z-10 w-full max-w-xs">
        <div className="mb-10 text-center">
          <h1 className="font-display text-xl font-medium tracking-[0.15em] text-white/70">
            WITHIN
          </h1>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.5em] text-white/20">
            Reset Access
          </div>
        </div>

        {devToken && devResetUrl ? (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-5 text-center">
            <p className="text-sm font-medium text-emerald-400">Development Mode</p>
            <p className="mt-2 text-xs leading-relaxed text-white/50">
              Token generated. Click below to reset your password:
            </p>
            <Link
              href={devResetUrl}
              className="mt-4 inline-block rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/30"
            >
              Reset Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-500/15 bg-red-500/[0.04] px-4 py-3 text-[12px] text-red-400/80">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30"
              >
                Admin Email
              </label>
              <input
                id="reset-email"
                type="email"
                placeholder="admin@within.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-[13px] text-white placeholder-white/15 outline-none transition-all duration-300 focus:border-white/[0.12] focus:bg-white/[0.04]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-white/[0.06] py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-all duration-300 hover:bg-white/[0.1] hover:text-white active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>

            <p className="text-center text-[10px] text-white/10">
              <Link href="/admin/login" className="transition hover:text-white/30">
                ← Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
