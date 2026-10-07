"use client";

import { useState, useEffect, Suspense, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetConfirmForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      const frame = requestAnimationFrame(() =>
        setError("Invalid reset link. Please request a new one."),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "An error occurred.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 2000);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-6 text-center">
        <p className="text-lg font-medium text-emerald-400">Password Reset</p>
        <p className="mt-2 text-sm text-white/50">
          Your password has been updated. Redirecting to login…
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-lg border border-red-500/15 bg-red-500/[0.04] p-5 text-center">
        <p className="text-sm text-red-400/80">{error}</p>
        <Link
          href="/admin/reset/request"
          className="mt-3 inline-block text-sm text-white/50 underline transition hover:text-white/80"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/15 bg-red-500/[0.04] px-4 py-3 text-[12px] text-red-400/80">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="new-password"
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30"
        >
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-[13px] text-white placeholder-white/15 outline-none transition-all duration-300 focus:border-white/[0.12] focus:bg-white/[0.04]"
        />
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30"
        >
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-[13px] text-white placeholder-white/15 outline-none transition-all duration-300 focus:border-white/[0.12] focus:bg-white/[0.04]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-white/[0.06] py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-all duration-300 hover:bg-white/[0.1] hover:text-white active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? "Resetting…" : "Reset Password"}
      </button>

      <p className="text-center text-[10px] text-white/10">
        <Link href="/admin/login" className="transition hover:text-white/30">
          ← Back to login
        </Link>
      </p>
    </form>
  );
}

export default function AdminResetConfirmPage() {
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
            New Password
          </div>
        </div>

        <Suspense fallback={<div className="text-center text-white/30">Loading…</div>}>
          <ResetConfirmForm />
        </Suspense>
      </div>
    </main>
  );
}
