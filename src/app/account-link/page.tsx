"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Account linking page — shown when a Clerk-authenticated user has no
 * local WITHIN mapping. The user verifies ownership of their existing
 * WITHIN account (email + legacy password) to link their Clerk identity.
 *
 * Never silently merges accounts — explicit verification is required.
 */

export default function AccountLinkPage() {
  const router = useRouter();
  const { status, clerkUserId, signOut } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If not in linking_required state, redirect home.
  useEffect(() => {
    if (status !== "linking_required") {
      router.push("/home");
    }
  }, [status, router]);

  const clearError = (field: keyof typeof errors) =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setErrors({});

    const nextErrors: { email?: string; password?: string } = {};
    if (!email) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/clerk/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setFormError(data?.error || "Account linking failed. Please try again.");
        setLoading(false);
        return;
      }

      // Linking succeeded — restore session and go home.
      await signOut();
      router.push("/home");
    } catch {
      setFormError("Account linking failed. Please try again.");
      setLoading(false);
    }
  };

  if (status !== "linking_required" || !clerkUserId) {
    return null;
  }

  return (
    <div className="min-h-full flex flex-col bg-black text-white">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em]">
              Link your account
            </h1>
            <p className="mt-2 text-[14px] text-gray-400/70">
              Your Clerk identity needs to be linked to your existing
              WITHIN account to preserve your data and permissions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {formError && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400/90">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-[11px] text-red-400/70">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-[11px] text-red-400/70">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 py-3.5 text-[13px] font-semibold text-white transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? "Linking…" : "Link accounts"}
            </button>
          </form>

          <p className="text-center text-[12px] text-gray-500/60">
            Don&apos;t have a WITHIN account yet? Sign in with Clerk again to
            create one.
          </p>
          <button
            onClick={() => signOut()}
            className="text-center text-[12px] font-medium text-emerald-400 hover:text-emerald-300 underline"
          >
            Sign out and try again
          </button>
        </div>
      </div>
    </div>
  );
}
