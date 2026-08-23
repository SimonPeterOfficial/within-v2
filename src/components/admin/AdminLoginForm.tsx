"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";

/**
 * Admin login form — password-only, server-side verification.
 *
 * Design: minimal, precise, premium. The form should feel like entering
 * a code, not filling out a survey.
 */
export default function AdminLoginForm() {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Enter the access code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!result.ok) {
        setError(result.error ?? "Authentication failed.");
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }

      router.push("/admin");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AnimatePresence>
        {error && (
          <motion.div
            ref={errorRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-red-500/15 bg-red-500/[0.04] px-4 py-3 text-[12px] text-red-400/80 outline-none"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label
          htmlFor="admin-password"
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30"
        >
          Access code
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 pr-11 text-[13px] text-white placeholder-white/15 outline-none transition-all duration-300 focus:border-white/[0.12] focus:bg-white/[0.04]"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 transition-colors hover:text-white/50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <Icon name={showPassword ? "close" : "forward"} size={14} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-white/[0.06] py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-all duration-300 hover:bg-white/[0.1] hover:text-white active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-white/[0.06]"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border border-white/20 border-t-white/60" />
            Verifying
          </span>
        ) : (
          "Enter control room"
        )}
      </button>

      <p className="text-center text-[10px] text-white/10">
        Admin access is restricted. All activity is logged.
      </p>
    </form>
  );
}
